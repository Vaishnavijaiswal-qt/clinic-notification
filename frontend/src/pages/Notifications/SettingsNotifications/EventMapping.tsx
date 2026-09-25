import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

type Mapping = {
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

const clients = ["Client A", "Client B", "Client C"];

const clinics: Record<string, string[]> = {
    "Client A": ["Clinic A1", "Clinic A2"],
    "Client B": ["Clinic B1"],
    "Client C": ["Clinic C1"],
};

function EventMapping() {
    const [showForm, setShowForm] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [client, setClient] = useState("");
    const [clinic, setClinic] = useState("");

    const [selectedEvents, setSelectedEvents] = useState<
        { event: string; eventTypes: string[] }[]
    >([]);

    const [errors, setErrors] = useState({
        client: "",
        clinic: "",
        events: "",
        eventTypes: "",
    });

    const [mappings, setMappings] = useState<Mapping[]>([
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

    const resetForm = () => {
        setClient("");
        setClinic("");
        setSelectedEvents([]);
        setEditingId(null);
        setDropdownOpen(false);
        setErrors({
            client: "",
            clinic: "",
            events: "",
            eventTypes: "",
        });
        setShowForm(false);
    };

    const openAddForm = () => {
        resetForm();
        setShowForm(true);
    };

    const openEditForm = (mapping: Mapping) => {
        setEditingId(mapping.id);
        setClient(mapping.client);
        setClinic(mapping.clinic);
        setSelectedEvents([
            {
                event: mapping.event,
                eventTypes: [...mapping.eventTypes],
            },
        ]);
        setErrors({
            client: "",
            clinic: "",
            events: "",
            eventTypes: "",
        });
        setShowForm(true);
    };

    const toggleEvent = (event: string) => {
        setSelectedEvents((current) =>
            current.some((item) => item.event === event)
                ? current.filter((item) => item.event !== event)
                : [...current, { event, eventTypes: [] }]
        );

        setErrors((current) => ({
            ...current,
            events: "",
            eventTypes: "",
        }));
    };

    const toggleEventType = (event: string, type: string) => {
        setSelectedEvents((current) =>
            current.map((item) =>
                item.event === event
                    ? {
                        ...item,
                        eventTypes: item.eventTypes.includes(type)
                            ? item.eventTypes.filter(
                                (value) => value !== type
                            )
                            : [...item.eventTypes, type],
                    }
                    : item
            )
        );

        setErrors((current) => ({
            ...current,
            eventTypes: "",
        }));
    };

    const removeEvent = (event: string) => {
        setSelectedEvents((current) =>
            current.filter((item) => item.event !== event)
        );

        setErrors((current) => ({
            ...current,
            events: "",
            eventTypes: "",
        }));
    };

    const saveMapping = () => {
        const newErrors = {
            client: "",
            clinic: "",
            events: "",
            eventTypes: "",
        };

        if (!client) {
            newErrors.client = "Client is required";
        }

        if (!clinic) {
            newErrors.clinic = "Clinic is required";
        }

        if (selectedEvents.length === 0) {
            newErrors.events = "Select at least one event";
        }

        if (
            selectedEvents.length > 0 &&
            selectedEvents.some(
                (item) => item.eventTypes.length === 0
            )
        ) {
            newErrors.eventTypes =
                "Select at least one event type for each event";
        }

        setErrors(newErrors);

        if (Object.values(newErrors).some(Boolean)) {
            return;
        }

        if (editingId !== null) {
            setMappings((current) =>
                current.map((mapping) =>
                    mapping.id === editingId
                        ? {
                            ...mapping,
                            event: selectedEvents[0].event,
                            eventTypes:
                                selectedEvents[0].eventTypes,
                        }
                        : mapping
                )
            );
        } else {
            setMappings((current) => [
                ...current,
                ...selectedEvents.map((item, index) => ({
                    id: Date.now() + index,
                    event: item.event,
                    eventTypes: item.eventTypes,
                    client,
                    clinic,
                })),
            ]);
        }

        resetForm();
    };

    const deleteMapping = () => {
        if (deleteId === null) {
            return;
        }

        setMappings((current) =>
            current.filter((item) => item.id !== deleteId)
        );

        setDeleteId(null);
    };

    const availableEvents = events.filter(
        (event) =>
            !selectedEvents.some((item) => item.event === event)
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
                            onClick={openAddForm}
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

                        {mappings.map((mapping) => (
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
                                            openEditForm(mapping)
                                        }
                                        title="Edit"
                                    >
                                        <Pencil size={16} />
                                    </button>

                                    <button
                                        type="button"
                                        className="action-icon"
                                        onClick={() =>
                                            setDeleteId(mapping.id)
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
                            Select a client, clinic, events and event
                            types.
                        </p>
                    </div>

                    <div className="event-form-card">
                        <div className="event-form-body">
                            <div className="form-field">
                                <label> Client <span className="required">*</span></label>

                                <select
                                    value={client}
                                    onChange={(e) => {
                                        setClient(e.target.value);
                                        setClinic("");

                                        setErrors((current) => ({
                                            ...current,
                                            client: "",
                                            clinic: "",
                                        }));
                                    }}
                                    disabled={editingId !== null}
                                >
                                    <option value="">
                                        Select Client
                                    </option>

                                    {clients.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>

                                {errors.client && (
                                    <p className="form-error">
                                        {errors.client}
                                    </p>
                                )}
                            </div>

                            <div className="form-field">
                                <label>Clinic <span className="required">*</span></label>

                                <select
                                    value={clinic}
                                    onChange={(e) => {
                                        setClinic(e.target.value);

                                        setErrors((current) => ({
                                            ...current,
                                            clinic: "",
                                        }));
                                    }}
                                    disabled={
                                        !client ||
                                        editingId !== null
                                    }
                                >
                                    <option value="">
                                        Select Clinic
                                    </option>

                                    {(clinics[client] || []).map(
                                        (item) => (
                                            <option
                                                key={item}
                                                value={item}
                                            >
                                                {item}
                                            </option>
                                        )
                                    )}
                                </select>

                                {errors.clinic && (
                                    <p className="form-error">
                                        {errors.clinic}
                                    </p>
                                )}
                            </div>

                            {editingId === null ? (
                                <div className="form-field">
                                    <label>Events <span className="required">*</span></label>

                                    <div className="event-multi-select">
                                        <div
                                            className={`event-multi-select-input ${!clinic ? "disabled" : ""
                                                }`}
                                            onClick={() => {
                                                if (clinic) {
                                                    setDropdownOpen(
                                                        (current) =>
                                                            !current
                                                    );
                                                }
                                            }}
                                        >
                                            <div className="event-selected-items">
                                                {selectedEvents.length ===
                                                    0 ? (
                                                    <span className="event-placeholder">
                                                        Select Events
                                                    </span>
                                                ) : (
                                                    selectedEvents.map(
                                                        (item) => (
                                                            <span
                                                                className="event-chip"
                                                                key={
                                                                    item.event
                                                                }
                                                            >
                                                                {item.event}

                                                                <button
                                                                    type="button"
                                                                    onClick={(
                                                                        e
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        removeEvent(
                                                                            item.event
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

                                        {dropdownOpen && clinic && (
                                            <div className="event-dropdown-menu">
                                                {availableEvents.map(
                                                    (event) => (
                                                        <div
                                                            key={event}
                                                            className="event-dropdown-option"
                                                            onClick={() =>
                                                                toggleEvent(
                                                                    event
                                                                )
                                                            }
                                                        >
                                                            <span className="event-check">□</span>

                                                            <span>
                                                                {event}
                                                            </span>
                                                        </div>
                                                    )
                                                )}

                                                {selectedEvents.map(
                                                    (item) => (
                                                        <div
                                                            key={
                                                                item.event
                                                            }
                                                            className="event-dropdown-option selected"
                                                            onClick={() =>
                                                                toggleEvent(
                                                                    item.event
                                                                )
                                                            }
                                                        >
                                                            <span className="event-check">
                                                                ✓
                                                            </span>

                                                            <span>
                                                                {
                                                                    item.event
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {errors.events && (
                                        <p className="form-error">
                                            {errors.events}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="form-field">
                                    <label>Event</label>

                                    <div className="readonly-field">
                                        {selectedEvents[0]?.event}
                                    </div>
                                </div>
                            )}

                            {selectedEvents.length > 0 && (
                                <div className="selected-events">
                                    <label>Selected Events</label>

                                    {selectedEvents.map((item) => (
                                        <div
                                            className="selected-event-card"
                                            key={item.event}
                                        >
                                            <div className="selected-event-header">
                                                <span>{item.event}</span>

                                                {editingId === null && (
                                                    <button
                                                        type="button"
                                                        className="remove-event"
                                                        onClick={() =>
                                                            removeEvent(
                                                                item.event
                                                            )
                                                        }
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>

                                            <div className="selected-event-types">
                                                <span>
                                                    Event Types <span className="required">*</span>
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
                                                                    checked={item.eventTypes.includes(
                                                                        type
                                                                    )}
                                                                    onChange={() =>
                                                                        toggleEventType(
                                                                            item.event,
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

                                    {errors.eventTypes && (
                                        <p className="form-error">
                                            {errors.eventTypes}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="page-actions">
                                <button
                                    type="button"
                                    className="button button-secondary"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="button button-primary"
                                    onClick={saveMapping}
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
                                onClick={() => setDeleteId(null)}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="button button-danger"
                                onClick={deleteMapping}
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