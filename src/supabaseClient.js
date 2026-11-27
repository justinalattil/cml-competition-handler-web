import { createClient } from '@supabase/supabase-js';

const getEnv = (key) => {
  try {
    return (import.meta && import.meta.env && import.meta.env[key]) || '';
  } catch {
    return '';
  }
};

export function getSupabaseConfig() {
  const url = getEnv('VITE_SUPABASE_URL') || localStorage.getItem('cml_supabase_url') || '';
  const anonKey = getEnv('VITE_SUPABASE_ANON_KEY') || localStorage.getItem('cml_supabase_key') || '';
  return { url: url.trim(), anonKey: anonKey.trim() };
}

export function getSupabaseClient() {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) return null;
  return createClient(url, anonKey);
}

export async function loadDbFromSupabase() {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client
    .from('cml_store')
    .select('data')
    .eq('id', 'main')
    .maybeSingle();
  if (error) throw error;
  return data ? data.data : null;
}

export async function saveDbToSupabase(dbPayload) {
  const client = getSupabaseClient();
  if (!client) return false;
  const { error } = await client
    .from('cml_store')
    .upsert(
      { id: 'main', data: dbPayload, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    );
  if (error) throw error;
  return true;
}
