
import { supabase } from '@/lib/supabase';

export interface Question {
  id?: string;
  content: string;
  marche_id: string;
  document_id?: string | null;
  fascicule_id?: string | null;
  attachment_path?: string | null;
  date_creation?: string;
  statut?: string;
  created_at?: string | null;
  documents?: { nom: string } | null;
  fascicules?: { nom: string } | null;
  profiles?: { nom: string, prenom: string, id: string } | null;
  reponses?: Reponse[];
  user_id?: string | null;
}

export interface Reponse {
  id?: string;
  question_id: string;
  content: string;
  user_id?: string | null;
  date_creation?: string | null;
  attachment_path?: string | null;
  created_at?: string | null;
  profiles?: { nom: string, prenom: string, entreprise: string, id: string } | null;
}

export const questionsService = {
  // Récupérer toutes les questions pour un marché
  async getQuestionsByMarcheId(marcheId: string) {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          documents(nom),
          fascicules(nom),
          profiles:user_id(id, nom, prenom, entreprise),
          reponses(
            id, 
            content, 
            user_id, 
            date_creation,
            attachment_path,
            profiles:user_id(id, nom, prenom, entreprise)
          )
        `)
        .eq('marche_id', marcheId)
        .order('date_creation', { ascending: false });

      if (error) {
        console.error("Erreur lors de la récupération des questions:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Exception lors de la récupération des questions:", error);
      throw error;
    }
  },

  // Ajouter une nouvelle question
  async addQuestion(question: Question, file?: File) {
    let attachmentPath = null;

    // Si un fichier est fourni, le télécharger d'abord
    if (file) {
      const fileName = `${Date.now()}_${file.name}`;
      attachmentPath = `${question.marche_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('questions')
        .upload(attachmentPath, file);

      if (uploadError) {
        console.error("Erreur lors du téléversement du fichier:", uploadError);
        throw uploadError;
      }
    }

    // Récupérer l'ID de l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Utilisateur non authentifié");
    }

    // Insérer la question dans la base de données
    const { data, error } = await supabase
      .from('questions')
      .insert([{
        ...question,
        user_id: user.id,
        attachment_path: attachmentPath,
        date_creation: new Date().toISOString(),
        statut: question.statut || 'En attente'
      }])
      .select();

    if (error) {
      console.error("Erreur lors de l'ajout de la question:", error);
      throw error;
    }
    
    return data[0];
  },

  // Ajouter une réponse à une question
  async addReponse(reponse: Reponse, file?: File) {
    let attachmentPath = null;

    // Si un fichier est fourni, le télécharger d'abord
    if (file) {
      const { data: questionData, error: fetchError } = await supabase
        .from('questions')
        .select('marche_id')
        .eq('id', reponse.question_id)
        .single();

      if (fetchError) {
        console.error("Erreur lors de la récupération du marché:", fetchError);
        throw fetchError;
      }

      const fileName = `${Date.now()}_${file.name}`;
      attachmentPath = `${questionData.marche_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('reponses')
        .upload(attachmentPath, file);

      if (uploadError) {
        console.error("Erreur lors du téléversement du fichier:", uploadError);
        throw uploadError;
      }
    }

    // Récupérer l'ID de l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Utilisateur non authentifié");
    }

    // Insérer la réponse dans la base de données
    const { data, error } = await supabase
      .from('reponses')
      .insert([{
        question_id: reponse.question_id,
        content: reponse.content,
        attachment_path: attachmentPath,
        date_creation: new Date().toISOString(),
        user_id: user.id
      }])
      .select();

    if (error) {
      console.error("Erreur lors de l'ajout de la réponse:", error);
      throw error;
    }

    // Mettre à jour le statut de la question
    await supabase
      .from('questions')
      .update({ statut: 'Répondu' })
      .eq('id', reponse.question_id);

    return data[0];
  },

  // Télécharger un fichier attaché à une question ou réponse
  async downloadAttachment(bucket: 'questions' | 'reponses', attachmentPath: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(attachmentPath);

    if (error) {
      console.error("Erreur lors du téléchargement du fichier:", error);
      throw error;
    }
    
    return data;
  },
  
  // Obtenir l'URL publique d'un fichier
  async getPublicUrl(bucket: 'questions' | 'reponses', attachmentPath: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(attachmentPath);
      
    return data.publicUrl;
  }
};
