import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudentContracts } from '@/hooks/useStudentContracts';
import SignaturePadComponent from '@/components/SignaturePad';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, AlertCircle, User, FileText, Calendar, Euro, CreditCard } from 'lucide-react';
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

  // Initialize bank details from student data when contract loads
  useEffect(() => {
    if (contract?.student) {
      setBankDetails({
        fld_bi: contract.student.fld_bank_name || '',
        fld_iban: contract.student.fld_bank_act || '',
      });
    }
  }, [contract]);

  const handleSignContract = () => {
    if (!contractId || !signatureData) {
      toast.error('Bitte geben Sie eine Unterschrift ein');
      return;
    }

    if (contract?.fld_p_mode === 'Lastschrift') {
      if (!bankDetails.fld_bi || !bankDetails.fld_iban) {
        toast.error('Bitte geben Sie Bankdaten für das SEPA-Lastschriftmandat ein');
        return;
      }
      if (bankDetails.fld_iban.length !== 22) {
        toast.error('IBAN muss genau 22 Zeichen lang sein');
        return;
      }
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Vertrag wird geladen...</p>
        </div>
      </div>
    );
  }

  if (error || isError || !contract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Vertrag nicht verfügbar</h2>
          <p className="text-muted-foreground mb-4">{error || 'Fehler beim Laden der Vertragsdaten'}</p>
          <Button onClick={() => navigate('/')}>Zur Startseite</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-primary text-white p-8 rounded-t-xl mb-0 shadow-xl">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              Anmeldung für Privatunterricht
            </h1>
            <div className="w-20 h-1 bg-white/30 rounded-full mb-4"></div>
            <div className="text-white/90 text-sm sm:text-base leading-relaxed">
              <p className="font-semibold mb-2">CleverCoach - Nachhilfe</p>
              <p>Höschenhofweg 31, 47249 Duisburg</p>
              <p className="mt-2">Telefon: 0203 39652097 | E-Mail: kontakt@clevercoach-nachhilfe.de</p>
            </div>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSignContract(); }} className="space-y-0">
          {/* Contract Partner Section */}
          <div className="bg-white border border-gray-200 border-t-0 rounded-b-xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Vertragspartner</h2>
                <p className="text-sm text-gray-600">Angaben zur Vertragspartei</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700 mb-2 block">Nachname</Label>
                  <Input
                    id="lastName"
                    value={contract.student.fld_last_name}
                    disabled
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="address" className="text-sm font-semibold text-gray-700 mb-2 block">Straße, Nr</Label>
                  <Input
                    id="address"
                    value={contract.student.fld_address || ''}
                    disabled
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="city" className="text-sm font-semibold text-gray-700 mb-2 block">Stadt</Label>
                  <Input
                    id="city"
                    value={contract.student.fld_city || ''}
                    disabled
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 mb-2 block">Festnetz</Label>
                  <Input
                    id="phone"
                    value={contract.student.fld_phone || 'N/A'}
                    disabled
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700 mb-2 block">Vorname</Label>
                  <Input
                    id="firstName"
                    value={contract.student.fld_first_name}
                    disabled
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="zip" className="text-sm font-semibold text-gray-700 mb-2 block">PLZ</Label>
                  <Input
                    id="zip"
                    value={contract.student.fld_zip || ''}
                    disabled
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="mobile" className="text-sm font-semibold text-gray-700 mb-2 block">Mobil</Label>
                  <Input
                    id="mobile"
                    value={contract.student.fld_mobile || ''}
                    disabled
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">E-Mail</Label>
                  <Input
                    id="email"
                    value={contract.student.fld_email}
                    disabled
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Student Section */}
          <div className="bg-white border border-gray-200 p-8 space-y-6 shadow-lg rounded-xl mt-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Schüler/ Schülerin</h2>
                <p className="text-sm text-gray-600">Angaben zum Schüler/ zur Schülerin</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="sLastName" className="text-sm font-semibold text-gray-700 mb-2 block">Name</Label>
                <Input
                  id="sLastName"
                  value={contract.student.fld_s_last_name || ''}
                  disabled
                  className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                />
              </div>
              <div>
                <Label htmlFor="sFirstName" className="text-sm font-semibold text-gray-700 mb-2 block">Name Schüler/ Schülerin</Label>
                <Input
                  id="sFirstName"
                  value={contract.student.fld_s_first_name || ''}
                  disabled
                  className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                />
              </div>
              <div>
                <Label htmlFor="learningMode" className="text-sm font-semibold text-gray-700 mb-2 block">Art der Nachhilfe</Label>
                <Input
                  id="learningMode"
                  value={contract.fld_lp === 'Onsite' ? 'Präsenz' : contract.fld_lp}
                  disabled
                  className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                />
              </div>
              <div>
                <Label htmlFor="school" className="text-sm font-semibold text-gray-700 mb-2 block">Schulform</Label>
                <Input
                  id="school"
                  value={contract.student.fld_school || ''}
                  disabled
                  className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                />
              </div>
              <div>
                <Label htmlFor="level" className="text-sm font-semibold text-gray-700 mb-2 block">Klasse</Label>
                <Input
                  id="level"
                  value={contract.student.fld_level || ''}
                  disabled
                  className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Individual Billing Model Section */}
          <div className="bg-white border border-gray-200 p-8 space-y-6 shadow-lg rounded-xl mt-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Euro className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Abrechnungsmodell - Individuell</h2>
                <p className="text-sm text-gray-600">Vertragsbedingungen und Gebühren</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="startDate" className="text-sm font-semibold text-gray-700 mb-2 block">Startdatum</Label>
                <Input
                  id="startDate"
                  value={formatDate(contract.fld_start_date)}
                  disabled
                  className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-sm font-semibold text-gray-700 mb-2 block">Endtermin</Label>
                <Input
                  id="endDate"
                  value={formatDate(contract.fld_end_date)}
                  disabled
                  className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                />
              </div>
              <div>
                <Label htmlFor="contractDuration" className="text-sm font-semibold text-gray-700 mb-2 block">Mindestvertragslaufzeit</Label>
                <Input
                  id="contractDuration"
                  value={`${contract.fld_ct} Monat(e)`}
                  disabled
                  className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                />
              </div>
              <div>
                <Label htmlFor="minLessons" className="text-sm font-semibold text-gray-700 mb-2 block">Mindeststunden im Monat</Label>
                <Input
                  id="minLessons"
                  value={contract.fld_min_lesson.toString()}
                  disabled
                  className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                />
              </div>
              <div>
                <Label htmlFor="lessonDuration" className="text-sm font-semibold text-gray-700 mb-2 block">Unterrichtsdauer</Label>
                <Input
                  id="lessonDuration"
                  value={contract.fld_lesson_dur}
                  disabled
                  className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                />
              </div>
              <div>
                <Label htmlFor="perLessonRate" className="text-sm font-semibold text-gray-700 mb-2 block">Preis pro Einheit</Label>
                <Input
                  id="perLessonRate"
                  value={`${contract.fld_s_per_lesson_rate.toFixed(2)} €`}
                  disabled
                  className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                />
              </div>
              <div>
                <Label htmlFor="regFee" className="text-sm font-semibold text-gray-700 mb-2 block">Einmalige Anmeldegebühr</Label>
                <Input
                  id="regFee"
                  value={`${contract.fld_reg_fee.toFixed(2)} €`}
                  disabled
                  className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Section */}
          {contract.fld_p_mode === 'Lastschrift' ? (
            <div className="bg-white border border-gray-200 p-8 space-y-6 shadow-lg rounded-xl mt-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">SEPA-Lastschriftmandat</h2>
                  <p className="text-sm text-gray-600">Bankverbindung für Lastschrift</p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-300 mb-6">
                <p className="text-sm text-gray-700 mb-2">
                  Hiermit ermächtige ich den Zahlungsempfänger, Zahlungen von meinem Konto mittels Lastschrift einzuziehen. 
                  Zugleich weise ich mein Kreditinstitut an, die auf mein Konto gezogenen Lastschriften einzulösen.
                </p>
                <p className="text-sm text-gray-700">
                  Hinweis: Ich kann innerhalb von acht Wochen, beginnend mit dem Belastungsdatum, die Erstattung des belasteten Betrags verlangen. 
                  Es gelten dabei die mit meinem Kreditinstitut vereinbarten Bedingungen.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="accountHolder" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Kontoinhaber <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="accountHolder"
                    value={contract.student.fld_payer || ''}
                    disabled
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="bank" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Bankinstitut <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="bank"
                    value={bankDetails.fld_bi}
                    onChange={(e) => setBankDetails(prev => ({ ...prev, fld_bi: e.target.value }))}
                    required
                    className="border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="z.B. Targobank"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="iban" className="text-sm font-semibold text-gray-700 mb-2 block">
                    IBAN (22 Zeichen) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="iban"
                    value={bankDetails.fld_iban}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, '').toUpperCase().slice(0, 22);
                      setBankDetails(prev => ({ ...prev, fld_iban: value }));
                    }}
                    maxLength={22}
                    pattern="[A-Z0-9]{22}"
                    required
                    className="border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary font-mono"
                    placeholder="DE82728272728272737382"
                  />
                  {bankDetails.fld_iban && bankDetails.fld_iban.length !== 22 && (
                    <p className="text-xs text-red-500 mt-1">IBAN muss genau 22 Zeichen lang sein</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 p-8 space-y-6 shadow-lg rounded-xl mt-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Zahlungsmethode</h2>
                  <p className="text-sm text-gray-600">Überweisung per Rechnung</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-gray-300">
                <p className="text-sm text-gray-700 mb-4">
                  <strong>Rechnung:</strong> Sie erhalten die Rechnung monatlich per E-Mail zwischen dem 3. und 6. des Monats.
                </p>
                <p className="text-sm text-gray-700 mb-4">
                  Ich stimme zu, die Zahlungen gemäß den vereinbarten Zahlungsbedingungen zu leisten. 
                  Die bevorzugte Zahlungsmethode ist per Rechnung. Ich verpflichte mich, alle Rechnungsbeträge innerhalb der vereinbarten Frist von 14 Tagen zu begleichen.
                </p>
                <p className="text-sm text-gray-700 mb-4">Ich werde die Zahlung auf folgendes Bankkonto überweisen:</p>
                <div className="text-sm text-gray-800 space-y-1 mt-4">
                  <p><strong>Tav und Uzun GbR</strong></p>
                  <p><strong>Bank Commerzbank Duisburg</strong></p>
                  <p><strong>IBAN DE82350400380422117200</strong></p>
                  <p><strong>BIC COBADEFFXXX</strong></p>
                  <p><strong>Gläubiger-ID DE70ZZZ00002684542</strong></p>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Section */}
          <div className="bg-white border border-gray-200 p-8 space-y-8 shadow-lg rounded-xl mt-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Bestätigung</h2>
                <p className="text-sm text-gray-600">Digitale Unterschrift und Vertragsannahme</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-200">
                <Label className="text-lg font-semibold text-gray-800 mb-4 block">
                  Unterschrift: <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-col items-center space-y-4">
                  <SignaturePadComponent
                    onSignatureChange={setSignatureData}
                    width={500}
                    height={200}
                    className="border-2 border-gray-300 rounded-lg bg-white shadow-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-primary border-primary hover:bg-primary hover:text-white transition-colors"
                    onClick={() => setSignatureData(null)}
                  >
                    Unterschrift löschen
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cityDate" className="text-sm font-semibold text-gray-700">Ort</Label>
                  <Input
                    id="cityDate"
                    value={contract.student.fld_city || ''}
                    disabled
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-semibold text-gray-700">Datum</Label>
                  <Input
                    id="date"
                    value={new Date().toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                    disabled
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-semibold text-gray-700">CleverCoach Nachhilfe</Label>
                  <Input
                    id="companyName"
                    value="Tav und Uzun Gbr"
                    disabled
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center py-4">
                <div className="text-center">
                  <img
                    src="/c-signature.png"
                    alt="Company Signature"
                    className="h-16 w-auto mx-auto mb-2"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <p className="text-sm text-gray-600">Unterschrift CleverCoach</p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-gray-300">
                <p className="text-sm text-gray-700 font-medium text-center leading-relaxed">
                  Ich bestätige die Richtigkeit meiner Angaben und erkläre, dass ich wirtschaftlich in der Lage bin, 
                  die vereinbarten Unterrichtsgebühren fristgerecht zu begleichen. Die Vertragsbedingungen sowie die 
                  Allgemeinen Geschäftsbedingungen (AGB) und Datenschutzbestimmungen wurden mir erläutert. Ich habe sie 
                  verstanden und erkenne sie verbindlich an. Die AGB enthalten unter anderem Regelungen zur Kündigung, 
                  Pausierung sowie zur Einhaltung der vertraglich vereinbarten Mindeststunden. Sie sind jederzeit einsehbar 
                  unter: www.clevercoach-nachhilfe.de. Mir ist bekannt, dass sich der Vertrag bei Nicht - Kündigung jeweils 
                  automatisch um einen weiteren Monat verlängert.
                </p>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  size="lg"
                  disabled={!signatureData || isSigningContract || (contract.fld_p_mode === 'Lastschrift' && (!bankDetails.fld_bi || !bankDetails.fld_iban || bankDetails.fld_iban.length !== 22))}
                  className="bg-primary hover:bg-primary/90 text-white px-12 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSigningContract ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                      Wird verarbeitet...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-3" />
                      Einreichen
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentContractSigning;
