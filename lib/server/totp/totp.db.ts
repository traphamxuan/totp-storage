// import type { PrismaClient } from '$lib/server/generated/prisma/client'
// import type { public_totp } from '$lib/server/generated/prisma/client';
// import type { public_totpCreateInput, public_totpOrderByWithAggregationInput, public_totpWhereInput, public_totpWhereUniqueInput } from '../generated/prisma/models';

// export class TOTPRepository implements TotpInterface {
//     constructor(private prisma: PrismaClient) {
//     }

//     async create(totp: public_totpCreateInput): Promise<public_totp> {
//         try {
//             return await this.prisma.public_totp.create({
//                 data: {
//                     secret: totp.secret,
//                     metadata: totp.metadata,
//                 }
//             });
//         } catch (error: unknown) {
//             // Handle unique constraint violation for secret field
//             // We need to check the error code since we can't import Prisma types directly
//             if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
//                 throw new Error('A TOTP entry with this secret already exists');
//             }
//             throw error;
//         }
//     }

//     async getMany(
//         page: number = 1,
//         limit: number = 10,
//         options?: {
//             search?: string;
//             sortBy?: 'issuer' | 'label' | 'createdAt';
//             sortOrder?: 'asc' | 'desc';
//             created_by?: string
//         }
//     ): Promise<{ data: public_totp[]; total: number }> {
//         // Build where clause
//         const where: public_totpWhereInput = {};
//         if (options?.search) {
//             const lowerSearch = options.search.toLowerCase();
//             where.OR = [
//                 {
//                     metadata: {
//                         path: ['issuer'],
//                         string_contains: lowerSearch,
//                         mode: 'insensitive'
//                     }
//                 },
//                 {
//                     metadata: {
//                         path: ['label'],
//                         string_contains: lowerSearch,
//                         mode: 'insensitive'
//                     }
//                 }
//             ];
//         }

//         // Build orderBy clause
//         let orderBy: public_totpOrderByWithAggregationInput | public_totpOrderByWithAggregationInput[] = [];
//         if (options?.sortBy && options?.sortOrder) {
//             switch (options.sortBy) {
//                 case 'issuer':
//                 case 'label':
//                     // For JSON fields, we'll sort by created_at as a fallback since complex JSON sorting is not supported
//                     orderBy = { created_at: options.sortOrder };
//                     break;
//                 case 'createdAt':
//                     orderBy = { created_at: options.sortOrder };
//                     break;
//                 default:
//                     orderBy = { created_at: 'desc' };
//             }
//         } else {
//             // Default sorting by used_at descending, then by created_at descending
//             orderBy = [{ used_at: 'desc' }, { created_at: 'desc' }];
//         }

//         // Apply pagination
//         const skip = (page - 1) * limit;
//         const take = limit;

//         const [data, count] = await this.prisma.$transaction([
//             this.prisma.public_totp.findMany({
//                 where,
//                 orderBy,
//                 skip,
//                 take
//             }),
//             this.prisma.public_totp.count({
//                 where
//             })
//         ]);

//         return {
//             data,
//             total: count
//         };
//     }

//     async getOne(id: string): Promise<public_totp> {
//         return this.prisma.public_totp.findFirstOrThrow({
//             where: { id } as public_totpWhereUniqueInput
//         });
//     }

//     async delete(id: string): Promise<boolean> {
//         await this.prisma.public_totp.delete({
//             where: { id } as public_totpWhereUniqueInput,
//         });
//         return true;
//     }

//     async count(options?: {
//         search?: string;
//         created_by?: string
//     }): Promise<number> {
//         const where: public_totpWhereInput = {};
//         if (options?.search) {
//             const lowerSearch = options.search.toLowerCase();
//             where.OR = [
//                 {
//                     metadata: {
//                         path: ['issuer'],
//                         string_contains: lowerSearch
//                     }
//                 },
//                 {
//                     metadata: {
//                         path: ['label'],
//                         string_contains: lowerSearch
//                     }
//                 }
//             ];
//         }

//         const count = await this.prisma.public_totp.count({
//             where
//         });

//         return count;
//     }

//     // Add method to update the used_at field for one or more entries
//     async updateUsedAt(ids: string[]): Promise<boolean> {
//         await this.prisma.public_totp.updateMany({
//             where: {
//                 id: {
//                     in: ids
//                 }
//             },
//             data: {
//                 used_at: new Date()
//             }
//         });
//         return true;
//     }
// }