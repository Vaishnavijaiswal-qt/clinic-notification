import { useState, type ChangeEvent } from "react";
import { Pencil, Trash2 } from "lucide-react";

type Channel = "whatsapp" | "sms" | "email";

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
    {
        id: 4,
        eventName: "Appointment Cancelled",
        whatsapp: {
            enabled: true,
            message:
                "Hello {{patientName}}, your appointment on {{appointmentDate}} has been cancelled.",
        },
        sms: {
            enabled: true,
            message:
                "Your appointment on {{appointmentDate}} has been cancelled.",
        },
        email: {
            enabled: true,
            subject: "Appointment Cancelled",
            message:
                "Dear {{patientName}},\n\nYour appointment on {{appointmentDate}} has been cancelled.\n\nThank you.",
        },
    },
];

function Templates() {
    const [templates, setTemplates] =
        useState<EventTemplate[]>(initialTemplates);

    const [selectedEventId, setSelectedEventId] = useState<number>(
        initialTemplates[0].id
    );

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingChannel, setEditingChannel] =
        useState<Channel | null>(null);

    const [deleteTarget, setDeleteTarget] = useState<{
        id: number;
        channel: Channel;
    } | null>(null);

    const [eventName, setEventName] = useState("");
    const [whatsappMessage, setWhatsappMessage] = useState("");
    const [smsMessage, setSmsMessage] = useState("");
    const [emailSubject, setEmailSubject] = useState("");
    const [emailMessage, setEmailMessage] = useState("");

    const selectedTemplate =
        templates.find(
            (template) => template.id === selectedEventId
        ) || null;

    const handleEventChange = (
        event: ChangeEvent<HTMLSelectElement>
    ) => {
        setSelectedEventId(Number(event.target.value));
    };

    const handleUseTemplate = (channel: Channel) => {
        console.log("Template selected:", {
            event: selectedTemplate?.eventName,
            channel,
        });
    };

    const openAddForm = () => {
        setEditingId(null);
        setEditingChannel(null);
        setEventName("");
        setWhatsappMessage("");
        setSmsMessage("");
        setEmailSubject("");
        setEmailMessage("");
        setShowForm(true);
    };

    const openEditForm = (
        template: EventTemplate,
        channel: Channel
    ) => {
        setEditingId(template.id);
        setEditingChannel(channel);
        setEventName(template.eventName);

        if (channel === "whatsapp") {
            setWhatsappMessage(template.whatsapp.message);
        }

        if (channel === "sms") {
            setSmsMessage(template.sms.message);
        }

        if (channel === "email") {
            setEmailSubject(template.email.subject);
            setEmailMessage(template.email.message);
        }

        setShowForm(true);
    };

    const saveTemplate = () => {
        if (!eventName.trim()) {
            return;
        }

        if (editingId !== null && editingChannel !== null) {
            setTemplates((current) =>
                current.map((template) => {
                    if (template.id !== editingId) {
                        return template;
                    }

                    if (editingChannel === "whatsapp") {
                        return {
                            ...template,
                            whatsapp: {
                                ...template.whatsapp,
                                message: whatsappMessage,
                            },
                        };
                    }

                    if (editingChannel === "sms") {
                        return {
                            ...template,
                            sms: {
                                ...template.sms,
                                message: smsMessage,
                            },
                        };
                    }

                    return {
                        ...template,
                        email: {
                            ...template.email,
                            subject: emailSubject,
                            message: emailMessage,
                        },
                    };
                })
            );

            setSelectedEventId(editingId);
        } else {
            const newTemplate: EventTemplate = {
                id: Date.now(),
                eventName,
                whatsapp: {
                    enabled: true,
                    message: whatsappMessage,
                },
                sms: {
                    enabled: true,
                    message: smsMessage,
                },
                email: {
                    enabled: true,
                    subject: emailSubject,
                    message: emailMessage,
                },
            };

            setTemplates((current) => [
                ...current,
                newTemplate,
            ]);

            setSelectedEventId(newTemplate.id);
        }

        setShowForm(false);
        setEditingId(null);
        setEditingChannel(null);
    };

    const deleteTemplate = () => {
        if (deleteTarget === null) {
            return;
        }

        const { id, channel } = deleteTarget;

        setTemplates((current) =>
            current.map((template) => {
                if (template.id !== id) {
                    return template;
                }

                if (channel === "whatsapp") {
                    return {
                        ...template,
                        whatsapp: {
                            ...template.whatsapp,
                            enabled: false,
                        },
                    };
                }

                if (channel === "sms") {
                    return {
                        ...template,
                        sms: {
                            ...template.sms,
                            enabled: false,
                        },
                    };
                }

                return {
                    ...template,
                    email: {
                        ...template.email,
                        enabled: false,
                    },
                };
            })
        );

        setDeleteTarget(null);
    };

    const getChannelName = (channel: Channel) => {
        if (channel === "whatsapp") {
            return "WhatsApp";
        }

        if (channel === "sms") {
            return "SMS";
        }

        return "Email";
    };

    if (!selectedTemplate && !showForm) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1>Notification Templates</h1>
                        <p> Manage notification templates for different events.</p>
                    </div>

                    <button
                        type="button"
                        className="button button-primary"
                        onClick={openAddForm}
                    >
                        + Add Template
                    </button>
                </div>

                <div className="content-card">
                    <p>No templates available.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            {!showForm ? (
                <>
                    <div className="page-header">
                        <div>
                            <h1>Notification Templates</h1>
                            <p> Select an event and use the configured notification template.</p>
                        </div>

                        <button
                            type="button"
                            className="button button-primary"
                            onClick={openAddForm}
                        >
                            + Add Template
                        </button>
                    </div>

                    <section className="content-card template-event-card">
                        <div className="template-event-select">
                            <label>Event</label>

                            <select
                                value={selectedEventId}
                                onChange={handleEventChange}
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

                    {selectedTemplate && (
                        <>
                            <section className="template-channel-grid">
                                {selectedTemplate.whatsapp.enabled && (
                                    <div className="template-channel-card">
                                        <div className="template-channel-header">
                                            <div>
                                                <h2>WhatsApp</h2>
                                                <p>WhatsApp notification template</p>
                                            </div>

                                            <div className="template-channel-actions">
                                                <button
                                                    type="button"
                                                    className="template-icon-button"
                                                    title="Edit WhatsApp template"
                                                    onClick={() =>
                                                        openEditForm(
                                                            selectedTemplate,
                                                            "whatsapp"
                                                        )
                                                    }
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="template-icon-button"
                                                    title="Delete WhatsApp template"
                                                    onClick={() =>
                                                        setDeleteTarget({
                                                            id: selectedTemplate.id,
                                                            channel: "whatsapp",
                                                        })
                                                    }
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="template-field">
                                            <label>Message</label>

                                            <textarea
                                                value={
                                                    selectedTemplate.whatsapp
                                                        .message
                                                }
                                                readOnly
                                                rows={6}
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            className="button button-primary template-use-button"
                                            onClick={() =>
                                                handleUseTemplate("whatsapp")
                                            }
                                        >
                                            Use Template
                                        </button>
                                    </div>
                                )}

                                {selectedTemplate.sms.enabled && (
                                    <div className="template-channel-card">
                                        <div className="template-channel-header">
                                            <div>
                                                <h2>SMS</h2>
                                                <p>SMS notification template</p>
                                            </div>

                                            <div className="template-channel-actions">
                                                <button
                                                    type="button"
                                                    className="template-icon-button"
                                                    title="Edit SMS template"
                                                    onClick={() =>
                                                        openEditForm(
                                                            selectedTemplate,
                                                            "sms"
                                                        )
                                                    }
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="template-icon-button"
                                                    title="Delete SMS template"
                                                    onClick={() =>
                                                        setDeleteTarget({
                                                            id: selectedTemplate.id,
                                                            channel: "sms",
                                                        })
                                                    }
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="template-field">
                                            <label>Message</label>

                                            <textarea
                                                value={
                                                    selectedTemplate.sms
                                                        .message
                                                }
                                                readOnly
                                                rows={6}
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            className="button button-primary template-use-button"
                                            onClick={() =>
                                                handleUseTemplate("sms")
                                            }
                                        >
                                            Use Template
                                        </button>
                                    </div>
                                )}

                                {selectedTemplate.email.enabled && (
                                    <div className="template-channel-card template-email-card">
                                        <div className="template-channel-header">
                                            <div>
                                                <h2>Email</h2>
                                                <p>Email notification template</p>
                                            </div>

                                            <div className="template-channel-actions">
                                                <button
                                                    type="button"
                                                    className="template-icon-button"
                                                    title="Edit Email template"
                                                    onClick={() =>
                                                        openEditForm(
                                                            selectedTemplate,
                                                            "email"
                                                        )
                                                    }
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="template-icon-button"
                                                    title="Delete Email template"
                                                    onClick={() =>
                                                        setDeleteTarget({
                                                            id: selectedTemplate.id,
                                                            channel: "email",
                                                        })
                                                    }
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="template-field">
                                            <label>Subject</label>

                                            <input
                                                type="text"
                                                value={
                                                    selectedTemplate.email
                                                        .subject
                                                }
                                                readOnly
                                            />
                                        </div>

                                        <div className="template-field">
                                            <label>Message</label>

                                            <textarea
                                                value={
                                                    selectedTemplate.email
                                                        .message
                                                }
                                                readOnly
                                                rows={6}
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            className="button button-primary template-use-button"
                                            onClick={() =>
                                                handleUseTemplate("email")
                                            }
                                        >
                                            Use Template
                                        </button>
                                    </div>
                                )}
                            </section>

                            <section className="content-card template-variable-card">
                                <div>
                                    <h2>Available Variables</h2>
                                    <p>
                                        These variables will be replaced with
                                        actual values when the notification is
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
                        </>
                    )}
                </>
            ) : (
                <>
                    <div className="page-header">
                        <div>
                            <h1>
                                {editingId !== null
                                    ? `Edit ${getChannelName(
                                        editingChannel as Channel
                                    )} Template`
                                    : "Add Notification Template"}
                            </h1>

                            <p>Configure notification templates for different channels.</p>
                        </div>
                    </div>

                    <section className="content-card template-form-card">
                        <div className="template-field">
                            <label>Event</label>

                            <input
                                type="text"
                                value={eventName}
                                onChange={(e) =>
                                    setEventName(e.target.value)
                                }
                                placeholder="Enter event name"
                                readOnly={editingId !== null}
                            />
                        </div>

                        {(editingChannel === null ||
                            editingChannel === "whatsapp") && (
                            <div className="template-field">
                                <label>WhatsApp Message</label>

                                <textarea
                                    value={whatsappMessage}
                                    onChange={(e) =>
                                        setWhatsappMessage(e.target.value)
                                    }
                                    rows={5}
                                    placeholder="Enter WhatsApp message"
                                />
                            </div>
                        )}

                        {(editingChannel === null ||
                            editingChannel === "sms") && (
                            <div className="template-field">
                                <label>SMS Message</label>

                                <textarea
                                    value={smsMessage}
                                    onChange={(e) =>
                                        setSmsMessage(e.target.value)
                                    }
                                    rows={5}
                                    placeholder="Enter SMS message"
                                />
                            </div>
                        )}

                        {(editingChannel === null ||
                            editingChannel === "email") && (
                            <>
                                <div className="template-field">
                                    <label>Email Subject</label>

                                    <input
                                        type="text"
                                        value={emailSubject}
                                        onChange={(e) =>
                                            setEmailSubject(e.target.value)
                                        }
                                        placeholder="Enter email subject"
                                    />
                                </div>

                                <div className="template-field">
                                    <label>Email Message</label>

                                    <textarea
                                        value={emailMessage}
                                        onChange={(e) =>
                                            setEmailMessage(e.target.value)
                                        }
                                        rows={7}
                                        placeholder="Enter email message"
                                    />
                                </div>
                            </>
                        )}

                        <div className="page-actions">
                            <button
                                type="button"
                                className="button button-secondary"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingId(null);
                                    setEditingChannel(null);
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="button button-primary"
                                onClick={saveTemplate}
                            >
                                {editingId !== null ? "Update Template" : "Save Template"}
                            </button>
                        </div>
                    </section>
                </>
            )}

            {deleteTarget !== null && (
                <div className="delete-confirmation">
                    <div className="delete-confirmation-card">
                        <div className="delete-confirmation-header">
                            <h2>
                                Delete{" "}
                                {getChannelName(
                                    deleteTarget.channel
                                )}{" "}
                                Template
                            </h2>

                            <p>
                                Are you sure you want to delete this{" "}
                                {getChannelName(
                                    deleteTarget.channel
                                )}{" "}
                                template?
                            </p>
                        </div>

                        <div className="delete-confirmation-actions">
                            <button
                                type="button"
                                className="button button-secondary"
                                onClick={() =>
                                    setDeleteTarget(null)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="button button-danger"
                                onClick={deleteTemplate}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Templates;