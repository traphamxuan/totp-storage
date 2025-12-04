import { generate_token } from './pkg'
import { TOTPRepository } from './totp.repository';
import { supabase } from '../supabase';

// export interface TOTPEntry {
//     id: string;
//     secret: string;
//     issuer: string;
//     label: string;
//     type?: 'public' | 'challenge';
//     challengeKey?: string;
//     createdAt: string;
// }

// export interface TOTPOptions {
//     issuer?: string;
//     label?: string;
//     type?: 'public' | 'challenge';
//     challengeKey?: string;
// }

export interface ListOptions {
    search?: string;
    sortBy?: 'issuer' | 'label' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}

export class TotpService {
    constructor(private totpRepo: TOTPRepository) {}

    async addTOTPEntry(data: Omit<TOTPEntry, 'id' | 'createdAt'>): Promise<TOTPEntry> {
        const result = await this.totpRepo.create({
            secret: data.secret,
            metadata: {
                issuer: data.issuer,
                label: data.label,
                type: 'public'
            }
        });
        return {
            id: result.id,
            secret: result.secret,
            issuer: result.metadata?.issuer || 'TOTP Store',
            label: result.metadata?.label || `Account ${result.id}`,
            type: result.metadata?.type || 'public',
            challengeKey: result.metadata?.challengeKey,
            createdAt: result.created_at || ''
        } satisfies TOTPEntry;
    }

    async getTOTPEntry(id: string): Promise<TOTPEntry | null> {
        try {
            const result = await this.totpRepo.getOne(id);
            return {
                id: result.id,
                secret: result.secret,
                issuer: result.metadata?.issuer || 'TOTP Store',
                label: result.metadata?.label || `Account ${result.id}`,
                type: result.metadata?.type || 'public',
                challengeKey: result.metadata?.challengeKey,
                createdAt: result.created_at || ''
            };
        } catch (error) {
            console.error('Error getting TOTP entry:', error);
            return null;
        }
    }

    async listTOTPEntries(
        page: number = 1,
        limit: number = 10,
        options?: ListOptions
    ): Promise<{ entries: TOTPEntry[]; total: number }> {
        // Note: Filtering and sorting by issuer/label would require storing these in the database
        // For now, we'll just implement pagination
        const result = await this.totpRepo.getMany(page, limit, options);

        const entries: TOTPEntry[] = result.data.map(item => ({
            id: item.id,
            secret: item.secret,
            issuer: item.metadata?.issuer || 'TOTP Store',
            label: item.metadata?.label || `Account ${item.id}`,
            type: item.metadata?.type || 'public',
            createdAt: item.created_at || ''
        }));
        return { entries, total: result.total };
    }

    async deleteTOTPEntry(id: string): Promise<boolean> {
        return await this.totpRepo.delete(id);
    }

    async getSize(search?: string): Promise<number> {
        return await this.totpRepo.count({ search });
    }

    generateToken(secret: string): { token: string; expiresIn: number; generatedAt: Date } {
        const token = generate_token(secret);
        const expiresIn = 30 - (Math.floor(Date.now() / 1000) % 30); // TOTP tokens expire every 30 seconds

        return {
            token,
            expiresIn,
            generatedAt: new Date()
        };
    }

    // Add method to update the used_at field for entries
    async updateUsedAt(ids: string[]): Promise<boolean> {
        try {
            return await this.totpRepo.updateUsedAt(ids);
        } catch (error) {
            console.error('Error updating used_at field:', error);
            return false;
        }
    }
}

// Export a singleton instance for backward compatibility
// Note: This would need to be initialized with a repository instance
export const totpService = new TotpService(new TOTPRepository(supabase));