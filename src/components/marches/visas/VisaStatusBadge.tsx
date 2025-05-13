
import React from 'react';
import { FileText, CheckCircle, FilePen, XCircle } from 'lucide-react';
import { Visa } from './types';

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
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
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
