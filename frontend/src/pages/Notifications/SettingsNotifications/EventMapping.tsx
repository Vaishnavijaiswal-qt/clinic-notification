import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

type EventMapping = {
    event: string;
    eventTypes: string[];
};

type ExistingMapping = {
    id: number;
    event: string;
    eventTypes: string[];
    client: string;
    clinic: string;
};

const events = [
    "Patient Registration",
    "Patient Appointment",
    "Appointment Rescheduled",
    "Appointment Cancelled",
];

const eventTypes = ["WhatsApp", "SMS", "Email"];

function EventMapping() {
    const [showForm, setShowForm] = useState(false);
    const [eventDropdownOpen, setEventDropdownOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [client, setClient] = useState("");
    const [clinic, setClinic] = useState("");
    const [mappings, setMappings] = useState<EventMapping[]>([]);

    const [existingMappings, setExistingMappings] = useState<
        ExistingMapping[]
    >([
        {
            id: 1,
            event: "Patient Registration",
            eventTypes: ["WhatsApp", "SMS"],
            client: "Client A",
            clinic: "Clinic A1",
        },
        {
            id: 2,
            event: "Patient Appointment",
            eventTypes: ["Email", "SMS"],
            client: "Client A",
            clinic: "Clinic A1",
        },
        {
            id: 3,
            event: "Appointment Cancelled",
            eventTypes: ["WhatsApp", "Email"],
            client: "Client B",
            clinic: "Clinic B1",
        },
    ]);

    const handleEventSelect = (event: string) => {
        setMappings((current) => {
            const exists = current.some(
                (mapping) => mapping.event === event
            );

            if (exists) {
                return current.filter(
                    (mapping) => mapping.event !== event
                );
            }

            return [
                ...current,
                {
                    event,
                    eventTypes: [],
                },
            ];
        });
    };

    const handleEventTypeChange = (
        eventName: string,
        type: string
    ) => {
        setMappings((current) =>
            current.map((mapping) => {
                if (mapping.event !== eventName) {
                    return mapping;
                }

                const eventTypes = mapping.eventTypes.includes(type)
                    ? mapping.eventTypes.filter(
                          (item) => item !== type
                      )
                    : [...mapping.eventTypes, type];

                return {
                    ...mapping,
                    eventTypes,
                };
            })
        );
    };

    const handleRemoveEvent = (eventName: string) => {
        setMappings((current) =>
            current.filter(
                (mapping) => mapping.event !== eventName
            )
        );
    };

    const handleEdit = (mapping: ExistingMapping) => {
        setEditingId(mapping.id);
        setClient(mapping.client);
        setClinic(mapping.clinic);

        setMappings([
            {
                event: mapping.event,
                eventTypes: [...mapping.eventTypes],
            },
        ]);

        setShowForm(true);
    };

    const handleDelete = (id: number) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        if (deleteId === null) {
            return;
        }

        setExistingMappings((current) =>
            current.filter((mapping) => mapping.id !== deleteId)
        );

        setDeleteId(null);
    };

    const cancelDelete = () => {
        setDeleteId(null);
    };

    const handleSave = () => {
        if (
            (!editingId && (!client || !clinic)) ||
            mappings.length === 0
        ) {
            return;
        }

        const hasMissingEventType = mappings.some(
            (mapping) => mapping.eventTypes.length === 0
        );

        if (hasMissingEventType) {
            return;
        }

        if (editingId !== null) {
            setExistingMappings((current) =>
                current.map((mapping) =>
                    mapping.id === editingId
                        ? {
                              ...mapping,
                              eventTypes: [
                                  ...mappings[0].eventTypes,
                              ],
                          }
                        : mapping
                )
            );
        } else {
            const newMappings = mappings.map((mapping, index) => ({
                id: Date.now() + index,
                event: mapping.event,
                eventTypes: mapping.eventTypes,
                client,
                clinic,
            }));

            setExistingMappings((current) => [
                ...current,
                ...newMappings,
            ]);
        }

        handleCancel();
    };

    const handleCancel = () => {
        setMappings([]);
        setClient("");
        setClinic("");
        setEditingId(null);
        setEventDropdownOpen(false);
        setShowForm(false);
    };

    const availableEvents = events.filter(
        (event) =>
            !mappings.some(
                (mapping) => mapping.event === event
            )
    );

    return (
        <div className="page-container">
            {!showForm ? (
                <>
                    <div className="page-header event-page-header">
                        <div>
                            <h1>Event Mapping</h1>
                            <p>
                                Configure events and event types for
                                clinics.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="button button-primary"
                            onClick={() => {
                                setEditingId(null);
                                setShowForm(true);
                            }}
                        >
                            + Add Event Mapping
                        </button>
                    </div>

                    <div className="table-card">
                        <div className="events-table-header event-mapping-table">
                            <div>Event</div>
                            <div>Event Type</div>
                            <div>Client</div>
                            <div>Clinic</div>
                            <div>Actions</div>
                        </div>

                        {existingMappings.map((mapping) => (
                            <div
                                className="events-table-row event-mapping-table"
                                key={mapping.id}
                            >
                                <div className="event-title">
                                    {mapping.event}
                                </div>

                                <div className="event-type-list">
                                    {mapping.eventTypes.map((type) => (
                                        <span
                                            className="event-status"
                                            key={type}
                                        >
                                            {type}
                                        </span>
                                    ))}
                                </div>

                                <div>{mapping.client}</div>

                                <div>{mapping.clinic}</div>

                                <div className="event-actions">
                                    <button
                                        type="button"
                                        className="action-icon"
                                        onClick={() =>
                                            handleEdit(mapping)
                                        }
                                        title="Edit"
                                    >
                                        <Pencil size={16} />
                                    </button>

                                    <button
                                        type="button"
                                        className="action-icon"
                                        onClick={() =>
                                            handleDelete(mapping.id)
                                        }
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <div className="page-header">
                        <h1>
                            {editingId !== null
                                ? "Edit Event Mapping"
                                : "Add Event Mapping"}
                        </h1>

                        <p>
                            {editingId !== null
                                ? "Update event types for this mapping."
                                : "Select a client, clinic, events and event types."}
                        </p>
                    </div>

                    <div className="event-form-card">
                        <div className="event-form-body">
                            <div className="form-field">
                                <label>Client</label>

                                <select
                                    value={client}
                                    onChange={(e) => {
                                        setClient(e.target.value);
                                        setClinic("");
                                    }}
                                    disabled={editingId !== null}
                                >
                                    <option value="">
                                        Select Client
                                    </option>
                                    <option value="Client A">
                                        Client A
                                    </option>
                                    <option value="Client B">
                                        Client B
                                    </option>
                                    <option value="Client C">
                                        Client C
                                    </option>
                                </select>
                            </div>

                            <div className="form-field">
                                <label>Clinic</label>

                                <select
                                    value={clinic}
                                    onChange={(e) =>
                                        setClinic(e.target.value)
                                    }
                                    disabled={
                                        !client ||
                                        editingId !== null
                                    }
                                >
                                    <option value="">
                                        Select Clinic
                                    </option>
                                    <option value="Clinic A1">
                                        Clinic A1
                                    </option>
                                    <option value="Clinic A2">
                                        Clinic A2
                                    </option>
                                    <option value="Clinic B1">
                                        Clinic B1
                                    </option>
                                </select>
                            </div>

                            {editingId === null ? (
                                <div className="form-field">
                                    <label>Events</label>

                                    <div className="event-multi-select">
                                        <div
                                            className={`event-multi-select-input ${
                                                !clinic ? "disabled" : ""
                                            }`}
                                            onClick={() => {
                                                if (clinic) {
                                                    setEventDropdownOpen(
                                                        (current) =>
                                                            !current
                                                    );
                                                }
                                            }}
                                        >
                                            <div className="event-selected-items">
                                                {mappings.length === 0 ? (
                                                    <span className="event-placeholder">
                                                        Select Events
                                                    </span>
                                                ) : (
                                                    mappings.map(
                                                        (mapping) => (
                                                            <span
                                                                className="event-chip"
                                                                key={
                                                                    mapping.event
                                                                }
                                                            >
                                                                {
                                                                    mapping.event
                                                                }

                                                                <button
                                                                    type="button"
                                                                    onClick={(
                                                                        e
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        handleRemoveEvent(
                                                                            mapping.event
                                                                        );
                                                                    }}
                                                                >
                                                                    ×
                                                                </button>
                                                            </span>
                                                        )
                                                    )
                                                )}
                                            </div>

                                            <span className="event-dropdown-arrow">
                                                ▼
                                            </span>
                                        </div>

                                        {eventDropdownOpen &&
                                            clinic && (
                                                <div className="event-dropdown-menu">
                                                    {availableEvents.length ===
                                                    0 ? (
                                                        <div className="event-dropdown-empty">
                                                            All events
                                                            selected
                                                        </div>
                                                    ) : (
                                                        availableEvents.map(
                                                            (event) => (
                                                                <div
                                                                    key={
                                                                        event
                                                                    }
                                                                    className="event-dropdown-option"
                                                                    onClick={() =>
                                                                        handleEventSelect(
                                                                            event
                                                                        )
                                                                    }
                                                                >
                                                                    <span className="event-check">
                                                                        ""
                                                                    </span>

                                                                    <span>
                                                                        {
                                                                            event
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )
                                                        )
                                                    )}

                                                    {mappings.map(
                                                        (mapping) => (
                                                            <div
                                                                key={
                                                                    mapping.event
                                                                }
                                                                className="event-dropdown-option selected"
                                                                onClick={() =>
                                                                    handleEventSelect(
                                                                        mapping.event
                                                                    )
                                                                }
                                                            >
                                                                <span className="event-check">
                                                                    ✓
                                                                </span>

                                                                <span>
                                                                    {
                                                                        mapping.event
                                                                    }
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                </div>
                            ) : (
                                <div className="form-field">
                                    <label>Event</label>

                                    <div className="readonly-field">
                                        {mappings[0]?.event}
                                    </div>
                                </div>
                            )}

                            {mappings.length > 0 && (
                                <div className="selected-events">
                                    <label>Selected Events</label>

                                    {mappings.map((mapping) => (
                                        <div
                                            className="selected-event-card"
                                            key={mapping.event}
                                        >
                                            <div className="selected-event-header">
                                                <span>
                                                    {mapping.event}
                                                </span>

                                                {editingId === null && (
                                                    <button
                                                        type="button"
                                                        className="remove-event"
                                                        onClick={() =>
                                                            handleRemoveEvent(
                                                                mapping.event
                                                            )
                                                        }
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>

                                            <div className="selected-event-types">
                                                <span>
                                                    Event Types
                                                </span>

                                                <div className="event-type-options">
                                                    {eventTypes.map(
                                                        (type) => (
                                                            <label
                                                                key={type}
                                                                className="event-type-option"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={mapping.eventTypes.includes(
                                                                        type
                                                                    )}
                                                                    onChange={() =>
                                                                        handleEventTypeChange(
                                                                            mapping.event,
                                                                            type
                                                                        )
                                                                    }
                                                                />
                                                                {type}
                                                            </label>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="page-actions">
                                <button
                                    type="button"
                                    className="button"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="button button-primary"
                                    onClick={handleSave}
                                    disabled={
                                        (!editingId &&
                                            (!client || !clinic)) ||
                                        mappings.length === 0 ||
                                        mappings.some(
                                            (mapping) =>
                                                mapping.eventTypes
                                                    .length === 0
                                        )
                                    }
                                >
                                    {editingId !== null
                                        ? "Update Mapping"
                                        : "Save Mapping"}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {deleteId !== null && (
                <div className="delete-confirmation">
                    <div className="delete-confirmation-card">
                        <div className="delete-confirmation-header">
                            <h2>Delete Event Mapping</h2>
                            <p>
                                Are you sure you want to delete this
                                event mapping?
                            </p>
                        </div>

                        <div className="delete-confirmation-actions">
                            <button
                                type="button"
                                className="button button-secondary"
                                onClick={cancelDelete}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="button button-danger"
                                onClick={confirmDelete}
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

export default EventMapping;