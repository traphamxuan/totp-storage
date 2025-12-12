import { Totp } from "@/lib/entities";
import axios from "axios";
import { config } from "@/lib/config";

export class TotpManager {
    constructor(private repository: TotpInterface) { }

    private async validateTurnstileToken(token: string, ip: string): Promise<boolean> {
        try {
            const response = await axios.post(
                'https://challenges.cloudflare.com/turnstile/v0/siteverify',
                `secret=${encodeURIComponent(config.turnstile.secretKey)}&response=${encodeURIComponent(token)}&remoteip=${encodeURIComponent(ip)}`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                });
            return response.data.success;
        } catch (error) {
            console.error('Error validating Turnstile token:', error);
            return false;
        }
    }


    listTotp(searchParams: URLSearchParams): Promise<ListTOTPResponse> {
        const page = parseInt(searchParams.get('page') || '1');
        const size = parseInt(searchParams.get('size') || '100');
        const search = searchParams.get('q') || '';

        // Handle multi-column sorting
        let sortColumns: SortColumn[] = [];

        // Check if we have multi-column sorting parameters
        let index = 0;
        while (searchParams.has(`sort[${index}][field]`)) {
            const field = searchParams.get(`sort[${index}][field]`);
            const order = searchParams.get(`sort[${index}][order]`) as 'asc' | 'desc' || 'asc';

            if (field) {
                sortColumns.push({ field, order });
            }
            index++;
        }

        // Fallback to default sorting if no sort columns provided
        if (sortColumns.length === 0) {
            sortColumns = [{ field: 'used_at', order: 'desc' }];
        }

        const payload: Record<keyof CreateTotpPayload, string> = {
            issuer: searchParams.get('issuer') || '',
            label: searchParams.get('label') || '',
            secret: searchParams.get('secret') || ''
        };

        let pagination: Pagination = {
            page,
            size,
            sort: sortColumns
        };

        return this.repository.list(payload, pagination, search);
    }

    createTotp(payload: CreateTotpPayload, turnstileToken: string, ip: string): Promise<Totp> {
        if (!this.validateTurnstileToken(turnstileToken, ip)) {
            throw new Error('Invalid Turnstile token');
        }
        return this.repository.create(payload);
    }

    markTotp(ids: string[]): Promise<void> {
        return this.repository.mark(ids);
    }
}