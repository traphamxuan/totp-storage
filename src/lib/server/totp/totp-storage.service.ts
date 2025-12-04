import { generate_token } from './pkg'
import { TOTPRepository } from './totp.repository';
import { prisma } from '../providers/prisma';
import { Totp } from '$lib/entities';

// export interface Totp {
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
    constructor(private totpRepo: TOTPRepository) { }

    async addTotp(data: Omit<Totp, 'id' | 'createdAt'>): Promise<Totp> {
        const result = await this.totpRepo.create({
            secret: data.secret,
            metadata: {
                issuer: data.issuer,
                label: data.label,
                type: 'public'
            }
        });
        return new Totp(result);
    }

    async getTotp(id: string): Promise<Totp | null> {
        try {
            const result = await this.totpRepo.getOne(id);
            return new Totp(result);
        } catch (error) {
            console.error('Error getting TOTP entry:', error);
            return null;
        }
    }

    async listTOTPEntries(
        page: number = 1,
        limit: number = 10,
        options?: ListOptions
    ): Promise<{ entries: Totp[]; total: number }> {
        // Note: Filtering and sorting by issuer/label would require storing these in the database
        // For now, we'll just implement pagination
        const result = await this.totpRepo.getMany(page, limit, options);

        const entries: Totp[] = result.data.map(item => new Totp(item));
        return { entries, total: result.total };
    }

    async deleteTotp(id: string): Promise<boolean> {
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
export const totpService = new TotpService(new TOTPRepository(prisma));