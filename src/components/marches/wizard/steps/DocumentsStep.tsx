
import React, { useState } from 'react';
import { FormSection } from '@/components/ui/form-section';
import { MarketFormData } from '../MarketWizard';
import { MultiFileUpload } from '@/components/ui/multi-file-upload';

interface DocumentsStepProps {
  formData: MarketFormData;
  onChange: (data: Partial<MarketFormData>) => void;
}

const DocumentsStep: React.FC<DocumentsStepProps> = ({ formData, onChange }) => {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  // Simulate upload progress for demo purposes
  const handleFilesChange = (files: File[]) => {
    onChange({ files });
    
    // Reset progress when files change
    setUploadProgress({});
    
    // Simulate progress for each file
    if (files.length > 0) {
      files.forEach(file => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.floor(Math.random() * 10) + 5;
          if (progress > 100) {
            progress = 100;
            clearInterval(interval);
          }
          
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: progress
          }));
        }, 300);
      });
    }
  };

  return (
    <div className="space-y-6">
      <FormSection
        title="Documents"
        description="Téléchargement des fichiers liés au marché"
      >
        <div className="space-y-6">
          <MultiFileUpload
            id="marketFiles"
            label="Documents du marché"
            files={formData.files}
            onChange={handleFilesChange}
            description="Ajoutez ici tous les documents relatifs à ce marché (cahier des charges, plans, etc.)"
            maxSize={20}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.png,.zip"
            progress={uploadProgress}
          />
          
          <div className="text-sm text-muted-foreground">
            <p>Les fichiers seront associés automatiquement à ce marché après sa création.</p>
            <p>Formats acceptés: PDF, Documents Office, Images, Archives ZIP</p>
          </div>
        </div>
      </FormSection>
    </div>
  );
};

export default DocumentsStep;
