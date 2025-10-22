import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Upload, Download, Eye, Trash2, Plus, Search, FileText, Image, File } from 'lucide-react';

interface Document {
  fld_id: number;
  fld_name: string;
  fld_type: string;
  fld_size: number;
  fld_path: string;
  fld_description?: string;
  fld_upload_date: string;
  fld_status: string;
}

export default function TeacherDocuments() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState({
    fld_name: '',
    fld_type: '',
    fld_description: ''
  });

  // Fetch teacher's documents
  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ['teacherDocuments', user?.fld_id],
    queryFn: async () => {
      if (!user?.fld_id) throw new Error('User not authenticated');

      // Get teacher ID
      const { data: teacher, error: teacherError } = await supabase
        .from('tbl_teachers')
        .select('fld_id')
        .eq('fld_uid', user.fld_id)
        .single();

      if (teacherError) throw teacherError;

      // For now, return empty array until table is created
      // TODO: Implement once tbl_teacher_documents table is created
      return [];
    },
    enabled: !!user?.fld_id
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.fld_id) throw new Error('User not authenticated');

      // Get teacher ID
      const { data: teacher, error: teacherError } = await supabase
        .from('tbl_teachers')
        .select('fld_id')
        .eq('fld_uid', user.fld_id)
        .single();

      if (teacherError) throw teacherError;

      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `teachers/${teacher.fld_id}/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // TODO: Save document metadata to database once tbl_teacher_documents table is created
      // For now, just upload to storage
      console.log('Document uploaded to storage:', filePath);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherDocuments'] });
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setUploadData({ fld_name: '', fld_type: '', fld_description: '' });
      toast.success('Document uploaded successfully');
    },
    onError: (error) => {
      toast.error('Failed to upload document: ' + error.message);
    }
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async ({ documentId, filePath }: { documentId: number; filePath: string }) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      // TODO: Delete from database once tbl_teacher_documents table is created
      console.log('Document deleted from storage:', filePath);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherDocuments'] });
      toast.success('Document deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete document: ' + error.message);
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadData({
        fld_name: file.name,
        fld_type: file.type,
        fld_description: ''
      });
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }
    uploadDocumentMutation.mutate(selectedFile);
  };

  const handleDownload = async (doc: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.fld_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.fld_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (type.includes('pdf')) return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documents?.filter(doc => {
    const matchesSearch = 
      doc.fld_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.fld_description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || doc.fld_type.includes(typeFilter);
    
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Documents</h1>
        <p className="text-muted-foreground">
          Upload and manage your teaching documents and certificates
        </p>
      </div>

      {/* Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
            />
            <Button onClick={() => fileInputRef.current?.click()}>
              <Plus className="h-4 w-4 mr-2" />
              Select File
            </Button>
            {selectedFile && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </span>
                <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Upload
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Upload Document</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Document Name</Label>
                        <Input
                          id="name"
                          value={uploadData.fld_name}
                          onChange={(e) => setUploadData({ ...uploadData, fld_name: e.target.value })}
                          placeholder="Enter document name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">Document Type</Label>
                        <Select value={uploadData.fld_type} onValueChange={(value) => setUploadData({ ...uploadData, fld_type: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="certificate">Certificate</SelectItem>
                            <SelectItem value="diploma">Diploma</SelectItem>
                            <SelectItem value="id">ID Document</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={uploadData.fld_description}
                          onChange={(e) => setUploadData({ ...uploadData, fld_description: e.target.value })}
                          placeholder="Enter document description (optional)"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleUpload} disabled={uploadDocumentMutation.isPending}>
                          {uploadDocumentMutation.isPending ? 'Uploading...' : 'Upload'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="certificate">Certificate</SelectItem>
            <SelectItem value="diploma">Diploma</SelectItem>
            <SelectItem value="id">ID Document</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Document Library</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments?.map((document) => (
                <TableRow key={document.fld_id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getFileIcon(document.fld_type)}
                      <div>
                        <div className="font-medium">{document.fld_name}</div>
                        {document.fld_description && (
                          <div className="text-sm text-gray-500">{document.fld_description}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{document.fld_type}</Badge>
                  </TableCell>
                  <TableCell>{formatFileSize(document.fld_size)}</TableCell>
                  <TableCell>{new Date(document.fld_upload_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={document.fld_status === 'Active' ? 'default' : 'secondary'}>
                      {document.fld_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownload(document)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownload(document)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteDocumentMutation.mutate({ 
                          documentId: document.fld_id, 
                          filePath: document.fld_path 
                        })}
                        disabled={deleteDocumentMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredDocuments?.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600">
                {searchTerm || typeFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Upload your first document to get started.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
