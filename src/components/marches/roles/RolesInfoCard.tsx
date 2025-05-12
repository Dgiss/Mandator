
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const RolesInfoCard: React.FC = () => {
  return (
    <Card className="bg-blue-50 border border-blue-200">
      <CardContent className="pt-6">
        <h3 className="font-semibold mb-2">Informations sur les rôles:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Maître d'œuvre (MOE)</strong>: Accès complet au marché, peut gérer les droits d'accès des autres utilisateurs.</li>
          <li><strong>Mandataire</strong>: Peut consulter et diffuser des documents sur le marché.</li>
          <li><strong>Consultant</strong>: Accès en lecture seule aux informations du marché.</li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default RolesInfoCard;
