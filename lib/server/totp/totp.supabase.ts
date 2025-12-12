import { Totp } from '@/lib/entities';
import type { SupabaseClient } from '@supabase/supabase-js';

export class TotpSupabase implements TotpInterface {
    constructor(private supabase: SupabaseClient) { }
    private async fetchUserId(): Promise<string | undefined> {
        const { data: { user }, error: error } = await this.supabase.auth.getUser();
        if (!error && user) {
            return user.id;
        }
    }

    async create(payload: CreateTotpPayload, ownerId?: string): Promise<Totp | null> {
        ownerId = await this.fetchUserId();
        // Generate secret if not provided
        const secret = payload.secret || this.generateSecret();

        // Prepare the data for insertion
        const data = {
            secret: secret,
            metadata: {
                issuer: payload.issuer,
                label: payload.label,
                type: 'public' // Default type
            },
            owner_id: ownerId,
        };

        // Insert into database
        const { data: result, error } = await this.supabase
            .schema('public')
            .from('totp')
            .insert(data)
            .select()
            .single();

        if (error) {
            console.error('Error creating TOTP entry:', error);
            throw new Error('Failed to create TOTP entry');
        }

        // Return as Totp entity
        return new Totp(result);
    }

    async list(filter: Record<keyof CreateTotpPayload, string>, pagination: Pagination, search?: string, ownerId?: string): Promise<ListTOTPResponse> {
        ownerId = await this.fetchUserId();

        let query = this.supabase
            .schema('public')
            .from('totp')
            .select('*', { count: 'exact' });

        if (ownerId) {
            query = query.eq('owner_id', ownerId);
        }

        // Apply filters
        if (filter.issuer) {
            query = query.ilike("metadata->>issuer", `%${filter.issuer}%`);
        }

        if (filter.label) {
            query = query.ilike("metadata->>label", `%${filter.label}%`);
        }

        // Apply search
        if (search) {
            query = query.or(`metadata->>issuer.ilike.%${search}%,metadata->>label.ilike.%${search}%`);
        }


        // Apply pagination
        const from = (pagination.page - 1) * pagination.size;
        const to = from + pagination.size - 1;
        query = query.range(from, to);

        // Apply sorting - handle multi-column sorting
        if (pagination.sort && pagination.sort.length > 0) {
            // Multi-column sorting
            pagination.sort.forEach(sortColumn => {
                const order = sortColumn.order || 'asc';
                let field = (() => {
                    switch (sortColumn.field) {
                        case 'issuer':
                            return 'metadata->>issuer';
                        case 'label':
                            return 'metadata->>label';
                        case 'createdAt':
                            return 'created_at';
                        default:
                            return 'used_at';
                    }
                })();
                query = query.order(field, { ascending: order === 'asc' });
            });
        }

        const { data, error, count } = await query;

        if (error) {
            console.error('Error listing TOTP entries:', error);
            throw new Error('Failed to list TOTP entries');
        }

        // Convert to Totp entities
        const entries = data.map(item => new Totp(item));

        return {
            entries,
            total: count || 0
        };
    }

    async get(id: string, ownerId?: string): Promise<{ token: string } | null> {
        ownerId = await this.fetchUserId();
        let query = this.supabase
            .schema('public')
            .from('totp')
            .select('secret')
            .eq('id', id)

        if (ownerId) {
            query = query.eq('owner_id', ownerId);
        }

        const { data, error } = await query.single();
        if (error) {
            console.error('Error getting TOTP entry:', error);
            return null;
        }

        return { token: data.secret || '' }
    }

    async delete(id: string, ownerId?: string): Promise<boolean> {
        ownerId = await this.fetchUserId();
        let query = this.supabase
            .schema('public')
            .from('totp')
            .delete()
            .eq('id', id);

        if (ownerId) {
            query = query.eq('owner_id', ownerId);
        }

        const { error } = await query;

        if (error) {
            console.error('Error deleting TOTP entry:', error);
            return false;
        }

        return true;
    }

    async mark(ids: string[], ownerId?: string): Promise<void> {
        ownerId = await this.fetchUserId();
        let query = this.supabase
            .schema('public')
            .from('totp')
            .update({ used_at: new Date().toISOString() })
            .in('id', ids);

        if (ownerId) {
            query = query.eq('owner_id', ownerId);
        }

        const { error } = await query;
        if (error) {
            console.error('Error marking TOTP entries:', error);
            throw new Error('Failed to mark TOTP entries');
        }
    }

    // Helper function to generate a secret
    private generateSecret(): string {
        // This is a placeholder - in a real implementation, you would use a proper secret generation library
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let result = '';
        for (let i = 0; i < 16; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}