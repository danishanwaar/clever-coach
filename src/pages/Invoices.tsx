import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, Users, GraduationCap } from 'lucide-react';

const Invoices = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Invoice Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Teacher Invoice */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Teacher Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Create invoices for teachers to track payments and lesson compensation.
            </p>
            <div className="flex gap-2">
              <Link to="/invoices/create-teacher">
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Teacher Invoice
                </Button>
              </Link>
              <Link to="/payables">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  View Teacher Invoices
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Create Student Invoice */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Student Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Create invoices for students to track tuition payments and lesson charges.
            </p>
            <div className="flex gap-2">
              <Link to="/invoices/create-student">
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Student Invoice
                </Button>
              </Link>
              <Link to="/receivables">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  View Student Invoices
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">€0</div>
              <p className="text-sm text-gray-600">Total Teacher Payments</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">€0</div>
              <p className="text-sm text-gray-600">Total Student Revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">0</div>
              <p className="text-sm text-gray-600">Pending Invoices</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <p className="text-sm text-gray-600">Paid Invoices</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
