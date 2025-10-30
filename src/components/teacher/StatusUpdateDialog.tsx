import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTeacherMediationTypes, useUpdateMediationStatus } from '@/hooks/useTeacherMediationStatus';
import { Loader } from '@/components/ui/loader';

interface StatusUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  teacherId: number;
  studentId: number;
  studentSubjectId: number;
}

export function StatusUpdateDialog({
  open,
  onOpenChange,
  studentName,
  teacherId,
  studentId,
  studentSubjectId,
}: StatusUpdateDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const { data: mediationTypes, isLoading: typesLoading } = useTeacherMediationTypes();
  const updateStatusMutation = useUpdateMediationStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStatus) {
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        teacherId,
        studentId,
        studentSubjectId,
        mediationTypeId: parseInt(selectedStatus),
      });
      
      // Reset form and close dialog
      setSelectedStatus('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleClose = () => {
    setSelectedStatus('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Status eintragen - {studentName}</DialogTitle>
          <DialogDescription>
            Wählen Sie den neuen Status für diese Mediation aus.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {typesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader message="Loading status options..." />
              </div>
            ) : (
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Status ändern
                </label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus} required>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Status auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {mediationTypes?.map((type) => (
                      <SelectItem key={type.fld_id} value={type.fld_id.toString()}>
                        {type.fld_stage_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateStatusMutation.isPending}
            >
              Schließen
            </Button>
            <Button
              type="submit"
              disabled={!selectedStatus || updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? 'Wird gespeichert...' : 'Ändern'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

