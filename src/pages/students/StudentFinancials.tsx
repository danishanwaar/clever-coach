import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useStudentFinancials } from '@/hooks/useStudentFinancials';
import { useStudent } from '@/hooks/useStudents';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  FileText, 
  Euro, 
  Search, 
  Download, 
  Eye,
  Receipt,
  TrendingUp,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { generateStudentInvoiceById } from '@/utils/invoicePdf';

export default function StudentFinancials() {
  const { id } = useParams<{ id: string }>();
  const studentId = parseInt(id || '0');
  const { data: student, isLoading: studentLoading } = useStudent(studentId);
  
  const {
    invoices,
    stats,
    isLoading,
  } = useStudentFinancials(studentId);

  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  // Memoized filter for better performance
  const filteredInvoices = useMemo(() => {
    if (!searchTerm) return invoices;
    
    const lowerSearch = searchTerm.toLowerCase();
    return invoices.filter(invoice => 
      invoice.fld_id.toString().includes(lowerSearch) ||
      (invoice.fld_lhid && invoice.fld_lhid.toLowerCase().includes(lowerSearch)) ||
      invoice.fld_invoice_total.toString().includes(lowerSearch)
    );
  }, [invoices, searchTerm]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd-MMM-yy');
  };

  const formatCurrency = (amount: number) => {
    return `€${amount.toFixed(2)}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Paid': { variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      'Active': { variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800' },
      'Suspended': { variant: 'outline' as const, className: 'bg-yellow-100 text-yellow-800' },
      'Deleted': { variant: 'destructive' as const, className: 'bg-red-100 text-red-800' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Active;
    
    return (
      <Badge variant={config.variant} className={`${config.className} text-xs font-medium`}>
        {status}
      </Badge>
    );
  };

  const handleViewInvoice = (invoiceId: number) => {
    // Navigate to invoice view page
    window.open(`/invoices/view/${invoiceId}?type=receivables`, '_blank');
  };

  const handleDownloadInvoice = async (invoiceId: number) => {
    try {
      setDownloadingId(invoiceId);
      await generateStudentInvoiceById(invoiceId);
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Failed to download invoice:', error);
      toast.error('Failed to download invoice. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  if (studentLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4" />
          <span>Student not found</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
      <div className="space-y-4 sm:space-y-6">
        {/* Header with Stats */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-6">
          {/* Header - Left Side */}
          <div className="space-y-1 flex-1">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">Financial Overview</h2>
            <p className="text-xs sm:text-sm text-gray-600">
              {student ? `${student.fld_first_name} ${student.fld_last_name}` : 'Manage student invoices and payments'}
            </p>
          </div>
          
          {/* Statistics Cards - Right Side */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 lg:flex-shrink-0 w-full sm:w-auto">
            {/* Total Invoices */}
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-300 border border-gray-200 shadow-sm hover:shadow-md min-w-[140px] sm:min-w-[160px] lg:min-w-[180px]">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="text-xs font-medium text-gray-600 mb-0.5 truncate">Total Invoices</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 break-words whitespace-normal">
                      {stats?.totalInvoices || 0}
                    </p>
                  </div>
                  <div className="p-2 bg-gray-200 rounded-full shadow-sm flex-shrink-0">
                    <Receipt className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Paid Amount */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-300 border border-green-200 shadow-sm hover:shadow-md min-w-[140px] sm:min-w-[160px] lg:min-w-[180px]">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="text-xs font-medium text-gray-600 mb-0.5 truncate">Paid</p>
                    <p className="text-lg sm:text-xl font-bold text-green-700 break-words whitespace-normal">
                      {formatCurrency(stats?.totalPaid || 0)}
                    </p>
                  </div>
                  <div className="p-2 bg-green-200 rounded-full shadow-sm flex-shrink-0">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Unpaid Amount */}
            <Card className="bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 transition-all duration-300 border border-red-200 shadow-sm hover:shadow-md min-w-[140px] sm:min-w-[160px] lg:min-w-[180px]">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="text-xs font-medium text-gray-600 mb-0.5 truncate">Unpaid</p>
                    <p className="text-lg sm:text-xl font-bold text-red-700 break-words whitespace-normal">
                      {formatCurrency(stats?.totalUnpaid || 0)}
                    </p>
                  </div>
                  <div className="p-2 bg-red-200 rounded-full shadow-sm flex-shrink-0">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-3 sm:p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by invoice ID, reference, or amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 sm:pl-12 border-gray-300 focus:border-primary focus:ring-primary/20 text-sm sm:text-base h-10 sm:h-11"
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoices Cards */}
        <div className="space-y-3 sm:space-y-4">
          {filteredInvoices.length > 0 ? (
            filteredInvoices.map((invoice) => (
              <Card 
                key={invoice.fld_id}
                className="bg-white rounded-lg shadow-sm border-l-4 border-l-primary hover:shadow-lg transition-all duration-200 group"
              >
                <CardContent className="p-4 sm:p-5 lg:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left Section - Invoice Info */}
                    <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                      {/* Invoice Icon */}
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary shadow-sm flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Receipt className="h-6 w-6 sm:h-7 sm:w-7" />
                      </div>
                      
                      {/* Invoice Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                          <h3 className="font-semibold text-base sm:text-lg text-gray-900">
                            Invoice #{invoice.fld_id}
                          </h3>
                          {getStatusBadge(invoice.fld_status)}
                        </div>
                        
                        {/* Invoice Info - Improved layout */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-600">
                          <div className="flex items-center">
                            <Euro className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 text-gray-400 flex-shrink-0" />
                            <span className="font-semibold text-red-600 text-sm sm:text-base">
                              {formatCurrency(invoice.fld_invoice_total)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{invoice.fld_lhid || 'No reference'}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{formatDate(invoice.fld_edate)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions Row - Improved layout */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewInvoice(invoice.fld_id)}
                        className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors flex-1 sm:flex-initial min-w-[90px]"
                      >
                        <Eye className="h-4 w-4 mr-1.5 sm:mr-2" />
                        <span>View</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoice(invoice.fld_id)}
                        disabled={downloadingId === invoice.fld_id}
                        className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-colors flex-1 sm:flex-initial min-w-[110px] disabled:opacity-50"
                      >
                        {downloadingId === invoice.fld_id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-1.5 sm:mr-2"></div>
                            <span>Downloading...</span>
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-1.5 sm:mr-2" />
                            <span>Download</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="p-8 sm:p-12 lg:p-16 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900 mb-2">
                  No invoices found
                </h3>
                <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
                  {searchTerm 
                    ? 'No invoices match your search criteria. Try adjusting your search terms.' 
                    : 'This student has no invoices yet.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}




