
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type NotificationType = "WHATSAPP" | "SMS" | "EMAIL";

export type Template = {
    id: number;
    notificationEvent: string;
    notificationType: NotificationType;
    subject: string | null;
    message: string;
    createdAt: string | null;
    updatedAt: string | null;
};

export type CreateTemplateRequest = {
    notificationEvent: string;
    notificationType: NotificationType;
    subject: string | null;
    message: string;
};

const request = async <T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        credentials: "include",
        headers: {
            ...(options?.body ? { "Content-Type": "application/json" } : {}),
            ...options?.headers,
        },
    });

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || `Request failed: ${response.status}`);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
};

export const getTemplates = (): Promise<Template[]> => {
    return request<Template[]>("/templates");
};

export const getTemplatesByEvent = (
    event: string
): Promise<Template[]> => {
    return request<Template[]>(
        `/templates/event/${encodeURIComponent(event)}`
    );
};

export const getTemplateById = (id: number): Promise<Template> => {
    return request<Template>(`/templates/${id}`);
};

export const createTemplate = (
    template: CreateTemplateRequest
): Promise<Template> => {
    return request<Template>("/templates", {
        method: "POST",
        body: JSON.stringify(template),
    });
};

export const updateTemplate = (
    id: number,
    template: CreateTemplateRequest
): Promise<Template> => {
    return request<Template>(`/templates/${id}`, {
        method: "PUT",
        body: JSON.stringify(template),
    });
};

export const deleteTemplate = (id: number): Promise<void> => {
    return request<void>(`/templates/${id}`, {
        method: "DELETE",
    });
};