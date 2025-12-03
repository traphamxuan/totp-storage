import { generate_token } from '@totp-store/totp-rs-bundler'

export interface TOTPEntry {
    id: string;
    secret: string;
    issuer: string;
    label: string;
    type?: 'public' | 'challenge';
    challengeKey?: string;
    createdAt: string;
}

export interface TOTPOptions {
    issuer?: string;
    label?: string;
    type?: 'public' | 'challenge';
    challengeKey?: string;
}

export interface ListOptions {
    search?: string;
    sortBy?: 'issuer' | 'label' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}

export class TotpService {
    private totpKeys: Map<string, TOTPEntry> = new Map();

    addTOTPEntry(secret: string, options?: TOTPOptions): string {
        const id = Math.random().toString(36).substring(2, 15);
        this.totpKeys.set(id, {
            id,
            secret,
            issuer: options?.issuer || 'TOTP Store',
            label: options?.label || `Account ${id}`,
            type: options?.type || 'public',
            challengeKey: options?.challengeKey || '',
            createdAt: new Date().toISOString()
        });
        return id;
    }

    getTOTPEntry(id: string): TOTPEntry | undefined {
        return this.totpKeys.get(id);
    }

    listTOTPEntries(
        page: number = 1,
        limit: number = 100,
        options?: ListOptions
    ): { entries: TOTPEntry[]; total: number } {
        // Get all entries as array
        let entries = Array.from(this.totpKeys.values());
        let total = entries.length;

        // Apply search filter if provided
        if (options?.search) {
            const searchLower = options.search.toLowerCase();
            entries = entries.filter(entry =>
                entry.issuer.toLowerCase().includes(searchLower) ||
                entry.label.toLowerCase().includes(searchLower)
            );
            // Update total to reflect filtered results
            total = entries.length;
        }

        // Apply sorting if provided
        if (options?.sortBy) {
            entries.sort((a, b) => {
                let comparison = 0;

                switch (options.sortBy) {
                    case 'issuer':
                        comparison = a.issuer.localeCompare(b.issuer);
                        break;
                    case 'label':
                        comparison = a.label.localeCompare(b.label);
                        break;
                    case 'createdAt':
                        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                        break;
                }

                return options.sortOrder === 'desc' ? -comparison : comparison;
            });
        } else {
            // Default sort by createdAt descending (newest first)
            entries.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        }

        // Apply pagination
        const startIndex = (page - 1) * limit;
        const paginatedEntries = entries.slice(startIndex, startIndex + limit);

        return { entries: paginatedEntries, total };
    }

    deleteTOTPEntry(id: string): boolean {
        return this.totpKeys.delete(id);
    }

    getSize(): number {
        return this.totpKeys.size;
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
}

// Export a singleton instance for backward compatibility
export const totpService = new TotpService();