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
    console.log('Starting daily event cleanup...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date().toISOString();
    
    // Delete past events from all sources (ticketwala, mock, and manual without vendor_id)
    // We keep vendor events for their analytics
    const { error: deleteTicketwalaError, count: deletedTicketwala } = await supabase
      .from('events')
      .delete()
      .eq('source', 'ticketwala')
      .lt('start_date', now);
    
    if (deleteTicketwalaError) {
      console.error('Error deleting past ticketwala events:', deleteTicketwalaError);
    } else {
      console.log(`Deleted ${deletedTicketwala || 0} past ticketwala events`);
    }

    // Delete past mock events
    const { error: deleteMockError, count: deletedMock } = await supabase
      .from('events')
      .delete()
      .eq('source', 'mock')
      .lt('start_date', now);
    
    if (deleteMockError) {
      console.error('Error deleting past mock events:', deleteMockError);
    } else {
      console.log(`Deleted ${deletedMock || 0} past mock events`);
    }
    
    // Delete old past events (more than 30 days old) from manual source without vendor_id
    // These are test events that should be cleaned up
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { error: deleteManualError, count: deletedManual } = await supabase
      .from('events')
      .delete()
      .eq('source', 'manual')
      .is('vendor_id', null)
      .lt('start_date', thirtyDaysAgo.toISOString());
    
    if (deleteManualError) {
      console.error('Error deleting old manual events:', deleteManualError);
    } else {
      console.log(`Deleted ${deletedManual || 0} old manual events without vendor`);
    }

    const totalDeleted = (deletedTicketwala || 0) + (deletedMock || 0) + (deletedManual || 0);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Cleaned up ${totalDeleted} past events`,
        deletedTicketwala: deletedTicketwala || 0,
        deletedMock: deletedMock || 0,
        deletedManual: deletedManual || 0,
        totalDeleted
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: unknown) {
    console.error('Cleanup error:', error);
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
