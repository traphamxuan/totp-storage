import type { TOTPEntry } from '$lib/server';
import axios from 'axios';

const BASE_URL = '/api/public/totp';

export async function addEntry(payload: EnrollmentResult): Promise<TOTPEntry | null> {
    try {
        const response = await axios.post<ApiResponse<TOTPEntry>>(BASE_URL, payload);

        if (response.data.success && response.data.data) {
            return response.data.data;
        }

        console.error('Failed to add TOTP entry:', response.data.error);
        return null;
    } catch (error) {
        console.error('Error adding TOTP entry:', error);
        return null;
    }
}

export async function listEntries(
    page: number = 1, 
    limit: number = 10,
    search?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
): Promise<ListTOTPResponse | null> {
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

        console.error('Failed to list TOTP entries with secrets:', response.data.error);
        return null;
    } catch (error) {
        console.error('Error listing TOTP entries with secrets:', error);
        return null;
    }
}

export async function syncEntry(id: string): Promise<{ token: string } | null> {
    try {
        const response = await axios.get<ApiResponse<{ token: string }>>(`${BASE_URL}/${id}`);

        if (response.data.success && response.data.data) {
            return response.data.data;
        }

        console.error('Failed to sync TOTP entry:', response.data.error);
        return null;
    } catch (error) {
        console.error('Error syncing TOTP entry:', error);
        return null;
    }
}

export async function deleteEntry(id: string): Promise<boolean> {
    try {
        const response = await axios.delete<ApiResponse<null>>(`${BASE_URL}/${id}`);

        if (response.data.success) {
            return true;
        }

        console.error('Failed to delete TOTP entry:', response.data.error);
        return false;
    } catch (error) {
        console.error('Error deleting TOTP entry:', error);
        return false;
    }
}