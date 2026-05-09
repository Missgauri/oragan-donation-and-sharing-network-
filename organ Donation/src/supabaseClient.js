import { createClient } from '@supabase/supabase-js';

// TODO: Replace the following with your Supabase project configuration.
// You can get this by creating a free project at supabase.com 
// and going to Settings -> API.

const supabaseUrl = 'https://kpzccpvnjjkponxztdvz.supabase.co';
const supabaseKey = 'sb_publishable_wRR77uOVubABJL96rzgz7Q_sy8QqXqq';

export const supabase = createClient(supabaseUrl, supabaseKey);
