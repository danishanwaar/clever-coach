import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStudentFinancials } from '@/hooks/useStudentFinancials';
import { useStudent } from '@/hooks/useStudents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Euro, 
  Search, 
  Download, 
  Eye,
  Receipt,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

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

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(invoice => 
    invoice.fld_id.toString().includes(searchTerm) ||
    (invoice.fld_lhid && invoice.fld_lhid.includes(searchTerm)) ||
    invoice.fld_invoice_total.toString().includes(searchTerm)
  );

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd-MMM-yy');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Active':
        return 'bg-blue-100 text-blue-800';
      case 'Suspended':
        return 'bg-yellow-100 text-yellow-800';
      case 'Deleted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewInvoice = (invoiceId: number) => {
    // TODO: Implement view invoice functionality
    console.log('View invoice:', invoiceId);
  };

  const handleDownloadInvoice = (invoiceId: number) => {
    // TODO: Implement download invoice functionality
    console.log('Download invoice:', invoiceId);
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-lg sm:text-xl font-semibold text-primary">Financial Overview</h2>
        <p className="text-xs sm:text-sm text-gray-600">Manage student invoices and payments</p>
      </div>
      {/* Statistics Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6">
        {/* Total Invoices */}
        <Card className="bg-gray-50 hover:bg-gray-100 transition-colors">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-gray-200 rounded-full">
                <Receipt className="h-4 w-4 sm:h-6 sm:w-6 text-gray-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <div className="text-lg sm:text-2xl font-bold text-gray-900">
                  {stats?.totalInvoices || 0}
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">Total Invoices</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paid Amount */}
        <Card className="bg-green-50 hover:bg-green-100 transition-colors">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-green-200 rounded-full">
                <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <div className="text-lg sm:text-2xl font-bold text-gray-900">
                  €{Math.round(stats?.totalPaid || 0)}
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">Paid</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unpaid Amount */}
        <Card className="bg-red-50 hover:bg-red-100 transition-colors">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-red-200 rounded-full">
                <AlertCircle className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <div className="text-lg sm:text-2xl font-bold text-gray-900">
                  €{Math.round(stats?.totalUnpaid || 0)}
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">Unpaid</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-300 focus:border-primary focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Invoices Cards */}
      <div className="space-y-4">
        {filteredInvoices.length > 0 ? (
          filteredInvoices.map((invoice) => (
            <div 
              key={invoice.fld_id}
              className="bg-white rounded-lg shadow-sm border-l-4 border-l-primary hover:shadow-md transition-all duration-200 group"
            >
              <div className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                  {/* Left Section - Invoice Info */}
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    {/* Invoice Icon */}
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm shadow-sm flex-shrink-0">
                      <Receipt className="h-5 w-5" />
                    </div>
                    
                    {/* Invoice Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-sm sm:text-base text-gray-900">
                          Invoice #{invoice.fld_id}
                        </h3>
                        <Badge className={`${getStatusColor(invoice.fld_status)} text-xs font-medium self-start sm:self-auto`}>
                          {invoice.fld_status}
                        </Badge>
                      </div>
                      
                      {/* Invoice Info */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Euro className="h-3 w-3 mr-2 text-gray-400 flex-shrink-0" />
                          <span className="font-medium text-red-600">€{Math.round(invoice.fld_invoice_total)}</span>
                        </div>
                        <div className="flex items-center">
                          <FileText className="h-3 w-3 mr-2 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{invoice.fld_lhid || 'No reference'}</span>
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="h-3 w-3 mr-2 text-gray-400 flex-shrink-0" />
                          <span className="truncate">Paid: {formatDate(invoice.fld_edate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex items-center justify-end sm:justify-start space-x-2 flex-shrink-0 sm:self-start">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewInvoice(invoice.fld_id)}
                      className="h-8 px-3 text-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice.fld_id)}
                      className="h-8 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'No invoices match your search criteria.' : 'This student has no invoices yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}




