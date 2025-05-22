
import React from 'react';
import { FileText, CheckCircle, FilePen, XCircle } from 'lucide-react';
import { Visa, Version } from './types';
import { getStatusTextWithDot } from '@/utils/statusColors';

interface VisaStatusBadgeProps {
  statut: Visa['statut'] | Version['statut'];
}

export const VisaStatusBadge = ({ statut }: VisaStatusBadgeProps) => {
  const getStatusStyle = () => {
    switch (statut) {
      case 'En attente':
      case 'En attente de diffusion':
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          icon: <FileText className="h-4 w-4 mr-1.5" />
        };
      case 'En attente de visa':
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-700',
          icon: <FileText className="h-4 w-4 mr-1.5" />
        };
      case 'VSO':
      case 'BPE':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          icon: <CheckCircle className="h-4 w-4 mr-1.5" />
        };
      case 'VAO':
      case 'À remettre à jour':
        return {
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-700',
          icon: <FilePen className="h-4 w-4 mr-1.5" />
        };
      case 'Refusé':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          icon: <XCircle className="h-4 w-4 mr-1.5" />
        };
      default:
        // Pour les statuts standard comme "En cours", utiliser notre utilitaire standardisé
        const { dotClass, textClass } = getStatusTextWithDot(statut);
        const baseColor = dotClass.replace('bg-', '');
        return {
          bgColor: `bg-${baseColor.split('-')[0]}-100`,
          textColor: textClass,
          icon: <FileText className="h-4 w-4 mr-1.5" />
        };
    }
  };

  const { bgColor, textColor, icon } = getStatusStyle();

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {icon}
      {statut}
    </div>
  );
};
