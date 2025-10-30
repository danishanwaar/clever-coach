import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, X, Download, Image, File, FileImage, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useAuthStore } from '@/stores/authStore';
import { useTeacher } from '@/hooks/useTeacherProfile';
import {
  useTeacherDocuments,
  useUploadTeacherDocuments,
  useDeleteTeacherDocument,
  useGetDocumentUrl
} from '@/hooks/useTeacherProfile';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const TeacherDocuments: React.FC = () => {
  const { user } = useAuthStore();
  const { data: teacher } = useTeacher(user?.fld_id);
  const teacherId = teacher?.fld_id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<{ id: number; fileName: string } | null>(null);
  const [downloadingDoc, setDownloadingDoc] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Fetch teacher documents
  const { data: documents = [], isLoading } = useTeacherDocuments(teacherId);

  // Upload documents mutation
  const uploadDocumentsMutation = useUploadTeacherDocuments(teacherId);

  // Delete document mutation
  const deleteDocumentMutation = useDeleteTeacherDocument(teacherId);

  // Get document URL helper
  const getDocumentUrl = useGetDocumentUrl();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      return;
    }
    uploadDocumentsMutation.mutate(selectedFiles, {
      onSuccess: () => {
        setSelectedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    });
  };

  const handleDeleteClick = (documentId: number, fileName: string) => {
    setDocumentToDelete({ id: documentId, fileName });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!documentToDelete) return;
    deleteDocumentMutation.mutate(
      { documentId: documentToDelete.id, fileName: documentToDelete.fileName },
      {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setDocumentToDelete(null);
        }
      }
    );
  };

  const handleDownload = async (documentId: number, fileName: string) => {
    if (!teacherId) return;
    
    setDownloadingDoc(documentId);
    try {
      const url = await getDocumentUrl(teacherId, fileName);
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    } finally {
      setDownloadingDoc(null);
    }
  };

  const handlePreview = async (fileName: string) => {
    if (!teacherId) return;
    const url = await getDocumentUrl(teacherId, fileName);
    if (url) {
      window.open(url, '_blank');
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic'].includes(ext || '')) {
      return <Image className="h-12 w-12 text-blue-500" />;
    }
    if (['pdf'].includes(ext || '')) {
      return <FileText className="h-12 w-12 text-red-500" />;
    }
    return <File className="h-12 w-12 text-gray-500" />;
  };

  const getPreviewUrl = (fileName: string): string => {
    if (!teacher?.fld_uid) return '';
    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(`${teacher.fld_uid}/${fileName}`);
    return data.publicUrl;
  };

  if (!teacherId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600">Loading teacher information...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="border border-gray-200 hover:shadow-md transition-shadow">
        <CardHeader className="border-b border-gray-200 bg-primary/5">
          <CardTitle className="text-xl font-bold text-primary flex items-center">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center mr-3">
              <Upload className="h-5 w-5 text-white" />
            </div>
            Dokumente Hochladen
          </CardTitle>
          <CardDescription className="text-gray-600">Upload your documents, certificates, and qualifications</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpload();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="documents" className="text-sm font-semibold text-gray-700">
                Unterlagen <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="documents"
                  multiple
                  required
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.heic,.webp"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-primary/30 text-primary hover:bg-primary/5 hover:border-primary"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Dateien auswählen
                </Button>
                {selectedFiles.length > 0 && (
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700">
                      {selectedFiles.length} Datei(en) ausgewählt
                    </span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {selectedFiles.map((file, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                        >
                          {file.name}
                          <button
                            type="button"
                            onClick={() => {
                              const newFiles = selectedFiles.filter((_, i) => i !== index);
                              setSelectedFiles(newFiles);
                            }}
                            className="ml-2 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={uploadDocumentsMutation.isPending || selectedFiles.length === 0}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {uploadDocumentsMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Wird hochgeladen...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Hochladen
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-primary flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Hochgeladene Dokumente
          </h3>
          <Badge variant="secondary" className="text-sm">
            {documents.length} Dokument{documents.length !== 1 ? 'e' : ''}
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {documents.length > 0 ? (
            documents.map((document) => {
              const fileNameWithoutExt = document.fld_doc_file.split('.')[0];
              const fileExt = document.fld_doc_file.split('.').pop()?.toLowerCase();
              const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic'].includes(fileExt || '');
              
              return (
                <Card
                  key={document.fld_id}
                  className="group hover:shadow-lg border border-gray-200 transition-all duration-200 hover:border-primary/30"
                >
                  <CardContent className="p-4">
                    {/* File Preview/Icon */}
                    <div className="relative mb-4">
                      <div className="w-full h-32 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
                        {isImage && !imageErrors.has(document.fld_id) ? (
                          <div className="relative w-full h-full">
                            <img
                              src={getPreviewUrl(document.fld_doc_file)}
                              alt={fileNameWithoutExt}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              onError={() => {
                                setImageErrors(prev => new Set(prev).add(document.fld_id));
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            {getFileIcon(document.fld_doc_file)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* File Name */}
                    <h4
                      className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handlePreview(document.fld_doc_file)}
                      title={fileNameWithoutExt}
                    >
                      {fileNameWithoutExt}
                    </h4>

                    {/* File Meta */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>{format(new Date(document.fld_edate), 'dd MMM yyyy')}</span>
                      <span className="uppercase font-medium">{fileExt}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(document.fld_id, document.fld_doc_file)}
                        disabled={downloadingDoc === document.fld_id}
                        className="flex-1 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary"
                      >
                        {downloadingDoc === document.fld_id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(document.fld_doc_file)}
                        className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Ansehen
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(document.fld_id, document.fld_doc_file)}
                        disabled={deleteDocumentMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full">
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Noch keine Dokumente hochgeladen</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Laden Sie Ihre Dokumente, Zeugnisse und Qualifikationen hoch
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-primary text-primary hover:bg-primary/5"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Dokument hochladen
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dokument löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie dieses Dokument löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteDocumentMutation.isPending}
            >
              {deleteDocumentMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Wird gelöscht...
                </>
              ) : (
                'Löschen'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeacherDocuments;
