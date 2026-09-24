const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type Client = {
    id: number;
    name: string;
};

export type Clinic = {
    id: number;
    name: string;
};

export type NotificationPreference = {
    notificationEvent: string;
    whatsappEnabled: boolean;
    smsEnabled: boolean;
    emailEnabled: boolean;
};

export type SavePreferencesRequest = {
    clinicId: number;
    preferences: NotificationPreference[];
};

export async function getClients(): Promise<Client[]> {
    const response = await fetch(`${API_BASE_URL}/clients`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch clients");
    }

    return response.json();
}

export async function getClinics(clientId: number): Promise<Clinic[]> {
    const response = await fetch(
        `${API_BASE_URL}/clinics?clientId=${clientId}`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch clinics");
    }

    return response.json();
}

export async function savePreferences(
    data: SavePreferencesRequest
): Promise<void> {
    const response = await fetch(
        `${API_BASE_URL}/communication-preferences`,
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
        throw new Error("Failed to save preferences");
    }
}