import { useState } from "react";
import { Pencil, Save, X } from "lucide-react";

type EventTemplate = {
    id: number;
    eventName: string;
    whatsapp: {
        enabled: boolean;
        message: string;
    };
    sms: {
        enabled: boolean;
        message: string;
    };
    email: {
        enabled: boolean;
        subject: string;
        message: string;
    };
};

const initialTemplates: EventTemplate[] = [
    {
        id: 1,
        eventName: "Patient Registration",
        whatsapp: {
            enabled: true,
            message:
                "Hello {{patientName}}, your registration has been completed successfully.",
        },
        sms: {
            enabled: true,
            message:
                "Hello {{patientName}}, your registration has been completed successfully.",
        },
        email: {
            enabled: true,
            subject: "Patient Registration Confirmation",
            message:
                "Dear {{patientName}},\n\nYour registration has been completed successfully.\n\nThank you.",
        },
    },
    {
        id: 2,
        eventName: "Patient Appointment",
        whatsapp: {
            enabled: true,
            message:
                "Hello {{patientName}}, your appointment is scheduled for {{appointmentDate}} at {{appointmentTime}}.",
        },
        sms: {
            enabled: true,
            message:
                "Your appointment is scheduled for {{appointmentDate}} at {{appointmentTime}}.",
        },
        email: {
            enabled: true,
            subject: "Appointment Confirmation",
            message:
                "Dear {{patientName}},\n\nYour appointment has been scheduled for {{appointmentDate}} at {{appointmentTime}}.\n\nThank you.",
        },
    },
    {
        id: 3,
        eventName: "Appointment Rescheduled",
        whatsapp: {
            enabled: true,
            message:
                "Hello {{patientName}}, your appointment has been rescheduled to {{appointmentDate}} at {{appointmentTime}}.",
        },
        sms: {
            enabled: true,
            message:
                "Your appointment has been rescheduled to {{appointmentDate}} at {{appointmentTime}}.",
        },
        email: {
            enabled: true,
            subject: "Appointment Rescheduled",
            message:
                "Dear {{patientName}},\n\nYour appointment has been rescheduled to {{appointmentDate}} at {{appointmentTime}}.\n\nThank you.",
        },
    },
];

function Templates() {
    const [templates, setTemplates] =
        useState<EventTemplate[]>(initialTemplates);

    const [selectedEventId, setSelectedEventId] = useState<number>(
        initialTemplates[0].id
    );

    const [editing, setEditing] = useState(false);

    const selectedTemplate =
        templates.find((template) => template.id === selectedEventId) ||
        null;

    const updateTemplate = (
        channel: "whatsapp" | "sms" | "email",
        field: "message" | "subject",
        value: string
    ) => {
        setTemplates((current) =>
            current.map((template) => {
                if (template.id !== selectedEventId) {
                    return template;
                }

                if (channel === "email") {
                    return {
                        ...template,
                        email: {
                            ...template.email,
                            [field]: value,
                        },
                    };
                }

                return {
                    ...template,
                    [channel]: {
                        ...template[channel],
                        [field]: value,
                    },
                };
            })
        );
    };

    const handleSave = () => {
        setEditing(false);
    };

    const handleCancel = () => {
        setTemplates(initialTemplates);
        setEditing(false);
    };

    if (!selectedTemplate) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1>Templates</h1>
                        <p>Manage reusable notification templates.</p>
                    </div>
                </div>

                <div className="content-card">
                    <p>No templates available.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header template-page-header">
                <div>
                    <h1>Notification Templates</h1>
                    <p>
                        Create reusable message templates for notification
                        events.
                    </p>
                </div>

                {!editing ? (
                    <button
                        type="button"
                        className="button button-primary"
                        onClick={() => setEditing(true)}
                    >
                        <Pencil size={16} />
                        Edit Template
                    </button>
                ) : (
                    <div className="template-header-actions">
                        <button
                            type="button"
                            className="button button-secondary"
                            onClick={handleCancel}
                        >
                            <X size={16} />
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="button button-primary"
                            onClick={handleSave}
                        >
                            <Save size={16} />
                            Save Changes
                        </button>
                    </div>
                )}
            </div>

            <section className="content-card template-event-card">
                <div className="template-event-select">
                    <label>Event</label>

                    <select
                        value={selectedEventId}
                        onChange={(event) => {
                            setSelectedEventId(Number(event.target.value));
                            setEditing(false);
                        }}
                    >
                        {templates.map((template) => (
                            <option
                                key={template.id}
                                value={template.id}
                            >
                                {template.eventName}
                            </option>
                        ))}
                    </select>
                </div>
            </section>

            <section className="template-channel-grid">
                <div className="template-channel-card">
                    <div className="template-channel-header">
                        <div>
                            <h2>WhatsApp</h2>
                            <p>Reusable WhatsApp message</p>
                        </div>

                        <span className="template-channel-badge">
                            WhatsApp
                        </span>
                    </div>

                    <div className="template-field">
                        <label>Message</label>

                        <textarea
                            value={selectedTemplate.whatsapp.message}
                            onChange={(event) =>
                                updateTemplate(
                                    "whatsapp",
                                    "message",
                                    event.target.value
                                )
                            }
                            disabled={!editing}
                            rows={7}
                            placeholder="Enter WhatsApp message"
                        />
                    </div>
                </div>

                <div className="template-channel-card">
                    <div className="template-channel-header">
                        <div>
                            <h2>SMS</h2>
                            <p>Reusable SMS message</p>
                        </div>

                        <span className="template-channel-badge">
                            SMS
                        </span>
                    </div>

                    <div className="template-field">
                        <label>Message</label>

                        <textarea
                            value={selectedTemplate.sms.message}
                            onChange={(event) =>
                                updateTemplate(
                                    "sms",
                                    "message",
                                    event.target.value
                                )
                            }
                            disabled={!editing}
                            rows={7}
                            placeholder="Enter SMS message"
                        />
                    </div>
                </div>

                <div className="template-channel-card template-email-card">
                    <div className="template-channel-header">
                        <div>
                            <h2>Email</h2>
                            <p>Reusable email template</p>
                        </div>

                        <span className="template-channel-badge">
                            Email
                        </span>
                    </div>

                    <div className="template-field">
                        <label>Subject</label>

                        <input
                            type="text"
                            value={selectedTemplate.email.subject}
                            onChange={(event) =>
                                updateTemplate(
                                    "email",
                                    "subject",
                                    event.target.value
                                )
                            }
                            disabled={!editing}
                            placeholder="Enter email subject"
                        />
                    </div>

                    <div className="template-field">
                        <label>Message</label>

                        <textarea
                            value={selectedTemplate.email.message}
                            onChange={(event) =>
                                updateTemplate(
                                    "email",
                                    "message",
                                    event.target.value
                                )
                            }
                            disabled={!editing}
                            rows={8}
                            placeholder="Enter email message"
                        />
                    </div>
                </div>
            </section>

            <section className="content-card template-variable-card">
                <div>
                    <h2>Available Variables</h2>
                    <p>
                        Use these variables in your templates. They will be
                        replaced with actual values when a notification is
                        sent.
                    </p>
                </div>

                <div className="template-variables">
                    <span>{"{{patientName}}"}</span>
                    <span>{"{{appointmentDate}}"}</span>
                    <span>{"{{appointmentTime}}"}</span>
                    <span>{"{{clinicName}}"}</span>
                    <span>{"{{doctorName}}"}</span>
                </div>
            </section>
        </div>
    );
}

export default Templates;