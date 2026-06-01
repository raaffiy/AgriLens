const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase;

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_url') {
    console.error('CRITICAL WARNING: SUPABASE_URL atau SUPABASE_KEY belum diisi di .env! Server akan tetap berjalan namun fitur database tidak berfungsi.');
    // Inisialisasi dummy agar server tidak crash saat boot
    supabase = {
        from: () => ({
            select: () => ({ order: () => Promise.resolve({ data: [], error: null }), eq: () => ({ order: () => Promise.resolve({ data: [], error: null }), single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }) }) }),
            insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }) }) }),
            update: () => ({ eq: () => Promise.resolve({ error: { message: 'Supabase not configured' } }) }),
            delete: () => ({ eq: () => Promise.resolve({ error: { message: 'Supabase not configured' } }) })
        }),
        storage: {
            from: () => ({
                upload: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
                getPublicUrl: () => ({ data: { publicUrl: '' } }),
                remove: () => Promise.resolve({ error: { message: 'Supabase not configured' } })
            })
        }
    };
} else {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Inisialisasi Supabase Client berhasil!');
}

module.exports = supabase;
