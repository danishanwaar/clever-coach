import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useStudentContracts } from '@/hooks/useStudentContracts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, User, FileText, Calendar, Euro, CreditCard, CheckCircle, Download } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface StudentContractViewProps {
  contractId?: number;
}

const StudentContractView: React.FC<StudentContractViewProps> = ({ contractId: propContractId }) => {
  const { encodedId } = useParams<{ encodedId: string }>();
  const {
    getContractForSigning,
    decodeContractLink,
  } = useStudentContracts();

  const [contractId, setContractId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const contractRef = useRef<HTMLDivElement>(null);

  const { data: contract, isLoading, isError } = getContractForSigning(contractId!);

  useEffect(() => {
    // If contractId is provided as prop, use it directly
    if (propContractId) {
      setContractId(propContractId);
    } else if (encodedId) {
      // Otherwise, try to decode from URL params
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
  }, [encodedId, propContractId, decodeContractLink]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateWithTime = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownloadPDF = async () => {
    if (!contract) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Anmeldung für Privatunterricht', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('CleverCoach - Nachhilfe', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 7;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Höschenhofweg 31, 47249 Duisburg', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 5;
      doc.text('Telefon: 0203 39652097 | E-Mail: kontakt@clevercoach-nachhilfe.de', pageWidth / 2, yPosition, { align: 'center', maxWidth: pageWidth - 40 });
      yPosition += 15;

      // Contract Partner Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Vertragspartner', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const contractInfo = [
        ['Nachname:', contract.student.fld_last_name || ''],
        ['Vorname:', contract.student.fld_first_name || ''],
        ['Straße:', contract.student.fld_address || ''],
        ['PLZ:', contract.student.fld_zip || ''],
        ['Stadt:', contract.student.fld_city || ''],
        ['Festnetz:', contract.student.fld_phone || ''],
        ['Mobil:', contract.student.fld_mobile || ''],
        ['Email:', contract.student.fld_email || ''],
      ];

      contractInfo.forEach(([label, value]) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.text(label, 20, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 60, yPosition);
        yPosition += 7;
      });

      yPosition += 5;

      // Student Section
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Schüler/Schülerin', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const studentInfo = [
        ['Name:', contract.student.fld_s_last_name || ''],
        ['Name Schüler/Schülerin:', contract.student.fld_s_first_name || ''],
        ['Art der Nachhilfe:', contract.fld_lp === 'Onsite' ? 'Präsenz' : contract.fld_lp || ''],
        ['Schulform:', contract.student.fld_school || ''],
        ['Klasse:', contract.student.fld_level || ''],
      ];

      studentInfo.forEach(([label, value]) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.text(label, 20, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 70, yPosition);
        yPosition += 7;
      });

      yPosition += 5;

      // Billing Model Section
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Abrechnungsmodell - Individuell', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const billingInfo = [
        ['Startdatum:', formatDate(contract.fld_start_date)],
        ['Endtermin:', formatDate(contract.fld_end_date)],
        ['Mindestvertragslaufzeit:', `${contract.fld_ct} Monat(e)`],
        ['Mindeststunden im Monat:', contract.fld_min_lesson.toString()],
        ['Unterrichtsdauer:', contract.fld_lesson_dur || ''],
        ['Preis pro Einheit:', `${contract.fld_s_per_lesson_rate.toFixed(2)} €`],
        ['Einmalige Anmeldegebühr:', `${contract.fld_reg_fee.toFixed(2)} €`],
      ];

      billingInfo.forEach(([label, value]) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.text(label, 20, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 80, yPosition);
        yPosition += 7;
      });

      yPosition += 5;

      // Payment Method Section
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }

      if (contract.fld_p_mode === 'Lastschrift') {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('SEPA-Lastschriftmandat', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const paymentInfo = [
          ['Kontoinhaber:', contract.student.fld_payer || ''],
          ['Bankinstitut:', contract.fld_bi || contract.student.fld_bank_name || ''],
          ['IBAN:', contract.fld_iban || contract.student.fld_bank_act || ''],
        ];

        paymentInfo.forEach(([label, value]) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          doc.setFont('helvetica', 'bold');
          doc.text(label, 20, yPosition);
          doc.setFont('helvetica', 'normal');
          doc.text(value, 70, yPosition);
          yPosition += 7;
        });
      }

      yPosition += 10;

      // Confirmation Section
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Bestätigung', 20, yPosition);
      yPosition += 10;

      if (contract.fld_edtim) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Ort: ${contract.student.fld_city || ''}`, 20, yPosition);
        yPosition += 7;
        doc.text(`Datum: ${formatDateWithTime(contract.fld_edtim)}`, 20, yPosition);
        yPosition += 7;
        doc.text('CleverCoach Nachhilfe: Tav und Uzun Gbr', 20, yPosition);
        yPosition += 10;
      }

      // Generate contract number
      const currentYear = new Date().getFullYear();
      const contractNumber = `MAN-${contract.student.fld_id}-${currentYear}-${contract.fld_id}`;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Vertragsnummer: ${contractNumber}`, pageWidth / 2, yPosition, { align: 'center' });

      // Save PDF
      const fileName = `Contract_${contract.student.fld_last_name}_${contract.student.fld_first_name}_${contract.fld_id}.pdf`;
      doc.save(fileName);
      
      toast.success('PDF erfolgreich heruntergeladen');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Fehler beim Erstellen des PDFs');
    }
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
          <p className="text-muted-foreground">{error || 'Fehler beim Laden der Vertragsdaten'}</p>
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
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
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
              <div className="ml-4">
                <Button
                  onClick={handleDownloadPDF}
                  className="bg-white text-primary hover:bg-gray-100"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Contract Partner Section */}
        <div ref={contractRef} className="bg-white border border-gray-200 border-t-0 rounded-b-xl p-8 shadow-lg">
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
                  Kontoinhaber
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
                  Bankinstitut
                </Label>
                <Input
                  id="bank"
                  value={contract.fld_bi || contract.student.fld_bank_name || ''}
                  disabled
                  className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="iban" className="text-sm font-semibold text-gray-700 mb-2 block">
                  IBAN
                </Label>
                <Input
                  id="iban"
                  value={contract.fld_iban || contract.student.fld_bank_act || ''}
                  disabled
                  className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium font-mono"
                />
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
              <p className="text-sm text-gray-600">Vertragsannahme und Unterschrift</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-200">
              <Label className="text-lg font-semibold text-gray-800 mb-4 block">
                Unterschrift:
              </Label>
              {contract.fld_signature ? (
                <div className="flex justify-center">
                  <img 
                    src={contract.fld_signature} 
                    alt="Student Signature" 
                    className="max-w-full h-auto border border-gray-300 rounded-lg"
                  />
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Keine Unterschrift vorhanden</p>
              )}
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
                  value={contract.fld_edtim ? formatDate(contract.fld_edtim) : ''}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentContractView;
