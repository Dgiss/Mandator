
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

type ProjectItem = {
  id: number;
  name: string;
  client: string;
  status: string;
};

interface RecentProjectsProps {
  projects: ProjectItem[];
}

const RecentProjects: React.FC<RecentProjectsProps> = ({ projects }) => {
  const navigate = useNavigate();

  // Return the status badge element based on status
  const getStatusBadge = (status: string) => {
    if (status === "En cours") {
      return <span className="inline-flex items-center">
        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
        <span className="text-sm text-gray-600">{status}</span>
      </span>;
    } else if (status === "En attente") {
      return <span className="inline-flex items-center">
        <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
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
        <div className="space-y-4">
          {projects.map(project => (
            <div key={project.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
              <div className="p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-800">{project.name}</h4>
                  <p className="text-sm text-gray-600">Client: {project.client}</p>
                </div>
                <div className="flex items-center">
                  {getStatusBadge(project.status)}
                  <button 
                    onClick={() => navigate(`/marches/${project.id}`)}
                    className="ml-4 p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default RecentProjects;
