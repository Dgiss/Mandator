
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, FileEdit, Users } from 'lucide-react';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Actions rapides</h2>
        <div className="space-y-3">
          <Button 
            variant="btpPrimary" 
            className="w-full justify-start"
            onClick={() => navigate('/marches/creation')}
          >
            <FileText className="mr-2 h-4 w-4" />
            Créer un nouveau marché
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            onClick={() => navigate('/formulaires')}
          >
            <FileEdit className="mr-2 h-4 w-4" />
            Gérer les formulaires
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            onClick={() => navigate('/clients')}
          >
            <Users className="mr-2 h-4 w-4" />
            Gérer les clients
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default QuickActions;
