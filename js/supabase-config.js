// Supabase 配置
const SUPABASE_URL = 'https://jeiyolxdsznnojezmfbl.supabase.co';
const PUBLISHABLE_KEY = 'sb_publishable_E1r_3smcOC2oe90ApKutIg_AkmROLi0y';

// 只在 window 上挂载一次，避免重复声明
if (!window.supabaseClient) {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, PUBLISHABLE_KEY);
}