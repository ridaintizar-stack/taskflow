import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sfmoolttsjtjihdpizav.supabase.co'
const supabaseKey = 'sb_publishable_S_ZHJwFDRQ4E8wJE2bCcvw_dGiRLsNK'

export const supabase = createClient(supabaseUrl, supabaseKey)
