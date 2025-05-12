
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';

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
  },
  
  // Get document status counts overall
  async getDocumentStatusCounts(client) {
    const query = `
      SELECT 
        statut, 
        COUNT(*) as count 
      FROM documents 
      GROUP BY statut
    `;
    
    const { data, error } = await client.rpc('execute_query', { query_text: query });
    if (error) throw error;
    return data;
  },
  
  // Get visa status counts overall
  async getVisaStatusCounts(client) {
    const query = `
      SELECT 
        statut, 
        COUNT(*) as count 
      FROM visas 
      GROUP BY statut
    `;
    
    const { data, error } = await client.rpc('execute_query', { query_text: query });
    if (error) throw error;
    return data;
  },
  
  // Get version status counts overall
  async getVersionStatusCounts(client) {
    const query = `
      SELECT 
        statut, 
        COUNT(*) as count 
      FROM versions 
      GROUP BY statut
    `;
    
    const { data, error } = await client.rpc('execute_query', { query_text: query });
    if (error) throw error;
    return data;
  }
};

// Process the user's query using Hugging Face
async function processQuery(query, client) {
  try {
    // Get the Hugging Face API token from environment
    const hfToken = Deno.env.get("HUGGING_FACE_TOKEN");
    if (!hfToken) {
      throw new Error("HUGGING_FACE_TOKEN is not set in environment variables");
    }
    
    // Extract market ID from the query if present (we'll add functionality for this later)
    let marcheId = null;
    let fasciculeId = null;
    
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
      const statusCounts = await predefinedQueries.getDocumentStatusCounts(client);
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
      const statusCounts = await predefinedQueries.getVisaStatusCounts(client);
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
      const statusCounts = await predefinedQueries.getVersionStatusCounts(client);
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
    // Check for fascicule progress queries
    else if (fasciculeId && lowerQuery.includes('fascicule') && 
            (lowerQuery.includes('progress') || lowerQuery.includes('avancement'))) {
      const fascicule = await predefinedQueries.getFasciculeProgress(client, fasciculeId);
      return {
        response: `Le fascicule ${fascicule.nom} a un avancement de ${fascicule.progression}%`,
        data: fascicule,
        queryType: 'fascicule'
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
          
          return {
            response: `Résumé global: ${pendingVisas} visas en attente, ${undistributedDocs} documents à diffuser, ${rejectedVersions} versions rejetées`,
            data: {
              pendingVisas,
              undistributedDocs,
              rejectedVersions
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
    
    return {
      response: result.generated_text,
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
    const { query } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: "Une question est requise" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Create a temporary Supabase client for executing queries
    // The client uses the function's service role to execute the queries
    const supabaseClient = {
      rpc: async (functionName, params) => {
        // In a real edge function, you would use the Supabase JS client here
        // For now, we'll mock this and assume it's calling the execute_query RPC
        
        // Simplified mock for demonstration
        if (functionName === 'execute_query') {
          const { query_text } = params;
          
          // Mock different query results
          if (query_text.includes('visas WHERE statut = \'En attente\'')) {
            return { data: [{ count: 12 }], error: null };
          }
          else if (query_text.includes('documents WHERE statut = \'En attente de diffusion\'')) {
            return { data: [{ count: 8 }], error: null };
          }
          else if (query_text.includes('versions WHERE statut = \'Rejeté\'')) {
            return { data: [{ count: 3 }], error: null };
          }
          else if (query_text.includes('SELECT statut, COUNT(*) as count FROM documents')) {
            return { 
              data: [
                { statut: 'En attente de diffusion', count: 8 },
                { statut: 'Approuvé', count: 42 },
                { statut: 'Rejeté', count: 5 }
              ], 
              error: null 
            };
          }
          else if (query_text.includes('SELECT statut, COUNT(*) as count FROM visas')) {
            return { 
              data: [
                { statut: 'En attente', count: 12 },
                { statut: 'Approuvé', count: 35 },
                { statut: 'Rejeté', count: 7 }
              ], 
              error: null 
            };
          }
          else if (query_text.includes('SELECT statut, COUNT(*) as count FROM versions')) {
            return { 
              data: [
                { statut: 'Actif', count: 56 },
                { statut: 'Rejeté', count: 3 },
                { statut: null, count: 2 }
              ], 
              error: null 
            };
          }
          else if (query_text.includes('marches m')) {
            return { 
              data: [{
                titre: "Marché exemple",
                total_documents: 55,
                visas_en_attente: 12,
                documents_a_diffuser: 8,
                versions_rejetees: 3
              }], 
              error: null 
            };
          }
          else {
            // Default response for other queries
            return { data: [{ count: 0 }], error: null };
          }
        }
        
        return { data: null, error: new Error(`Function ${functionName} not implemented`) };
      }
    };
    
    const result = await processQuery(query, supabaseClient);
    
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
