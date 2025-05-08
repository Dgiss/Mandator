
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, FileEdit, Users, Plus } from 'lucide-react';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="bg-white border border-gray-200 rounded-lg overflow-hidden p-5">
      <h3 className="text-lg font-medium mb-4">Actions rapides</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button 
          onClick={() => navigate('/marches/create')}
          variant="btpPrimary"
          className="flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Nouveau marché
        </Button>
        <Button 
          variant="btpOutline"
          className="flex items-center justify-center gap-2"
          onClick={() => navigate('/marches')}
        >
          <FileText size={16} />
          Consulter marchés
        </Button>
      </div>
    </Card>
  );
};

export default QuickActions;
