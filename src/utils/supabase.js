import { createClient } from '@supabase/supabase-js';

// TODO: ユーザーから提供された実際のURLとキーに置き換える
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://rrpnxduecjhyampvqhlu.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJycG54ZHVlY2poeWFtcHZxaGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjE2OTcsImV4cCI6MjA4ODYzNzY5N30.tBIvcaNRrfsXDSTls_U4MfsMdtPtLr0aRPy7dsCHM0I';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}
