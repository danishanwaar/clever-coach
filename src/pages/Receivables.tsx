import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStudentInvoices, formatDate, formatCurrency } from '@/hooks/useInvoiceManagement';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

const Receivables = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const {
    invoices,
    stats,
    isLoading,
    updateStatus,
    sendEmail,
    isUpdating,
    isSendingEmail,
  } = useStudentInvoices();

  // Filter invoices based on search and status
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch = searchTerm === '' || 
        invoice.tbl_students?.fld_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.tbl_students?.fld_last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const handleSendEmail = async (studentId: number, invoiceId: number) => {
    try {
      await sendEmail({ 
        studentId, 
        invoiceId, 
        email: 'kontakt@clevercoach-nachhilfe.de' // Default email as in legacy
      });
    } catch (error) {
      console.error('Failed to send email:', error);
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
          <div className="text-lg">Loading receivables...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Receivables</h1>
        <div className="flex gap-2">
          <Link to="/invoices/create-student">
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Student Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.totalAmount)}
                  </p>
                </div>
                <Euro className="h-8 w-8 text-green-600" />
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
        <CardHeader>
          <CardTitle>Student Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by student name or invoice ID..."
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

          {/* Invoices Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice & Student</TableHead>
                  <TableHead>References</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Paid On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.fld_id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          {invoice.fld_id}
                        </Badge>
                        <Badge variant="default" className="bg-blue-100 text-blue-800">
                          {invoice.tbl_students?.fld_first_name} {invoice.tbl_students?.fld_last_name}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{invoice.fld_lhid}</TableCell>
                    <TableCell className="text-red-600 font-semibold">
                      {formatCurrency(invoice.fld_invoice_total)}
                    </TableCell>
                    <TableCell>{formatDate(invoice.fld_edate)}</TableCell>
                    <TableCell>
                      {getStatusBadge(invoice.fld_status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link to={`/invoices/view/${invoice.fld_id}?type=receivables`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link to={`/invoices/edit/${invoice.fld_id}?type=receivables`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link to={`/invoices/download/${invoice.fld_id}?type=receivables`} target="_blank">
                            <Download className="h-4 w-4" />
                          </Link>
                        </Button>
                        {invoice.fld_i_type === 'Normal' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isSendingEmail}
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Send Email</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to send this invoice via email to the student?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleSendEmail(invoice.fld_sid, invoice.fld_id)}
                                >
                                  Send Email
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        <Select
                          value={invoice.fld_status}
                          onValueChange={(value) => handleStatusUpdate(invoice.fld_id, value)}
                        >
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Paid">Paid</SelectItem>
                            <SelectItem value="Overdue">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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

export default Receivables;
