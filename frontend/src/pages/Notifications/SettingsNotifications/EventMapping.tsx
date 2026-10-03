import { useEffect, useState } from "react";
import { Pencil, Trash2, Search } from "lucide-react";

import {
    getEventMappings,
    createEventMapping,
    updateEventMapping,
    deleteEventMapping,
} from "../../../api/eventmappingApi";

import {
    getClients,
    getClinics,
} from "../../../api/preferencesApi";

import { getEvents } from "../../../api/eventsApi";

import type {
    Client,
    Clinic,
} from "../../../api/preferencesApi";

import type {
    EventMapping as ApiEventMapping,
} from "../../../api/eventmappingApi";

import type {
    NotificationEvent,
} from "../../../api/eventsApi";

type Mapping = {
    id: number;
    event: string;
    eventId: number;
    eventTypes: string[];
    client: string;
    clientId: number;
    clinic: string;
    clinicId: number;
};

const eventTypes = ["WhatsApp", "SMS", "Email"];

function EventMapping() {
    const [showForm, setShowForm] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [clients, setClients] = useState<Client[]>([]);
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [events, setEvents] = useState<NotificationEvent[]>([]);

    const [client, setClient] = useState("");
    const [clinic, setClinic] = useState("");

    const [selectedEvents, setSelectedEvents] = useState<
        {
            event: string;
            eventId: number;
            eventTypes: string[];
        }[]
    >([]);

    const [mappings, setMappings] = useState<Mapping[]>([]);

    const [errors, setErrors] = useState({
        client: "",
        clinic: "",
        events: "",
        eventTypes: "",
    });

    const loadMappings = async (searchValue = "") => {
    try {
        const mappingData = await getEventMappings(searchValue);

        const grouped = new Map<string, Mapping>();

        mappingData.forEach((item: ApiEventMapping) => {
            const key = `${item.clientId}-${item.clinicId}-${item.eventId}`;

            const type =
                item.notificationType === "WHATSAPP"
                    ? "WhatsApp"
                    : item.notificationType === "SMS"
                        ? "SMS"
                        : "Email";

            const eventName =
                events.find(
                    (event) => event.id === item.eventId
                )?.eventName || "Unknown Event";

            const clientName =
                clients.find(
                    (client) => client.id === item.clientId
                )?.name || "Unknown Client";

            const clinicName =
                clinics.find(
                    (clinic) => clinic.id === item.clinicId
                )?.name || "Unknown Clinic";

            const existing = grouped.get(key);

            if (existing) {
                if (!existing.eventTypes.includes(type)) {
                    existing.eventTypes.push(type);
                }
            } else {
                grouped.set(key, {
                    id: item.id,
                    eventId: item.eventId,
                    event: eventName,
                    eventTypes: [type],
                    clientId: item.clientId,
                    client: clientName,
                    clinicId: item.clinicId,
                    clinic: clinicName,
                });
            }
        });

        let result = Array.from(grouped.values());

        if (searchValue.trim()) {
            const searchText = searchValue.trim().toLowerCase();

            result = result.filter(
                (mapping) =>
                    mapping.event.toLowerCase().includes(searchText) ||
                    mapping.client.toLowerCase().includes(searchText) ||
                    mapping.clinic.toLowerCase().includes(searchText) ||
                    mapping.eventTypes.some((type) =>
                        type.toLowerCase().includes(searchText)
                    )
            );
        }

        setMappings(result);
    } catch (error) {
        console.error(
            "Failed to load event mappings:",
            error
        );
    }
};

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [clientData, eventData] = await Promise.all([
                    getClients(),
                    getEvents(),
                ]);

                setClients(clientData);
                setEvents(eventData);

                const clinicResults = await Promise.all(
                    clientData.map((item) =>
                        getClinics(item.id)
                    )
                );

                const allClinics = clinicResults.flat();

                setClinics(allClinics);

                const mappingData = await getEventMappings("");

                const grouped = new Map<string, Mapping>();

                mappingData.forEach((item: ApiEventMapping) => {
                    const key = `${item.clientId}-${item.clinicId}-${item.eventId}`;

                    const existing = grouped.get(key);

                    const type =
                        item.notificationType === "WHATSAPP"
                            ? "WhatsApp"
                            : item.notificationType === "SMS"
                                ? "SMS"
                                : "Email";

                    const eventName =
                        eventData.find(
                            (event) => event.id === item.eventId
                        )?.eventName || "Unknown Event";

                    const clientName =
                        clientData.find(
                            (client) => client.id === item.clientId
                        )?.name || "Unknown Client";

                    const clinicName =
                        allClinics.find(
                            (clinic) => clinic.id === item.clinicId
                        )?.name || "Unknown Clinic";

                    if (existing) {
                        if (!existing.eventTypes.includes(type)) {
                            existing.eventTypes.push(type);
                        }
                    } else {
                        grouped.set(key, {
                            id: item.id,
                            eventId: item.eventId,
                            event: eventName,
                            eventTypes: [type],
                            clientId: item.clientId,
                            client: clientName,
                            clinicId: item.clinicId,
                            clinic: clinicName,
                        });
                    }
                });

                setMappings(Array.from(grouped.values()));
            } catch (error) {
                console.error(
                    "Failed to load event mapping data:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

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
        setClient(String(mapping.clientId));
        setClinic(String(mapping.clinicId));

        setSelectedEvents([
            {
                event: mapping.event,
                eventId: mapping.eventId,
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

    const handleClientChange = async (value: string) => {
        setClient(value);
        setClinic("");
        setSelectedEvents([]);
        setDropdownOpen(false);

        setErrors((current) => ({
            ...current,
            client: "",
            clinic: "",
            events: "",
            eventTypes: "",
        }));

        if (!value) {
            setClinics([]);
            return;
        }

        try {
            const data = await getClinics(Number(value));
            setClinics(data);
        } catch (error) {
            console.error(
                "Failed to load clinics:",
                error
            );
            setClinics([]);
        }
    };

    const handleClinicChange = (value: string) => {
        setClinic(value);
        setSelectedEvents([]);
        setDropdownOpen(false);

        setErrors((current) => ({
            ...current,
            clinic: "",
            events: "",
            eventTypes: "",
        }));
    };

    const toggleEvent = (event: NotificationEvent) => {
        setSelectedEvents((current) =>
            current.some(
                (item) => item.eventId === event.id
            )
                ? current.filter(
                    (item) => item.eventId !== event.id
                )
                : [
                    ...current,
                    {
                        event: event.eventName,
                        eventId: event.id,
                        eventTypes: [],
                    },
                ]
        );

        setErrors((current) => ({
            ...current,
            events: "",
            eventTypes: "",
        }));
    };

    const toggleEventType = (
        eventId: number,
        type: string
    ) => {
        setSelectedEvents((current) =>
            current.map((item) =>
                item.eventId === eventId
                    ? {
                        ...item,
                        eventTypes:
                            item.eventTypes.includes(type)
                                ? item.eventTypes.filter(
                                    (value) => value !== type
                                )
                                : [
                                    ...item.eventTypes,
                                    type,
                                ],
                    }
                    : item
            )
        );

        setErrors((current) => ({
            ...current,
            eventTypes: "",
        }));
    };

    const removeEvent = (eventId: number) => {
        setSelectedEvents((current) =>
            current.filter(
                (item) => item.eventId !== eventId
            )
        );

        setErrors((current) => ({
            ...current,
            events: "",
            eventTypes: "",
        }));
    };

    const getNotificationType = (
        type: string
    ): "WHATSAPP" | "SMS" | "EMAIL" => {
        if (type === "WhatsApp") {
            return "WHATSAPP";
        }

        if (type === "SMS") {
            return "SMS";
        }

        return "EMAIL";
    };

    const saveMapping = async () => {
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

        try {
            if (editingId !== null) {
                const selectedEvent = selectedEvents[0];

                await updateEventMapping(
                    editingId,
                    {
                        clientId: Number(client),
                        clinicId: Number(clinic),
                        eventId: selectedEvent.eventId,
                        notificationType:
                            getNotificationType(
                                selectedEvent.eventTypes[0]
                            ),
                    }
                );
            } else {
                for (const item of selectedEvents) {
                    for (const type of item.eventTypes) {
                        await createEventMapping({
                            clientId: Number(client),
                            clinicId: Number(clinic),
                            eventId: item.eventId,
                            notificationType:
                                getNotificationType(type),
                        });
                    }
                }
            }

            await loadMappings();
            resetForm();
        } catch (error) {
            console.error(
                "Failed to save event mapping:",
                error
            );
        }
    };

    const deleteMapping = async () => {
        if (deleteId === null) {
            return;
        }

        try {
            await deleteEventMapping(deleteId);
            await loadMappings();
            setDeleteId(null);
        } catch (error) {
            console.error(
                "Failed to delete event mapping:",
                error
            );
        }
    };

    const availableEvents = events.filter(
        (event) =>
            !selectedEvents.some(
                (item) => item.eventId === event.id
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
                                Configure events and event types for clinics.
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

                    <div className="events-toolbar">
                        <div className="events-search">
                            <Search size={18} />

                            <input
                                type="text"
                                placeholder="Search event mappings by clients and clinics..."
                                value={search}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSearch(value);
                                    loadMappings(value);
                                }}
                            />
                        </div>

                        <button
                            type="button"
                            className="events-reset-button"
                            onClick={() => {
                                setSearch("");
                                loadMappings("");
                            }}
                        >
                            Reset
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

                        {loading ? (
                            <div className="mapping-no-results">
                                <p>Loading event mappings...</p>
                            </div>
                        ) : mappings.length > 0 ? (
                            mappings.map((mapping) => (
                                <div
                                    className="events-table-row event-mapping-table"
                                    key={mapping.id}
                                >
                                    <div className="event-title">
                                        {mapping.event}
                                    </div>

                                    <div className="event-type-list">
                                        {mapping.eventTypes.map(
                                            (type) => (
                                                <span
                                                    className="event-status"
                                                    key={type}
                                                >
                                                    {type}
                                                </span>
                                            )
                                        )}
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
                            ))
                        ) : (
                            <div className="mapping-no-results">
                                <p>No event mappings found.</p>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <div className="page-header">
                        <h1>{editingId !== null ? "Edit Event Mapping" : "Add Event Mapping"}</h1>

                        <p>Select a client, clinic, events and event types.</p>
                    </div>

                    <div className="event-form-card">
                        <div className="event-form-body">
                            <div className="form-field">
                                <label>
                                    Client{" "}
                                    <span className="required">*</span>
                                </label>

                                <select
                                    value={client}
                                    onChange={(e) =>
                                        handleClientChange(
                                            e.target.value
                                        )
                                    }
                                    disabled={
                                        editingId !== null
                                    }
                                >
                                    <option value="">Select Client</option>

                                    {clients.map((item) => (
                                        <option
                                            key={item.id}
                                            value={item.id}
                                        >
                                            {item.name}
                                        </option>
                                    ))}
                                </select>

                                {errors.client && (
                                    <p className="form-error">{errors.client}</p>
                                )}
                            </div>

                            <div className="form-field">
                                <label>
                                    Clinic{" "}
                                    <span className="required">*</span>
                                </label>

                                <select
                                    value={clinic}
                                    onChange={(e) =>
                                        handleClinicChange(
                                            e.target.value
                                        )
                                    }
                                    disabled={
                                        !client ||
                                        editingId !== null
                                    }
                                >
                                    <option value=""> Select Clinic </option>

                                    {clinics.map((item) => (
                                        <option
                                            key={item.id}
                                            value={item.id}
                                        >
                                            {item.name}
                                        </option>
                                    ))}
                                </select>

                                {errors.clinic && (
                                    <p className="form-error"> {errors.clinic} </p>
                                )}
                            </div>

                            {editingId === null ? (
                                <div className="form-field">
                                    <label>
                                        Events{" "}
                                        <span className="required"> * </span>
                                    </label>

                                    <div className="event-multi-select">
                                        <div
                                            className={`event-multi-select-input ${!clinic ? "disabled" : ""
                                                }`}
                                            onClick={() => {
                                                if (clinic) {
                                                    setDropdownOpen(
                                                        (current) => !current
                                                    );
                                                }
                                            }}
                                        >
                                            <div className="event-selected-items">
                                                {selectedEvents.length === 0 ? (
                                                    <span className="event-placeholder"> Select Events </span>
                                                ) : (
                                                    selectedEvents.map(
                                                        (item) => (
                                                            <span
                                                                className="event-chip"
                                                                key={item.eventId}
                                                            >
                                                                {item.event}

                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        removeEvent(
                                                                            item.eventId
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

                                            <span className="event-dropdown-arrow"> ▼ </span>
                                        </div>

                                        {dropdownOpen && clinic && (
                                            <div className="event-dropdown-menu">
                                                {availableEvents.map(
                                                    (event) => (
                                                        <div
                                                            key={event.id}
                                                            className="event-dropdown-option"
                                                            onClick={() =>
                                                                toggleEvent(
                                                                    event
                                                                )
                                                            }
                                                        >
                                                            <span className="event-check">□</span>

                                                            <span>{event.eventName}</span>
                                                        </div>
                                                    )
                                                )}

                                                {selectedEvents.map(
                                                    (item) => (
                                                        <div
                                                            key={item.eventId}
                                                            className="event-dropdown-option selected"
                                                            onClick={() =>
                                                                removeEvent(
                                                                    item.eventId
                                                                )
                                                            }
                                                        >
                                                            <span className="event-check"> ✓</span>

                                                            <span>{item.event}</span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {errors.events && (
                                        <p className="form-error">{errors.events}</p>
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
                                            key={item.eventId}
                                        >
                                            <div className="selected-event-header">
                                                <span>{item.event}</span>

                                                {editingId === null && (
                                                    <button
                                                        type="button"
                                                        className="remove-event"
                                                        onClick={() =>
                                                            removeEvent(
                                                                item.eventId
                                                            )
                                                        }
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>

                                            <div className="selected-event-types">
                                                <span>
                                                    Event Types{" "}
                                                    <span className="required">*</span>
                                                </span>

                                                <div className="event-type-options">
                                                    {eventTypes.map(
                                                        (type) => (
                                                            <label
                                                                key={
                                                                    type
                                                                }
                                                                className="event-type-option"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={item.eventTypes.includes(
                                                                        type
                                                                    )}
                                                                    onChange={() =>
                                                                        toggleEventType(
                                                                            item.eventId,
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
                                        <p className="form-error">{errors.eventTypes}</p>
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
                                    {editingId !== null ? "Update Mapping" : "Save Mapping"}
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
                                Are you sure you want to delete this event
                                mapping?
                            </p>
                        </div>

                        <div className="delete-confirmation-actions">
                            <button
                                type="button"
                                className="button button-secondary"
                                onClick={() =>
                                    setDeleteId(null)
                                }
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