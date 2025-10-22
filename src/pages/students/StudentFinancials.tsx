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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Student Financials</h1>
          <p className="text-gray-600">
            Financial overview for {student.fld_first_name} {student.fld_last_name}
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Invoices */}
        <Card className="bg-gray-50 hover:bg-gray-100 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gray-200 rounded-full">
                <Receipt className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {stats?.totalInvoices || 0}
                </div>
                <div className="text-sm font-medium text-gray-600">Total Invoices</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paid Amount */}
        <Card className="bg-green-50 hover:bg-green-100 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-200 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  €{Math.round(stats?.totalPaid || 0)}
                </div>
                <div className="text-sm font-medium text-gray-600">Paid</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unpaid Amount */}
        <Card className="bg-red-50 hover:bg-red-100 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-200 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  €{Math.round(stats?.totalUnpaid || 0)}
                </div>
                <div className="text-sm font-medium text-gray-600">Unpaid</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invoices</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Invoice</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">References</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Total Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Paid On</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.fld_id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{invoice.fld_id}</td>
                      <td className="py-3 px-4 text-gray-600">{invoice.fld_lhid || '-'}</td>
                      <td className="py-3 px-4 text-red-600 font-medium">
                        €{Math.round(invoice.fld_invoice_total)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDate(invoice.fld_edate)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(invoice.fld_status)}>
                          {invoice.fld_status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewInvoice(invoice.fld_id)}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadInvoice(invoice.fld_id)}
                            className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'No invoices match your search criteria.' : 'This student has no invoices yet.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}




