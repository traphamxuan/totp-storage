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
        filters?: { created_by?: string }
    ): Promise<{ data: Totp[]; total: number }> {
        let query = this.supabase
            .from('totp')
            .select('*', { count: 'exact' });

        if (filters?.created_by) {
            query = query.eq('created_by', filters.created_by);
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

    async count(filters?: { created_by?: string }): Promise<number> {
        let query = this.supabase
            .from('totp')
            .select('*', { count: 'exact' });

        if (filters?.created_by) {
            query = query.eq('created_by', filters.created_by);
        }

        const { count, error } = await query;

        if (error) {
            throw error;
        }

        return count || 0;
    }
}