
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserRole } from '@/hooks/useUserRole';

type ProjectItem = {
  id: string | number;
  name: string;
  client: string;
  status: string;
};

interface RecentProjectsProps {
  projects: ProjectItem[];
  loading?: boolean;
}

const RecentProjects: React.FC<RecentProjectsProps> = ({ projects, loading = false }) => {
  const navigate = useNavigate();
  const { canCreateMarche } = useUserRole();
  
  // Garantir que projects est un tableau valide
  const validProjects = Array.isArray(projects) ? projects : [];

  // Return the status badge element based on status
  const getStatusBadge = (status: string) => {
    if (!status) return (
      <span className="inline-flex items-center">
        <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
        <span className="text-sm text-gray-600">Non défini</span>
      </span>
    );
    
    const statusLower = status.toLowerCase();
    if (statusLower === "en cours") {
      return <span className="inline-flex items-center">
        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
        <span className="text-sm text-gray-600">{status}</span>
      </span>;
    } else if (statusLower === "en attente") {
      return <span className="inline-flex items-center">
        <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
        <span className="text-sm text-gray-600">{status}</span>
      </span>;
    } else if (statusLower === "terminé") {
      return <span className="inline-flex items-center">
        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
        <span className="text-sm text-gray-600">{status}</span>
      </span>;
    } else {
      return <span className="inline-flex items-center">
        <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
        <span className="text-sm text-gray-600">{status}</span>
      </span>;
    }
  };

  return (
    <Card className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Projets récents</h2>
        
        {loading ? (
          // Afficher des squelettes pendant le chargement
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                <div className="p-4">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
            ))}
          </div>
        ) : validProjects.length > 0 ? (
          // Afficher les vraies données
          <div className="space-y-4">
            {validProjects.map(project => (
              <div key={project.id || `project-${Math.random()}`} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-800">{project.name || 'Sans nom'}</h4>
                    <p className="text-sm text-gray-600">Client: {project.client || 'Non spécifié'}</p>
                  </div>
                  <div className="flex items-center">
                    {getStatusBadge(project.status)}
                    <button 
                      onClick={() => project.id && navigate(`/marches/${project.id}`)}
                      className="ml-4 p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Aucun projet
          <div className="text-center py-8 text-gray-500">
            {canCreateMarche ? (
              <>
                Aucun projet récent à afficher.
                <div className="mt-2">
                  <span 
                    className="text-blue-600 cursor-pointer hover:underline"
                    onClick={() => navigate('/marches/creation')}
                  >
                    Créer un nouveau marché
                  </span>
                </div>
              </>
            ) : (
              <>
                Vous n'avez pas accès à des projets.
                <div className="mt-2">
                  <span className="text-gray-500">
                    Contactez votre administrateur pour obtenir des droits d'accès.
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default RecentProjects;
