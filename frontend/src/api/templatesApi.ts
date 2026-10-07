const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type NotificationType = "WHATSAPP" | "SMS" | "EMAIL";

export type Template = {
    id: number;
    notificationEvent: string;
    notificationType: NotificationType;
    subject: string | null;
    message: string;
};

export type CreateTemplateRequest = {
    notificationEvent: string;
    notificationType: NotificationType;
    subject: string | null;
    message: string;
};

export const getTemplates = async (): Promise<Template[]> => {
    const response = await fetch(`${API_BASE_URL}/templates`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch templates");
    }

    return response.json();
};

export const getTemplatesByEvent = async (
    event: string
): Promise<Template[]> => {
    const response = await fetch(
        `${API_BASE_URL}/templates/event/${encodeURIComponent(event)}`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch templates by event");
    }

    return response.json();
};

export const getTemplateById = async (
    id: number
): Promise<Template> => {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch template");
    }

    return response.json();
};

export const createTemplate = async (
    template: CreateTemplateRequest
): Promise<Template> => {
    const response = await fetch(`${API_BASE_URL}/templates`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(template),
    });

    if (!response.ok) {
        throw new Error("Failed to create template");
    }

    return response.json();
};

export const updateTemplate = async (
    id: number,
    template: CreateTemplateRequest
): Promise<Template> => {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(template),
    });

    if (!response.ok) {
        throw new Error("Failed to update template");
    }

    return response.json();
};

export const deleteTemplate = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
        method: "DELETE",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to delete template");
    }
};