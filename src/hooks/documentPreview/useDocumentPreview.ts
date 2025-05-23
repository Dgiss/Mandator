
import { useState, useEffect } from 'react';
import { fileStorage } from '@/services/storage/fileStorage';

interface DocumentPreviewOptions {
  filePath: string;
  bucket: string;
  open?: boolean;
}

export const useDocumentPreview = (options: DocumentPreviewOptions | null) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [isFileChecking, setIsFileChecking] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);

  useEffect(() => {
    const checkFileExists = async () => {
      if (!options || !options.filePath || (options.open === false)) {
        return;
      }

      setIsFileChecking(true);
      setFileError(null);
      setFileType(null);
      setPdfDataUrl(null);
      
      try {
        const { filePath, bucket } = options;
        
        console.log(`Checking file path: ${filePath} in bucket: ${bucket}`);
        
        // Check if file exists
        const exists = await fileStorage.fileExists(bucket, filePath);
        
        if (!exists) {
          console.error(`File does not exist: ${filePath}`);
          setFileError("Le fichier n'existe pas ou n'est pas accessible.");
          setIsFileChecking(false);
          return;
        }
        
        // Get public URL
        const url = fileStorage.getPublicUrl(bucket, filePath);
        setFileUrl(url);
        console.log(`File URL: ${url}`);
        
        // Determine file type from extension
        const fileExtension = filePath.split('.').pop()?.toLowerCase() || '';
        const mimeType = fileStorage.getMimeTypeFromExtension(fileExtension);
        console.log(`File extension: ${fileExtension}, MIME type: ${mimeType}`);
        
        if (mimeType.startsWith('image/')) {
          setFileType('image');
        } else if (mimeType === 'application/pdf') {
          setFileType('pdf');
          // For PDFs, create a data URL to avoid MIME type issues
          await loadPdfAsDataUrl(bucket, filePath);
        } else {
          setFileType('other');
        }
      } catch (error) {
        console.error("Error checking if file exists:", error);
        setFileError("Erreur lors de la vérification du fichier.");
      } finally {
        setIsFileChecking(false);
      }
    };
    
    checkFileExists();
  }, [options]);

  // Function to load PDF as data URL
  const loadPdfAsDataUrl = async (bucket: string, filePath: string) => {
    setIsLoadingPdf(true);
    try {
      // Download the file content as blob
      const fileBlob = await fileStorage.downloadFile(bucket, filePath);
      
      if (!fileBlob) {
        throw new Error("Impossible de télécharger le fichier PDF");
      }
      
      // Create a new blob with the correct PDF MIME type
      const pdfBlob = new Blob([fileBlob], { type: 'application/pdf' });
      
      // Convert blob to base64 data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        setPdfDataUrl(base64data);
        setIsLoadingPdf(false);
      };
      reader.onerror = () => {
        console.error("Error reading file as data URL");
        setFileError("Erreur lors de la lecture du fichier PDF");
        setIsLoadingPdf(false);
      };
      reader.readAsDataURL(pdfBlob);
    } catch (error) {
      console.error("Error creating PDF data URL:", error);
      setFileError("Erreur lors de la préparation du fichier PDF");
      setIsLoadingPdf(false);
    }
  };

  return {
    fileUrl,
    fileError,
    fileType,
    pdfDataUrl,
    isFileChecking,
    isLoadingPdf
  };
};
