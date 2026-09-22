import { useState } from "react";

type NotificationPreference = {
    id: number;
    event: string;
    whatsapp: boolean;
    sms: boolean;
    email: boolean;
};

function Preferences() {
    const [selectedClient, setSelectedClient] = useState("");
    const [selectedClinic, setSelectedClinic] = useState("");

    const [preferences, setPreferences] = useState<NotificationPreference[]>([
        {
            id: 1,
            event: "Patient Registration",
            whatsapp: true,
            sms: true,
            email: true,
        },
        {
            id: 2,
            event: "Patient Appointment",
            whatsapp: true,
            sms: true,
            email: true,
        },
        {
            id: 3,
            event: "Appointment Rescheduled",
            whatsapp: true,
            sms: true,
            email: true,
        },
        {
            id: 4,
            event: "Appointment Cancelled",
            whatsapp: true,
            sms: false,
            email: true,
        },
    ]);

    const handleToggle = (
        id: number,
        channel: "whatsapp" | "sms" | "email"
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

    const handleSave = () => {
        if (!selectedClient || !selectedClinic) {
            alert("Please select a client and clinic.");
            return;
        }

        console.log({
            clientId: selectedClient,
            clinicId: selectedClinic,
            preferences,
        });

        alert("Notification preferences saved successfully.");
    };

    const handleCancel = () => {
        setSelectedClient("");
        setSelectedClinic("");
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
                            onChange={(event) => {
                                setSelectedClient(event.target.value);
                                setSelectedClinic("");
                            }}
                        >
                            <option value="">Select Client</option>
                            <option value="client-1">
                                ABC Healthcare
                            </option>
                            <option value="client-2">
                                XYZ Healthcare
                            </option>
                        </select>
                    </div>

                    <div className="form-field">
                        <label>Clinic</label>

                        <select
                            value={selectedClinic}
                            onChange={(event) =>
                                setSelectedClinic(event.target.value)
                            }
                            disabled={!selectedClient}
                        >
                            <option value="">Select Clinic</option>

                            {selectedClient === "client-1" && (
                                <>
                                    <option value="clinic-1">
                                        ABC Medical Center
                                    </option>

                                    <option value="clinic-2">
                                        XYZ Dental Clinic
                                    </option>
                                </>
                            )}

                            {selectedClient === "client-2" && (
                                <option value="clinic-3">
                                    ABC Health Center
                                </option>
                            )}
                        </select>
                    </div>

                </div>

            </section>

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

                    {preferences.map((preference) => (
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
                                        preference.whatsapp
                                            ? "toggle-on"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleToggle(
                                            preference.id,
                                            "whatsapp"
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
                                        preference.sms
                                            ? "toggle-on"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleToggle(
                                            preference.id,
                                            "sms"
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
                                        preference.email
                                            ? "toggle-on"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleToggle(
                                            preference.id,
                                            "email"
                                        )
                                    }
                                    aria-label={`Toggle Email for ${preference.event}`}
                                >
                                    <span className="toggle-circle" />
                                </button>
                            </div>
                        </div>
                    ))}

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
                >
                    Save Changes
                </button>

            </div>

        </div>
    );
}

export default Preferences;