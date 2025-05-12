
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

// Create a Supabase client
const createSupabaseClient = (req) => {
  const authHeader = req.headers.get('Authorization');
  const apiKey = req.headers.get('apikey') || '';
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || apiKey;
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader || '',
      },
    },
  });
};

// Predefined query functions
const predefinedQueries = {
  // Count pending visas overall or for a specific market
  async countPendingVisas(client, marcheId = null) {
    const query = client.from('visas')
      .select('*', { count: 'exact' })
      .eq('statut', 'En attente');
      
    if (marcheId) {
      query.eq('marche_id', marcheId);
    }
    
    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  },
  
  // Count documents awaiting distribution
  async countUndistributedDocuments(client, marcheId = null) {
    const query = client.from('documents')
      .select('*', { count: 'exact' })
      .eq('statut', 'En attente de diffusion');
      
    if (marcheId) {
      query.eq('marche_id', marcheId);
    }
    
    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  },
  
  // Count rejected versions
  async countRejectedVersions(client, marcheId = null) {
    const query = client.from('versions')
      .select('*', { count: 'exact' })
      .eq('statut', 'Refusé');
      
    if (marcheId) {
      query.eq('marche_id', marcheId);
    }
    
    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  },
  
  // Get fascicule progress
  async getFasciculeProgress(client, fasciculeId) {
    if (!fasciculeId) throw new Error("Identifiant du fascicule requis");
    
    const { data, error } = await client
      .from('fascicules')
      .select('nom, progression')
      .eq('id', fasciculeId)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  // Get market summary
  async getMarcheSummary(client, marcheId) {
    if (!marcheId) throw new Error("Identifiant du marché requis");
    
    // Get market details
    const { data: marcheData, error: marcheError } = await client
      .from('marches')
      .select('titre, description')
      .eq('id', marcheId)
      .single();
    
    if (marcheError) throw marcheError;
    
    // Count documents
    const { count: totalDocuments, error: docsError } = await client
      .from('documents')
      .select('*', { count: 'exact' })
      .eq('marche_id', marcheId);
      
    if (docsError) throw docsError;
    
    // Count pending visas
    const visasEnAttente = await predefinedQueries.countPendingVisas(client, marcheId);
    
    // Count documents awaiting distribution
    const documentsADiffuser = await predefinedQueries.countUndistributedDocuments(client, marcheId);
    
    // Count rejected versions
    const versionsRejetees = await predefinedQueries.countRejectedVersions(client, marcheId);
    
    return {
      titre: marcheData.titre,
      description: marcheData.description,
      total_documents: totalDocuments,
      visas_en_attente: visasEnAttente,
      documents_a_diffuser: documentsADiffuser,
      versions_rejetees: versionsRejetees
    };
  },
  
  // Get document status counts overall
  async getDocumentStatusCounts(client, marcheId = null) {
    let query = client.from('documents')
      .select('statut, count(*)')
      .groupBy('statut');
      
    if (marcheId) {
      query.eq('marche_id', marcheId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  
  // Get visa status counts overall
  async getVisaStatusCounts(client, marcheId = null) {
    let query = client.from('visas')
      .select('statut, count(*)')
      .groupBy('statut');
      
    if (marcheId) {
      query.eq('marche_id', marcheId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  
  // Get version status counts overall
  async getVersionStatusCounts(client, marcheId = null) {
    let query = client.from('versions')
      .select('statut, count(*)')
      .groupBy('statut');
      
    if (marcheId) {
      query.eq('marche_id', marcheId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get overall documents stats
  async getOverallDocumentsStats(client, marcheId = null) {
    let query = client.from('documents').select('*', { count: 'exact' });
    
    if (marcheId) {
      query.eq('marche_id', marcheId);
    }
    
    const { count: totalDocuments, error: countError } = await query;
    if (countError) throw countError;
    
    // Count documents pending distribution
    let pendingQuery = client.from('documents')
      .select('*', { count: 'exact' })
      .eq('statut', 'En attente de diffusion');
      
    if (marcheId) {
      pendingQuery.eq('marche_id', marcheId);
    }
    
    const { count: pendingDistribution, error: pendingError } = await pendingQuery;
    if (pendingError) throw pendingError;
    
    // Count approved documents
    let approvedQuery = client.from('documents')
      .select('*', { count: 'exact' })
      .eq('statut', 'Approuvé');
      
    if (marcheId) {
      approvedQuery.eq('marche_id', marcheId);
    }
    
    const { count: approved, error: approvedError } = await approvedQuery;
    if (approvedError) throw approvedError;
    
    return {
      total_documents: totalDocuments,
      pending_distribution: pendingDistribution,
      approved: approved
    };
  },

  // Get overall fascicules progress
  async getOverallFasciculesProgress(client, marcheId = null) {
    let query = client.from('fascicules').select('*', { count: 'exact' });
    let progressionQuery = client.from('fascicules').select('progression');
    
    if (marcheId) {
      query.eq('marche_id', marcheId);
      progressionQuery.eq('marche_id', marcheId);
    }
    
    const { count: totalFascicules, error: countError } = await query;
    if (countError) throw countError;
    
    const { data: progressionData, error: progressionError } = await progressionQuery;
    if (progressionError) throw progressionError;
    
    // Calculate average progression
    let avgProgress = 0;
    if (progressionData && progressionData.length > 0) {
      const sum = progressionData.reduce((acc, item) => acc + (item.progression || 0), 0);
      avgProgress = sum / progressionData.length;
    }
    
    return {
      total_fascicules: totalFascicules,
      avg_progress: avgProgress
    };
  }
};

// Process the user's query using Hugging Face
async function processQuery(query, client, marcheId = null) {
  try {
    console.log(`Processing query: "${query}" for marché ID: ${marcheId || 'None'}`);
    
    // Get the Hugging Face API token from environment
    const hfToken = Deno.env.get("HUGGING_FACE_TOKEN");
    if (!hfToken) {
      throw new Error("HUGGING_FACE_TOKEN is not set in environment variables");
    }
    
    // Simplified pattern matching for common queries
    const lowerQuery = query.toLowerCase();
    
    // Check for visa related queries
    if (lowerQuery.includes('visa') && (lowerQuery.includes('attente') || lowerQuery.includes('non visé') || lowerQuery.includes('en cours'))) {
      const count = await predefinedQueries.countPendingVisas(client, marcheId);
      return {
        response: `Il y a actuellement ${count} visa${count > 1 ? 's' : ''} en attente${marcheId ? ' pour ce marché' : ''}`,
        data: { count },
        queryType: 'visas'
      };
    } 
    // Check for document related queries
    else if (lowerQuery.includes('document') && 
            (lowerQuery.includes('diffus') || lowerQuery.includes('attente') || lowerQuery.includes('non diffusé'))) {
      const count = await predefinedQueries.countUndistributedDocuments(client, marcheId);
      return {
        response: `Il y a actuellement ${count} document${count > 1 ? 's' : ''} en attente de diffusion${marcheId ? ' pour ce marché' : ''}`,
        data: { count },
        queryType: 'documents'
      };
    } 
    // Check for rejected versions queries
    else if (lowerQuery.includes('version') && 
            (lowerQuery.includes('rejet') || lowerQuery.includes('refus'))) {
      const count = await predefinedQueries.countRejectedVersions(client, marcheId);
      return {
        response: `Il y a actuellement ${count} version${count > 1 ? 's' : ''} rejetée${count > 1 ? 's' : ''}${marcheId ? ' pour ce marché' : ''}`,
        data: { count },
        queryType: 'versions'
      };
    }
    // Check for document status distribution queries
    else if (lowerQuery.includes('statut') && lowerQuery.includes('document')) {
      const statusCounts = await predefinedQueries.getDocumentStatusCounts(client, marcheId);
      let response = "Voici la répartition des documents par statut:\n\n";
      
      statusCounts.forEach(item => {
        response += `- ${item.statut}: ${item.count} document${item.count > 1 ? 's' : ''}\n`;
      });
      
      return {
        response,
        data: statusCounts,
        queryType: 'document_status'
      };
    }
    // Check for visa status distribution queries
    else if (lowerQuery.includes('statut') && lowerQuery.includes('visa')) {
      const statusCounts = await predefinedQueries.getVisaStatusCounts(client, marcheId);
      let response = "Voici la répartition des visas par statut:\n\n";
      
      statusCounts.forEach(item => {
        response += `- ${item.statut}: ${item.count} visa${item.count > 1 ? 's' : ''}\n`;
      });
      
      return {
        response,
        data: statusCounts,
        queryType: 'visa_status'
      };
    }
    // Check for version status distribution queries
    else if (lowerQuery.includes('statut') && lowerQuery.includes('version')) {
      const statusCounts = await predefinedQueries.getVersionStatusCounts(client, marcheId);
      let response = "Voici la répartition des versions par statut:\n\n";
      
      statusCounts.forEach(item => {
        response += `- ${item.statut || 'Non défini'}: ${item.count} version${item.count > 1 ? 's' : ''}\n`;
      });
      
      return {
        response,
        data: statusCounts,
        queryType: 'version_status'
      };
    }
    // Check for market summary queries
    else if ((lowerQuery.includes('résumé') || lowerQuery.includes('synthèse')) && 
             (lowerQuery.includes('marché') || lowerQuery.includes('marche'))) {
      try {
        if (marcheId) {
          const summary = await predefinedQueries.getMarcheSummary(client, marcheId);
          return {
            response: `Résumé du marché ${summary.titre}: ${summary.total_documents} documents au total, ${summary.visas_en_attente} visas en attente, ${summary.documents_a_diffuser} documents à diffuser, ${summary.versions_rejetees} versions rejetées`,
            data: summary,
            queryType: 'summary'
          };
        } else {
          // Get overall stats
          const pendingVisas = await predefinedQueries.countPendingVisas(client);
          const undistributedDocs = await predefinedQueries.countUndistributedDocuments(client);
          const rejectedVersions = await predefinedQueries.countRejectedVersions(client);
          const docsStats = await predefinedQueries.getOverallDocumentsStats(client);
          const fasciculesStats = await predefinedQueries.getOverallFasciculesProgress(client);
          
          return {
            response: `Résumé global: 
- ${pendingVisas} visas en attente
- ${undistributedDocs} documents à diffuser
- ${rejectedVersions} versions rejetées
- ${docsStats.total_documents} documents au total
- ${docsStats.approved} documents approuvés
- ${fasciculesStats.total_fascicules} fascicules avec une progression moyenne de ${Math.round(fasciculesStats.avg_progress)}%`,
            data: {
              pendingVisas,
              undistributedDocs,
              rejectedVersions,
              docsStats,
              fasciculesStats
            },
            queryType: 'global_summary'
          };
        }
      } catch (error) {
        console.error("Error getting summary:", error);
        return {
          response: `Désolé, je n'ai pas pu obtenir le résumé demandé: ${error.message}`,
          error: error.message
        };
      }
    }
    
    // If the query doesn't match any predefined patterns, use Hugging Face to generate a response
    const hf = new HfInference(hfToken);
    
    const systemPrompt = `
      Tu es un assistant spécialisé dans le domaine de la gestion documentaire pour les marchés publics.
      Tu connais bien les concepts de documents, versions, visas, diffusion, approbation.
      Réponds de manière précise et concise, en français.
      Si tu ne connais pas la réponse exacte à une question, indique que tu n'as pas accès à cette information spécifique 
      mais propose des alternatives pour l'obtenir (comme consulter la page des visas ou des documents).
      
      Voici des exemples de questions que tu peux traiter:
      - Combien de visas sont en attente ?
      - Combien de documents ne sont pas encore diffusés ?
      - Combien de versions ont été rejetées ?
      - Quel est le statut des documents ?
      - Quel est le statut des visas ?
      - Combien de documents sont approuvés ?
    `;
    
    // Using the Hugging Face Inference API for text generation
    const result = await hf.textGeneration({
      model: "mistralai/Mistral-7B-Instruct-v0.2", // Using a French-capable model
      inputs: `<s>[INST]${systemPrompt}\nQuestion utilisateur: ${query}[/INST]`,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        top_p: 0.95
      }
    });
    
    // Extract the generated text
    let generatedText = result.generated_text || "";
    
    // Clean up the response if needed
    if (generatedText.includes("[/INST]")) {
      generatedText = generatedText.split("[/INST]").pop() || "";
    }
    
    return {
      response: generatedText.trim(),
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
    const requestData = await req.json();
    const { query, marcheId } = requestData;
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: "Une question est requise" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log(`Query received: "${query}"`);
    console.log(`Market ID: ${marcheId || 'Not provided'}`);
    
    // Create a Supabase client using the request headers
    const supabaseClient = createSupabaseClient(req);
    
    // Process the query
    const result = await processQuery(query, supabaseClient, marcheId);
    
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
