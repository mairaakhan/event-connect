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

    // Step 1: Delete past events (events where start_date has passed)
    const now = new Date().toISOString();
    const { error: deleteError, count: deletedCount } = await supabase
      .from('events')
      .delete()
      .eq('source', 'ticketwala')
      .lt('start_date', now);
    
    if (deleteError) {
      console.error('Error deleting past events:', deleteError);
    } else {
      console.log(`Deleted ${deletedCount || 0} past ticketwala events`);
    }

    // Step 2: Fetch ticketwala.pk homepage
    const response = await fetch('https://ticketwala.pk/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await response.text();
    
    console.log('Fetched ticketwala.pk, parsing events...');
    console.log('HTML length:', html.length);
    
    // Parse events from HTML
    const events: any[] = [];
    
    // Try multiple patterns to find event data
    // Pattern 1: Look for event cards with links to /event/
    const eventLinkPattern = /href="(https?:\/\/(?:www\.)?ticketwala\.pk\/event\/([^"]+))"/gi;
    const foundUrls = new Set<string>();
    
    let linkMatch;
    while ((linkMatch = eventLinkPattern.exec(html)) !== null) {
      foundUrls.add(linkMatch[1]);
    }
    
    console.log(`Found ${foundUrls.size} unique event URLs`);
    
    // For each event URL, try to extract more details from the page context
    for (const eventUrl of foundUrls) {
      const externalId = eventUrl.split('/').pop()?.split('?')[0] || '';
      
      if (!externalId) continue;
      
      // Check if event already exists
      const { data: existing } = await supabase
        .from('events')
        .select('id')
        .eq('external_id', externalId)
        .eq('source', 'ticketwala')
        .maybeSingle();
      
      if (existing) {
        console.log(`Event ${externalId} already exists, skipping`);
        continue;
      }
      
      // Try to fetch individual event page for more details
      try {
        console.log(`Fetching event details from: ${eventUrl}`);
        const eventResponse = await fetch(eventUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        const eventHtml = await eventResponse.text();
        
        // Extract event name from title or h1
        let eventName = 'Event from Ticketwala';
        const titleMatch = eventHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) {
          eventName = titleMatch[1].replace(/\s*[-|]\s*Ticketwala.*$/i, '').trim();
        }
        const h1Match = eventHtml.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        if (h1Match && h1Match[1].length > 3) {
          eventName = h1Match[1].trim();
        }
        
        // Extract image
        let image = '';
        const ogImageMatch = eventHtml.match(/property="og:image"[^>]*content="([^"]+)"/i) ||
                            eventHtml.match(/content="([^"]+)"[^>]*property="og:image"/i);
        if (ogImageMatch) {
          image = ogImageMatch[1];
        } else {
          // Try to find any event banner image
          const imgMatch = eventHtml.match(/src="([^"]*(?:banner|event|poster)[^"]*)"/i);
          if (imgMatch) {
            image = imgMatch[1];
          }
        }
        
        // Extract date - look for common date patterns
        let startDate = new Date();
        startDate.setDate(startDate.getDate() + 7); // Default to 7 days from now
        
        const datePatterns = [
          /(\d{1,2})\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{4})/i,
          /(\d{4})-(\d{2})-(\d{2})/,
          /(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i
        ];
        
        for (const pattern of datePatterns) {
          const dateMatch = eventHtml.match(pattern);
          if (dateMatch) {
            const parsedDate = new Date(dateMatch[0]);
            if (!isNaN(parsedDate.getTime()) && parsedDate > new Date()) {
              startDate = parsedDate;
              break;
            }
          }
        }
        
        // Extract city/location
        let city = 'Karachi';
        let venue = 'Venue TBA';
        const cityPatterns = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Multan', 'Faisalabad', 'Quetta'];
        for (const c of cityPatterns) {
          if (eventHtml.includes(c)) {
            city = c;
            break;
          }
        }
        
        // Try to find venue
        const venueMatch = eventHtml.match(/(?:venue|location|place)[:\s]*([^<,]+)/i);
        if (venueMatch) {
          venue = venueMatch[1].trim().substring(0, 100);
        }
        
        // Extract price
        let ticketPrice = 0;
        const priceMatch = eventHtml.match(/(?:Rs\.?|PKR|₨)\s*([\d,]+)/i);
        if (priceMatch) {
          ticketPrice = parseInt(priceMatch[1].replace(/,/g, '')) || 0;
        }
        
        // Determine category based on event name/content
        let category = 'other';
        const categoryKeywords: Record<string, string[]> = {
          'music': ['concert', 'music', 'live', 'performance', 'band', 'singer', 'gig'],
          'festival': ['festival', 'fest', 'mela', 'carnival'],
          'sports': ['match', 'game', 'cricket', 'football', 'sports', 'tournament'],
          'comedy': ['comedy', 'standup', 'stand-up', 'laugh'],
          'technology': ['tech', 'hackathon', 'conference', 'workshop', 'seminar'],
          'food': ['food', 'culinary', 'cooking', 'chef', 'taste']
        };
        
        const lowerContent = (eventName + ' ' + eventHtml.substring(0, 5000)).toLowerCase();
        for (const [cat, keywords] of Object.entries(categoryKeywords)) {
          if (keywords.some(kw => lowerContent.includes(kw))) {
            category = cat;
            break;
          }
        }
        
        // Only add if the event is in the future
        if (startDate > new Date()) {
          events.push({
            name: eventName,
            description: `Event from Ticketwala - ${eventName}`,
            start_date: startDate.toISOString(),
            category: category,
            city: city,
            venue: venue,
            ticket_price: ticketPrice,
            total_tickets: 500,
            sold_tickets: 0,
            tickets_live_from: new Date().toISOString(),
            image: image.startsWith('http') ? image : (image ? `https://ticketwala.pk${image}` : null),
            vendor_name: 'Ticketwala',
            status: 'live',
            source: 'ticketwala',
            external_id: externalId,
          });
          
          console.log(`Parsed event: ${eventName} on ${startDate.toDateString()} in ${city}`);
        } else {
          console.log(`Skipping past event: ${eventName}`);
        }
        
        // Add a small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (eventError) {
        console.error(`Error fetching event ${eventUrl}:`, eventError);
      }
    }
    
    console.log(`Found ${events.length} new upcoming events to add`);
    
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
        message: `Cleaned up past events and added ${events.length} new upcoming events`,
        deletedPastEvents: deletedCount || 0,
        newEvents: events.length
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
