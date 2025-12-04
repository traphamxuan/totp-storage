import type { SupabaseClient } from '@supabase/supabase-js';

export class TOTPRepository {
    constructor(private supabase: SupabaseClient) {
    }

    async create(totp: Omit<Totp, 'id' | 'created_at'>): Promise<Totp> {
        const { data, error } = await this.supabase
            .from('totp')
            .insert(totp)
            .select()
            .single<Totp>();

        if (error) {
            throw error;
        }

        return data;
    }

    async getMany(
        page: number = 1,
        limit: number = 10,
        options?: { 
            search?: string; 
            sortBy?: 'issuer' | 'label' | 'createdAt'; 
            sortOrder?: 'asc' | 'desc';
            created_by?: string 
        }
    ): Promise<{ data: Totp[]; total: number }> {
        let query = this.supabase
            .from('totp')
            .select('*', { count: 'exact' });

        // Apply search filter
        if (options?.search) {
            // Search in issuer or label fields within metadata
            query = query.or(`metadata->>issuer.ilike.%${options.search}%,metadata->>label.ilike.%${options.search}%`);
        }

        if (options?.created_by) {
            query = query.eq('created_by', options.created_by);
        }

        // Apply sorting
        if (options?.sortBy && options?.sortOrder) {
            let sortColumn: string;
            switch (options.sortBy) {
                case 'issuer':
                    sortColumn = 'metadata->>issuer';
                    break;
                case 'label':
                    sortColumn = 'metadata->>label';
                    break;
                case 'createdAt':
                    sortColumn = 'created_at';
                    break;
                default:
                    sortColumn = 'created_at';
            }
            query = query.order(sortColumn, { ascending: options.sortOrder === 'asc' });
        } else {
            // Default sorting by used_at descending, then by created_at descending
            query = query.order('used_at', { ascending: false, nullsFirst: false })
                         .order('created_at', { ascending: false });
        }

        // Apply pagination
        const startIndex = (page - 1) * limit;
        query = query.range(startIndex, startIndex + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            throw error;
        }

        return {
            data: data || [],
            total: count || 0
        };
    }

    async getOne(id: string): Promise<Totp> {
        const { data, error } = await this.supabase
            .from('totp')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    async delete(id: string): Promise<boolean> {
        const { error } = await this.supabase
            .from('totp')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        return true;
    }

    async count(options?: { 
        search?: string;
        created_by?: string 
    }): Promise<number> {
        let query = this.supabase
            .from('totp')
            .select('*', { count: 'exact' });

        // Apply search filter
        if (options?.search) {
            // Search in issuer or label fields within metadata
            query = query.or(`metadata->>issuer.ilike.%${options.search}%,metadata->>label.ilike.%${options.search}%`);
        }

        if (options?.created_by) {
            query = query.eq('created_by', options.created_by);
        }

        const { count, error } = await query;

        if (error) {
            throw error;
        }

        return count || 0;
    }

    // Add method to update the used_at field for one or more entries
    async updateUsedAt(ids: string[]): Promise<boolean> {
        const { error } = await this.supabase
            .from('totp')
            .update({ used_at: new Date().toISOString() })
            .in('id', ids);

        if (error) {
            throw error;
        }

        return true;
    }
}