
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define question templates for common queries
const questionTemplates = {
  visasEnAttente: "Combien de visas sont en attente sur {marche}?",
  documentsNonDiffuses: "Combien de documents ne sont pas encore diffusés sur {marche}?",
  versionRejetes: "Combien de versions ont été rejetées sur {marche}?",
  fasciculeProgress: "Quel est l'avancement du fascicule {fascicule}?"
};

// Predefined query functions
const predefinedQueries = {
  // Count pending visas overall or for a specific market
  async countPendingVisas(client, marcheId = null) {
    const query = marcheId 
      ? `SELECT COUNT(*) FROM visas WHERE statut = 'En attente' AND marche_id = '${marcheId}'`
      : `SELECT COUNT(*) FROM visas WHERE statut = 'En attente'`;
    
    const { data, error } = await client.rpc('execute_query', { query_text: query });
    if (error) throw error;
    return data[0].count;
  },
  
  // Count documents awaiting distribution
  async countUndistributedDocuments(client, marcheId = null) {
    const query = marcheId
      ? `SELECT COUNT(*) FROM documents WHERE statut = 'En attente de diffusion' AND marche_id = '${marcheId}'`
      : `SELECT COUNT(*) FROM documents WHERE statut = 'En attente de diffusion'`;
    
    const { data, error } = await client.rpc('execute_query', { query_text: query });
    if (error) throw error;
    return data[0].count;
  },
  
  // Count rejected versions
  async countRejectedVersions(client, marcheId = null) {
    const query = marcheId
      ? `SELECT COUNT(*) FROM versions WHERE statut = 'Rejeté' AND marche_id = '${marcheId}'`
      : `SELECT COUNT(*) FROM versions WHERE statut = 'Rejeté'`;
    
    const { data, error } = await client.rpc('execute_query', { query_text: query });
    if (error) throw error;
    return data[0].count;
  },
  
  // Get fascicule progress
  async getFasciculeProgress(client, fasciculeId) {
    if (!fasciculeId) throw new Error("Identifiant du fascicule requis");
    
    const query = `SELECT nom, progression FROM fascicules WHERE id = '${fasciculeId}'`;
    const { data, error } = await client.rpc('execute_query', { query_text: query });
    if (error) throw error;
    return data[0];
  },
  
  // Get market summary
  async getMarcheSummary(client, marcheId) {
    if (!marcheId) throw new Error("Identifiant du marché requis");
    
    const query = `
      SELECT 
        m.titre,
        (SELECT COUNT(*) FROM documents d WHERE d.marche_id = '${marcheId}') AS total_documents,
        (SELECT COUNT(*) FROM visas v WHERE v.marche_id = '${marcheId}' AND v.statut = 'En attente') AS visas_en_attente,
        (SELECT COUNT(*) FROM documents d WHERE d.marche_id = '${marcheId}' AND d.statut = 'En attente de diffusion') AS documents_a_diffuser,
        (SELECT COUNT(*) FROM versions v WHERE v.marche_id = '${marcheId}' AND v.statut = 'Rejeté') AS versions_rejetees
      FROM marches m
      WHERE m.id = '${marcheId}'
    `;
    
    const { data, error } = await client.rpc('execute_query', { query_text: query });
    if (error) throw error;
    return data[0];
  }
};

// Process the user's query
async function processQuery(query, client, userId) {
  try {
    // Get the OpenAI API key from environment
    const openAiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiApiKey) {
      throw new Error("OPENAI_API_KEY is not set in environment variables");
    }
    
    // Check user access rights
    const { data: userRole, error: roleError } = await client.rpc('get_user_global_role');
    if (roleError) throw roleError;
    
    // Extract market ID from the query if present
    let marcheId = null;
    let fasciculeId = null;
    
    if (query.toLowerCase().includes('marché') || query.toLowerCase().includes('marche')) {
      // First, try to process with OpenAI to extract market ID or name
      const systemPrompt = `
        Tu es un assistant qui extrait des informations de requêtes en langage naturel.
        Identifie les marchés, fascicules ou documents mentionnés dans la requête.
        Si un ID spécifique est mentionné, extrais-le.
        Réponds uniquement avec un JSON au format: {"marcheId": "id-ou-null", "fasciculeId": "id-ou-null", "documentId": "id-ou-null", "intent": "intention-identifiee"}
      `;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: query }
          ],
          temperature: 0.3
        })
      });

      const result = await response.json();
      if (result.choices && result.choices.length > 0) {
        try {
          const parsedContent = JSON.parse(result.choices[0].message.content);
          marcheId = parsedContent.marcheId;
          fasciculeId = parsedContent.fasciculeId;
        } catch (e) {
          console.error("Failed to parse OpenAI response as JSON:", e);
        }
      }
    }
    
    // Process the query based on intent
    if (query.toLowerCase().includes('visa') && query.toLowerCase().includes('attente')) {
      const count = await predefinedQueries.countPendingVisas(client, marcheId);
      return {
        response: `Il y a actuellement ${count} visa${count > 1 ? 's' : ''} en attente${marcheId ? ' pour ce marché' : ''}`,
        data: { count },
        queryType: 'visas'
      };
    } 
    else if (query.toLowerCase().includes('document') && 
            (query.toLowerCase().includes('diffus') || query.toLowerCase().includes('attente'))) {
      const count = await predefinedQueries.countUndistributedDocuments(client, marcheId);
      return {
        response: `Il y a actuellement ${count} document${count > 1 ? 's' : ''} en attente de diffusion${marcheId ? ' pour ce marché' : ''}`,
        data: { count },
        queryType: 'documents'
      };
    } 
    else if (query.toLowerCase().includes('version') && 
            (query.toLowerCase().includes('rejet') || query.toLowerCase().includes('refus'))) {
      const count = await predefinedQueries.countRejectedVersions(client, marcheId);
      return {
        response: `Il y a actuellement ${count} version${count > 1 ? 's' : ''} rejetée${count > 1 ? 's' : ''}${marcheId ? ' pour ce marché' : ''}`,
        data: { count },
        queryType: 'versions'
      };
    }
    else if (fasciculeId && query.toLowerCase().includes('fascicule') && 
            (query.toLowerCase().includes('progress') || query.toLowerCase().includes('avancement'))) {
      const fascicule = await predefinedQueries.getFasciculeProgress(client, fasciculeId);
      return {
        response: `Le fascicule ${fascicule.nom} a un avancement de ${fascicule.progression}%`,
        data: fascicule,
        queryType: 'fascicule'
      };
    }
    else if (marcheId && query.toLowerCase().includes('résumé') || query.toLowerCase().includes('synthèse')) {
      const summary = await predefinedQueries.getMarcheSummary(client, marcheId);
      return {
        response: `Résumé du marché ${summary.titre}: ${summary.total_documents} documents au total, ${summary.visas_en_attente} visas en attente, ${summary.documents_a_diffuser} documents à diffuser, ${summary.versions_rejetees} versions rejetées`,
        data: summary,
        queryType: 'summary'
      };
    }
    
    // If the query doesn't match any predefined patterns, use OpenAI to generate a response
    const systemPrompt = `
      Tu es un assistant spécialisé dans le domaine de la gestion documentaire pour les marchés publics.
      Tu connais bien les concepts de documents, versions, visas, diffusion, approbation.
      Réponds de manière précise et concise, en français.
      Si tu ne connais pas la réponse exacte à une question, indique que tu n'as pas accès à cette information spécifique 
      mais propose des alternatives pour l'obtenir (comme consulter la page des visas ou des documents).
    `;
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query }
        ],
        temperature: 0.7
      })
    });
    
    const result = await response.json();
    return {
      response: result.choices[0].message.content,
      queryType: 'general'
    };
    
  } catch (error) {
    console.error("Error processing query:", error);
    return {
      response: `Désolé, je n'ai pas pu traiter votre demande: ${error.message}`,
      error: error.message
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { query, supabaseClient } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: "Une question est requise" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const userId = supabaseClient.auth.user()?.id;
    const result = await processQuery(query, supabaseClient, userId);
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error("Error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
