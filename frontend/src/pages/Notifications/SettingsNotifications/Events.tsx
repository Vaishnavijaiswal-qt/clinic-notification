import { useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";

type EventItem = {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
};

function Events() {
    const [events, setEvents] = useState<EventItem[]>([
        {
            id: 1,
            name: "Patient Registration",
            description: "Notification when a new patient is registered.",
            createdAt: "23 Sep 2026, 10:20 AM",
            updatedAt: "23 Sep 2026, 10:20 AM",
        },
        {
            id: 2,
            name: "Patient Appointment",
            description: "Notification when a patient appointment is created.",
            createdAt: "23 Sep 2026, 10:25 AM",
            updatedAt: "23 Sep 2026, 10:25 AM",
        },
        {
            id: 3,
            name: "Appointment Rescheduled",
            description: "Notification when an appointment is rescheduled.",
            createdAt: "23 Sep 2026, 10:30 AM",
            updatedAt: "23 Sep 2026, 10:30 AM",
        },
        {
            id: 4,
            name: "Appointment Cancelled",
            description: "Notification when an appointment is cancelled.",
            createdAt: "23 Sep 2026, 10:35 AM",
            updatedAt: "23 Sep 2026, 10:35 AM",
        },
    ]);

    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
    const [deleteEvent, setDeleteEvent] = useState<EventItem | null>(null);
    const [eventName, setEventName] = useState("");
    const [description, setDescription] = useState("");

    const openAddForm = () => {
        setEditingEvent(null);
        setEventName("");
        setDescription("");
        setShowForm(true);
    };

    const openEditForm = (event: EventItem) => {
        setEditingEvent(event);
        setEventName(event.name);
        setDescription(event.description);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingEvent(null);
        setEventName("");
        setDescription("");
    };

    const handleSave = () => {
        if (!eventName.trim() || !description.trim()) {
            return;
        }

        if (editingEvent) {
            setEvents((current) =>
                current.map((event) =>
                    event.id === editingEvent.id
                        ? {
                              ...event,
                              name: eventName.trim(),
                              description: description.trim(),
                              updatedAt: new Date().toLocaleString(),
                          }
                        : event
                )
            );
        } else {
            const now = new Date().toLocaleString();

            setEvents((current) => [
                ...current,
                {
                    id: Date.now(),
                    name: eventName.trim(),
                    description: description.trim(),
                    createdAt: now,
                    updatedAt: now,
                },
            ]);
        }

        closeForm();
    };

    const handleDelete = () => {
        if (!deleteEvent) {
            return;
        }

        setEvents((current) =>
            current.filter((event) => event.id !== deleteEvent.id)
        );

        setDeleteEvent(null);
    };

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

                        {events.map((event) => (
                            <div
                                className="events-table-row"
                                key={event.id}
                            >
                                <div className="event-title">
                                    {event.name}
                                </div>

                                <div className="event-description">
                                    {event.description}
                                </div>

                                <div className="event-date">
                                    {event.createdAt}
                                </div>

                                <div className="event-date">
                                    {event.updatedAt}
                                </div>

                                <div className="event-actions">
                                    <button
                                        type="button"
                                        className="action-icon"
                                        onClick={() => openEditForm(event)}
                                        aria-label={`Edit ${event.name}`}
                                    >
                                        <Pencil size={17} />
                                    </button>

                                    <button
                                        type="button"
                                        className="action-icon"
                                        onClick={() => setDeleteEvent(event)}
                                        aria-label={`Delete ${event.name}`}
                                    >
                                        <Trash2 size={17} />
                                    </button>
                                </div>
                            </div>
                        ))}
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
                            <label>Event Name</label>

                            <input
                                type="text"
                                value={eventName}
                                onChange={(event) =>
                                    setEventName(event.target.value)
                                }
                                placeholder="Enter event name"
                            />
                        </div>

                        <div className="form-field">
                            <label>Description</label>

                            <input
                                type="text"
                                value={description}
                                onChange={(event) =>
                                    setDescription(event.target.value)
                                }
                                placeholder="Enter event description"
                            />
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
                        >
                            {editingEvent ? "Update" : "Add Event"}
                        </button>
                    </div>
                </div>
            )}

            {deleteEvent && (
                <div className="delete-confirmation">
                    <div className="delete-confirmation-card">
                        <div className="delete-confirmation-header">
                            <div>
                                <h2>Delete Event</h2>
                                <p>
                                    Are you sure you want to delete{" "}
                                    <strong>{deleteEvent.name}</strong>?
                                </p>
                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={() => setDeleteEvent(null)}
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="delete-confirmation-actions">
                            <button
                                type="button"
                                className="button button-secondary"
                                onClick={() => setDeleteEvent(null)}
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