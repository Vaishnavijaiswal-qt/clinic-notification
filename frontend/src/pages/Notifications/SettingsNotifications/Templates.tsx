import { useEffect, useState, type ChangeEvent } from "react";
import { Pencil, Trash2 } from "lucide-react";

import {
    getTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate as deleteTemplateApi,
    type Template as ApiTemplate,
    type NotificationType,
} from "../../../api/templatesApi";

import {
    getEvents,
    type NotificationEvent,
    type EventPage,
} from "../../../api/eventsApi";

type Channel = "whatsapp" | "sms" | "email";

type ChannelTemplate = {
    id: number | null;
    enabled: boolean;
    message: string;
};

type EmailTemplate = {
    id: number | null;
    enabled: boolean;
    subject: string;
    message: string;
};

type EventTemplate = {
    notificationEvent: string;
    whatsapp: ChannelTemplate;
    sms: ChannelTemplate;
    email: EmailTemplate;
};

const formatEventName = (event: string) =>
    event
        .replace(/_/g, " ")
        .trim()
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");

const normalizeEventName = (event: string) =>
    event.trim().toLowerCase().replace(/_/g, " ").replace(/\s+/g, " ");

const toApiEventValue = (event: string) => {
    const value = event.trim().toLowerCase().replace(/_/g, " ").replace(/\s+/g, "_");

    const eventValues: Record<string, string> = {
        "patient_registration": "patient_registration",
        "patient_appointment": "patient_appointment",
        "appointment_rescheduled": "appointment_rescheduled",
        "appointment_cancelled": "appointment_cancelled",
        "patient registration": "patient_registration",
        "patient appointment": "patient_appointment",
        "appointment rescheduled": "appointment_rescheduled",
        "appointment cancelled": "appointment_cancelled",
    };

    return eventValues[value] ?? value;
};

const mapApiTemplates = (apiTemplates: ApiTemplate[]): EventTemplate[] => {
    const grouped = new Map<string, EventTemplate>();

    apiTemplates.forEach((template) => {
        const eventKey = normalizeEventName(template.notificationEvent);

        if (!grouped.has(eventKey)) {
            grouped.set(eventKey, {
                notificationEvent: template.notificationEvent,
                whatsapp: { id: null, enabled: false, message: "" },
                sms: { id: null, enabled: false, message: "" },
                email: { id: null, enabled: false, subject: "", message: "" },
            });
        }

        const eventTemplate = grouped.get(eventKey);

        if (!eventTemplate) {
            return;
        }

        if (template.notificationType === "WHATSAPP") {
            eventTemplate.whatsapp = {
                id: template.id,
                enabled: true,
                message: template.message,
            };
        } else if (template.notificationType === "SMS") {
            eventTemplate.sms = {
                id: template.id,
                enabled: true,
                message: template.message,
            };
        } else if (template.notificationType === "EMAIL") {
            eventTemplate.email = {
                id: template.id,
                enabled: true,
                subject: template.subject ?? "",
                message: template.message,
            };
        }
    });

    return Array.from(grouped.values());
};

const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }

    return fallback;
};

function Templates() {
    const [templates, setTemplates] = useState<EventTemplate[]>([]);
    const [events, setEvents] = useState<NotificationEvent[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ channel: Channel } | null>(null);
    const [eventName, setEventName] = useState("");
    const [whatsappMessage, setWhatsappMessage] = useState("");
    const [smsMessage, setSmsMessage] = useState("");
    const [emailSubject, setEmailSubject] = useState("");
    const [emailMessage, setEmailMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const selectedEvent =
        events.find((event) => event.id === selectedEventId) ?? null;

    const selectedTemplate =
        selectedEvent
            ? templates.find(
                  (template) =>
                      normalizeEventName(template.notificationEvent) ===
                      normalizeEventName(selectedEvent.eventName)
              ) ?? null
            : null;

    useEffect(() => {
    const loadInitialData = async () => {
        try {
            setError("");

            const [templateData, eventResponse] = await Promise.all([
                getTemplates(),
                getEvents("", 0, 100),
            ]);

            const eventData: NotificationEvent[] = Array.isArray(eventResponse)
                ? eventResponse
                : (eventResponse as EventPage).content ?? [];

            setTemplates(mapApiTemplates(templateData));
            setEvents(eventData);
            setSelectedEventId(
                eventData.length > 0 ? eventData[0].id : null
            );

            if (eventData.length === 0) {
                setError("No events found.");
            }
        } catch (error) {
            console.error("Failed to load notification template data:", error);
            setError(
                getErrorMessage(
                    error,
                    "Failed to load notification templates."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    void loadInitialData();
}, []);

    const refreshTemplates = async () => {
        const data = await getTemplates();
        setTemplates(mapApiTemplates(data));
    };

    const handleEventChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedEventId(Number(event.target.value));
    };

    const openAddForm = () => {
        setEditingId(null);
        setEditingChannel(null);
        setEventName(selectedEvent?.eventName ?? "");
        setWhatsappMessage("");
        setSmsMessage("");
        setEmailSubject("");
        setEmailMessage("");
        setError("");
        setShowForm(true);
    };

    const openEditForm = (template: EventTemplate, channel: Channel) => {
        const channelTemplate =
            channel === "whatsapp"
                ? template.whatsapp
                : channel === "sms"
                  ? template.sms
                  : template.email;

        if (channelTemplate.id === null) {
            return;
        }

        setEditingId(channelTemplate.id);
        setEditingChannel(channel);
        setEventName(template.notificationEvent);
        setWhatsappMessage(channel === "whatsapp" ? template.whatsapp.message : "");
        setSmsMessage(channel === "sms" ? template.sms.message : "");
        setEmailSubject(channel === "email" ? template.email.subject : "");
        setEmailMessage(channel === "email" ? template.email.message : "");
        setError("");
        setShowForm(true);
    };

    const saveTemplate = async () => {
        if (!eventName.trim()) {
            setError("Please select an event.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            if (editingId !== null && editingChannel !== null) {
                let notificationType: NotificationType;
                let message: string;
                let subject: string | null = null;

                if (editingChannel === "whatsapp") {
                    notificationType = "WHATSAPP";
                    message = whatsappMessage;
                } else if (editingChannel === "sms") {
                    notificationType = "SMS";
                    message = smsMessage;
                } else {
                    notificationType = "EMAIL";
                    subject = emailSubject.trim() || null;
                    message = emailMessage;
                }

                if (!message.trim()) {
                    setError("Message cannot be empty.");
                    return;
                }

                await updateTemplate(editingId, {
                    notificationEvent: toApiEventValue(eventName),
                    notificationType,
                    subject,
                    message: message.trim(),
                });
            } else {
                const requests = [
                    whatsappMessage.trim()
                        ? createTemplate({
                              notificationEvent: toApiEventValue(eventName),
                              notificationType: "WHATSAPP",
                              subject: null,
                              message: whatsappMessage.trim(),
                          })
                        : null,
                    smsMessage.trim()
                        ? createTemplate({
                              notificationEvent: toApiEventValue(eventName),
                              notificationType: "SMS",
                              subject: null,
                              message: smsMessage.trim(),
                          })
                        : null,
                    emailMessage.trim()
                        ? createTemplate({
                              notificationEvent: toApiEventValue(eventName),
                              notificationType: "EMAIL",
                              subject: emailSubject.trim() || null,
                              message: emailMessage.trim(),
                          })
                        : null,
                ].filter((request) => request !== null);

                if (requests.length === 0) {
                    setError("Please enter at least one notification template.");
                    return;
                }

                const results = await Promise.allSettled(requests);
                const failed = results.filter((result) => result.status === "rejected");

                await refreshTemplates();

                if (failed.length > 0) {
                    const firstFailure = failed[0];

                    if (firstFailure.status === "rejected") {
                        setError(
                            getErrorMessage(
                                firstFailure.reason,
                                "Some templates could not be created."
                            )
                        );
                    }

                    return;
                }
            }

            await refreshTemplates();
            setShowForm(false);
            setEditingId(null);
            setEditingChannel(null);
            setEventName("");
            setWhatsappMessage("");
            setSmsMessage("");
            setEmailSubject("");
            setEmailMessage("");
        } catch (error) {
            console.error("Failed to save template:", error);
            setError(getErrorMessage(error, "Failed to save notification template."));
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTemplate = async () => {
        if (deleteTarget === null || selectedTemplate === null) {
            return;
        }

        const channelTemplate =
            deleteTarget.channel === "whatsapp"
                ? selectedTemplate.whatsapp
                : deleteTarget.channel === "sms"
                  ? selectedTemplate.sms
                  : selectedTemplate.email;

        if (channelTemplate.id === null) {
            setDeleteTarget(null);
            return;
        }

        try {
            setSaving(true);
            setError("");
            await deleteTemplateApi(channelTemplate.id);
            await refreshTemplates();
            setDeleteTarget(null);
        } catch (error) {
            console.error("Failed to delete template:", error);
            setError(getErrorMessage(error, "Failed to delete notification template."));
        } finally {
            setSaving(false);
        }
    };

    const getChannelName = (channel: Channel) => {
        if (channel === "whatsapp") return "WhatsApp";
        if (channel === "sms") return "SMS";
        return "Email";
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setEditingChannel(null);
        setEventName("");
        setWhatsappMessage("");
        setSmsMessage("");
        setEmailSubject("");
        setEmailMessage("");
        setError("");
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="content-card">
                    <p>Loading notification templates...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            {error && <div className="error-message">{error}</div>}

            {!showForm ? (
                <>
                    <div className="page-header">
                        <div>
                            <h1>Notification Templates</h1>
                            <p>Configure notification templates for each event and channel.</p>
                        </div>

                        <button
                            type="button"
                            className="button button-primary"
                            onClick={openAddForm}
                        >
                            + Add Template
                        </button>
                    </div>

                    {events.length === 0 ? (
                        <div className="content-card">
                            <p>No events available.</p>
                        </div>
                    ) : (
                        <>
                            <section className="content-card template-event-card">
                                <div className="template-event-select">
                                    <label>Event</label>
                                    <select
                                        value={selectedEventId ?? ""}
                                        onChange={handleEventChange}
                                    >
                                        {events.map((event) => (
                                            <option key={event.id} value={event.id}>
                                                {formatEventName(event.eventName)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </section>

                            {!selectedTemplate ? (
                                <div className="content-card">
                                    <p>No notification template configured for this event.</p>
                                </div>
                            ) : (
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
                                                                openEditForm(selectedTemplate, "whatsapp")
                                                            }
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="template-icon-button"
                                                            title="Delete WhatsApp template"
                                                            onClick={() =>
                                                                setDeleteTarget({ channel: "whatsapp" })
                                                            }
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="template-field">
                                                    <label>Message</label>
                                                    <textarea
                                                        value={selectedTemplate.whatsapp.message}
                                                        readOnly
                                                        rows={6}
                                                    />
                                                </div>
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
                                                                openEditForm(selectedTemplate, "sms")
                                                            }
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="template-icon-button"
                                                            title="Delete SMS template"
                                                            onClick={() =>
                                                                setDeleteTarget({ channel: "sms" })
                                                            }
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="template-field">
                                                    <label>Message</label>
                                                    <textarea
                                                        value={selectedTemplate.sms.message}
                                                        readOnly
                                                        rows={6}
                                                    />
                                                </div>
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
                                                                openEditForm(selectedTemplate, "email")
                                                            }
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="template-icon-button"
                                                            title="Delete Email template"
                                                            onClick={() =>
                                                                setDeleteTarget({ channel: "email" })
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
                                                        value={selectedTemplate.email.subject}
                                                        readOnly
                                                    />
                                                </div>
                                                <div className="template-field">
                                                    <label>Message</label>
                                                    <textarea
                                                        value={selectedTemplate.email.message}
                                                        readOnly
                                                        rows={6}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </section>

                                    <section className="content-card template-variable-card">
                                        <div>
                                            <h2>Available Variables</h2>
                                            <p>
                                                These variables will be replaced with actual values when
                                                the notification is sent.
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
                    )}
                </>
            ) : (
                <>
                    <div className="page-header">
                        <div>
                            <h1>
                                {editingId !== null
                                    ? `Edit ${getChannelName(editingChannel as Channel)} Template`
                                    : "Add Notification Template"}
                            </h1>
                            <p>Configure notification templates for different channels.</p>
                        </div>
                    </div>

                    <section className="content-card template-form-card">
                        <div className="template-field">
                            <label>Event</label>
                            <select
                                value={eventName}
                                onChange={(event) => setEventName(event.target.value)}
                                disabled={editingId !== null}
                            >
                                <option value="">Select event</option>
                                {events.map((event) => (
                                    <option key={event.id} value={event.eventName}>
                                        {formatEventName(event.eventName)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {(editingChannel === null || editingChannel === "whatsapp") && (
                            <div className="template-field">
                                <label>WhatsApp Message</label>
                                <textarea
                                    value={whatsappMessage}
                                    onChange={(event) => setWhatsappMessage(event.target.value)}
                                    rows={5}
                                    placeholder="Enter WhatsApp message"
                                />
                            </div>
                        )}

                        {(editingChannel === null || editingChannel === "sms") && (
                            <div className="template-field">
                                <label>SMS Message</label>
                                <textarea
                                    value={smsMessage}
                                    onChange={(event) => setSmsMessage(event.target.value)}
                                    rows={5}
                                    placeholder="Enter SMS message"
                                />
                            </div>
                        )}

                        {(editingChannel === null || editingChannel === "email") && (
                            <>
                                <div className="template-field">
                                    <label>Email Subject</label>
                                    <input
                                        type="text"
                                        value={emailSubject}
                                        onChange={(event) => setEmailSubject(event.target.value)}
                                        placeholder="Enter email subject"
                                    />
                                </div>
                                <div className="template-field">
                                    <label>Email Message</label>
                                    <textarea
                                        value={emailMessage}
                                        onChange={(event) => setEmailMessage(event.target.value)}
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
                                onClick={closeForm}
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="button button-primary"
                                onClick={saveTemplate}
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingId !== null
                                      ? "Update Template"
                                      : "Save Template"}
                            </button>
                        </div>
                    </section>
                </>
            )}

            {deleteTarget !== null && (
                <div className="delete-confirmation">
                    <div className="delete-confirmation-card">
                        <div className="delete-confirmation-header">
                            <h2>Delete {getChannelName(deleteTarget.channel)} Template</h2>
                            <p>
                                Are you sure you want to delete this{" "}
                                {getChannelName(deleteTarget.channel)} template?
                            </p>
                        </div>
                        <div className="delete-confirmation-actions">
                            <button
                                type="button"
                                className="button button-secondary"
                                onClick={() => setDeleteTarget(null)}
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="button button-danger"
                                onClick={handleDeleteTemplate}
                                disabled={saving}
                            >
                                {saving ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Templates;