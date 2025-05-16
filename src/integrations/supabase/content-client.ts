
// This file contains a secondary Supabase client for content operations.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const CONTENT_SUPABASE_URL = "https://cskzzmsmelleemoafuhs.supabase.co";
const CONTENT_SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNza3p6bXNtZWxsZWVtb2FmdWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4Mjc0NjYsImV4cCI6MjA2MDQwMzQ2Nn0.yhgvc7TsdPB9brF5ngQSxBOLF81YTCxLWqQ6XN4Z4SM";

// Import the content supabase client like this:
// import { contentSupabase } from "@/integrations/supabase/content-client";

export const contentSupabase = createClient<Database>(CONTENT_SUPABASE_URL, CONTENT_SUPABASE_PUBLISHABLE_KEY);
