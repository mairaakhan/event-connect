import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting ticketwala scrape...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch ticketwala.pk homepage
    const response = await fetch('https://ticketwala.pk/');
    const html = await response.text();
    
    console.log('Fetched ticketwala.pk, parsing events...');
    
    // Parse events from HTML using regex patterns
    const events: any[] = [];
    
    // Match event cards - looking for event links and images
    const eventPattern = /<a[^>]*href="(https:\/\/ticketwala\.pk\/event\/[^"]+)"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[^>]*>[\s\S]*?<h[23][^>]*>([^<]+)<\/h[23]>/gi;
    
    let match;
    while ((match = eventPattern.exec(html)) !== null) {
      const [_, url, image, name] = match;
      
      // Generate a unique external ID from the URL
      const externalId = url.split('/').pop() || '';
      
      // Check if event already exists
      const { data: existing } = await supabase
        .from('events')
        .select('id')
        .eq('external_id', externalId)
        .eq('source', 'ticketwala')
        .maybeSingle();
      
      if (!existing) {
        events.push({
          name: name.trim(),
          description: `Event scraped from ticketwala.pk`,
          start_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random future date
          category: 'music',
          city: 'Karachi',
          venue: 'TBA',
          ticket_price: 1000,
          total_tickets: 500,
          sold_tickets: 0,
          tickets_live_from: new Date().toISOString(),
          image: image.startsWith('http') ? image : `https://ticketwala.pk${image}`,
          vendor_name: 'Ticketwala',
          status: 'live',
          source: 'ticketwala',
          external_id: externalId,
        });
      }
    }
    
    console.log(`Found ${events.length} new events to add`);
    
    if (events.length > 0) {
      const { error } = await supabase.from('events').insert(events);
      if (error) {
        console.error('Error inserting events:', error);
        throw error;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Scraped and added ${events.length} new events` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: unknown) {
    console.error('Scrape error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
