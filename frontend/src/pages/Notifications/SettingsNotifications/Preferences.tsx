import { useEffect, useMemo, useState } from "react";
import {
    getClients,
    getClinics,
    savePreferences,
} from "../../../api/preferencesApi";

import type {
    Client,
    Clinic,
    NotificationPreference,
} from "../../../api/preferencesApi";

import { getEventMappings } from "../../../api/eventmappingApi";
import type { EventMapping } from "../../../api/eventmappingApi";

import { getEvents } from "../../../api/eventsApi";
import type { NotificationEvent } from "../../../api/eventsApi";

type PreferenceRow = NotificationPreference & {
    id: number;
};

function Preferences() {
    const [clients, setClients] = useState<Client[]>([]);
    const [clinics, setClinics] = useState<Clinic[]>([]);

    const [selectedClient, setSelectedClient] = useState("");
    const [selectedClinic, setSelectedClinic] = useState("");

    const [mappings, setMappings] = useState<EventMapping[]>([]);
    const [events, setEvents] = useState<NotificationEvent[]>([]);

    const [preferenceChanges, setPreferenceChanges] =
        useState<Record<number, Partial<PreferenceRow>>>({});

    const [doNotDisturb, setDoNotDisturb] = useState(false);
    const [loadingClients, setLoadingClients] = useState(true);
    const [loadingClinics, setLoadingClinics] = useState(false);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadClients = async () => {
            try {
                const data = await getClients();
                setClients(data);
            } catch (error) {
                console.error(
                    "Failed to load clients:",
                    error
                );

                setError("Failed to load clients.");
            } finally {
                setLoadingClients(false);
            }
        };

        loadClients();
    }, []);

    useEffect(() => {
        const loadEventData = async () => {
            try {
                setLoadingEvents(true);

                const [mappingData, eventResponse] =
                    await Promise.all([
                        getEventMappings(),
                        getEvents("", 0, 1000),
                    ]);

                setMappings(mappingData);
                setEvents(eventResponse.content);
            } catch (error) {
                console.error(
                    "Failed to load notification events:",
                    error
                );

                setError(
                    "Failed to load notification events."
                );
            } finally {
                setLoadingEvents(false);
            }
        };

        loadEventData();
    }, []);

    const preferences = useMemo<PreferenceRow[]>(() => {
        if (!selectedClient || !selectedClinic) {
            return [];
        }

        const clientId = Number(selectedClient);
        const clinicId = Number(selectedClinic);

        const grouped = new Map<number, PreferenceRow>();

        mappings
            .filter(
                (mapping) =>
                    mapping.clientId === clientId &&
                    mapping.clinicId === clinicId
            )
            .forEach((mapping) => {
                const event = events.find(
                    (item) => item.id === mapping.eventId
                );

                if (!event) {
                    return;
                }

                if (!grouped.has(mapping.eventId)) {
                    grouped.set(mapping.eventId, {
                        id: mapping.eventId,
                        notificationEvent: event.eventName,
                        whatsappEnabled: false,
                        smsEnabled: false,
                        emailEnabled: false,
                    });
                }

                const current = grouped.get(mapping.eventId)!;

                if (
                    mapping.notificationType ===
                    "WHATSAPP"
                ) {
                    current.whatsappEnabled = true;
                }

                if (
                    mapping.notificationType === "SMS"
                ) {
                    current.smsEnabled = true;
                }

                if (
                    mapping.notificationType === "EMAIL"
                ) {
                    current.emailEnabled = true;
                }
            });

        return Array.from(grouped.values()).map(
            (preference) => ({
                ...preference,
                ...preferenceChanges[preference.id],
            })
        );
    }, [
        selectedClient,
        selectedClinic,
        mappings,
        events,
        preferenceChanges,
    ]);

    const handleClientChange = async (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const clientId = event.target.value;

        setSelectedClient(clientId);
        setSelectedClinic("");
        setClinics([]);
        setPreferenceChanges({});
        setError("");

        if (!clientId) {
            return;
        }

        try {
            setLoadingClinics(true);

            const data = await getClinics(
                Number(clientId)
            );

            setClinics(data);
        } catch (error) {
            console.error(
                "Failed to load clinics:",
                error
            );

            setError("Failed to load clinics.");
        } finally {
            setLoadingClinics(false);
        }
    };

    const handleClinicChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setSelectedClinic(event.target.value);
        setPreferenceChanges({});
        setError("");
    };

    const handleToggle = (
        id: number,
        channel:
            | "whatsappEnabled"
            | "smsEnabled"
            | "emailEnabled"
    ) => {
        const currentPreference =
            preferences.find(
                (preference) =>
                    preference.id === id
            );

        if (!currentPreference) {
            return;
        }

        setPreferenceChanges((current) => ({
            ...current,
            [id]: {
                ...current[id],
                [channel]:
                    !currentPreference[channel],
            },
        }));
    };

    const handleSave = async () => {
        if (!selectedClient || !selectedClinic) {
            setError(
                "Please select a client and clinic."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");

            await savePreferences({
                clientId: Number(selectedClient),
                clinicId: Number(selectedClinic),

                preferences: preferences.map(
                    (preference) => ({
                        notificationEvent:
                            preference.notificationEvent ===
                            "Patient Registration"
                                ? "PATIENT_REGISTRATION"
                                : preference.notificationEvent ===
                                    "Patient Appointment"
                                    ? "PATIENT_APPOINTMENT"
                                    : preference.notificationEvent ===
                                        "Appointment Rescheduled"
                                        ? "APPOINTMENT_RESCHEDULED"
                                        : "APPOINTMENT_CANCELLED",

                        whatsappEnabled:
                            preference.whatsappEnabled,

                        smsEnabled:
                            preference.smsEnabled,

                        emailEnabled:
                            preference.emailEnabled,
                    })
                ),
            });

            setPreferenceChanges({});

            alert(
                "Notification preferences saved successfully."
            );
        } catch (error) {
            console.error(
                "Failed to save notification preferences:",
                error
            );

            setError(
                "Failed to save notification preferences."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setSelectedClient("");
        setSelectedClinic("");
        setClinics([]);
        setPreferenceChanges({});
        setDoNotDisturb(false);
        setError("");
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Notification Preferences</h1>

                    <p>
                        Manage how notifications are
                        delivered across your clinics.
                    </p>
                </div>
            </div>

            <section className="content-card">
                <div className="card-header">
                    <div>
                        <h2>Configuration</h2>

                        <p>
                            Select the client and clinic
                            for which you want to configure
                            notification preferences.
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
                                <option
                                    key={client.id}
                                    value={client.id}
                                >
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
                            disabled={
                                !selectedClient ||
                                loadingClinics
                            }
                        >
                            <option value="">
                                {loadingClinics
                                    ? "Loading clinics..."
                                    : "Select Clinic"}
                            </option>

                            {clinics.map((clinic) => (
                                <option
                                    key={clinic.id}
                                    value={clinic.id}
                                >
                                    {clinic.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            {error && <p>{error}</p>}

            <section className="content-section">
                <div className="section-header">
                    <div>
                        <h2>Communication Preferences</h2>

                        <p>
                            Control which communication
                            channels are enabled for each
                            notification event.
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
                                Select a clinic to configure
                                notification preferences.
                            </div>
                        </div>
                    ) : loadingEvents ? (
                        <div className="table-row">
                            <div>
                                Loading notification
                                events...
                            </div>
                        </div>
                    ) : preferences.length === 0 ? (
                        <div className="table-row">
                            <div>
                                No notification events are
                                mapped for this clinic.
                            </div>
                        </div>
                    ) : (
                        preferences.map(
                            (preference) => (
                                <div
                                    className="table-row"
                                    key={preference.id}
                                >
                                    <div className="event-title">
                                        {
                                            preference.notificationEvent
                                        }
                                    </div>

                                    <div>
                                        <button
                                            type="button"
                                            className={`toggle ${
                                                preference.whatsappEnabled
                                                    ? "toggle-on"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                handleToggle(
                                                    preference.id,
                                                    "whatsappEnabled"
                                                )
                                            }
                                            aria-label={`Toggle WhatsApp for ${preference.notificationEvent}`}
                                        >
                                            <span className="toggle-circle" />
                                        </button>
                                    </div>

                                    <div>
                                        <button
                                            type="button"
                                            className={`toggle ${
                                                preference.smsEnabled
                                                    ? "toggle-on"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                handleToggle(
                                                    preference.id,
                                                    "smsEnabled"
                                                )
                                            }
                                            aria-label={`Toggle SMS for ${preference.notificationEvent}`}
                                        >
                                            <span className="toggle-circle" />
                                        </button>
                                    </div>

                                    <div>
                                        <button
                                            type="button"
                                            className={`toggle ${
                                                preference.emailEnabled
                                                    ? "toggle-on"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                handleToggle(
                                                    preference.id,
                                                    "emailEnabled"
                                                )
                                            }
                                            aria-label={`Toggle Email for ${preference.notificationEvent}`}
                                        >
                                            <span className="toggle-circle" />
                                        </button>
                                    </div>
                                </div>
                            )
                        )
                    )}
                </div>
            </section>

            <section className="content-card dnd-card">
                <div className="dnd-content">
                    <div>
                        <h2>Do Not Disturb</h2>

                        <p>
                            Pause notifications during
                            specific hours.
                        </p>
                    </div>

                    <button
                        type="button"
                        className={`toggle ${
                            doNotDisturb
                                ? "toggle-on"
                                : ""
                        }`}
                        onClick={() =>
                            setDoNotDisturb(
                                !doNotDisturb
                            )
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
                >
                    Cancel
                </button>

                <button
                    type="button"
                    className="button button-primary"
                    onClick={handleSave}
                    disabled={
                        saving || !selectedClinic
                    }
                >
                    {saving
                        ? "Saving..."
                        : "Save Changes"}
                </button>
            </div>
        </div>
    );
}

export default Preferences;