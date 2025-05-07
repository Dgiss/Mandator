
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
}

export interface Reponse {
  id?: string;
  question_id: string;
  content: string;
  user_id?: string;
  date_creation?: string;
  attachment_path?: string | null;
}

export const questionsService = {
  // Récupérer toutes les questions pour un marché
  async getQuestionsByMarcheId(marcheId: string) {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        documents(nom),
        fascicules(nom)
      `)
      .eq('marche_id', marcheId)
      .order('date_creation', { ascending: false });

    // Récupérer les réponses pour chaque question
    if (!error && data) {
      const questionsWithResponses = await Promise.all(
        data.map(async (question) => {
          const { data: responsesData } = await supabase
            .from('reponses')
            .select('*')
            .eq('question_id', question.id);
          
          return {
            ...question,
            reponses: responsesData || []
          };
        })
      );
      
      return questionsWithResponses;
    }

    if (error) throw error;
    return data;
  },

  // Ajouter une nouvelle question
  async addQuestion(question: Question, file?: File) {
    let attachmentPath = null;

    // Si un fichier est fourni, le télécharger d'abord
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${file.name}`;
      attachmentPath = `${question.marche_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('questions')
        .upload(attachmentPath, file);

      if (uploadError) throw uploadError;
    }

    // Insérer la question dans la base de données
    const { data, error } = await supabase
      .from('questions')
      .insert([{
        ...question,
        attachment_path: attachmentPath,
        date_creation: new Date().toISOString(),
        statut: question.statut || 'En attente'
      }])
      .select();

    if (error) throw error;
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

      if (fetchError) throw fetchError;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${file.name}`;
      attachmentPath = `${questionData.marche_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('reponses')
        .upload(attachmentPath, file);

      if (uploadError) throw uploadError;
    }

    // Récupérer l'ID de l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    // Insérer la réponse dans la base de données
    const { data, error } = await supabase
      .from('reponses')
      .insert([{
        question_id: reponse.question_id,
        content: reponse.content,
        attachment_path: attachmentPath,
        date_creation: new Date().toISOString(),
        user_id: userId
      }])
      .select();

    if (error) throw error;

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

    if (error) throw error;
    return data;
  }
};
