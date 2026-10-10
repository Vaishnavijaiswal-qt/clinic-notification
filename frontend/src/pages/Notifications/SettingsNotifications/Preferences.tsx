
import { useEffect, useMemo, useState } from "react";

import {
    getClients,
    getClinics,
    getSavedPreferences,
    savePreferences,
} from "../../../api/preferencesApi";

import type {
    Client,
    Clinic,
    NotificationPreference,
} from "../../../api/preferencesApi";

import { getEventMappings } from "../../../api/eventmappingApi";

import type {
    EventMapping,
    NotificationType,
} from "../../../api/eventmappingApi";

import { getEvents } from "../../../api/eventsApi";

import type { NotificationEvent } from "../../../api/eventsApi";

type PreferenceRow = NotificationPreference & {
    id: number;
    event: string;
    whatsappAvailable: boolean;
    smsAvailable: boolean;
    emailAvailable: boolean;
};

type MappingWithLegacyType = EventMapping & {
    notificationType?: NotificationType;
};

const normalize = (value: string) => value.trim().toLowerCase();

function Preferences() {
    const [clients, setClients] = useState<Client[]>([]);
    const [clinics, setClinics] = useState<Clinic[]>([]);

    const [selectedClient, setSelectedClient] = useState("");
    const [selectedClinic, setSelectedClinic] = useState("");

    const [mappings, setMappings] = useState<EventMapping[]>([]);
    const [events, setEvents] = useState<NotificationEvent[]>([]);
    const [savedPreferences, setSavedPreferences] = useState<
        NotificationPreference[]
    >([]);

    const [preferenceChanges, setPreferenceChanges] = useState<
        Record<number, Partial<NotificationPreference>>
    >({});

    const [doNotDisturb, setDoNotDisturb] = useState(false);

    const [loadingClients, setLoadingClients] = useState(true);
    const [loadingClinics, setLoadingClinics] = useState(false);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [loadingPreferences, setLoadingPreferences] = useState(false);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const loadClients = async () => {
            try {
                setClients(await getClients());
            } catch (error) {
                console.error("Failed to load clients:", error);
                setError("Failed to load clients. Please try again.");
            } finally {
                setLoadingClients(false);
            }
        };

        void loadClients();
    }, []);

    useEffect(() => {
        if (!success) return;

        const timeoutId = window.setTimeout(() => {
            setSuccess("");
        }, 3000);

        return () => window.clearTimeout(timeoutId);
    }, [success]);

    useEffect(() => {
        const loadEventData = async () => {
            try {
                setLoadingEvents(true);

                const [mappingResponse, eventResponse] = await Promise.all([
                    getEventMappings("", 0, 1000),
                    getEvents("", 0, 1000),
                ]);

                setMappings(mappingResponse.content);
                setEvents(eventResponse.content);
            } catch (error) {
                console.error("Failed to load notification events:", error);
                setError(
                    "Failed to load notification events. Please try again."
                );
            } finally {
                setLoadingEvents(false);
            }
        };

        void loadEventData();
    }, []);

    const preferences = useMemo<PreferenceRow[]>(() => {
        if (!selectedClient || !selectedClinic) {
            return [];
        }

        const clientId = Number(selectedClient);
        const clinicId = Number(selectedClinic);
        const grouped = new Map<number, PreferenceRow>();

        const clinicMappings = mappings.filter(
            (mapping) =>
                mapping.clientId === clientId &&
                mapping.clinicId === clinicId
        );

        clinicMappings.forEach((mapping) => {
            const event = events.find((item) => item.id === mapping.eventId);

            if (!event) return;

            if (!grouped.has(mapping.eventId)) {
                grouped.set(mapping.eventId, {
                    id: mapping.eventId,
                    event: event.eventName,
                    notificationEvent: event.eventName,
                    whatsappEnabled: false,
                    smsEnabled: false,
                    emailEnabled: false,
                    whatsappAvailable: false,
                    smsAvailable: false,
                    emailAvailable: false,
                });
            }

            const current = grouped.get(mapping.eventId);
            if (!current) return;

            const legacyMapping = mapping as MappingWithLegacyType;

            const types: NotificationType[] =
                legacyMapping.notificationTypes ??
                (legacyMapping.notificationType
                    ? [legacyMapping.notificationType]
                    : []);

            types.forEach((type) => {
                if (type === "WHATSAPP") current.whatsappAvailable = true;
                if (type === "SMS") current.smsAvailable = true;
                if (type === "EMAIL") current.emailAvailable = true;
            });
        });

        return Array.from(grouped.values()).map((row) => {
            const saved = savedPreferences.find(
                (item) =>
                    normalize(item.notificationEvent) ===
                    normalize(row.notificationEvent)
            );

            return {
                ...row,
                whatsappEnabled: row.whatsappAvailable
                    ? saved
                        ? saved.whatsappEnabled
                        : true
                    : false,
                smsEnabled: row.smsAvailable
                    ? saved
                        ? saved.smsEnabled
                        : true
                    : false,
                emailEnabled: row.emailAvailable
                    ? saved
                        ? saved.emailEnabled
                        : true
                    : false,
                ...preferenceChanges[row.id],
            };
        });
    }, [
        selectedClient,
        selectedClinic,
        mappings,
        events,
        savedPreferences,
        preferenceChanges,
    ]);

    const loadClinicPreferences = async (clinicId: number) => {
        try {
            setLoadingPreferences(true);
            setError("");
            setSuccess("");

            const data = await getSavedPreferences(clinicId);

            setSavedPreferences(data);
            setPreferenceChanges({});
        } catch (error) {
            console.error("Failed to load saved preferences:", error);
            setSavedPreferences([]);
            setError(
                "Failed to load saved preferences for this clinic."
            );
        } finally {
            setLoadingPreferences(false);
        }
    };

    const handleClientChange = async (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const clientId = event.target.value;

        setSelectedClient(clientId);
        setSelectedClinic("");
        setClinics([]);
        setSavedPreferences([]);
        setPreferenceChanges({});
        setError("");
        setSuccess("");

        if (!clientId) return;

        try {
            setLoadingClinics(true);

            const data = await getClinics(Number(clientId));
            setClinics(data);
        } catch (error) {
            console.error("Failed to load clinics:", error);
            setError("Failed to load clinics. Please try again.");
        } finally {
            setLoadingClinics(false);
        }
    };

    const handleClinicChange = async (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const clinicId = event.target.value;

        setSelectedClinic(clinicId);
        setSavedPreferences([]);
        setPreferenceChanges({});
        setError("");
        setSuccess("");

        if (!clinicId) return;

        await loadClinicPreferences(Number(clinicId));
    };

    const handleToggle = (
        id: number,
        channel:
            | "whatsappEnabled"
            | "smsEnabled"
            | "emailEnabled"
    ) => {
        const currentPreference = preferences.find(
            (preference) => preference.id === id
        );

        if (!currentPreference) return;

        const available =
            channel === "whatsappEnabled"
                ? currentPreference.whatsappAvailable
                : channel === "smsEnabled"
                    ? currentPreference.smsAvailable
                    : currentPreference.emailAvailable;

        if (!available) return;

        setPreferenceChanges((current) => ({
            ...current,
            [id]: {
                ...current[id],
                [channel]: !currentPreference[channel],
            },
        }));

        setSuccess("");
        setError("");
    };

    const handleSave = async () => {
        if (!selectedClient || !selectedClinic) {
            setError("Please select a client and clinic.");
            setSuccess("");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const payload = {
                clientId: Number(selectedClient),
                clinicId: Number(selectedClinic),
                preferences: preferences.map((preference) => ({
                    notificationEvent: preference.notificationEvent,
                    whatsappEnabled:
                        preference.whatsappAvailable &&
                        preference.whatsappEnabled,
                    smsEnabled:
                        preference.smsAvailable &&
                        preference.smsEnabled,
                    emailEnabled:
                        preference.emailAvailable &&
                        preference.emailEnabled,
                })),
            };

            await savePreferences(payload);

            const refreshed = await getSavedPreferences(
                Number(selectedClinic)
            );

            setSavedPreferences(refreshed);
            setPreferenceChanges({});
            setSuccess(
                "Your notification preferences have been saved successfully!"
            );
        } catch (error) {
            console.error(
                "Failed to save notification preferences:",
                error
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to save notification preferences."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setPreferenceChanges({});
        setError("");
        setSuccess("");

        if (selectedClinic) {
            void loadClinicPreferences(Number(selectedClinic));
        }
    };

    return (
        <div className="page-container">
            {success && (
                <div className="form-success" role="status" aria-live="polite">
                    <span className="success-icon" aria-hidden="true">
                        ✓
                    </span>

                    <span>{success}</span>

                    <button
                        type="button"
                        className="success-close"
                        onClick={() => setSuccess("")}
                        aria-label="Close success message"
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="page-header">
                <div>
                    <h1>Notification Preferences</h1>
                    <p>
                        Manage how notifications are delivered across your
                        clinics.
                    </p>
                </div>
            </div>

            <section className="content-card">
                <div className="card-header">
                    <div>
                        <h2>Configuration</h2>
                        <p>
                            Select the client and clinic for which you want
                            to configure notification preferences.
                        </p>
                    </div>
                </div>

                <div className="form-grid">
                    <div className="form-field">
                        <label>Client</label>

                        <select
                            value={selectedClient}
                            onChange={handleClientChange}
                            disabled={loadingClients}
                        >
                            <option value="">
                                {loadingClients
                                    ? "Loading clients..."
                                    : "Select Client"}
                            </option>

                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {client.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-field">
                        <label>Clinic</label>

                        <select
                            value={selectedClinic}
                            onChange={handleClinicChange}
                            disabled={!selectedClient || loadingClinics}
                        >
                            <option value="">
                                {loadingClinics
                                    ? "Loading clinics..."
                                    : "Select Clinic"}
                            </option>

                            {clinics.map((clinic: Clinic) => (
                                <option key={clinic.id} value={clinic.id}>
                                    {clinic.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            {error && (
                <p className="form-error" role="alert">
                    {error}
                </p>
            )}

            <section className="content-section">
                <div className="section-header">
                    <div>
                        <h2>Communication Preferences</h2>
                        <p>
                            Control which communication channels are enabled
                            for each notification event.
                        </p>
                    </div>
                </div>

                <div className="table-card">
                    <div className="table-header">
                        <div>Notification Event</div>
                        <div>WhatsApp</div>
                        <div>SMS</div>
                        <div>Email</div>
                    </div>

                    {!selectedClinic ? (
                        <div className="table-row">
                            <div>
                                Select a clinic to configure notification
                                preferences.
                            </div>
                        </div>
                    ) : loadingEvents || loadingPreferences ? (
                        <div className="table-row">
                            <div>Loading notification preferences...</div>
                        </div>
                    ) : preferences.length === 0 ? (
                        <div className="table-row">
                            <div>
                                No notification events are mapped for this
                                clinic.
                            </div>
                        </div>
                    ) : (
                        preferences.map((preference) => (
                            <div
                                className="table-row"
                                key={preference.id}
                            >
                                <div className="event-title">
                                    {preference.event}
                                </div>

                                <div>
                                    <button
                                        type="button"
                                        disabled={!preference.whatsappAvailable}
                                        className={`toggle ${
                                            preference.whatsappEnabled
                                                ? "toggle-on"
                                                : ""
                                        } ${
                                            !preference.whatsappAvailable
                                                ? "toggle-disabled"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handleToggle(
                                                preference.id,
                                                "whatsappEnabled"
                                            )
                                        }
                                        aria-label={`Toggle WhatsApp for ${preference.event}`}
                                    >
                                        <span className="toggle-circle" />
                                    </button>
                                </div>

                                <div>
                                    <button
                                        type="button"
                                        disabled={!preference.smsAvailable}
                                        className={`toggle ${
                                            preference.smsEnabled
                                                ? "toggle-on"
                                                : ""
                                        } ${
                                            !preference.smsAvailable
                                                ? "toggle-disabled"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handleToggle(
                                                preference.id,
                                                "smsEnabled"
                                            )
                                        }
                                        aria-label={`Toggle SMS for ${preference.event}`}
                                    >
                                        <span className="toggle-circle" />
                                    </button>
                                </div>

                                <div>
                                    <button
                                        type="button"
                                        disabled={!preference.emailAvailable}
                                        className={`toggle ${
                                            preference.emailEnabled
                                                ? "toggle-on"
                                                : ""
                                        } ${
                                            !preference.emailAvailable
                                                ? "toggle-disabled"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handleToggle(
                                                preference.id,
                                                "emailEnabled"
                                            )
                                        }
                                        aria-label={`Toggle Email for ${preference.event}`}
                                    >
                                        <span className="toggle-circle" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            <section className="content-card dnd-card">
                <div className="dnd-content">
                    <div>
                        <h2>Do Not Disturb</h2>
                        <p>
                            Pause notifications during specific hours.
                        </p>
                    </div>

                    <button
                        type="button"
                        className={`toggle ${
                            doNotDisturb ? "toggle-on" : ""
                        }`}
                        onClick={() =>
                            setDoNotDisturb((current) => !current)
                        }
                        aria-label="Toggle Do Not Disturb"
                    >
                        <span className="toggle-circle" />
                    </button>
                </div>
            </section>

            <div className="page-actions">
                <button
                    type="button"
                    className="button button-secondary"
                    onClick={handleCancel}
                    disabled={saving}
                >
                    Cancel
                </button>

                <button
                    type="button"
                    className="button button-primary"
                    onClick={handleSave}
                    disabled={
                        saving ||
                        loadingEvents ||
                        loadingPreferences ||
                        !selectedClinic
                    }
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
}

export default Preferences;
