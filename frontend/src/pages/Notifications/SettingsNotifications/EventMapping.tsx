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

    const [allMappings, setAllMappings] = useState<Mapping[]>([]);
    const [mappings, setMappings] = useState<Mapping[]>([]);

    const [client, setClient] = useState("");
    const [clinic, setClinic] = useState("");

    const [selectedEvents, setSelectedEvents] = useState<
        {
            event: string;
            eventId: number;
            eventTypes: string[];
        }[]
    >([]);

    const [errors, setErrors] = useState({
        client: "",
        clinic: "",
        events: "",
        eventTypes: "",
    });

    const groupMappings = (
        mappingData: ApiEventMapping[],
        eventData: NotificationEvent[]
    ): Mapping[] => {
        const grouped = new Map<string, Mapping>();

        mappingData.forEach((item) => {
            const key = `${item.clientId}-${item.clinicId}-${item.eventId}`;

            const type =
                item.notificationType === "WHATSAPP"
                    ? "WhatsApp"
                    : item.notificationType === "SMS"
                        ? "SMS"
                        : "Email";

            const eventName =
                item.eventName ||
                eventData.find(
                    (event) => event.id === item.eventId
                )?.eventName ||
                "Unknown Event";

            const clientName =
                item.clientName || "Unknown Client";

            const clinicName =
                item.clinicName || "Unknown Clinic";

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

        return Array.from(grouped.values());
    };

    const filterMappings = (
        mappingData: Mapping[],
        searchValue: string
    ): Mapping[] => {
        const searchText = searchValue.trim().toLowerCase();

        if (!searchText) {
            return mappingData;
        }

        return mappingData.filter(
            (mapping) =>
                mapping.event
                    .toLowerCase()
                    .includes(searchText) ||
                mapping.client
                    .toLowerCase()
                    .includes(searchText) ||
                mapping.clinic
                    .toLowerCase()
                    .includes(searchText) ||
                mapping.eventTypes.some((type) =>
                    type.toLowerCase().includes(searchText)
                )
        );
    };

    const applySearch = (
        mappingData: Mapping[],
        searchValue: string
    ) => {
        setMappings(
            filterMappings(
                mappingData,
                searchValue
            )
        );
    };

    const loadMappings = async () => {
        try {
            const mappingData = await getEventMappings();

            const groupedMappings = groupMappings(
                mappingData,
                events
            );

            setAllMappings(groupedMappings);

            applySearch(
                groupedMappings,
                search
            );
        } catch (error) {
            console.error(
                "Failed to load event mappings:",
                error
            );

            setAllMappings([]);
            setMappings([]);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);

                const [
                    clientData,
                    eventResponse,
                    mappingData,
                ] = await Promise.all([
                    getClients(),
                    getEvents("", 0, 1000),
                    getEventMappings(),
                ]);

                const eventData =
                    eventResponse.content;

                setClients(clientData);
                setEvents(eventData);

                const groupedMappings =
                    groupMappings(
                        mappingData,
                        eventData
                    );

                setAllMappings(
                    groupedMappings
                );

                setMappings(
                    groupedMappings
                );
            } catch (error) {
                console.error(
                    "Failed to load event mapping data:",
                    error
                );

                setClients([]);
                setClinics([]);
                setEvents([]);
                setAllMappings([]);
                setMappings([]);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    const resetForm = () => {
        setClient("");
        setClinic("");
        setClinics([]);
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

    const openEditForm = async (
        mapping: Mapping
    ) => {
        setEditingId(mapping.id);
        setClient(String(mapping.clientId));

        try {
            const clinicData =
                await getClinics(
                    mapping.clientId
                );

            setClinics(clinicData);
        } catch (error) {
            console.error(
                "Failed to load clinics:",
                error
            );

            setClinics([]);
        }

        setClinic(
            String(mapping.clinicId)
        );

        setSelectedEvents([
            {
                event: mapping.event,
                eventId: mapping.eventId,
                eventTypes: [
                    ...mapping.eventTypes,
                ],
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

    const handleClientChange = async (
        value: string
    ) => {
        setClient(value);
        setClinic("");
        setClinics([]);
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
            return;
        }

        try {
            const clinicData =
                await getClinics(
                    Number(value)
                );

            setClinics(clinicData);
        } catch (error) {
            console.error(
                "Failed to load clinics:",
                error
            );

            setClinics([]);
        }
    };

    const handleClinicChange = (
        value: string
    ) => {
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

    const toggleEvent = (
        event: NotificationEvent
    ) => {
        setSelectedEvents((current) =>
            current.some(
                (item) =>
                    item.eventId === event.id
            )
                ? current.filter(
                    (item) =>
                        item.eventId !==
                        event.id
                )
                : [
                    ...current,
                    {
                        event:
                            event.eventName,
                        eventId:
                            event.id,
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
                            item.eventTypes.includes(
                                type
                            )
                                ? item.eventTypes.filter(
                                    (value) =>
                                        value !==
                                        type
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

    const removeEvent = (
        eventId: number
    ) => {
        setSelectedEvents((current) =>
            current.filter(
                (item) =>
                    item.eventId !== eventId
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
            newErrors.client =
                "Client is required";
        }

        if (!clinic) {
            newErrors.clinic =
                "Clinic is required";
        }

        if (selectedEvents.length === 0) {
            newErrors.events =
                "Select at least one event";
        }

        if (
            selectedEvents.length > 0 &&
            selectedEvents.some(
                (item) =>
                    item.eventTypes.length === 0
            )
        ) {
            newErrors.eventTypes =
                "Select at least one event type for each event";
        }

        setErrors(newErrors);

        if (
            Object.values(newErrors).some(
                Boolean
            )
        ) {
            return;
        }

        try {
            const payload = {
                clientId: Number(client),
                clinicId: Number(clinic),
                mappings: selectedEvents.map(
                    (item) => ({
                        eventId: item.eventId,
                        notificationTypes:
                            item.eventTypes.map(
                                (type) =>
                                    getNotificationType(
                                        type
                                    )
                            ),
                    })
                ),
            };

            console.log(
                "Event mapping payload:",
                payload
            );

            if (editingId !== null) {
                await updateEventMapping(
                    editingId,
                    payload
                );
            } else {
                await createEventMapping(
                    payload
                );
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
            await deleteEventMapping(
                deleteId
            );

            await loadMappings();

            setDeleteId(null);
        } catch (error) {
            console.error(
                "Failed to delete event mapping:",
                error
            );
        }
    };

    const availableEvents =
        events.filter(
            (event) =>
                !selectedEvents.some(
                    (item) =>
                        item.eventId ===
                        event.id
                )
        );

    const handleSearch = (
        value: string
    ) => {
        setSearch(value);

        applySearch(
            allMappings,
            value
        );
    };

    const handleResetSearch = () => {
        setSearch("");

        setMappings(
            allMappings
        );
    };

    return (
        <div className="events-page">
            {!showForm ? (
                <>
                    <div className="page-header">
                        <div>
                            <h1>
                                Event Mapping
                            </h1>

                            <p>
                                Configure events and event types for clinics.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="primary-button"
                            onClick={
                                openAddForm
                            }
                        >
                            + Add Event Mapping
                        </button>
                    </div>

                    <div className="search-section">
                        <div className="search-box">
                            <Search
                                size={18}
                            />

                            <input
                                type="text"
                                placeholder="Search event mappings by clients and clinics..."
                                value={search}
                                onChange={(e) =>
                                    handleSearch(
                                        e.target
                                            .value
                                    )
                                }
                            />
                        </div>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={
                                handleResetSearch
                            }
                        >
                            Reset
                        </button>
                    </div>

                    <div className="events-table-container">
                        <div className="events-table-header event-mapping-table">
                            <div>
                                Event
                            </div>

                            <div>
                                Event Type
                            </div>

                            <div>
                                Client
                            </div>

                            <div>
                                Clinic
                            </div>

                            <div>
                                Actions
                            </div>
                        </div>

                        {loading ? (
                            <div className="table-message">
                                <p>
                                    Loading event mappings...
                                </p>
                            </div>
                        ) : mappings.length >
                          0 ? (
                            mappings.map(
                                (
                                    mapping
                                ) => (
                                    <div
                                        className="events-table-row event-mapping-table"
                                        key={
                                            mapping.id
                                        }
                                    >
                                        <div className="event-title">
                                            {
                                                mapping.event
                                            }
                                        </div>

                                        <div className="event-type-list">
                                            {mapping.eventTypes.map(
                                                (
                                                    type
                                                ) => (
                                                    <span
                                                        className="event-status"
                                                        key={
                                                            type
                                                        }
                                                    >
                                                        {
                                                            type
                                                        }
                                                    </span>
                                                )
                                            )}
                                        </div>

                                        <div>
                                            {
                                                mapping.client
                                            }
                                        </div>

                                        <div>
                                            {
                                                mapping.clinic
                                            }
                                        </div>

                                        <div className="action-buttons">
                                            <button
                                                type="button"
                                                className="icon-button edit-button"
                                                onClick={() =>
                                                    openEditForm(
                                                        mapping
                                                    )
                                                }
                                                title="Edit"
                                            >
                                                <Pencil
                                                    size={
                                                        16
                                                    }
                                                />
                                            </button>

                                            <button
                                                type="button"
                                                className="icon-button delete-button"
                                                onClick={() =>
                                                    setDeleteId(
                                                        mapping.id
                                                    )
                                                }
                                                title="Delete"
                                            >
                                                <Trash2
                                                    size={
                                                        16
                                                    }
                                                />
                                            </button>
                                        </div>
                                    </div>
                                )
                            )
                        ) : (
                            <div className="table-message">
                                <p>
                                    No event mappings found.
                                </p>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <div className="page-header">
                        <div>
                            <h1>
                                {editingId !==
                                null
                                    ? "Edit Event Mapping"
                                    : "Add Event Mapping"}
                            </h1>

                            <p>
                                Select a client, clinic, events and event types.
                            </p>
                        </div>
                    </div>

                    <div className="event-form-container">
                        <div className="event-form">
                            <div className="form-group">
                                <label>
                                    Client{" "}
                                    <span className="required">
                                        *
                                    </span>
                                </label>

                                <select
                                    value={
                                        client
                                    }
                                    onChange={(e) =>
                                        handleClientChange(
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                    disabled={
                                        editingId !==
                                        null
                                    }
                                >
                                    <option value="">
                                        Select Client
                                    </option>

                                    {clients.map(
                                        (
                                            item
                                        ) => (
                                            <option
                                                key={
                                                    item.id
                                                }
                                                value={
                                                    item.id
                                                }
                                            >
                                                {
                                                    item.name
                                                }
                                            </option>
                                        )
                                    )}
                                </select>

                                {errors.client && (
                                    <p className="form-error">
                                        {
                                            errors.client
                                        }
                                    </p>
                                )}
                            </div>

                            <div className="form-group">
                                <label>
                                    Clinic{" "}
                                    <span className="required">
                                        *
                                    </span>
                                </label>

                                <select
                                    value={
                                        clinic
                                    }
                                    onChange={(e) =>
                                        handleClinicChange(
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                    disabled={
                                        !client ||
                                        editingId !==
                                        null
                                    }
                                >
                                    <option value="">
                                        Select Clinic
                                    </option>

                                    {clinics.map(
                                        (
                                            item
                                        ) => (
                                            <option
                                                key={
                                                    item.id
                                                }
                                                value={
                                                    item.id
                                                }
                                            >
                                                {
                                                    item.name
                                                }
                                            </option>
                                        )
                                    )}
                                </select>

                                {errors.clinic && (
                                    <p className="form-error">
                                        {
                                            errors.clinic
                                        }
                                    </p>
                                )}
                            </div>

                            {editingId ===
                            null ? (
                                <div className="form-group">
                                    <label>
                                        Events{" "}
                                        <span className="required">
                                            *
                                        </span>
                                    </label>

                                    <div className="event-multi-select">
                                        <div
                                            className={`event-multi-select-input ${
                                                !clinic
                                                    ? "disabled"
                                                    : ""
                                            }`}
                                            onClick={() => {
                                                if (
                                                    clinic
                                                ) {
                                                    setDropdownOpen(
                                                        (
                                                            current
                                                        ) =>
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
                                                        (
                                                            item
                                                        ) => (
                                                            <span
                                                                className="event-chip"
                                                                key={
                                                                    item.eventId
                                                                }
                                                            >
                                                                {
                                                                    item.event
                                                                }

                                                                <button
                                                                    type="button"
                                                                    onClick={(
                                                                        e
                                                                    ) => {
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

                                            <span className="event-dropdown-arrow">
                                                ▼
                                            </span>
                                        </div>

                                        {dropdownOpen &&
                                            clinic && (
                                                <div className="event-dropdown-menu">
                                                    {availableEvents.map(
                                                        (
                                                            event
                                                        ) => (
                                                            <div
                                                                key={
                                                                    event.id
                                                                }
                                                                className="event-dropdown-option"
                                                                onClick={() =>
                                                                    toggleEvent(
                                                                        event
                                                                    )
                                                                }
                                                            >
                                                                <span className="event-check">
                                                                    □
                                                                </span>

                                                                <span>
                                                                    {
                                                                        event.eventName
                                                                    }
                                                                </span>
                                                            </div>
                                                        )
                                                    )}

                                                    {selectedEvents.map(
                                                        (
                                                            item
                                                        ) => (
                                                            <div
                                                                key={
                                                                    item.eventId
                                                                }
                                                                className="event-dropdown-option selected"
                                                                onClick={() =>
                                                                    removeEvent(
                                                                        item.eventId
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
                                            {
                                                errors.events
                                            }
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label>
                                        Event
                                    </label>

                                    <div className="readonly-field">
                                        {
                                            selectedEvents[0]
                                                ?.event
                                        }
                                    </div>
                                </div>
                            )}

                            {selectedEvents.length >
                                0 && (
                                <div className="selected-events">
                                    <label>
                                        Selected Events
                                    </label>

                                    {selectedEvents.map(
                                        (
                                            item
                                        ) => (
                                            <div
                                                className="selected-event-card"
                                                key={
                                                    item.eventId
                                                }
                                            >
                                                <div className="selected-event-header">
                                                    <span>
                                                        {
                                                            item.event
                                                        }
                                                    </span>

                                                    {editingId ===
                                                        null && (
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
                                                        <span className="required">
                                                            *
                                                        </span>
                                                    </span>

                                                    <div className="event-type-options">
                                                        {eventTypes.map(
                                                            (
                                                                type
                                                            ) => (
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

                                                                    {
                                                                        type
                                                                    }
                                                                </label>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}

                                    {errors.eventTypes && (
                                        <p className="form-error">
                                            {
                                                errors.eventTypes
                                            }
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={
                                        resetForm
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="primary-button"
                                    onClick={
                                        saveMapping
                                    }
                                >
                                    {editingId !==
                                    null
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
                            <h2>
                                Delete Event Mapping
                            </h2>

                            <p>
                                Are you sure you want to delete this event mapping?
                            </p>
                        </div>

                        <div className="delete-confirmation-actions">
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() =>
                                    setDeleteId(
                                        null
                                    )
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="delete-button"
                                onClick={
                                    deleteMapping
                                }
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