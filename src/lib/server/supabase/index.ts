import { createClient } from '@supabase/supabase-js';
import { privateConfig } from '$lib/server/configs';

export const supabase = createClient(privateConfig.supabase.url, privateConfig.supabase.serviceRoleKey);