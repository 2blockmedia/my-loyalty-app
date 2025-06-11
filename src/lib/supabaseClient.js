import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ohscjjhaitbkgwoksyio.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oc2NqamhhaXRia2d3b2tzeWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4OTQ5NDIsImV4cCI6MjA2NDQ3MDk0Mn0.daevRFiEnPjHjZxw_3I9pVfJDASzxqO7UTa3zTDlXuM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
