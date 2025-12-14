import axios, { AxiosError } from 'axios';
import { Totp } from '@/lib/entities';

export class APIPublicTotp implements TotpInterface {
    private readonly BASE_URL = '/api/totp';
    constructor() { }

    async create(payload: CreateTotpPayload, turnstileToken?: string): Promise<Totp | null> {
        try {
            const config = turnstileToken ? {
                headers: {
                    'x-turnstile-token': turnstileToken
                }
            } : {};
            const response = await axios.post<ApiResponse<Totp>>(this.BASE_URL, payload, config);

            if (response.data.success && response.data.data) {
                // Convert TOTPEntry to Totp object
                return response.data.data;
            }

            // Show error toast for API errors
            if (response.data.error) {
                this.reportError('Failed to save TOTP entry')
            }
        } catch (error: unknown) {
            this.reportError(error as AxiosError);
        }
        return null;
    }

    async list(
        filter: Record<keyof CreateTotpPayload, string>,
        pagination: Pagination,
        search?: string,
    ): Promise<ListTOTPResponse> {
        try {
            // Build query parameters
            const params = new URLSearchParams();
            params.append('page', pagination.page.toString());
            params.append('size', pagination.size.toString());

            if (search) {
                params.append('q', search);
            }

            // Handle multi-column sorting
            if (pagination.sort && pagination.sort.length > 0) {
                pagination.sort.forEach((sortColumn, index) => {
                    params.append(`sort[${index}][field]`, sortColumn.field);
                    params.append(`sort[${index}][order]`, sortColumn.order);
                });
            }

            for (const [key, value] of Object.entries(filter)) {
                if (key.length && value.length) {
                    params.append(key, value);
                }
            }

            const response = await axios.get<ApiResponse<ListTOTPResponse>>(
                `${this.BASE_URL}?${params.toString()}`
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

    async get(id: string): Promise<{ token: string } | null> {
        try {
            const response = await axios.get<ApiResponse<{ token: string }>>(`${this.BASE_URL}/${id}`);

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

    async delete(id: string): Promise<boolean> {
        try {
            const response = await axios.delete<ApiResponse<null>>(`${this.BASE_URL}/${id}`);

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
    async mark(ids: string[]): Promise<void> {
        try {
            const response = await axios.patch<ApiResponse<null>>(this.BASE_URL, { ids });
            if (response.data.error) {
                reportError(response.data.error)
            }
        } catch (error) {
            reportError(error as AxiosError);
        }
    }

    // Add function to register TOTP entry with external service
    async register(id: string, secret: string): Promise<boolean> {
        try {
            const response = await axios.post<ApiResponse<null>>('https://totp-token.xarest.com/register', {
                id,
                secret
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                return true;
            }

            if (response.data.error) {
                this.reportError(response.data.error);
            }
        } catch (error) {
            this.reportError(error as AxiosError);
        }
        return false;
    }

    private reportError(error: string | AxiosError) {
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
        // toast.push(msg, {
        //     duration: 5000,
        //     theme: {
        //         '--toastColor': 'mintcream',
        //         '--toastBackground': 'rgba(201, 24, 24, 0.9)',
        //         '--toastBarBackground': 'rgba(116, 24, 24, 0.9)'
        //     }
        // })
    }
}
