
import React from 'react';
import { useParams } from 'react-router-dom';
import { SituationForm } from '@/components/forms/SituationForm';

interface MarcheSituationsProps {
  marcheId: string;
}

const MarcheSituations: React.FC<MarcheSituationsProps> = ({ marcheId }) => {
  return (
    <div>
      <SituationForm marcheId={marcheId} />
    </div>
  );
};

export default MarcheSituations;
