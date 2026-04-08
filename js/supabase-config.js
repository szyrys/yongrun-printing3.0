// Supabase 配置
const SUPABASE_URL = 'https://jeiyolxdsznnojezmfbl.supabase.coo';
const PUBLISHABLE_KEY = 'sb_publishable_E1r_3smcOC2oe90ApKutIg_AkmROLi0y';

// 检查是否已经存在 supabase 变量，避免重复声明
if (typeof window.supabaseClient === 'undefined') {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, PUBLISHABLE_KEY);
}
const supabase = window.supabaseClient;