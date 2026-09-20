import { useState } from "react";
import "./Templates.css";

type Template = {
    id: number;
    event: string;
    channel: "Email" | "SMS";
    subject: string;
    body: string;
    active: boolean;
};

function Templates() {

    const [templates, setTemplates] = useState<Template[]>([
        {
            id: 1,
            event: "Patient Registration",
            channel: "Email",
            subject: "Welcome to {{clinicName}}",
            body:
                "Hello {{patientName}},\n\n" +
                "Your registration with {{clinicName}} has been completed successfully.",
            active: true
        },
        {
            id: 2,
            event: "Patient Appointment",
            channel: "Email",
            subject: "Appointment Confirmation",
            body:
                "Hello {{patientName}},\n\n" +
                "Your appointment is confirmed for {{appointmentDate}} at {{appointmentTime}}.",
            active: true
        },
        {
            id: 3,
            event: "Patient Appointment Rescheduled",
            channel: "Email",
            subject: "Appointment Rescheduled",
            body:
                "Hello {{patientName}},\n\n" +
                "Your appointment has been rescheduled to {{appointmentDate}} at {{appointmentTime}}.",
            active: true
        },
        {
            id: 4,
            event: "Patient Appointment Cancelled",
            channel: "Email",
            subject: "Appointment Cancelled",
            body:
                "Hello {{patientName}},\n\n" +
                "Your appointment scheduled for {{appointmentDate}} has been cancelled.",
            active: true
        }
    ]);

    const [selectedTemplate, setSelectedTemplate] =
        useState<Template | null>(null);

    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        event: "",
        channel: "Email",
        subject: "",
        body: ""
    });

    const handleAddTemplate = () => {
        setSelectedTemplate(null);

        setFormData({
            event: "",
            channel: "Email",
            subject: "",
            body: ""
        });

        setShowForm(true);
    };

    const handleEditTemplate = (template: Template) => {
        setSelectedTemplate(template);

        setFormData({
            event: template.event,
            channel: template.channel,
            subject: template.subject,
            body: template.body
        });

        setShowForm(true);
    };

    const handleSaveTemplate = () => {

        if (
            !formData.event ||
            !formData.channel ||
            !formData.body
        ) {
            alert("Please fill in all required fields.");
            return;
        }

        if (selectedTemplate) {

            setTemplates((previousTemplates) =>
                previousTemplates.map((template) =>
                    template.id === selectedTemplate.id
                        ? {
                            ...template,
                            event: formData.event,
                            channel: formData.channel as "Email" | "SMS",
                            subject: formData.subject,
                            body: formData.body
                        }
                        : template
                )
            );

        } else {

            const newTemplate: Template = {
                id: Date.now(),
                event: formData.event,
                channel: formData.channel as "Email" | "SMS",
                subject: formData.subject,
                body: formData.body,
                active: true
            };

            setTemplates((previousTemplates) => [
                ...previousTemplates,
                newTemplate
            ]);
        }

        setShowForm(false);
    };

    const handleCancel = () => {
        setShowForm(false);
        setSelectedTemplate(null);
    };

    return (
        <div className="templates-page">

            <div className="templates-page-header">

                <div>
                    <h1>Message Templates</h1>

                    <p>
                        Create and manage templates used for
                        patient notifications.
                    </p>
                </div>

                <button
                    className="add-template-button"
                    onClick={handleAddTemplate}
                >
                    + Add Template
                </button>

            </div>

            {!showForm && (
                <section className="templates-card">

                    <div className="templates-card-header">

                        <div>
                            <h2>Notification Templates</h2>

                            <p>
                                Templates are selected based on
                                the notification event and channel.
                            </p>
                        </div>

                    </div>

                    <div className="templates-table">

                        <div className="templates-table-header">

                            <span>Event</span>
                            <span>Channel</span>
                            <span>Subject</span>
                            <span>Status</span>
                            <span>Action</span>

                        </div>

                        {templates.map((template) => (

                            <div
                                className="templates-table-row"
                                key={template.id}
                            >

                                <span className="template-event">
                                    {template.event}
                                </span>

                                <span>
                                    <span className="channel-badge">
                                        {template.channel}
                                    </span>
                                </span>

                                <span className="template-subject">
                                    {template.subject || "-"}
                                </span>

                                <span>
                                    <span
                                        className={
                                            template.active
                                                ? "status-active"
                                                : "status-inactive"
                                        }
                                    >
                                        {template.active
                                            ? "Active"
                                            : "Inactive"}
                                    </span>
                                </span>

                                <span>
                                    <button
                                        className="edit-button"
                                        onClick={() =>
                                            handleEditTemplate(template)
                                        }
                                    >
                                        Edit
                                    </button>
                                </span>

                            </div>

                        ))}

                    </div>

                </section>
            )}

            {showForm && (
                <section className="template-form-card">

                    <div className="template-form-header">

                        <div>
                            <h2>
                                {selectedTemplate
                                    ? "Edit Template"
                                    : "Create Template"}
                            </h2>

                            <p>
                                Configure the message content for
                                the selected notification event.
                            </p>
                        </div>

                    </div>

                    <div className="template-form">

                        <div className="form-row">

                            <div className="template-form-group">

                                <label>Notification Event</label>

                                <select
                                    value={formData.event}
                                    onChange={(event) =>
                                        setFormData({
                                            ...formData,
                                            event: event.target.value
                                        })
                                    }
                                >

                                    <option value="">
                                        Select Event
                                    </option>

                                    <option value="Patient Registration">
                                        Patient Registration
                                    </option>

                                    <option value="Patient Appointment">
                                        Patient Appointment
                                    </option>

                                    <option value="Patient Appointment Rescheduled">
                                        Patient Appointment Rescheduled
                                    </option>

                                    <option value="Patient Appointment Cancelled">
                                        Patient Appointment Cancelled
                                    </option>

                                </select>

                            </div>

                            <div className="template-form-group">

                                <label>Channel</label>

                                <select
                                    value={formData.channel}
                                    onChange={(event) =>
                                        setFormData({
                                            ...formData,
                                            channel: event.target.value
                                        })
                                    }
                                >

                                    <option value="Email">
                                        Email
                                    </option>

                                    <option value="SMS">
                                        SMS
                                    </option>

                                </select>

                            </div>

                        </div>

                        {formData.channel === "Email" && (
                            <div className="template-form-group">

                                <label>Email Subject</label>

                                <input
                                    type="text"
                                    placeholder="Enter email subject"
                                    value={formData.subject}
                                    onChange={(event) =>
                                        setFormData({
                                            ...formData,
                                            subject: event.target.value
                                        })
                                    }
                                />

                            </div>
                        )}

                        <div className="template-form-group">

                            <label>Message Body</label>

                            <textarea
                                placeholder="Enter message template"
                                value={formData.body}
                                onChange={(event) =>
                                    setFormData({
                                        ...formData,
                                        body: event.target.value
                                    })
                                }
                            />

                        </div>

                        <div className="template-variables">

                            <h3>Available Variables</h3>

                            <p>
                                Use these variables in your template.
                                They will be replaced with actual
                                patient information when sending.
                            </p>

                            <div className="variable-list">

                                <span>{"{{patientName}}"}</span>
                                <span>{"{{clinicName}}"}</span>
                                <span>{"{{appointmentDate}}"}</span>
                                <span>{"{{appointmentTime}}"}</span>

                            </div>

                        </div>

                    </div>

                    <div className="template-form-actions">

                        <button
                            className="cancel-template-button"
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>

                        <button
                            className="save-template-button"
                            onClick={handleSaveTemplate}
                        >
                            Save Template
                        </button>

                    </div>

                </section>
            )}

        </div>
    );
}

export default Templates;