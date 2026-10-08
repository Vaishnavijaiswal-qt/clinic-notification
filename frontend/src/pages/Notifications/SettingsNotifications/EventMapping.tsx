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

type MappingRecord = {
    id: number;
    type: string;
};

type Mapping = {
    id: number;
    mappingIds: number[];
    mappingRecords: MappingRecord[];
    event: string;
    eventId: number;
    eventTypes: string[];
    client: string;
    clientId: number;
    clinic: string;
    clinicId: number;
};

type SelectedEvent = {
    event: string;
    eventId: number;
    eventTypes: string[];
};

const eventTypes = [
    "WhatsApp",
    "SMS",
    "Email",
];

const pageSize = 10;

function EventMapping() {
    const [showForm, setShowForm] = useState(false);

    const [dropdownOpen, setDropdownOpen] = useState(false);

    const [editingId, setEditingId] =  useState<number | null>(null);

    const [editingMapping, setEditingMapping] = useState<Mapping | null>(null);
    const [deleteMappingIds, setDeleteMappingIds] = useState<number[] | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [clients, setClients] = useState<Client[]>([]);
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [events, setEvents] = useState<NotificationEvent[]>([]);
    const [mappings, setMappings] =  useState<Mapping[]>([]);
    const [allMappings, setAllMappings] = useState<Mapping[]>([]);

    const [client, setClient] = useState("");
    const [clinic, setClinic] = useState("");
    const [selectedEvents, setSelectedEvents] = useState<SelectedEvent[]>([]);

    const [errors, setErrors] =
        useState({
            client: "",
            clinic: "",
            events: "",
            eventTypes: "",
        });

    const convertMapping = (
        item: ApiEventMapping,
        eventList: NotificationEvent[] = events
    ): Mapping => {
        const type =
            item.notificationType === "WHATSAPP"
                ? "WhatsApp"
                : item.notificationType === "SMS"
                    ? "SMS"
                    : "Email";

        const eventName =
            item.eventName ||
            eventList.find(
                (event) =>
                    event.id === item.eventId
            )?.eventName ||
            "Unknown Event";

        return {
            id: item.id,
            mappingIds: [item.id],
            mappingRecords: [
                {
                    id: item.id,
                    type: type,
                },
            ],
            eventId: item.eventId,
            event: eventName,
            eventTypes: [type],
            clientId: item.clientId,
            client:
                item.clientName ||
                "Unknown Client",
            clinicId: item.clinicId,
            clinic:
                item.clinicName ||
                "Unknown Clinic",
        };
    };

    const groupMappings = (
        items: ApiEventMapping[],
        eventList: NotificationEvent[] = events
    ): Mapping[] => {
        const grouped = new Map<
            string,
            Mapping
        >();

        items.forEach((item) => {
            const converted =
                convertMapping(
                    item,
                    eventList
                );

            const key =
                `${item.clientId}-${item.clinicId}-${item.eventId}`;

            const existing =
                grouped.get(key);

            if (!existing) {
                grouped.set(
                    key,
                    converted
                );

                return;
            }

            existing.mappingIds.push(
                item.id
            );

            const type =
                item.notificationType ===
                "WHATSAPP"
                    ? "WhatsApp"
                    : item.notificationType ===
                        "SMS"
                        ? "SMS"
                        : "Email";

            existing.mappingRecords.push({
                id: item.id,
                type: type,
            });

            if (
                !existing.eventTypes.includes(
                    type
                )
            ) {
                existing.eventTypes.push(
                    type
                );
            }
        });

        return Array.from(
            grouped.values()
        );
    };

    const updateDisplayedPage = (
        data: Mapping[],
        page: number
    ) => {
        const calculatedTotalPages =
            Math.ceil(
                data.length /
                pageSize
            );

        const safePage =
            calculatedTotalPages === 0
                ? 0
                : Math.min(
                    page,
                    calculatedTotalPages - 1
                );

        const startIndex =
            safePage * pageSize;

        const endIndex =
            startIndex + pageSize;

        const pageData =
            data.slice(
                startIndex,
                endIndex
            );

        setAllMappings(data);
        setMappings(pageData);
        setCurrentPage(safePage);
        setTotalPages(
            calculatedTotalPages
        );
        setTotalElements(
            data.length
        );
    };

    const loadMappings = async (
        page = currentPage,
        searchValue = search
    ) => {
        try {
            setLoading(true);

            const response =
                await getEventMappings(
                    searchValue,
                    0,
                    10
                );

            const mappingRows =
                groupMappings(
                    response.content
                );

            updateDisplayedPage(
                mappingRows,
                page
            );
        } catch (error) {
            console.error(
                "Failed to load event mappings:",
                error
            );

            setMappings([]);
            setAllMappings([]);
            setCurrentPage(0);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadInitialData =
            async () => {
                try {
                    setLoading(true);

                    const [
                        clientData,
                        eventResponse,
                        mappingResponse,
                    ] =
                        await Promise.all([
                            getClients(),
                            getEvents(
                                "",
                                0,
                                10
                            ),
                            getEventMappings(
                                "",
                                0,
                                10
                            ),
                        ]);

                    const eventData =
                        eventResponse.content;

                    setClients(
                        clientData
                    );

                    setEvents(
                        eventData
                    );

                    const mappingRows =
                        groupMappings(
                            mappingResponse.content,
                            eventData
                        );

                    updateDisplayedPage(
                        mappingRows,
                        0
                    );
                } catch (error) {
                    console.error(
                        "Failed to load event mapping data:",
                        error
                    );

                    setClients([]);
                    setClinics([]);
                    setEvents([]);
                    setMappings([]);
                    setAllMappings([]);
                    setCurrentPage(0);
                    setTotalPages(0);
                    setTotalElements(0);
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
        setEditingMapping(null);
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
        setEditingMapping(mapping);

        setClient(
            String(mapping.clientId)
        );

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

        try {
            const clinicData =
                await getClinics(
                    mapping.clientId
                );

            setClinics(
                clinicData
            );
        } catch (error) {
            console.error(
                "Failed to load clinics:",
                error
            );

            setClinics([]);
        }
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

            setClinics(
                clinicData
            );
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
        setSelectedEvents(
            (current) =>
                current.some(
                    (item) =>
                        item.eventId ===
                        event.id
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
            current.map((item) => {
                if (
                    item.eventId !==
                    eventId
                ) {
                    return item;
                }

                const alreadySelected =
                    item.eventTypes.includes(
                        type
                    );

                return {
                    ...item,
                    eventTypes:
                        alreadySelected
                            ? item.eventTypes.filter(
                                (
                                    value
                                ) =>
                                    value !==
                                    type
                            )
                            : [
                                ...item.eventTypes,
                                type,
                            ],
                };
            })
        );

        setErrors((current) => ({
            ...current,
            eventTypes: "",
        }));
    };

    const removeEvent = (
        eventId: number
    ) => {
        setSelectedEvents(
            (current) =>
                current.filter(
                    (item) =>
                        item.eventId !==
                        eventId
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
    ):
        | "WHATSAPP"
        | "SMS"
        | "EMAIL" => {
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

        if (
            selectedEvents.length ===
            0
        ) {
            newErrors.events =
                "Select at least one event";
        }

        if (
            editingId === null &&
            selectedEvents.length > 0 &&
            selectedEvents.some(
                (item) =>
                    item.eventTypes.length ===
                    0
            )
        ) {
            newErrors.eventTypes =
                "Select at least one event type for each event";
        }

        setErrors(newErrors);

        if (
            Object.values(
                newErrors
            ).some(Boolean)
        ) {
            return;
        }

        try {
            if (
                editingId !== null
            ) {
                const selectedEvent =
                    selectedEvents[0];

                if (
                    !selectedEvent ||
                    !editingMapping
                ) {
                    return;
                }

                const selectedTypes =
                    selectedEvent.eventTypes;

                const originalRecords =
                    editingMapping.mappingRecords;

                const originalTypes =
                    originalRecords.map(
                        (record) =>
                            record.type
                    );

                const removedRecords =
                    originalRecords.filter(
                        (record) =>
                            !selectedTypes.includes(
                                record.type
                            )
                    );

                const addedTypes =
                    selectedTypes.filter(
                        (type) =>
                            !originalTypes.includes(
                                type
                            )
                    );

                const updateCount =
                    Math.min(
                        removedRecords.length,
                        addedTypes.length
                    );

                for (
                    let index = 0;
                    index < updateCount;
                    index++
                ) {
                    const record =
                        removedRecords[
                            index
                        ];

                    const newType =
                        addedTypes[
                            index
                        ];

                    await updateEventMapping(
                        record.id,
                        {
                            clientId:
                                Number(client),
                            clinicId:
                                Number(clinic),
                            eventId:
                                selectedEvent.eventId,
                            notificationType:
                                getNotificationType(
                                    newType
                                ),
                        }
                    );
                }

                if (
                    removedRecords.length >
                    updateCount
                ) {
                    const recordsToDelete =
                        removedRecords.slice(
                            updateCount
                        );

                    await Promise.all(
                        recordsToDelete.map(
                            (record) =>
                                deleteEventMapping(
                                    record.id
                                )
                        )
                    );
                }

                if (
                    addedTypes.length >
                    updateCount
                ) {
                    const remainingTypes =
                        addedTypes.slice(
                            updateCount
                        );

                    await createEventMapping({
                        clientId:
                            Number(client),
                        clinicId:
                            Number(clinic),
                        mappings: [
                            {
                                eventId:
                                    selectedEvent.eventId,
                                notificationTypes:
                                    remainingTypes.map(
                                        (
                                            type
                                        ) =>
                                            getNotificationType(
                                                type
                                            )
                                    ),
                            },
                        ],
                    });
                }
            } else {
                const createPayload = {
                    clientId:
                        Number(client),
                    clinicId:
                        Number(clinic),
                    mappings:
                        selectedEvents.map(
                            (item) => ({
                                eventId:
                                    item.eventId,
                                notificationTypes:
                                    item.eventTypes.map(
                                        (
                                            type
                                        ) =>
                                            getNotificationType(
                                                type
                                            )
                                    ),
                            })
                        ),
                };

                await createEventMapping(
                    createPayload
                );
            }

            await loadMappings(
                0,
                search
            );

            resetForm();
        } catch (error) {
            console.error(
                "Failed to save event mapping:",
                error
            );
        }
    };

    const deleteMapping = async () => {
        if (
            !deleteMappingIds ||
            deleteMappingIds.length === 0
        ) {
            return;
        }

        try {
            setDeleting(true);

            await Promise.all(
                deleteMappingIds.map(
                    (id) =>
                        deleteEventMapping(id)
                )
            );

            setDeleteMappingIds(
                null
            );

            await loadMappings(
                currentPage,
                search
            );
        } catch (error) {
            console.error(
                "Failed to delete event mapping:",
                error
            );
        } finally {
            setDeleting(false);
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
        setCurrentPage(0);

        loadMappings(
            0,
            value
        );
    };

    const handleResetSearch = () => {
        setSearch("");
        setCurrentPage(0);

        loadMappings(
            0,
            ""
        );
    };

    const handlePageChange = (
        page: number
    ) => {
        if (
            page < 0 ||
            page >= totalPages ||
            page === currentPage
        ) {
            return;
        }

        const startIndex =
            page * pageSize;

        const endIndex =
            startIndex + pageSize;

        const pageData =
            allMappings.slice(
                startIndex,
                endIndex
            );

        setMappings(
            pageData
        );

        setCurrentPage(
            page
        );
    };

    const getVisiblePages = () => {
        const pages: number[] = [];

        const start = Math.max(
            0,
            currentPage - 2
        );

        const end = Math.min(
            totalPages - 1,
            currentPage + 2
        );

        for (
            let page = start;
            page <= end;
            page++
        ) {
            pages.push(page);
        }

        return pages;
    };

    return (
        <div className="events-page">

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
                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search event mappings by clients and clinics..."
                        value={search}
                        onChange={(e) =>
                            handleSearch(
                                e.target.value
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
                ) : mappings.length > 0 ? (
                    mappings.map(
                        (mapping) => (
                            <div
                                className="events-table-row event-mapping-table"
                                key={
                                    `${mapping.clientId}-${mapping.clinicId}-${mapping.eventId}`
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
                                            size={16}
                                        />
                                    </button>

                                    <button
                                        type="button"
                                        className="icon-button delete-button"
                                        onClick={() =>
                                            setDeleteMappingIds(
                                                mapping.mappingIds
                                            )
                                        }
                                        title="Delete"
                                        disabled={
                                            deleting
                                        }
                                    >
                                        <Trash2
                                            size={16}
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

            {!loading &&
                totalElements > 0 && (
                    <div className="mapping-pagination">

                        <div className="mapping-pagination-info">
                            Showing page{" "}
                            {currentPage + 1}{" "}
                            of{" "}
                            {totalPages}{" "}
                            ({totalElements}{" "}
                            records)
                        </div>

                        <div className="mapping-pagination-controls">

                            <button
                                type="button"
                                onClick={() =>
                                    handlePageChange(
                                        currentPage - 1
                                    )
                                }
                                disabled={
                                    currentPage === 0
                                }
                            >
                                Previous
                            </button>

                            {getVisiblePages().map(
                                (page) => (
                                    <button
                                        type="button"
                                        key={
                                            page
                                        }
                                        className={
                                            page ===
                                            currentPage
                                                ? "active"
                                                : ""
                                        }
                                        onClick={() =>
                                            handlePageChange(
                                                page
                                            )
                                        }
                                    >
                                        {page + 1}
                                    </button>
                                )
                            )}

                            <button
                                type="button"
                                onClick={() =>
                                    handlePageChange(
                                        currentPage + 1
                                    )
                                }
                                disabled={
                                    currentPage >=
                                    totalPages - 1
                                }
                            >
                                Next
                            </button>

                        </div>

                    </div>
                )}

            {showForm && (
                <div className="event-modal-overlay">

                    <div className="event-form-container">

                        <div className="event-form-header">

                            <div>
                                <span className="event-form-label">
                                    {editingId !== null
                                        ? "EDIT EVENT MAPPING"
                                        : "NEW EVENT MAPPING"}
                                </span>

                                <h3>
                                    {editingId !== null
                                        ? "Edit Event Mapping"
                                        : "Add Event Mapping"}
                                </h3>

                                <p>
                                    Configure client, clinic, events and notification types.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="close-button"
                                onClick={
                                    resetForm
                                }
                                aria-label="Close"
                            >
                                ×
                            </button>

                        </div>

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
                                    onChange={(
                                        e
                                    ) =>
                                        handleClientChange(
                                            e.target.value
                                        )
                                    }
                                    disabled={
                                        editingId !== null
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
                                    onChange={(
                                        e
                                    ) =>
                                        handleClinicChange(
                                            e.target.value
                                        )
                                    }
                                    disabled={
                                        !client ||
                                        editingId !== null
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

                            {editingId === null ? (
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

                                                {selectedEvents.length === 0 ? (
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

                            {selectedEvents.length > 0 && (
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
                                    {editingId !== null
                                        ? "Update Mapping"
                                        : "Save Mapping"}
                                </button>

                            </div>

                        </div>

                    </div>

                </div>
            )}

            {deleteMappingIds !== null && (
                <div className="delete-confirmation">

                    <div className="delete-confirmation-card">

                        <div className="delete-confirmation-header">

                            <h2>
                                Delete Event Mapping
                            </h2>

                            <p>
                                Are you sure you want to delete this event mapping?
                                This action cannot be undone.
                            </p>

                        </div>

                        <div className="delete-confirmation-actions">

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() =>
                                    setDeleteMappingIds(
                                        null
                                    )
                                }
                                disabled={
                                    deleting
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="button-danger"
                                onClick={
                                    deleteMapping
                                }
                                disabled={
                                    deleting
                                }
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

export default EventMapping;