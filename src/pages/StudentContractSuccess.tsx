import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

const StudentContractSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md text-center p-8 shadow-lg rounded-lg">
        <CheckCircle2 className="h-24 w-24 text-green-500 mx-auto mb-6" />
        <CardTitle className="text-3xl font-bold text-gray-800 mb-4">
          Vertrag erfolgreich unterzeichnet!
        </CardTitle>
        <CardContent className="text-gray-600 mb-8">
          <p className="mb-4">
            Vielen Dank für die Unterzeichnung Ihres Vertrags. Sie sind nun ein offizieller Kunde von CleverCoach Nachhilfe!
          </p>
          <p className="mb-4">
            Eine Bestätigungs-E-Mail mit einer Kopie Ihres unterschriebenen Vertrags wurde an Sie gesendet.
          </p>
          <p className="text-sm">
            Sollten Sie Fragen haben oder weitere Unterstützung benötigen, können Sie uns jederzeit kontaktieren.
          </p>
        </CardContent>
        <Button onClick={() => navigate('/')} className="w-full">
          Zur Startseite
        </Button>
      </Card>
    </div>
  );
};

export default StudentContractSuccess;
