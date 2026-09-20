import { useEffect, useState } from "react";
import "./Settings.css";

type NotificationEvent = {
    id: number;
    name: string;
    whatsapp: boolean;
    sms: boolean;
    email: boolean;
};

type SavedSetting = {
    clientId: string;
    clinicId: string;
    event: string;
    whatsapp: boolean;
    sms: boolean;
    email: boolean;
};

function Settings() {

    const [clients, setClients] = useState<
        { id: string; name: string }[]
    >([]);

    const [clinics, setClinics] = useState<
        { id: string; clientId: string; name: string }[]
    >([]);

    const [selectedClient, setSelectedClient] = useState("");
    const [selectedClinic, setSelectedClinic] = useState("");

    const [savedSettings, setSavedSettings] =
        useState<SavedSetting[]>([]);

    const [notificationEvents, setNotificationEvents] =
        useState<NotificationEvent[]>([
            {
                id: 1,
                name: "Appointment Created",
                whatsapp: true,
                sms: true,
                email: true
            },
            {
                id: 2,
                name: "Appointment Reminder",
                whatsapp: true,
                sms: true,
                email: true
            },
            {
                id: 3,
                name: "Appointment Cancelled",
                whatsapp: true,
                sms: false,
                email: true
            },
            {
                id: 4,
                name: "Invoice Generated",
                whatsapp: true,
                sms: true,
                email: true
            },
            {
                id: 5,
                name: "Payment Reminder",
                whatsapp: true,
                sms: false,
                email: true
            }
        ]);

    useEffect(() => {

        fetch("http://localhost:8080/api/clients")
            .then((response) => response.json())
            .then((data) => {
                setClients(data);
            })
            .catch((error) => {
                console.error("Error loading clients:", error);
            });

        fetch("http://localhost:8080/api/clinics")
            .then((response) => response.json())
            .then((data) => {
                setClinics(data);
            })
            .catch((error) => {
                console.error("Error loading clinics:", error);
            });

        fetch("http://localhost:8080/api/settings")
            .then((response) => response.json())
            .then((data) => {
                setSavedSettings(data);
            })
            .catch((error) => {
                console.error("Error loading settings:", error);
            });

    }, []);

    useEffect(() => {

        if (!selectedClient || !selectedClinic || savedSettings.length === 0) {
            return;
        }

        const matchingSettings = savedSettings.filter(
            (setting) =>
                setting.clientId === selectedClient &&
                setting.clinicId === selectedClinic
        );

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setNotificationEvents((previousEvents) =>
            previousEvents.map((event) => {

                const savedSetting = matchingSettings.find(
                    (setting) => setting.event === event.name
                );

                if (!savedSetting) {
                    return event;
                }

                return {
                    ...event,
                    whatsapp: savedSetting.whatsapp,
                    sms: savedSetting.sms,
                    email: savedSetting.email
                };
            })
        );

    }, [selectedClient, selectedClinic, savedSettings]);

    const filteredClinics = clinics.filter(
        (clinic) => clinic.clientId === selectedClient
    );

    const handleCheckboxChange = (
        id: number,
        channel: "whatsapp" | "sms" | "email"
    ) => {

        setNotificationEvents((previousEvents) =>
            previousEvents.map((event) =>
                event.id === id
                    ? {
                        ...event,
                        [channel]: !event[channel]
                    }
                    : event
            )
        );
    };

    const handleSave = () => {

        if (!selectedClient || !selectedClinic) {
            alert("Please select a client and clinic.");
            return;
        }

        const settingsData = notificationEvents.map((event) => ({
            clientId: selectedClient,
            clinicId: selectedClinic,
            event: event.name,
            whatsapp: event.whatsapp,
            sms: event.sms,
            email: event.email
        }));

        settingsData.forEach((setting) => {

            fetch("http://localhost:8080/api/settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(setting)
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log("Backend Response:", data);
                })
                .catch((error) => {
                    console.error("Error saving setting:", error);
                });

        });

        alert("Settings saved successfully!");
    };

    const handleCancel = () => {

        setSelectedClient("");
        setSelectedClinic("");

        alert("Changes cancelled");
    };

    return (
        <div className="settings-page">

            <div className="page-header">

                <h1>Notification Settings</h1>

                <p>
                    Configure communication preferences
                    for your organization.
                </p>

            </div>

            <section className="configuration-card">

                <div className="section-heading">

                    <h2>Configuration</h2>

                    <p>
                        Select the client and clinic for which
                        you want to configure notification preferences.
                    </p>

                </div>

                <div className="configuration-form">

                    <div className="form-group">

                        <label>Client</label>

                        <select
                            value={selectedClient}
                            onChange={(event) => {
                                setSelectedClient(event.target.value);
                                setSelectedClinic("");
                            }}
                        >

                            <option value="">
                                Select Client
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

                    <div className="form-group">

                        <label>Clinic</label>

                        <select
                            value={selectedClinic}
                            onChange={(event) =>
                                setSelectedClinic(event.target.value)
                            }
                        >

                            <option value="">
                                Select Clinic
                            </option>

                            {filteredClinics.map((clinic) => (

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

            <section className="preferences-section">

                <div className="preferences-header">

                    <div>

                        <h2>Communication Preferences</h2>

                        <p>
                            Select the communication channels for
                            each notification event.
                        </p>

                    </div>

                </div>

                <div className="preferences-card">

                    {/* Table Header */}

                    <div className="preferences-table-header">

                        <span>Notification Event</span>

                        <span>WhatsApp</span>

                        <span>SMS</span>

                        <span>Email</span>

                    </div>

                    {/* Table Rows */}

                    {notificationEvents.map((event) => (

                        <div
                            className="preferences-row"
                            key={event.id}
                        >

                            <span className="event-name">
                                {event.name}
                            </span>

                            {/* WhatsApp */}

                            <label className="checkbox-label">

                                <input
                                    type="checkbox"
                                    checked={event.whatsapp}
                                    onChange={() =>
                                        handleCheckboxChange(
                                            event.id,
                                            "whatsapp"
                                        )
                                    }
                                />

                                <span>Enabled</span>

                            </label>

                            {/* SMS */}

                            <label className="checkbox-label">

                                <input
                                    type="checkbox"
                                    checked={event.sms}
                                    onChange={() =>
                                        handleCheckboxChange(
                                            event.id,
                                            "sms"
                                        )
                                    }
                                />

                                <span>Enabled</span>

                            </label>

                            {/* Email */}

                            <label className="checkbox-label">

                                <input
                                    type="checkbox"
                                    checked={event.email}
                                    onChange={() =>
                                        handleCheckboxChange(
                                            event.id,
                                            "email"
                                        )
                                    }
                                />

                                <span>Enabled</span>

                            </label>

                        </div>

                    ))}

                </div>

            </section>

            <div className="page-actions">

                <button
                    className="cancel-button"
                    onClick={handleCancel}
                >
                    Cancel
                </button>

                <button
                    className="save-button"
                    onClick={handleSave}
                >
                    Save Changes
                </button>

            </div>

        </div>
    );
}

export default Settings;