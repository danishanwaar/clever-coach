import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { DollarSign, Search, Filter, Download, Eye, Calendar, TrendingUp, FileText } from 'lucide-react';

interface Invoice {
  fld_id: number;
  fld_edate: string;
  fld_invoice_total: number;
  fld_status: string;
  fld_notes?: string;
  details: Array<{
    fld_lesson: number;
    fld_t_rate: number;
    fld_l_date: string;
    fld_my: string;
  }>;
}

interface FinancialSummary {
  totalInvoices: number;
  totalEarnings: number;
  paidAmount: number;
  pendingAmount: number;
  averageMonthlyEarnings: number;
}

export default function TeacherFinancials() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Fetch teacher's financial data
  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ['teacherInvoices', user?.fld_id, yearFilter],
    queryFn: async () => {
      if (!user?.fld_id) throw new Error('User not authenticated');

      // Get teacher ID
      const { data: teacher, error: teacherError } = await supabase
        .from('tbl_teachers')
        .select('fld_id')
        .eq('fld_uid', user.fld_id)
        .single();

      if (teacherError) throw teacherError;

      // Get invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('tbl_teachers_invoices')
        .select(`
          fld_id,
          fld_edate,
          fld_invoice_total,
          fld_status,
          fld_notes
        `)
        .eq('fld_tid', teacher.fld_id)
        .order('fld_edate', { ascending: false }) as any;

      if (invoicesError) throw invoicesError;

      // Get invoice details for each invoice
      const invoicesWithDetails = await Promise.all(
        invoicesData?.map(async (invoice) => {
          const { data: details } = await supabase
            .from('tbl_teachers_invoices_detail')
            .select(`
              fld_lesson,
              fld_t_rate,
              fld_l_date,
              fld_my
            `)
            .eq('fld_iid', invoice.fld_id);

          return {
            ...invoice,
            details: details || []
          };
        }) || []
      );

      return invoicesWithDetails;
    },
    enabled: !!user?.fld_id
  });

  // Calculate financial summary
  const financialSummary: FinancialSummary = React.useMemo(() => {
    if (!invoices) {
      return {
        totalInvoices: 0,
        totalEarnings: 0,
        paidAmount: 0,
        pendingAmount: 0,
        averageMonthlyEarnings: 0
      };
    }

    const totalInvoices = invoices.length;
    const totalEarnings = invoices.reduce((sum, invoice) => sum + invoice.fld_invoice_total, 0);
    const paidAmount = invoices
      .filter(invoice => invoice.fld_status === 'Paid')
      .reduce((sum, invoice) => sum + invoice.fld_invoice_total, 0);
    const pendingAmount = invoices
      .filter(invoice => invoice.fld_status === 'Pending')
      .reduce((sum, invoice) => sum + invoice.fld_invoice_total, 0);

    // Calculate average monthly earnings
    const monthlyEarnings = new Map();
    invoices.forEach(invoice => {
      const month = new Date(invoice.fld_edate).getMonth();
      const current = monthlyEarnings.get(month) || 0;
      monthlyEarnings.set(month, current + invoice.fld_invoice_total);
    });
    const averageMonthlyEarnings = monthlyEarnings.size > 0 
      ? Array.from(monthlyEarnings.values()).reduce((sum, amount) => sum + amount, 0) / monthlyEarnings.size
      : 0;

    return {
      totalInvoices,
      totalEarnings,
      paidAmount,
      pendingAmount,
      averageMonthlyEarnings
    };
  }, [invoices]);

  const filteredInvoices = invoices?.filter(invoice => {
    const matchesSearch = 
      invoice.fld_id.toString().includes(searchTerm.toLowerCase()) ||
      invoice.fld_status.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.fld_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'default';
      case 'Pending':
        return 'secondary';
      case 'Overdue':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      // This would typically generate a PDF invoice
      toast.success('Invoice download started');
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

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
        <h1 className="text-3xl font-bold">Financial Overview</h1>
        <p className="text-muted-foreground">
          Track your earnings, invoices, and payment history
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold">{financialSummary.totalInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold">€{financialSummary.totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paid Amount</p>
                <p className="text-2xl font-bold">€{financialSummary.paidAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                <p className="text-2xl font-bold">€{financialSummary.pendingAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices?.map((invoice) => (
                <TableRow key={invoice.fld_id}>
                  <TableCell className="font-medium">#{invoice.fld_id}</TableCell>
                  <TableCell>{new Date(invoice.fld_edate).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">€{invoice.fld_invoice_total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(invoice.fld_status)}>
                      {invoice.fld_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {invoice.fld_status === 'Paid' ? 'Paid' : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedInvoice(invoice)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Invoice Details - #{selectedInvoice?.fld_id}</DialogTitle>
                          </DialogHeader>
                          {selectedInvoice && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-semibold">Invoice Number</p>
                                  <p className="text-sm text-gray-600">#{selectedInvoice.fld_id}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold">Invoice Date</p>
                                  <p className="text-sm text-gray-600">
                                    {new Date(selectedInvoice.fld_edate).toLocaleDateString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold">Total Amount</p>
                                  <p className="text-sm text-gray-600">€{selectedInvoice.fld_invoice_total.toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold">Status</p>
                                  <Badge variant={getStatusColor(selectedInvoice.fld_status)}>
                                    {selectedInvoice.fld_status}
                                  </Badge>
                                </div>
                              </div>
                              
                              {selectedInvoice.details.length > 0 && (
                                <div>
                                  <p className="text-sm font-semibold mb-2">Invoice Details</p>
                                  <div className="space-y-2">
                                    {selectedInvoice.details.map((detail, index) => (
                                      <div key={index} className="flex justify-between items-center p-2 border rounded">
                                        <div>
                                          <p className="text-sm font-medium">
                                            {detail.fld_my}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {detail.fld_lesson} hours @ €{detail.fld_t_rate}/hour
                                          </p>
                                        </div>
                                        <p className="text-sm font-medium">
                                          €{(detail.fld_lesson * detail.fld_t_rate).toFixed(2)}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {selectedInvoice.fld_notes && (
                                <div>
                                  <p className="text-sm font-semibold">Notes</p>
                                  <p className="text-sm text-gray-600">{selectedInvoice.fld_notes}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadInvoice(invoice)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredInvoices?.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No invoices have been generated yet.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
