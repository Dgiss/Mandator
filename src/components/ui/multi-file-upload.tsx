
import * as React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, File, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiFileUploadProps {
  id: string;
  label?: string;
  files: File[];
  onChange: (files: File[]) => void;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  maxSize?: number; // in MB
  accept?: string;
  maxFiles?: number;
  progress?: Record<string, number>; // file name -> progress percentage
}

export function MultiFileUpload({
  id,
  label,
  files,
  onChange,
  description,
  error,
  required,
  className,
  maxSize = 10, // Default 10MB
  accept,
  maxFiles = 10,
  progress = {}
}: MultiFileUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).filter(file => {
        // Filter by file size
        if (maxSize && file.size > maxSize * 1024 * 1024) {
          console.warn(`File ${file.name} is larger than the ${maxSize}MB limit`);
          return false;
        }
        return true;
      });

      // Check if adding these files would exceed maxFiles
      const totalFiles = files.length + newFiles.length;
      if (maxFiles && totalFiles > maxFiles) {
        console.warn(`Cannot upload more than ${maxFiles} files`);
        // Take only as many new files as will fit
        const fitCount = Math.max(0, maxFiles - files.length);
        onChange([...files, ...newFiles.slice(0, fitCount)]);
      } else {
        onChange([...files, ...newFiles]);
      }
    }
    
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(file => {
        // Filter by file size
        if (maxSize && file.size > maxSize * 1024 * 1024) {
          console.warn(`File ${file.name} is larger than the ${maxSize}MB limit`);
          return false;
        }
        return true;
      });

      // Check if adding these files would exceed maxFiles
      const totalFiles = files.length + droppedFiles.length;
      if (maxFiles && totalFiles > maxFiles) {
        console.warn(`Cannot upload more than ${maxFiles} files`);
        // Take only as many new files as will fit
        const fitCount = Math.max(0, maxFiles - files.length);
        onChange([...files, ...droppedFiles.slice(0, fitCount)]);
      } else {
        onChange([...files, ...droppedFiles]);
      }
    }
  };

  // Helper to format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Helper to get file icon based on type
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return (
        <div className="w-8 h-8 bg-muted rounded flex items-center justify-center overflow-hidden">
          <img
            src={URL.createObjectURL(file)}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        </div>
      );
    } else if (file.type.includes('pdf')) {
      return <File className="w-8 h-8 text-red-500" />;
    } else if (file.type.includes('word') || file.type.includes('document')) {
      return <File className="w-8 h-8 text-blue-500" />;
    } else if (file.type.includes('excel') || file.type.includes('spreadsheet')) {
      return <File className="w-8 h-8 text-green-500" />;
    } else {
      return <FileText className="w-8 h-8 text-gray-500" />;
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={id} className={cn(error && "text-destructive")}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors",
          error && "border-destructive"
        )}
      >
        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {accept ? `${accept.split(',').join(', ')}` : "All files"} (max. {maxSize}MB)
        </p>
        {maxFiles && (
          <p className="text-xs text-muted-foreground">
            Up to {maxFiles} files
          </p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          id={id}
          className="hidden"
          multiple
          accept={accept}
          onChange={handleFileChange}
        />
      </div>
      
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-3 p-2 border rounded bg-background">
              {getFileIcon(file)}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" title={file.name}>
                  {file.name}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                  
                  {progress && progress[file.name] !== undefined && (
                    <div className="flex items-center gap-2 w-24">
                      <Progress value={progress[file.name]} className="h-1.5" />
                      <span className="text-xs text-muted-foreground">
                        {progress[file.name]}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(index);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      
      {maxFiles && files.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {files.length}/{maxFiles} files
        </p>
      )}
    </div>
  );
}
