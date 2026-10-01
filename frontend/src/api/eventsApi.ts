const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type NotificationEvent = {
    id: number;
    eventName: string;
    description: string;
    createdAt: string;
    updatedAt: string;
};

export async function getEvents(
    search?: string
): Promise<NotificationEvent[]> {
    const query = search?.trim()
        ? `?search=${encodeURIComponent(search.trim())}`
        : "";

    const response = await fetch(
        `${API_BASE_URL}/notification-events${query}`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch events");
    }

    return response.json();
}

export async function createEvent(
    data: {
        eventName: string;
        description: string;
    }
): Promise<NotificationEvent> {
    const response = await fetch(
        `${API_BASE_URL}/notification-events`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {
        let message = "Failed to create event";

        try {
            const errorData = await response.json();

            if (errorData?.message) {
                message = errorData.message;
            }
        } catch {
            message = "Failed to create event";
        }

        throw new Error(message);
    }

    return response.json();
}

export async function updateEvent(
    id: number,
    data: {
        eventName: string;
        description: string;
    }
): Promise<NotificationEvent> {
    const response = await fetch(
        `${API_BASE_URL}/notification-events/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {
        let message = "Failed to update event";

        try {
            const errorData = await response.json();

            if (errorData?.message) {
                message = errorData.message;
            }
        } catch {
            message = "Failed to update event";
        }

        throw new Error(message);
    }

    return response.json();
}

export async function deleteEvent(
    id: number
): Promise<void> {
    const response = await fetch(
        `${API_BASE_URL}/notification-events/${id}`,
        {
            method: "DELETE",
            credentials: "include",
        }
    );

    if (!response.ok) {
        let message = "Failed to delete event";

        try {
            const errorData = await response.json();

            if (errorData?.message) {
                message = errorData.message;
            }
        } catch {
            message = "Failed to delete event";
        }

        throw new Error(message);
    }
}