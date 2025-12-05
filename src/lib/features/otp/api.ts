import axios, { AxiosError } from 'axios';
import { Totp } from '$lib/entities';
import { toast } from '@zerodevx/svelte-toast';

const BASE_URL = '/api/public/totp';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

interface ListTOTPResponse {
    entries: Totp[];
    total: number;
}

export async function addEntry(payload: EnrollmentResult, turnstileToken?: string): Promise<Totp | null> {
    try {
        const config = turnstileToken ? {
            headers: {
                'x-turnstile-token': turnstileToken
            }
        } : {};

        const response = await axios.post<ApiResponse<Totp>>(BASE_URL, payload, config);

        if (response.data.success && response.data.data) {
            // Convert TOTPEntry to Totp object
            return response.data.data;
        }

        // Show error toast for API errors
        if (response.data.error) {
            reportError('Failed to save TOTP entry')
        }
    } catch (error: unknown) {
        reportError(error as AxiosError);
    }
    return null;
}

export async function listEntries(
    page: number = 1,
    limit: number = 10,
    search?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
): Promise<ListTOTPResponse> {
    try {
        // Build query parameters
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        if (search) {
            params.append('search', search);
        }

        if (sortBy) {
            params.append('sortBy', sortBy);
        }

        if (sortOrder) {
            params.append('sortOrder', sortOrder);
        }

        const response = await axios.get<ApiResponse<ListTOTPResponse>>(
            `${BASE_URL}?${params.toString()}`
        );

        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        if (response.data.error) {
            console.warn(response.data.error);
        }
    } catch (err) {
        reportError(err as AxiosError);
    }
    return { entries: [], total: 0 };
}

export async function syncEntry(id: string): Promise<{ token: string } | null> {
    try {
        const response = await axios.get<ApiResponse<{ token: string }>>(`${BASE_URL}/${id}`);

        if (response.data.success && response.data.data) {
            return response.data.data;
        }

        if (response.data.error) {
            reportError(response.data.error)
        }
    } catch (error) {
        reportError(error as AxiosError);
    }
    return null;

}

export async function deleteEntry(id: string): Promise<boolean> {
    try {
        const response = await axios.delete<ApiResponse<null>>(`${BASE_URL}/${id}`);

        if (response.data.success) {
            return true;
        }

        if (response.data.error) {
            reportError(response.data.error)
        }
    } catch (error) {
        reportError(error as AxiosError);
    }
    return false
}

// Add function to update used_at field for entries
export async function updateUsedAt(ids: string[]): Promise<boolean> {
    try {
        const response = await axios.patch<ApiResponse<null>>(BASE_URL, { ids });

        if (response.data.success) {
            return true;
        }
        if (response.data.error) {
            reportError(response.data.error)
        }
    } catch (error) {
        reportError(error as AxiosError);
    }
    return false;
}

function reportError(error: string | AxiosError) {
    let msg: string;
    if (error instanceof AxiosError) {
        if (error.status === 409) {
            msg = 'TOTP entry already exists';
        } else {
            msg = error.message;
        }
    } else {
        msg = error;
    }
    toast.push(msg, {
        duration: 5000,
        theme: {
            '--toastColor': 'mintcream',
            '--toastBackground': 'rgba(201, 24, 24, 0.9)',
            '--toastBarBackground': 'rgba(116, 24, 24, 0.9)'
        }
    })
}
