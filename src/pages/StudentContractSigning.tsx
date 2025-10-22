import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudentContracts } from '@/hooks/useStudentContracts';
import SignaturePadComponent from '@/components/SignaturePad';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const StudentContractSigning = () => {
  const { encodedId } = useParams<{ encodedId: string }>();
  const navigate = useNavigate();
  const {
    getContractForSigning,
    signContractMutation,
    decodeContractLink
  } = useStudentContracts();

  const [contractId, setContractId] = useState<number | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [bankDetails, setBankDetails] = useState({
    fld_bi: '',
    fld_iban: '',
    fld_bic: ''
  });
  const [error, setError] = useState<string | null>(null);

  const { data: contract, isLoading, isError } = getContractForSigning(contractId!);
  const { mutate: signContract, isPending: isSigningContract } = signContractMutation;

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

  const handleSignContract = () => {
    if (!contractId || !signatureData) {
      toast.error('Please provide a signature');
      return;
    }

    if (contract?.fld_p_mode === 'Lastschrift' && (!bankDetails.fld_bi || !bankDetails.fld_iban)) {
      toast.error('Please provide bank details for SEPA mandate');
      return;
    }

    signContract({ 
      contractId, 
      signatureData, 
      bankDetails: contract?.fld_p_mode === 'Lastschrift' ? bankDetails : undefined 
    }, {
      onSuccess: () => {
        navigate('/student-contract-success');
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
  };

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
              <p className="text-sm mb-4">
                Hiermit ermächtige ich den Zahlungsempfänger, Zahlungen von meinem Konto mittels Lastschrift einzuziehen. 
                Zugleich weise ich mein Kreditinstitut an, die auf mein Konto gezogenen Lastschriften einzulösen.
              </p>
              <p className="text-sm mb-4">
                Hinweis: Ich kann innerhalb von acht Wochen, beginnend mit dem Belastungsdatum, die Erstattung des belasteten Betrags verlangen. 
                Es gelten dabei die mit meinem Kreditinstitut vereinbarten Bedingungen.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="accountHolder">Kontoinhaber</Label>
                  <Input 
                    id="accountHolder" 
                    value={contract.student.fld_payer || ''} 
                    disabled 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank">Bankinstitut</Label>
                  <Input 
                    id="bank" 
                    value={bankDetails.fld_bi}
                    onChange={(e) => setBankDetails(prev => ({ ...prev, fld_bi: e.target.value }))}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iban">IBAN (22 Zeichen)</Label>
                  <Input 
                    id="iban" 
                    value={bankDetails.fld_iban}
                    onChange={(e) => setBankDetails(prev => ({ ...prev, fld_iban: e.target.value }))}
                    maxLength={22}
                    pattern="[a-zA-Z0-9]{22}"
                    required 
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-4">Zahlungsmethode</h2>
              <p className="text-sm mb-2">
                <strong>Rechnung:</strong> Sie erhalten die Rechnung monatlich per E-Mail zwischen dem 3. und 6. des Monats.
              </p>
              <p className="text-sm mb-2">
                Ich stimme zu, die Zahlungen gemäß den vereinbarten Zahlungsbedingungen zu leisten. 
                Die bevorzugte Zahlungsmethode ist per Rechnung. Ich verpflichte mich, alle Rechnungsbeträge innerhalb der vereinbarten Frist von 14 Tagen zu begleichen.
              </p>
              <p className="text-sm mb-4">Ich werde die Zahlung auf folgendes Bankkonto überweisen:</p>
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
            <SignaturePadComponent 
              onSignatureChange={setSignatureData} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="cityDate">Ort</Label>
              <Input id="cityDate" value={contract.student.fld_city || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Datum</Label>
              <Input id="date" value={new Date().toLocaleDateString('de-DE')} disabled />
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

          <Button
            onClick={handleSignContract}
            disabled={isSigningContract || !signatureData}
            className="w-full"
          >
            {isSigningContract ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Einreichen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentContractSigning;
