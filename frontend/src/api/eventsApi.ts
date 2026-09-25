const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type NotificationEvent = {
    id: number;
    eventName: string;
    description: string;
    createdAt: string;
    updatedAt: string;
};

export type CreateEventRequest = {
    eventName: string;
    description: string;
};

export type UpdateEventRequest = {
    eventName: string;
    description: string;
};

export async function getEvents(): Promise<NotificationEvent[]> {
    const response = await fetch(
        `${API_BASE_URL}/notification-events`,
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
    data: CreateEventRequest
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
        throw new Error("Failed to create event");
    }

    return response.json();
}

export async function updateEvent(
    id: number,
    data: UpdateEventRequest
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
        throw new Error("Failed to update event");
    }

    return response.json();
}

export async function deleteEvent(id: number): Promise<void> {
    const response = await fetch(
        `${API_BASE_URL}/notification-events/${id}`,
        {
            method: "DELETE",
            credentials: "include",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to delete event");
    }
}