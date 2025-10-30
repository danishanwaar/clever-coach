import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTeacherInvoices, formatDate, formatCurrency } from '@/hooks/useInvoiceManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Eye, 
  Edit, 
  Download, 
  Mail,
  PlusCircle,
  Euro,
  TrendingUp,
  Clock,
  CheckCircle,
  Calendar,
  FileText
} from 'lucide-react';
import { generateTeacherInvoiceById, generateTeacherInvoiceBlobById } from '@/utils/invoicePdf';

const Payables = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const {
    invoices,
    stats,
    isLoading,
    updateStatus,
    sendEmail,
    generateInvoices,
    isUpdating,
    isSendingEmail,
    isGenerating,
  } = useTeacherInvoices();

  // Filter invoices based on search and status
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch = searchTerm === '' || 
        invoice.tbl_teachers?.fld_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.tbl_teachers?.fld_last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.fld_id.toString().includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || invoice.fld_status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  const handleStatusUpdate = async (invoiceId: number, newStatus: string) => {
    try {
      await updateStatus({ invoiceId, status: newStatus });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleSendEmail = async (teacherId: number, invoiceId: number) => {
    try {
      await sendEmail({ 
        teacherId, 
        invoiceId, 
        email: 'kontakt@clevercoach-nachhilfe.de', // Default email as in legacy
        type: 'payables'
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  const handleGenerateInvoices = (period: 'current' | 'previous') => {
    generateInvoices({ type: 'payables', period });
  };

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isZipping, setIsZipping] = useState(false);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelectedIds(new Set(filteredInvoices.map(i => i.fld_id)));
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleDownloadSelectedZip = async () => {
    if (selectedIds.size === 0) {
      return;
    }
    setIsZipping(true);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      for (const id of selectedIds) {
        try {
          const { filename, blob } = await generateTeacherInvoiceBlobById(id);
          zip.file(filename, blob);
        } catch (e) {
          console.error('Failed to generate invoice', id, e);
        }
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(zipBlob);
      a.download = `teacher_invoices_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch (e:any) {
      console.error(e);
    } finally {
      setIsZipping(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Pending': { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' },
      'Paid': { variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      'Overdue': { variant: 'destructive' as const, className: 'bg-red-100 text-red-800' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading payables...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">Payables</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="destructive"
            onClick={() => handleGenerateInvoices('previous')}
            disabled={isGenerating}
            size="sm"
            className="h-8 px-2 sm:px-3 whitespace-nowrap"
          >
            <Calendar className="h-4 w-4 mr-1.5 sm:mr-2" />
            <span className="hidden md:inline">Generate Previous Month Invoices</span>
            <span className="md:hidden">Prev Month</span>
          </Button>
          <Button
            onClick={() => handleGenerateInvoices('current')}
            disabled={isGenerating}
            size="sm"
            className="h-8 px-2 sm:px-3 whitespace-nowrap"
          >
            <FileText className="h-4 w-4 mr-1.5 sm:mr-2" />
            <span className="hidden md:inline">Generate Current Month Invoices</span>
            <span className="md:hidden">Current Month</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Payments</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(stats.totalAmount)}
                  </p>
                </div>
                <Euro className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalCount}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Paid</p>
                  <p className="text-2xl font-bold text-green-600">{stats.paidCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-primary">Teacher Invoices</CardTitle>
          <div className="flex items-center gap-2 ml-auto">
            <Button onClick={handleDownloadSelectedZip} disabled={isZipping || selectedIds.size === 0} size="sm" className="h-8 px-2 sm:px-3 whitespace-nowrap">
              <Download className="h-4 w-4 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">{isZipping ? 'Preparing ZIP...' : 'Download Selected (ZIP)'}</span>
              <span className="sm:hidden">ZIP</span>
            </Button>
            <Button onClick={selectAllVisible} size="sm" aria-label="Select All" title="Select All" className="h-8 w-8 p-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            </Button>
            <Button onClick={clearSelection} size="sm" aria-label="Clear Selection" title="Clear Selection" className="h-8 w-8 p-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by teacher name or invoice ID..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Invoices Cards */}
          <div className="space-y-2">
            {filteredInvoices.map((invoice) => {
              const initials = `${invoice.tbl_teachers?.fld_first_name?.[0] || ''}${invoice.tbl_teachers?.fld_last_name?.[0] || ''}`;
              
              return (
                <div 
                  key={invoice.fld_id}
                  className="bg-white rounded-lg shadow-sm border-l-4 border-l-primary hover:shadow-md transition-all duration-200 group cursor-pointer"
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left Section - Invoice Info */}
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {/* Select + Avatar */}
                        <input
                          type="checkbox"
                          checked={selectedIds.has(invoice.fld_id)}
                          onChange={() => toggleSelect(invoice.fld_id)}
                          className="h-4 w-4 accent-primary"
                        />
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm shadow-sm flex-shrink-0">
                          {initials}
                        </div>
                        
                        {/* Basic Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {invoice.tbl_teachers?.fld_first_name} {invoice.tbl_teachers?.fld_last_name}
                            </h3>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-sm px-2 py-1">
                              #{invoice.fld_id}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-500">
                            <span className="font-medium">Teacher Invoice</span>
                            <span>Due: {formatDate(invoice.fld_edate)}</span>
                            {invoice.fld_lhid && <span>Ref: {invoice.fld_lhid}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Amount + Actions Row (responsive) */}
                      <div className="flex w-full sm:w-auto items-center justify-between gap-3 sm:gap-4 mt-3 sm:mt-0">
                        {/* Amount */}
                        <div className="text-left sm:text-right">
                          <div className="text-xl sm:text-2xl font-bold text-red-600 leading-tight">
                            {formatCurrency(invoice.fld_invoice_total)}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 font-medium">Total</div>
                        </div>

                        {/* Status + Actions */}
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
                          {/* Status Badge */}
                          <div className="flex-shrink-0">
                            {getStatusBadge(invoice.fld_status)}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0"
                              asChild
                              aria-label="View invoice"
                              title="View"
                            >
                              <Link to={`/invoices/view/${invoice.fld_id}?type=payables`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0"
                              asChild
                              aria-label="Edit invoice"
                              title="Edit"
                            >
                              <Link to={`/invoices/edit/${invoice.fld_id}?type=payables`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0"
                              onClick={async () => {
                                try { await generateTeacherInvoiceById(invoice.fld_id); } catch (e) { console.error(e); }
                              }}
                              aria-label="Download PDF"
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0"
                              onClick={() => handleSendEmail(invoice.fld_tid, invoice.fld_id)}
                              disabled={isSendingEmail}
                              aria-label="Send email"
                              title="Send Email"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Select
                              value={invoice.fld_status}
                              onValueChange={(value) => handleStatusUpdate(invoice.fld_id, value)}
                            >
                              <SelectTrigger className="h-9 w-28 sm:w-24 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Paid">Paid</SelectItem>
                                <SelectItem value="Overdue">Overdue</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No invoices found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Payables;
