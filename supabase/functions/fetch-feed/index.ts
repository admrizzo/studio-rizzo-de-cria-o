import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// This function is a simple CORS proxy - it streams the feed response
// directly to the client without parsing, to avoid memory limits.
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    const feedUrl = url || "https://api.robustcrm.io/feeds/ext-4c6e46e46kjme";

    const res = await fetch(feedUrl);
    if (!res.ok) {
      throw new Error(`Feed HTTP error: ${res.status}`);
    }

    // Stream the response body directly - no parsing in the edge function
    return new Response(res.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
