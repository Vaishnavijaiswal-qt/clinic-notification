import { useEffect, useState } from "react";
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

type PreferenceRow = NotificationPreference & {
    id: number;
    event: string;
};

function Preferences() {
    const [clients, setClients] = useState<Client[]>([]);
    const [clinics, setClinics] = useState<Clinic[]>([]);

    const [selectedClient, setSelectedClient] = useState("");
    const [selectedClinic, setSelectedClinic] = useState("");

    const [preferences, setPreferences] = useState<PreferenceRow[]>([]);

    const [doNotDisturb, setDoNotDisturb] = useState(false);
    const [loadingClients, setLoadingClients] = useState(true);
    const [loadingClinics, setLoadingClinics] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadClients = async () => {
            try {
                const data = await getClients();
                setClients(data);
            } catch {
                setError("Failed to load clients.");
            } finally {
                setLoadingClients(false);
            }
        };

        loadClients();
    }, []);

    const handleClientChange = async (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const clientId = event.target.value;

        setSelectedClient(clientId);
        setSelectedClinic("");
        setClinics([]);
        setPreferences([]);

        if (!clientId) {
            return;
        }

        try {
            setError("");
            setLoadingClinics(true);

            const data = await getClinics(Number(clientId));
            setClinics(data);
        } catch {
            setError("Failed to load clinics.");
        } finally {
            setLoadingClinics(false);
        }
    };

    const handleClinicChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setSelectedClinic(event.target.value);
    };

    const handleToggle = (
        id: number,
        channel:
            | "whatsappEnabled"
            | "smsEnabled"
            | "emailEnabled"
    ) => {
        setPreferences((current) =>
            current.map((preference) =>
                preference.id === id
                    ? {
                          ...preference,
                          [channel]: !preference[channel],
                      }
                    : preference
            )
        );
    };

    const handleSave = async () => {
        if (!selectedClient || !selectedClinic) {
            setError("Please select a client and clinic.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            await savePreferences({
                clinicId: Number(selectedClinic),
                preferences: preferences.map((preference) => ({
                    notificationEvent:
                        preference.notificationEvent,
                    whatsappEnabled:
                        preference.whatsappEnabled,
                    smsEnabled: preference.smsEnabled,
                    emailEnabled: preference.emailEnabled,
                })),
            });

            alert("Notification preferences saved successfully.");
        } catch {
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
        setPreferences([]);
        setDoNotDisturb(false);
        setError("");
    };

    return (
        <div className="page-container">
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
                            Select the client and clinic for which you want to
                            configure notification preferences.
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

                    {preferences.length === 0 ? (
                        <div className="table-row">
                            <div>
                                Select a clinic to configure notification
                                preferences.
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
                                        aria-label={`Toggle WhatsApp for ${preference.event}`}
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
                                        aria-label={`Toggle SMS for ${preference.event}`}
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
                        <p>Pause notifications during specific hours.</p>
                    </div>

                    <button
                        type="button"
                        className={`toggle ${
                            doNotDisturb ? "toggle-on" : ""
                        }`}
                        onClick={() =>
                            setDoNotDisturb(!doNotDisturb)
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
                    disabled={saving || !selectedClinic}
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
}

export default Preferences;