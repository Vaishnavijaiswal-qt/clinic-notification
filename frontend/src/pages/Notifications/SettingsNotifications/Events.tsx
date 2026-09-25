import { useEffect, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent,
} from "../../../api/eventsApi";

import type { NotificationEvent } from "../../../api/eventsApi";

function Events() {
    const [events, setEvents] = useState<NotificationEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] =
        useState<NotificationEvent | null>(null);
    const [deleteEventData, setDeleteEventData] =
        useState<NotificationEvent | null>(null);

    const [eventName, setEventName] = useState("");
    const [description, setDescription] = useState("");
    const [eventNameError, setEventNameError] = useState("");
    const [descriptionError, setDescriptionError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadEvents = async () => {
            try {
                const data = await getEvents();
                setEvents(data);
            } catch {
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };

        loadEvents();
    }, []);

    const openAddForm = () => {
        setEditingEvent(null);
        setEventName("");
        setDescription("");
        setEventNameError("");
        setDescriptionError("");
        setShowForm(true);
    };

    const openEditForm = (event: NotificationEvent) => {
        setEditingEvent(event);
        setEventName(event.eventName);
        setDescription(event.description);
        setEventNameError("");
        setDescriptionError("");
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingEvent(null);
        setEventName("");
        setDescription("");
        setEventNameError("");
        setDescriptionError("");
    };

    const handleSave = async () => {
        const name = eventName.trim();
        const details = description.trim();

        setEventNameError("");
        setDescriptionError("");

        if (!name) {
            setEventNameError("Event name is required");
        }

        if (!details) {
            setDescriptionError("Description is required");
        }

        if (!name || !details) {
            return;
        }

        const exists = events.some(
            (event) =>
                event.eventName.toLowerCase() === name.toLowerCase() &&
                event.id !== editingEvent?.id
        );

        if (exists) {
            setEventNameError("Event already exists");
            return;
        }

        try {
            setSaving(true);

            if (editingEvent) {
                await updateEvent(editingEvent.id, {
                    eventName: name,
                    description: details,
                });
            } else {
                await createEvent({
                    eventName: name,
                    description: details,
                });
            }

            const data = await getEvents();
            setEvents(data);
            closeForm();
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteEventData) {
            return;
        }

        await deleteEvent(deleteEventData.id);

        setEvents((current) =>
            current.filter(
                (event) => event.id !== deleteEventData.id
            )
        );

        setDeleteEventData(null);
    };

    const formatDate = (date: string) =>
        new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    return (
        <div className="page-container">
            {!showForm ? (
                <>
                    <div className="page-header event-page-header">
                        <div>
                            <h1>Events</h1>
                            <p>
                                Manage notification events for your clinics.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="button button-primary"
                            onClick={openAddForm}
                        >
                            + Add Event
                        </button>
                    </div>

                    <div className="table-card">
                        <div className="events-table-header">
                            <div>Event</div>
                            <div>Description</div>
                            <div>Created At</div>
                            <div>Updated At</div>
                            <div>Actions</div>
                        </div>

                        {loading ? (
                            <div className="events-table-row">
                                <div>Loading events...</div>
                            </div>
                        ) : events.length === 0 ? (
                            <div className="events-table-row">
                                <div>No events found.</div>
                            </div>
                        ) : (
                            events.map((event) => (
                                <div
                                    className="events-table-row"
                                    key={event.id}
                                >
                                    <div className="event-title">
                                        {event.eventName}
                                    </div>

                                    <div className="event-description">
                                        {event.description}
                                    </div>

                                    <div className="event-date">
                                        {formatDate(event.createdAt)}
                                    </div>

                                    <div className="event-date">
                                        {formatDate(event.updatedAt)}
                                    </div>

                                    <div className="event-actions">
                                        <button
                                            type="button"
                                            className="action-icon"
                                            onClick={() =>
                                                openEditForm(event)
                                            }
                                            aria-label={`Edit ${event.eventName}`}
                                        >
                                            <Pencil size={17} />
                                        </button>

                                        <button
                                            type="button"
                                            className="action-icon"
                                            onClick={() =>
                                                setDeleteEventData(event)
                                            }
                                            aria-label={`Delete ${event.eventName}`}
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            ) : (
                <div className="content-card">
                    <div className="card-header event-form-header">
                        <div>
                            <h2>
                                {editingEvent
                                    ? "Edit Event"
                                    : "Add Event"}
                            </h2>

                            <p>
                                {editingEvent
                                    ? "Update the notification event details."
                                    : "Create a new notification event."}
                            </p>
                        </div>

                        <button
                            type="button"
                            className="modal-close"
                            onClick={closeForm}
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="form-grid">
                        <div className="form-field">
                            <label>
                                Event Name{" "}
                                <span className="required">*</span>
                            </label>

                            <input
                                type="text"
                                value={eventName}
                                onChange={(event) => {
                                    setEventName(event.target.value);
                                    setEventNameError("");
                                }}
                                placeholder="Enter event name"
                            />

                            {eventNameError && (
                                <p className="form-error">
                                    {eventNameError}
                                </p>
                            )}
                        </div>

                        <div className="form-field">
                            <label>
                                Description{" "}
                                <span className="required">*</span>
                            </label>

                            <input
                                type="text"
                                value={description}
                                onChange={(event) => {
                                    setDescription(event.target.value);
                                    setDescriptionError("");
                                }}
                                placeholder="Enter event description"
                            />

                            {descriptionError && (
                                <p className="form-error">
                                    {descriptionError}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="page-actions">
                        <button
                            type="button"
                            className="button button-secondary"
                            onClick={closeForm}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="button button-primary"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : editingEvent
                                ? "Update"
                                : "Add Event"}
                        </button>
                    </div>
                </div>
            )}

            {deleteEventData && (
                <div className="delete-confirmation">
                    <div className="delete-confirmation-card">
                        <div className="delete-confirmation-header">
                            <div>
                                <h2>Delete Event</h2>

                                <p>
                                    Are you sure you want to delete{" "}
                                    <strong>
                                        {deleteEventData.eventName}
                                    </strong>
                                    ?
                                </p>
                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={() =>
                                    setDeleteEventData(null)
                                }
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="delete-confirmation-actions">
                            <button
                                type="button"
                                className="button button-secondary"
                                onClick={() =>
                                    setDeleteEventData(null)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="button button-danger"
                                onClick={handleDelete}
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

export default Events;