
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type NotificationType =
    | "WHATSAPP"
    | "SMS"
    | "EMAIL";

export type EventMapping = {
    id: number;
    clientId: number;
    clientName: string;
    clinicId: number;
    clinicName: string;
    eventId: number;
    eventName: string | null;
    notificationTypes: NotificationType[];
};

export type EventMappingCreateResponse = {
    clientId: number;
    clientName: string;
    clinicId: number;
    clinicName: string;
    mappings: {
        id: number;
        eventId: number;
        eventName: string | null;
        notificationTypes: NotificationType[];
    }[];
};

export type EventMappingPagination = {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
};

export type EventMappingPage = {
    content: EventMapping[];
    pagination: EventMappingPagination;
};

export type EventMappingItemRequest = {
    eventId: number;
    notificationTypes: NotificationType[];
};

export type EventMappingRequest = {
    clientId: number;
    clinicId: number;
    mappings: EventMappingItemRequest[];
};

export type UpdateEventMappingRequest = {
    clientId: number;
    clinicId: number;
    eventId: number;
    notificationTypes: NotificationType[];
};

export async function getEventMappings(
    search = "",
    page = 0,
    size = 10
): Promise<EventMappingPage> {
    const params = new URLSearchParams();

    if (search.trim()) {
        params.set("search", search.trim());
    }

    params.set("page", String(page));
    params.set("size", String(size));

    const response = await fetch(
        `${API_BASE_URL}/event-mappings?${params.toString()}`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch event mappings");
    }

    return response.json();
}

export async function createEventMapping(
    data: EventMappingRequest
): Promise<EventMappingCreateResponse> {
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
    data: UpdateEventMappingRequest
): Promise<unknown> {
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