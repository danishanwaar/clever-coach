import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, ExternalLink } from 'lucide-react';
import { generateContractLink } from '@/utils/contractUtils';
import { toast } from 'sonner';

const ContractLinkGenerator: React.FC = () => {
  const [teacherId, setTeacherId] = useState<string>('');
  const [contractLink, setContractLink] = useState<string>('');

  const handleGenerateLink = () => {
    if (!teacherId || isNaN(parseInt(teacherId))) {
      toast.error('Please enter a valid teacher ID');
      return;
    }

    const link = generateContractLink(parseInt(teacherId));
    setContractLink(link);
    toast.success('Contract link generated!');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(contractLink);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleOpenLink = () => {
    window.open(contractLink, '_blank');
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Generate Contract Link</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="teacherId">Teacher ID</Label>
          <Input
            id="teacherId"
            type="number"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            placeholder="Enter teacher ID"
          />
        </div>
        
        <Button onClick={handleGenerateLink} className="w-full">
          Generate Contract Link
        </Button>

        {contractLink && (
          <div className="space-y-2">
            <Label>Generated Link:</Label>
            <div className="flex gap-2">
              <Input
                value={contractLink}
                readOnly
                className="flex-1"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyLink}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleOpenLink}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContractLinkGenerator;
