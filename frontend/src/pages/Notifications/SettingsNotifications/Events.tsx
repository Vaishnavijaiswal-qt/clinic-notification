import { useEffect, useState } from "react";
import { Pencil, Trash2, Search } from "lucide-react";

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

    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");

    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;

    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] =
        useState<NotificationEvent | null>(null);

    const [eventName, setEventName] = useState("");
    const [description, setDescription] = useState("");

    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const loadEvents = async (
        searchValue = search,
        page = currentPage
    ) => {
        try {
            setLoading(true);

            const data = await getEvents(
                searchValue,
                page,
                pageSize
            );

            setEvents(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (error) {
            console.error(
                "Failed to load events:",
                error
            );

            setEvents([]);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let cancelled = false;

        const fetchEvents = async () => {
            try {
                const data = await getEvents(
                    search,
                    currentPage,
                    pageSize
                );

                if (cancelled) {
                    return;
                }

                setEvents(data.content);
                setTotalPages(data.totalPages);
                setTotalElements(data.totalElements);
            } catch (error) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Failed to load events:",
                    error
                );

                setEvents([]);
                setTotalPages(0);
                setTotalElements(0);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchEvents();

        return () => {
            cancelled = true;
        };
    }, [search, currentPage]);

    const handleSearch = () => {
        setLoading(true);
        setCurrentPage(0);
        setSearch(searchInput.trim());
    };

    const handleReset = () => {
        setLoading(true);
        setSearchInput("");
        setSearch("");
        setCurrentPage(0);
    };

    const handlePageChange = (page: number) => {
        if (page < 0 || page >= totalPages) {
            return;
        }

        setLoading(true);
        setCurrentPage(page);
    };

    const handleAdd = () => {
        setEditingEvent(null);
        setEventName("");
        setDescription("");
        setShowForm(true);
    };

    const handleEdit = (event: NotificationEvent) => {
        setEditingEvent(event);
        setEventName(event.eventName);
        setDescription(event.description);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingEvent(null);
        setEventName("");
        setDescription("");
    };

    const handleSave = async () => {
        if (
            !eventName.trim() ||
            !description.trim()
        ) {
            return;
        }

        try {
            setSaving(true);

            const payload = {
                eventName: eventName.trim(),
                description: description.trim(),
            };

            if (editingEvent) {
                await updateEvent(
                    editingEvent.id,
                    payload
                );
            } else {
                await createEvent(payload);
            }

            handleCloseForm();

            await loadEvents(
                search,
                currentPage
            );
        } catch (error) {
            console.error(
                "Failed to save event:",
                error
            );

            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to save event";

            alert(message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this event?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(id);

            await deleteEvent(id);

            const shouldMoveToPreviousPage =
                events.length === 1 &&
                currentPage > 0;

            if (shouldMoveToPreviousPage) {
                setLoading(true);
                setCurrentPage(
                    (previousPage) =>
                        previousPage - 1
                );
            } else {
                await loadEvents(
                    search,
                    currentPage
                );
            }
        } catch (error) {
            console.error(
                "Failed to delete event:",
                error
            );

            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to delete event";

            alert(message);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="events-page">
            <div className="page-header">
                <div>
                    <h2>Events</h2>

                    <p>
                        Manage notification events used
                        across the system.
                    </p>
                </div>

                <button
                    type="button"
                    className="primary-button"
                    onClick={handleAdd}
                >
                    Add Event
                </button>
            </div>

<div className="search-section">
    <div className="search-box">
        <Search size={18} />

        <input
            type="text"
            placeholder="Search events..."
            value={searchInput}
            onChange={(event) =>
                setSearchInput(event.target.value)
            }
            onKeyDown={(event) => {
                if (event.key === "Enter") {
                    handleSearch();
                }
            }}
        />
    </div>

    <button
        type="button"
        className="secondary-button"
        onClick={handleReset}
    >
        Reset
    </button>
</div>
            {showForm && (
                <div className="event-form-container">
                    <div className="event-form-header">
                        <h3>
                            {editingEvent
                                ? "Edit Event"
                                : "Add Event"}
                        </h3>

                        <button
                            type="button"
                            className="close-button"
                            onClick={handleCloseForm}
                            disabled={saving}
                        >
                            ×
                        </button>
                    </div>

                    <div className="event-form">
                        <div className="form-group">
                            <label htmlFor="eventName">
                                Event Name
                            </label>

                            <input
                                id="eventName"
                                type="text"
                                value={eventName}
                                onChange={(event) =>
                                    setEventName(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter event name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">
                                Description
                            </label>

                            <textarea
                                id="description"
                                value={description}
                                onChange={(event) =>
                                    setDescription(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter event description"
                                rows={4}
                            />
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={
                                    handleCloseForm
                                }
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="primary-button"
                                onClick={handleSave}
                                disabled={
                                    saving ||
                                    !eventName.trim() ||
                                    !description.trim()
                                }
                            >
                                {saving
                                    ? "Saving..."
                                    : editingEvent
                                      ? "Update Event"
                                      : "Add Event"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="events-table-container">
                <table className="events-table">
                    <thead>
                        <tr>
                            <th>Event Name</th>
                            <th>Description</th>
                            <th>Created At</th>
                            <th>Updated At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="table-message"
                                >
                                    Loading events...
                                </td>
                            </tr>
                        ) : events.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="table-message"
                                >
                                    No events found.
                                </td>
                            </tr>
                        ) : (
                            events.map((event) => (
                                <tr key={event.id}>
                                    <td>
                                        {event.eventName}
                                    </td>

                                    <td>
                                        {event.description}
                                    </td>

                                    <td>
                                        {new Date(
                                            event.createdAt
                                        ).toLocaleString()}
                                    </td>

                                    <td>
                                        {new Date(
                                            event.updatedAt
                                        ).toLocaleString()}
                                    </td>

                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                type="button"
                                                className="icon-button edit-button"
                                                onClick={() =>
                                                    handleEdit(
                                                        event
                                                    )
                                                }
                                                title="Edit"
                                            >
                                                <Pencil
                                                    size={17}
                                                />
                                            </button>

                                            <button
                                                type="button"
                                                className="icon-button delete-button"
                                                onClick={() =>
                                                    handleDelete(
                                                        event.id
                                                    )
                                                }
                                                disabled={
                                                    deletingId ===
                                                    event.id
                                                }
                                                title="Delete"
                                            >
                                                <Trash2
                                                    size={17}
                                                />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {!loading &&
                totalElements > 0 && (
                    <div className="pagination">
                        <div className="pagination-info">
                            Showing{" "}
                            {currentPage *
                                pageSize +
                                1}
                            –
                            {Math.min(
                                (currentPage + 1) *
                                    pageSize,
                                totalElements
                            )}{" "}
                            of {totalElements}
                        </div>

                        <div className="pagination-controls">
                            <button
                                type="button"
                                disabled={
                                    currentPage === 0
                                }
                                onClick={() =>
                                    handlePageChange(
                                        currentPage - 1
                                    )
                                }
                            >
                                Previous
                            </button>

                            {Array.from(
                                {
                                    length: totalPages,
                                },
                                (_, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className={
                                            currentPage ===
                                            index
                                                ? "active"
                                                : ""
                                        }
                                        onClick={() =>
                                            handlePageChange(
                                                index
                                            )
                                        }
                                    >
                                        {index + 1}
                                    </button>
                                )
                            )}

                            <button
                                type="button"
                                disabled={
                                    currentPage ===
                                    totalPages - 1
                                }
                                onClick={() =>
                                    handlePageChange(
                                        currentPage + 1
                                    )
                                }
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
        </div>
    );
}

export default Events;