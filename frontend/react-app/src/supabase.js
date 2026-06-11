import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  "https://uisznpqqxwtkifehweos.supabase.co";

const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpc3pucHFxeHd0a2lmZWh3ZW9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MjUzNzAsImV4cCI6MjA5MzIwMTM3MH0.epKDlyXwY8z7wy39UJ7VMdyC0PsApzLSQbTQpAkSmVY";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);