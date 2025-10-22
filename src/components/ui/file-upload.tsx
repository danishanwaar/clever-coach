import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useFileUpload, UseFileUploadOptions } from '@/hooks/useFileUpload';

interface FileUploadProps extends UseFileUploadOptions {
  onUploadSuccess?: (filePath: string) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  multiple?: boolean;
  accept?: Record<string, string[]>;
}

interface UploadedFile {
  file: File;
  path?: string;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  bucket,
  allowedTypes,
  maxSizeInMB = 10,
  onUploadSuccess,
  onUploadError,
  className,
  multiple = false,
  accept = {
    'application/pdf': ['.pdf'],
    'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
  }
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { uploadFile, isUploading, uploadProgress } = useFileUpload({
    bucket,
    allowedTypes,
    maxSizeInMB
  });

  const handleFileUpload = async (files: File[]) => {
    const newFiles: UploadedFile[] = files.map(file => ({
      file,
      status: 'uploading' as const
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileIndex = uploadedFiles.length + i;
      
      try {
        const result = await uploadFile(file);
        
        setUploadedFiles(prev => 
          prev.map((f, index) => 
            index === fileIndex 
              ? { ...f, status: result.success ? 'success' : 'error', path: result.filePath, error: result.error }
              : f
          )
        );

        if (result.success && result.filePath) {
          onUploadSuccess?.(result.filePath);
        } else {
          onUploadError?.(result.error || 'Upload failed');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setUploadedFiles(prev => 
          prev.map((f, index) => 
            index === fileIndex 
              ? { ...f, status: 'error', error: errorMessage }
              : f
          )
        );
        onUploadError?.(errorMessage);
      }
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleFileUpload(acceptedFiles);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    accept,
    maxSize: maxSizeInMB * 1024 * 1024
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors",
          "hover:border-primary/50 hover:bg-muted/50",
          isDragActive && "border-primary bg-primary/5",
          isUploading && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-2">
            {isDragActive
              ? "Drop the files here..."
              : "Drag & drop files here, or click to select files"}
          </p>
          <p className="text-xs text-muted-foreground">
            Max file size: {maxSizeInMB}MB
          </p>
        </div>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Uploading...</p>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files</h4>
          {uploadedFiles.map((uploadedFile, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <File className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{uploadedFile.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {uploadedFile.status === 'success' && (
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                )}
                {uploadedFile.status === 'error' && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};