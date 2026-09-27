const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type EventMapping = {
    id: number;
    clientId: number;
    clinicId: number;
    eventId: number;
    notificationType: "WHATSAPP" | "SMS" | "EMAIL";
};

export type EventMappingRequest = {
    clientId: number;
    clinicId: number;
    eventId: number;
    notificationType: "WHATSAPP" | "SMS" | "EMAIL";
};

export async function getEventMappings(): Promise<EventMapping[]> {
    const response = await fetch(`${API_BASE_URL}/event-mappings`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch event mappings");
    }

    return response.json();
}

export async function getEventMapping(
    id: number
): Promise<EventMapping> {
    const response = await fetch(
        `${API_BASE_URL}/event-mappings/${id}`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch event mapping");
    }

    return response.json();
}

export async function createEventMapping(
    data: EventMappingRequest
): Promise<EventMapping> {
    const response = await fetch(
        `${API_BASE_URL}/event-mappings`,
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
        throw new Error("Failed to create event mapping");
    }

    return response.json();
}

export async function updateEventMapping(
    id: number,
    data: EventMappingRequest
): Promise<EventMapping> {
    const response = await fetch(
        `${API_BASE_URL}/event-mappings/${id}`,
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
        throw new Error("Failed to update event mapping");
    }

    return response.json();
}

export async function deleteEventMapping(
    id: number
): Promise<void> {
    const response = await fetch(
        `${API_BASE_URL}/event-mappings/${id}`,
        {
            method: "DELETE",
            credentials: "include",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to delete event mapping");
    }
}