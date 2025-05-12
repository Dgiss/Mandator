
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const AccessRestrictedAlert: React.FC = () => {
  return (
    <Alert variant="default" className="bg-muted">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Accès restreint</AlertTitle>
      <AlertDescription>
        Vous n'avez pas les droits nécessaires pour gérer les collaborateurs sur ce marché. 
        Seuls les administrateurs et les maîtres d'œuvre (MOE) du marché peuvent gérer les accès.
      </AlertDescription>
    </Alert>
  );
};

export default AccessRestrictedAlert;
