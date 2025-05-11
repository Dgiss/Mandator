
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MarketWizard from '@/components/marches/wizard/MarketWizard';

export default function MarketCreationPage() {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate('/marches');
  };

  return (
    <PageLayout
      title="Créer un nouveau marché"
      description="Remplissez le formulaire pour créer un nouveau marché"
      actions={
        <Button variant="outline" onClick={handleCancel}>
          Retour
        </Button>
      }
    >
      <Card>
        <CardContent className="pt-6">
          <MarketWizard onCancel={handleCancel} />
        </CardContent>
      </Card>
    </PageLayout>
  );
}
