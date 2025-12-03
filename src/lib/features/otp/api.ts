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

export async function listEntries(page: number = 1, limit: number = 10): Promise<ListTOTPResponse | null> {
    try {
        const response = await axios.get<ApiResponse<ListTOTPResponse>>(
            `${BASE_URL}?&page=${page}&limit=${limit}`
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

// export async function generateToken(id: string): Promise<TokenResponse | null> {
//     try {
//         const response = await axios.get<ApiResponse<TokenResponse>>(`${BASE_URL}/${id}`);

//         if (response.data.success && response.data.data) {
//             return response.data.data;
//         }

//         console.error('Failed to generate token:', response.data.error);
//         return null;
//     } catch (error) {
//         console.error('Error generating token:', error);
//         return null;
//     }
// }

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