import { NextResponse } from 'next/server';
import { TotpManager } from '@/lib/server/totp/totp.manager';
import { TotpSupabase } from '@/lib/server/totp/totp.supabase';
import { createClient } from '@/lib/supabase/server';

// // Helper function to list TOTP entries
// async function listTOTPEntries(
//   page: number = 1,
//   limit: number = 10,
//   options?: {
//     search?: string;
//     sortBy?: 'issuer' | 'label' | 'createdAt';
//     sortOrder?: 'asc' | 'desc';
//   }
// ) {
//   let filteredEntries = [...totpEntries];

//   // Apply search filter
//   if (options?.search) {
//     const searchLower = options.search.toLowerCase();
//     filteredEntries = filteredEntries.filter(entry =>
//       entry.metadata.issuer.toLowerCase().includes(searchLower) ||
//       entry.metadata.label.toLowerCase().includes(searchLower)
//     );
//   }

//   // Apply sorting
//   if (options?.sortBy) {
//     filteredEntries.sort((a, b) => {
//       let aValue, bValue;

//       switch (options.sortBy) {
//         case 'issuer':
//           aValue = a.metadata.issuer.toLowerCase();
//           bValue = b.metadata.issuer.toLowerCase();
//           break;
//         case 'label':
//           aValue = a.metadata.label.toLowerCase();
//           bValue = b.metadata.label.toLowerCase();
//           break;
//         case 'createdAt':
//           aValue = a.created_at;
//           bValue = b.created_at;
//           break;
//         default:
//           aValue = a.created_at;
//           bValue = b.created_at;
//       }

//       const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
//       return options.sortOrder === 'desc' ? -comparison : comparison;
//     });
//   } else {
//     // Default sort by createdAt descending
//     filteredEntries.sort((a, b) => 
//       new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//     );
//   }

//   // Apply pagination
//   const startIndex = (page - 1) * limit;
//   const paginatedEntries = filteredEntries.slice(startIndex, startIndex + limit);

//   // Return entries without secrets for security
//   const entries = paginatedEntries.map(entry => ({
//     id: entry.id,
//     issuer: entry.metadata.issuer,
//     label: entry.metadata.label,
//     type: entry.metadata.type,
//     challengeKey: entry.metadata.challengeKey,
//     createdAt: entry.created_at
//   }));

//   return {
//     entries,
//     total: filteredEntries.length
//   };
// }

// // Helper function to add a TOTP entry
// async function addTotp(payload: {
//   secret?: string;
//   issuer: string;
//   label: string;
//   type: 'public' | 'challenge';
//   challengeKey?: string;
// }) {
//   // Generate secret if not provided
//   const secret = payload.secret || generate_secret();

//   // Check for duplicate secrets
//   const existingEntry = totpEntries.find(entry => entry.secret === secret);
//   if (existingEntry) {
//     throw new Error('A TOTP entry with this secret already exists');
//   }

//   // Generate QR code
//   const qrCodeUrl = generate_totp_uri(secret, payload.label, payload.issuer);
//   const qrCodeDataUrl = await generate_qr_code_base64(qrCodeUrl);

//   // Create new entry
//   const newEntry: TotpEntry = {
//     id: generateId(),
//     secret,
//     metadata: {
//       issuer: payload.issuer,
//       label: payload.label,
//       type: payload.type,
//       challengeKey: payload.challengeKey
//     },
//     created_at: new Date().toISOString()
//   };

//   // Add to storage
//   totpEntries.push(newEntry);

//   return {
//     secret,
//     issuer: payload.issuer,
//     label: payload.label,
//     qrCodeDataUrl
//   };
// }

// // Helper function to update used_at field
// async function updateUsedAt(ids: string[]) {
//   const now = new Date().toISOString();
//   let updatedCount = 0;

//   for (const id of ids) {
//     const entry = totpEntries.find(e => e.id === id);
//     if (entry) {
//       entry.used_at = now;
//       updatedCount++;
//     }
//   }

//   return updatedCount > 0;
// }

// // Add Turnstile validation function
// async function validateTurnstileToken(turnstileToken: string, ip: string): Promise<boolean> {
//   const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY;

//   if (!turnstileSecretKey) {
//     console.error('TURNSTILE_SECRET_KEY is not configured');
//     return false;
//   }

//   try {
//     const response = await axios.post(
//       'https://challenges.cloudflare.com/turnstile/v0/siteverify',
//       `secret=${encodeURIComponent(turnstileSecretKey)}&response=${encodeURIComponent(turnstileToken)}&remoteip=${encodeURIComponent(ip)}`,
//       {
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//         },
//       }
//     );
//     return response.data.success === true;
//   } catch (error) {
//     console.error('Error validating Turnstile token:', error);
//     return false;
//   }
// }

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const manager = new TotpManager(
      new TotpSupabase(supabase)
    )

    // Standard behavior - return entries without secrets
    const result = await manager.listTotp(new URL(request.url).searchParams);
    return NextResponse.json({
      success: true,
      data: {
        entries: result.entries,
        total: result.total
      }
    });
  } catch (error) {
    console.error('Error in GET /api/totp:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to list TOTP entries'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const manager = new TotpManager(
    new TotpSupabase(supabase)
  );
  try {
    const payload: CreateTotpPayload = await request.json();

    // Extract Turnstile token from request headers
    const turnstileToken = request.headers.get('x-turnstile-token') || '';
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIP = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    const totp = await manager.createTotp(payload, turnstileToken, clientIP)

    return NextResponse.json({
      success: true,
      data: totp
    });
  } catch (error: unknown) {
    console.error('Error in POST /api/totp:', error);

    // Handle specific error messages
    if (error instanceof Error) {
      // Check if it's a duplicate secret error
      if (error.message === 'A TOTP entry with this secret already exists') {
        return NextResponse.json({
          success: false,
          error: 'This TOTP secret already exists in the database'
        }, { status: 409 }); // Conflict status code
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to add TOTP entry'
    }, { status: 500 });
  }
}

// Add PATCH endpoint to update used_at field
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const manager = new TotpManager(
    new TotpSupabase(supabase)
  );
  try {
    const { ids } = await request.json();

    // Validate input
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing or invalid IDs array'
      }, { status: 400 });
    }

    // Update used_at field for the specified entries
    await manager.markTotp(ids);

    return NextResponse.json({
      success: true,
      message: `Successfully updated used_at field for ${ids.length} entries`
    });
  } catch (error) {
    console.error('Error updating used_at field:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update used_at field'
    }, { status: 500 });
  }
}