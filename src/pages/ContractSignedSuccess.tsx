import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, Home } from 'lucide-react';

const ContractSignedSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="max-w-lg mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mx-auto mb-6 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Contract Signed Successfully!
          </h1>
          
          <p className="text-gray-600 mb-8 text-lg">
            Welcome to the CleverCoach team. We're excited to have you on board.
          </p>

          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Mail className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-800">Next Steps</h2>
            </div>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Check your email for login credentials</p>
              <p>• Your account is now active in our system</p>
              <p>• You'll receive student assignments soon</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90"
            >
              <Home className="h-4 w-4" />
              Go to Homepage
            </Button>
            <Button
              variant="outline"
              onClick={() => window.close()}
              className="border-gray-300"
            >
              Close Window
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractSignedSuccess;
