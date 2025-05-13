
import React from 'react';
import { useParams } from 'react-router-dom';
import { SituationForm } from '@/components/forms/SituationForm';

const MarcheSituations: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const marcheId = id || '';

  return (
    <div>
      <SituationForm marcheId={marcheId} />
    </div>
  );
};

export default MarcheSituations;
