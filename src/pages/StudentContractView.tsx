import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStudentContracts } from '@/hooks/useStudentContracts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const StudentContractView = () => {
  const { encodedId } = useParams<{ encodedId: string }>();
  const {
    getContractForSigning,
    decodeContractLink,
    getSignatureUrl
  } = useStudentContracts();

  const [contractId, setContractId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: contract, isLoading, isError } = getContractForSigning(contractId!);

  useEffect(() => {
    if (encodedId) {
      try {
        const decodedId = decodeContractLink(encodedId);
        setContractId(decodedId);
      } catch (err) {
        setError('Invalid contract link');
        toast.error('Invalid contract link');
      }
    } else {
      setError('No contract ID provided');
      toast.error('No contract ID provided');
    }
  }, [encodedId, decodeContractLink]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || isError || !contract) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        <p>{error || 'Failed to load contract data'}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">Anmeldung für Privatunterricht</CardTitle>
          <p className="text-center text-gray-600 text-sm">Vertragspartner</p>
        </CardHeader>
        <CardContent>
          {/* Student Information */}
          <h2 className="text-xl font-bold mb-4">Vertragspartner</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="lastName">Nachname</Label>
              <Input id="lastName" value={contract.student.fld_last_name} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">Vorname</Label>
              <Input id="firstName" value={contract.student.fld_first_name} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Straße, Nr</Label>
              <Input id="address" value={contract.student.fld_address || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">PLZ</Label>
              <Input id="zip" value={contract.student.fld_zip || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Stadt</Label>
              <Input id="city" value={contract.student.fld_city || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Festnetz</Label>
              <Input id="phone" value={contract.student.fld_phone} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={contract.student.fld_email} disabled />
            </div>
          </div>

          {/* Student Details */}
          <h2 className="text-xl font-bold mb-4">Schüler/ Schülerin</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="sLastName">Name</Label>
              <Input id="sLastName" value={contract.student.fld_s_last_name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sFirstName">Name Schüler/ Schülerin</Label>
              <Input id="sFirstName" value={contract.student.fld_s_first_name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="learningMode">Art der Nachhilfe</Label>
              <Input id="learningMode" value={contract.fld_lp === 'Onsite' ? 'Präsenz' : contract.fld_lp} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school">Schulform</Label>
              <Input id="school" value={contract.student.fld_school || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Klasse</Label>
              <Input id="level" value={contract.student.fld_level || ''} disabled />
            </div>
          </div>

          {/* Contract Details */}
          <h2 className="text-xl font-bold mb-4">Abrechnungsmodell - Individuell</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="startDate">Startdatum</Label>
              <Input id="startDate" value={contract.fld_start_date} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Endtermin</Label>
              <Input id="endDate" value={contract.fld_end_date} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contractDuration">Vertragslaufzeit</Label>
              <Input id="contractDuration" value={`${contract.fld_ct} Monat(e)`} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minLessons">Mindeststunden im Monat</Label>
              <Input id="minLessons" value={contract.fld_min_lesson.toString()} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lessonDuration">Unterrichtsdauer</Label>
              <Input id="lessonDuration" value={contract.fld_lesson_dur} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="perLessonRate">Preis pro Einheit</Label>
              <Input id="perLessonRate" value={`${contract.fld_s_per_lesson_rate} €`} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="regFee">Anmeldegebühr</Label>
              <Input id="regFee" value={`${contract.fld_reg_fee} €`} disabled />
            </div>
          </div>

          {/* Payment Method */}
          {contract.fld_p_mode === 'Lastschrift' ? (
            <>
              <h2 className="text-xl font-bold mb-4">SEPA-Lastschriftmandat</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="accountHolder">Kontoinhaber</Label>
                  <Input id="accountHolder" value={contract.student.fld_payer || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank">Bankinstitut</Label>
                  <Input id="bank" value={contract.fld_bi || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iban">IBAN</Label>
                  <Input id="iban" value={contract.fld_iban || ''} disabled />
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-4">Zahlungsmethode</h2>
              <p className="text-sm mb-2">
                <strong>Rechnung:</strong> Sie erhalten die Rechnung monatlich per E-Mail zwischen dem 3. und 6. des Monats.
              </p>
              <div className="text-sm mb-4">
                <p><strong>Tav und Uzun GbR</strong></p>
                <p><strong>Bank Commerzbank Duisburg</strong></p>
                <p><strong>IBAN DE82350400380422117200</strong></p>
                <p><strong>BIC COBADEFFXXX</strong></p>
                <p><strong>Gläubiger-ID DE70ZZZ00002684542</strong></p>
              </div>
            </>
          )}

          {/* Signature Section */}
          <h2 className="text-xl font-bold mb-4">Bestätigung</h2>
          <div className="mb-6">
            <Label className="block mb-2">Unterschrift:</Label>
            {contract.fld_signature ? (
              <div className="border border-gray-300 rounded-md p-4">
                <img 
                  src={getSignatureUrl(contract.fld_signature)} 
                  alt="Student Signature" 
                  className="max-w-full h-auto"
                />
              </div>
            ) : (
              <p className="text-gray-500">No signature available</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="cityDate">Ort</Label>
              <Input id="cityDate" value={contract.student.fld_city || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Datum</Label>
              <Input 
                id="date" 
                value={contract.fld_edtim ? new Date(contract.fld_edtim).toLocaleDateString('de-DE') : ''} 
                disabled 
              />
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Ich bestätige die Richtigkeit meiner Angaben und erkläre, dass ich wirtschaftlich in der Lage bin, 
            die vereinbarten Unterrichtsgebühren fristgerecht zu begleichen. Die Vertragsbedingungen sowie die 
            Allgemeinen Geschäftsbedingungen (AGB) und Datenschutzbestimmungen wurden mir erläutert. Ich habe sie 
            verstanden und erkenne sie verbindlich an. Die AGB enthalten unter anderem Regelungen zur Kündigung, 
            Pausierung sowie zur Einhaltung der vertraglich vereinbarten Mindeststunden. Sie sind jederzeit einsehbar 
            unter: www.clevercoach-nachhilfe.de. Mir ist bekannt, dass sich der Vertrag bei Nicht - Kündigung jeweils 
            automatisch um einen weiteren Monat verlängert.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentContractView;
