import { supabase } from './src/lib/supabaseClient'; (async () => { const { data, error } = await supabase.from('playlists').select('*').limit(1); console.log(data, error); })();
