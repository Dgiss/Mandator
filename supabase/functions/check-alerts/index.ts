
import { serve } from 'https://deno.land/std@0.188.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Configuration des en-têtes CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Créer un client Supabase authentifié avec le rôle de service
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction principale qui sera exécutée par le cron job
async function checkAllAlerts() {
  console.log('Début de la vérification des alertes...');

  try {
    // 1. Vérifier les versions non diffusées
    const { data: versionsData, error: versionsError } = await supabase.rpc('check_versions_non_diffusees');
    if (versionsError) {
      throw versionsError;
    }
    console.log(`${versionsData?.length || 0} notifications générées pour les versions non diffusées`);

    // 2. Vérifier les visas en attente
    const { data: visasData, error: visasError } = await supabase.rpc('check_visas_en_attente');
    if (visasError) {
      throw visasError;
    }
    console.log(`${visasData?.length || 0} notifications générées pour les visas en attente`);

    return {
      success: true,
      notificationsCount: {
        versions: versionsData?.length || 0,
        visas: visasData?.length || 0,
        total: (versionsData?.length || 0) + (visasData?.length || 0)
      },
      message: 'Vérification des alertes terminée avec succès'
    };
  } catch (error) {
    console.error('Erreur lors de la vérification des alertes:', error);
    return {
      success: false,
      error: error.message || 'Une erreur inconnue est survenue',
      message: 'Échec de la vérification des alertes'
    };
  }
}

// Gestionnaire de requête HTTP
serve(async (req) => {
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Vérifier si la requête contient un token d'authentification valide
    // (sauf si elle vient d'un cron job interne)
    const authHeader = req.headers.get('Authorization');
    const isCronJob = req.headers.get('X-Cron-Job') === 'true';
    
    if (!isCronJob && (!authHeader || !authHeader.startsWith('Bearer '))) {
      return new Response(
        JSON.stringify({ error: 'Authentification requise' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isCronJob) {
      // Vérifier le JWT du client (si ce n'est pas un cron job)
      const token = authHeader!.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Token invalide ou expiré' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Exécuter la vérification des alertes
    const result = await checkAllAlerts();
    
    // Renvoyer le résultat
    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur lors du traitement de la requête:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Une erreur inconnue est survenue' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
