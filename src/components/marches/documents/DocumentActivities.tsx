
import React, { useState, useEffect } from 'react';
import { Document, Visa } from '@/services/types';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CheckCircle2, XCircle, Eye, AlertCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface DocumentActivitiesProps {
  document: Document;
}

const DocumentActivities: React.FC<DocumentActivitiesProps> = ({ document }) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!document.id) return;
      
      try {
        setLoading(true);
        
        // Fetch visas associated with this document
        const { data: visasData, error: visasError } = await supabase
          .from('visas')
          .select('*')
          .eq('document_id', document.id)
          .order('date_demande', { ascending: false });
          
        if (visasError) throw visasError;
        
        // Format all activities
        let allActivities = [];
        
        if (visasData && visasData.length > 0) {
          const formattedVisas = visasData.map(visa => ({
            ...visa,
            type: 'visa',
            date: visa.date_demande,
            activity: getVisaActivity(visa)
          }));
          allActivities = [...allActivities, ...formattedVisas];
        }
        
        // Add document creation as an activity
        if (document.created_at) {
          allActivities.push({
            id: 'doc-creation',
            type: 'creation',
            date: document.created_at,
            activity: 'Création du document'
          });
        }
        
        // Add document diffusion as an activity if it exists
        if (document.date_diffusion) {
          allActivities.push({
            id: 'doc-diffusion',
            type: 'diffusion',
            date: document.date_diffusion,
            activity: 'Diffusion du document'
          });
        }
        
        // Add document BPE as an activity if it exists
        if (document.date_bpe) {
          allActivities.push({
            id: 'doc-bpe',
            type: 'bpe',
            date: document.date_bpe,
            activity: 'Document approuvé BPE'
          });
        }
        
        // Sort all activities by date
        allActivities.sort((a, b) => {
          const dateA = new Date(a.date || 0).getTime();
          const dateB = new Date(b.date || 0).getTime();
          return dateB - dateA;  // Most recent first
        });
        
        setActivities(allActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
        toast.error('Erreur lors du chargement des activités');
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, [document.id]);

  // Format date for display
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '—';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      return '—';
    }
  };
  
  // Get activity description based on visa
  const getVisaActivity = (visa: Visa) => {
    if (!visa.commentaire) return 'Visa demandé';
    
    const commentLower = visa.commentaire.toLowerCase();
    if (commentLower.includes('vso:')) return 'VSO - Visa Sans Observation';
    if (commentLower.includes('vao:')) return 'VAO - Visa Avec Observations';
    if (commentLower.includes('refusé:')) return 'Document refusé';
    return 'Visa traité';
  };
  
  // Get appropriate icon for activity type
  const getActivityIcon = (activity: any) => {
    switch (activity.type) {
      case 'visa':
        if (activity.commentaire?.toLowerCase().includes('refusé:')) {
          return <XCircle className="h-6 w-6 text-red-500" />;
        }
        if (activity.commentaire?.toLowerCase().includes('vso:')) {
          return <CheckCircle2 className="h-6 w-6 text-green-500" />;
        }
        if (activity.commentaire?.toLowerCase().includes('vao:')) {
          return <AlertCircle className="h-6 w-6 text-amber-500" />;
        }
        return <Clock className="h-6 w-6 text-blue-500" />;
      case 'creation':
        return <Eye className="h-6 w-6 text-gray-500" />;
      case 'diffusion':
        return <Eye className="h-6 w-6 text-blue-500" />;
      case 'bpe':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      default:
        return <Eye className="h-6 w-6 text-gray-500" />;
    }
  };
  
  // Get appropriate badge for activity type
  const getActivityBadge = (activity: any) => {
    switch (activity.type) {
      case 'visa':
        if (activity.commentaire?.toLowerCase().includes('refusé:')) {
          return <Badge className="bg-red-100 text-red-800">Refusé</Badge>;
        }
        if (activity.commentaire?.toLowerCase().includes('vso:')) {
          return <Badge className="bg-green-100 text-green-800">VSO</Badge>;
        }
        if (activity.commentaire?.toLowerCase().includes('vao:')) {
          return <Badge className="bg-amber-100 text-amber-800">VAO</Badge>;
        }
        return <Badge className="bg-blue-100 text-blue-800">Visa</Badge>;
      case 'creation':
        return <Badge className="bg-gray-100 text-gray-800">Création</Badge>;
      case 'diffusion':
        return <Badge className="bg-blue-100 text-blue-800">Diffusion</Badge>;
      case 'bpe':
        return <Badge className="bg-green-100 text-green-800">BPE</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Autre</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Activités récentes</h3>
      
      {loading ? (
        <p className="text-center py-4">Chargement des activités...</p>
      ) : activities.length === 0 ? (
        <p className="text-center py-4">Aucune activité trouvée</p>
      ) : (
        <div className="space-y-4">
          <ul className="space-y-4">
            {activities.map((activity, index) => (
              <li 
                key={`${activity.type}-${activity.id || index}`} 
                className="flex gap-4 p-3 border rounded-md"
              >
                <div className="flex-shrink-0">
                  {getActivityIcon(activity)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{activity.activity}</span>
                    {getActivityBadge(activity)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(activity.date)}
                  </p>
                  {activity.commentaire && (
                    <p className="text-sm mt-2 bg-gray-50 p-2 rounded">
                      {activity.commentaire.split(':').slice(1).join(':').trim()}
                    </p>
                  )}
                  {activity.demande_par && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Par: {activity.demande_par}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DocumentActivities;
