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
    notificationType: NotificationType;
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

type EventMappingApiItem = {
    eventId: number;
    eventName: string | null;
    notificationTypes: NotificationType[];
};

type EventMappingApiResponse = {
    clientId: number;
    clientName: string;
    clinicId: number;
    clinicName: string;
    mappings: EventMappingApiItem[];
};

export async function getEventMappings(): Promise<EventMapping[]> {
    const response = await fetch(
        `${API_BASE_URL}/event-mappings`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch event mappings");
    }

    const data: EventMappingApiResponse[] =
        await response.json();

    return data.flatMap((clinicMapping) =>
        clinicMapping.mappings.flatMap((mapping) =>
            mapping.notificationTypes.map(
                (notificationType, index) => ({
                    id:
                        mapping.eventId * 1000 +
                        clinicMapping.clinicId * 10 +
                        index,

                    clientId: clinicMapping.clientId,
                    clientName: clinicMapping.clientName,

                    clinicId: clinicMapping.clinicId,
                    clinicName: clinicMapping.clinicName,

                    eventId: mapping.eventId,
                    eventName: mapping.eventName,

                    notificationType,
                })
            )
        )
    );
}

export async function createEventMapping(
    data: EventMappingRequest
): Promise<void> {
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
}

export async function updateEventMapping(
    id: number,
    data: EventMappingRequest
): Promise<void> {
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