import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sfmoolttsjtjihdpizav.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmbW9vbHR0c2p0amloZHBpemF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3Mzc1OTcsImV4cCI6MjA5NjMxMzU5N30.rTdsveDH5kbrMeGsjotNh6DoDNTOkZMmMnkNjIzLyjI'

export const supabase = createClient(supabaseUrl, supabaseKey)
