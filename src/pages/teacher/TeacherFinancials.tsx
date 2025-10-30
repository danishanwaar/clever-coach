import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { DollarSign, Search, Download, Eye, FileText } from 'lucide-react';
import { useTeacher, useTeacherFinancials, useTeacherFinancialsStats } from '@/hooks/useTeacherProfile';
import { format } from 'date-fns';

export default function TeacherFinancials() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Get teacher ID
  const { data: teacher } = useTeacher(user?.fld_id);
  
  // Fetch financial data using hooks
  const { data: invoices = [], isLoading } = useTeacherFinancials(teacher?.fld_id);
  const { data: stats } = useTeacherFinancialsStats(teacher?.fld_id);

  // Filter invoices by search term (following PHP: search by invoice ID or reference)
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.fld_id.toString().includes(searchTerm.toLowerCase()) ||
      invoice.fld_lhid?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleViewInvoice = (invoiceId: number) => {
    // Following PHP: link to view.php?FLD_ID=xxx&view=Payables
    window.open(`/view?FLD_ID=${encodeURIComponent(btoa(invoiceId.toString()))}&view=${encodeURIComponent(btoa('Payables'))}`, '_blank');
  };

  const handleDownloadInvoice = (invoiceId: number) => {
    // Following PHP: link to download.php?FLD_ID=xxx&view=Payables
    window.open(`/download?FLD_ID=${encodeURIComponent(btoa(invoiceId.toString()))}&view=${encodeURIComponent(btoa('Payables'))}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar - Following PHP layout */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Suchen"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Invoice Cards - Card-based layout following PHP business logic */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredInvoices.map((invoice) => (
          <Card key={invoice.fld_id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold text-primary">Rechnung #{invoice.fld_id}</h3>
                  <p className="text-xs text-gray-600 mt-1">Referenz: {invoice.fld_lhid || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-red-600">€{Math.round(invoice.fld_invoice_total)}</p>
                  <p className="text-xs text-gray-500">{format(new Date(invoice.fld_edate), 'dd-MMM-yy')}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white flex-1 h-8 text-xs"
                  onClick={() => handleViewInvoice(invoice.fld_id)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Sicht
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1 h-8 text-xs"
                  onClick={() => handleDownloadInvoice(invoice.fld_id)}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Herunterladen
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInvoices.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">No invoices found</h3>
            <p className="text-sm text-gray-600">
              {searchTerm ? 'Try adjusting your search criteria.' : 'No invoices have been generated yet.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
