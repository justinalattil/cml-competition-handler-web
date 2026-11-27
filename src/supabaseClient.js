const DEFAULT_URL = 'https://iaubmoabxhxmwfzhuklm.supabase.co';
const DEFAULT_KEY = 'sb_publishable_sl02alBQVO9Ayb76q6jk-A_zmGdECPt';

const getEnv = (key) => {
  try {
    return (import.meta && import.meta.env && import.meta.env[key]) || '';
  } catch {
    return '';
  }
};

export function getSupabaseConfig() {
  const url = (localStorage.getItem('cml_supabase_url') || getEnv('VITE_SUPABASE_URL') || DEFAULT_URL).replace(/\/+$/, '');
  const anonKey = localStorage.getItem('cml_supabase_key') || getEnv('VITE_SUPABASE_ANON_KEY') || DEFAULT_KEY;
  return { url: url.trim(), anonKey: anonKey.trim() };
}

function buildHeaders(anonKey, extra = {}) {
  const headers = {
    apikey: anonKey,
    'Content-Type': 'application/json',
    ...extra
  };
  // Legacy JWT anon keys (eyJ...) also use Bearer Authorization; sb_publishable_ keys only need apikey
  if (anonKey.startsWith('eyJ')) {
    headers.Authorization = `Bearer ${anonKey}`;
  }
  return headers;
}

export async function loadDbFromSupabase() {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) return null;

  const res = await fetch(`${url}/rest/v1/cml_store?id=eq.main&select=data`, {
    method: 'GET',
    headers: buildHeaders(anonKey)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Supabase load failed (${res.status}): ${errText}`);
  }

  const rows = await res.json();
  if (Array.isArray(rows) && rows.length > 0 && rows[0].data) {
    return rows[0].data;
  }
  return null;
}

export async function saveDbToSupabase(dbPayload) {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) return false;

  const res = await fetch(`${url}/rest/v1/cml_store?on_conflict=id`, {
    method: 'POST',
    headers: buildHeaders(anonKey, {
      Prefer: 'resolution=merge-duplicates,return=minimal'
    }),
    body: JSON.stringify({
      id: 'main',
      data: dbPayload,
      updated_at: new Date().toISOString()
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Supabase save failed (${res.status}): ${errText}`);
  }
  return true;
}
