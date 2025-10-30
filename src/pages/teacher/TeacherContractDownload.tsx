import React, { useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTeacher } from '@/hooks/useTeacherProfile';
import { useTeacherContractDownload } from '@/hooks/useTeacherContractDownload';
import { Download, FileText, User, CheckCircle, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';

export default function TeacherContractDownload() {
  const { user } = useAuthStore();
  const { data: teacher } = useTeacher(user?.fld_id);
  const { data, isLoading, error } = useTeacherContractDownload(teacher?.fld_id);
  const contractRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading contract...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Contract Not Found</h3>
            <p className="text-gray-600">Unable to load contract information.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { teacher: teacherData, subjects, signatureUrl } = data;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleDownloadPDF = async () => {
    if (!contractRef.current) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Freelance Contract', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('between CleverCoach-Nachhilfe, represented by Tav und Uzun GbR Höschenhofweg 31 47249 Duisburg and the contractor', pageWidth / 2, yPosition, { align: 'center', maxWidth: pageWidth - 40 });
      yPosition += 15;

      // Company Info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('CleverCoach – Nachhilfe', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 5;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Höschenhofweg 31, 47249 Duisburg', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 5;
      doc.text('Telefon: 0203 39652097 | E-Mail: kontakt@clevercoach-nachhilfe.de', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Contract Information
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Vertragsinformation', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const contractInfo = [
        ['Vorname:', teacherData.fld_first_name],
        ['Nachname:', teacherData.fld_last_name],
        ['Geboren am:', formatDate(teacherData.fld_dob) || 'N/A'],
        ['Telefonnummer:', teacherData.fld_phone || 'N/A'],
        ['PLZ:', teacherData.fld_zip || 'N/A'],
        ['Stadt:', teacherData.fld_city || 'N/A'],
        ['Straße, Nr:', teacherData.fld_street || 'N/A'],
        ['E-Mail-Adresse:', teacherData.fld_email],
      ];

      contractInfo.forEach(([label, value]) => {
        if (yPosition > pageHeight - 30) {
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

      // Section 1: Tätigkeit
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Tätigkeit', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const activityText = [
        `Die Auftragnehmenden werden mit der Erteilung von Nachhilfe in den folgenden Fächern betraut: ${subjects.join(', ')}`,
        'Die Auftragnehmenden sind beauftragt, die ihnen zugeteilten Schülerinnen und Schüler in den entsprechenden Schulfächern zu unterrichten und sie auf eine Berufsausbildung, einen Schulabschluss oder eine andere staatlich anerkannte Prüfung vorzubereiten. Der Nachhilfeunterricht kann entweder zu Hause bei den Schülerinnen, an einem anderen vereinbarten Ort oder online stattfinden.',
        'Die Auftragnehmenden können Zeit und Umfang ihrer Tätigkeit selbst bestimmen. Die Terminfestlegung erfolgt in Absprache mit den jeweiligen Schülerinnen bzw. deren Eltern. Sofern Stundenausfälle rechtzeitig mitgeteilt werden, entstehen hieraus keine Ansprüche gegen das CleverCoach-Nachhilfeinstitut.',
        'Die Auftragnehmenden verpflichten sich, während der Vertragsdauer und für die Dauer eines weiteren Schuljahres nach Vertragsbeendigung keine eigenen Geschäftsbeziehungen zu den ihnen zugewiesenen Schülerinnen und Schülern aufzunehmen.',
        'Die Auftragnehmenden sind berechtigt, ihre selbstständige Tätigkeit auch für andere Unternehmen auszuüben, solange diese nicht in direkter Konkurrenz zu den von CleverCoach Nachhilfe angebotenen Dienstleistungen stehen. Ein Wettbewerbsverbot gilt nur in dem Maße, wie es zum Schutz der unternehmerischen Interessen von CleverCoach erforderlich ist.',
      ];

      activityText.forEach((text) => {
        const lines = doc.splitTextToSize(text, pageWidth - 40);
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, 20, yPosition);
          yPosition += 6;
        });
        yPosition += 3;
      });

      yPosition += 5;

      // Section 2: Honorar
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('2. Honorar', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const feeText = [
        'Die Auftragnehmenden akzeptieren, dass das Institut am Ende eines jeden Monats eine Gutschrift basierend auf den korrekt und vollständig im Lehrerportal dokumentierten Stunden erstellt, die als verbindliche Honorarabrechnung dient.',
        'Die Gutschriften werden unter der Voraussetzung, dass alle Stunden korrekt eingetragen wurden, zwischen dem 15. und 18. des Folgemonats auf das bei uns hinterlegte Bankkonto der Auftragnehmenden überwiesen.',
        `Falls nicht gesondert vereinbart, beträgt das Honorar für die Auftragnehmenden: ${teacherData.fld_per_l_rate}€ für 60 Minuten Nachhilfeunterricht. Barauszahlungen sind grundsätzlich nicht möglich.`,
      ];

      feeText.forEach((text) => {
        const lines = doc.splitTextToSize(text, pageWidth - 40);
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, 20, yPosition);
          yPosition += 6;
        });
        yPosition += 3;
      });

      yPosition += 5;

      // Section 3: Kündigung
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('3. Kündigung', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const terminationText = 'Dieser Vertrag ist unbefristet. Die Auftragnehmenden sollten den Vertrag jedoch mit einer Frist von mindestens einem Monat schriftlich kündigen. Diese Kündigungsfrist gibt dem Institut die Möglichkeit, die Schülerinnen und Schüler währenddessen neu zu vermitteln.';

      const terminationLines = doc.splitTextToSize(terminationText, pageWidth - 40);
      terminationLines.forEach((line: string) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 6;
      });

      yPosition += 5;

      // Section 4: Sonstiges
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('4. Sonstiges', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const miscText = [
        'Beide Parteien sind sich einig, dass es sich bei diesem Vertrag um einen Honorarvertrag für freie Mitarbeit handelt und nicht um einen Arbeitsvertrag.',
        'Die Auftragnehmenden verpflichten sich, während der Vertragsdauer und auch nach Beendigung des Vertragsverhältnisses, keine Daten über Schülerinnen und Schüler oder sonstige geschäftliche Informationen des CleverCoach-Nachhilfeinstituts an Dritte weiterzugeben.',
        'Die Auftragnehmenden verpflichten sich, während der Vertragsdauer kein eigenes Nachhilfeinstitut zu eröffnen, zu betreiben oder sich in einer ähnlichen Form an einem Nachhilfeinstitut zu beteiligen, das in direkter Konkurrenz zum CleverCoach-Nachhilfeinstitut steht.',
        'Das Nachhilfeinstitut behält sich das Recht vor, im Falle von Diskrepanzen bezüglich der Stundenaufstellung die Auszahlung der Honorare bis zur Klärung der Unstimmigkeiten zurückzuhalten.',
        'Die Auftragnehmenden versichern, dass sie nicht vorbestraft sind und dass kein Verfahren gegen sie anhängig ist. Sollte sich der Sachverhalt ändern, sind die Auftragnehmenden verpflichtet, das CleverCoach-Nachhilfeinstitut unverzüglich darüber zu informieren.',
        'Die Auftragnehmenden erbringen ihre Tätigkeit auf selbstständiger Basis und sind eigenverantwortlich für die Abführung ihrer Steuern und eventueller Sozialversicherungsbeiträge.',
        'Ist oder wird eine Bestimmung des Vertrages unwirksam, so bleibt der übrige Vertragstext davon unberührt.',
        'Durch ihre Unterschrift versichern die Auftragnehmenden, dass alle Angaben zu ihrer Person wahrheitsgemäß gemacht wurden und dass sie den Vertragstext gelesen und verstanden haben. Ein Exemplar des Vertrages wurde den Auftragnehmenden digital ausgehändigt.',
      ];

      miscText.forEach((text) => {
        const lines = doc.splitTextToSize(text, pageWidth - 40);
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, 20, yPosition);
          yPosition += 6;
        });
        yPosition += 3;
      });

      yPosition += 10;

      // Signature Section
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Bestätigung', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Unterschrift Lehrkraft/ Erziehungsberechtigte/r:', 20, yPosition);
      yPosition += 10;

      if (signatureUrl) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = signatureUrl;
          
          await new Promise((resolve) => {
            img.onload = () => {
              const imgWidth = 80;
              const imgHeight = (img.height * imgWidth) / img.width;
              doc.addImage(img, 'PNG', 20, yPosition, imgWidth, imgHeight);
              yPosition += imgHeight + 15;
              resolve(void 0);
            };
            img.onerror = () => {
              doc.text('[Signature not available]', 20, yPosition);
              yPosition += 10;
              resolve(void 0);
            };
          });
        } catch (error) {
          doc.text('[Signature not available]', 20, yPosition);
          yPosition += 10;
        }
      } else {
        doc.text('[Keine Unterschrift vorhanden]', 20, yPosition);
        yPosition += 10;
      }

      yPosition += 10;
      doc.setFont('helvetica', 'bold');
      doc.text('Vollständiger Name:', 20, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(`${teacherData.fld_first_name} ${teacherData.fld_last_name}`, 20, yPosition + 7);
      doc.setFont('helvetica', 'bold');
      doc.text('CleverCoach Nachhilfe:', 110, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text('Tav und Uzun Gbr', 110, yPosition + 7);
      yPosition += 15;

      doc.setFont('helvetica', 'bold');
      doc.text('Datum:', 20, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(formatDate(teacherData.fld_onboard_date) || 'N/A', 20, yPosition + 7);

      yPosition += 20;
      doc.setFontSize(9);
      doc.text('Mit Ihrer Anmeldung akzeptieren Sie unsere Allgemeinen Geschäftsbedingungen, wie sie auf unserer Website aufgeführt sind.', 20, yPosition, { maxWidth: pageWidth - 40 });

      // Save PDF
      doc.save(`contract-teacher-${teacherData.fld_id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Header */}
        <div className="bg-primary text-white p-8 rounded-t-xl mb-0 shadow-xl">
          <div className="max-w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 pr-4">
                <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                  Freelance Contract
                </h1>
                <div className="w-20 h-1 bg-white/30 rounded-full mb-4"></div>
                <p className="text-white/90 text-sm sm:text-base leading-relaxed">
                  between CleverCoach-Nachhilfe, represented by Tav und Uzun GbR Höschenhofweg 31 47249 Duisburg and the contractor
                </p>
              </div>
              <Button 
                onClick={handleDownloadPDF} 
                className="bg-white text-primary hover:bg-gray-100 shadow-lg flex-shrink-0"
              >
                <Download className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
            </div>
          </div>
        </div>

        <div ref={contractRef} className="space-y-0">
          {/* Contract Information Section */}
          <div className="bg-white border border-gray-200 border-t-0 rounded-b-xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Contract Information</h2>
                <p className="text-sm text-gray-600">Personal details and contact information</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700 mb-2 block">First name</Label>
                  <Input
                    id="firstName"
                    value={teacherData.fld_first_name}
                    disabled
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="dob" className="text-sm font-semibold text-gray-700 mb-2 block">Birth date</Label>
                  <Input
                    id="dob"
                    value={formatDate(teacherData.fld_dob) || 'N/A'}
                    disabled
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="zip" className="text-sm font-semibold text-gray-700 mb-2 block">Postal code</Label>
                  <Input
                    id="zip"
                    value={teacherData.fld_zip || 'N/A'}
                    disabled
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="street" className="text-sm font-semibold text-gray-700 mb-2 block">Street, No</Label>
                  <Input
                    id="street"
                    value={teacherData.fld_street || 'N/A'}
                    disabled
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700 mb-2 block">Last name</Label>
                  <Input
                    id="lastName"
                    value={teacherData.fld_last_name}
                    disabled
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 mb-2 block">Telephone number</Label>
                  <Input
                    id="phone"
                    value={teacherData.fld_phone || 'N/A'}
                    disabled
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="city" className="text-sm font-semibold text-gray-700 mb-2 block">City</Label>
                  <Input
                    id="city"
                    value={teacherData.fld_city || 'N/A'}
                    disabled
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">E-mail address</Label>
                  <Input
                    id="email"
                    value={teacherData.fld_email}
                    disabled
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contract Terms */}
          <div className="bg-white border border-gray-200 p-8 space-y-6 shadow-lg rounded-xl mt-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 font-bold text-sm">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Activity</h3>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300">
                <p className="font-medium text-gray-800">
                  Die Auftragnehmenden werden mit der Erteilung von Nachhilfe in den folgenden Fächern betraut:{' '}
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                    {subjects.join(', ')}
                  </span>
                </p>
              </div>
              
              <p>
                Die Auftragnehmenden sind beauftragt, die ihnen zugeteilten Schülerinnen und Schüler in den entsprechenden Schulfächern zu unterrichten und sie auf eine Berufsausbildung, einen Schulabschluss oder eine andere staatlich anerkannte Prüfung vorzubereiten. Der Nachhilfeunterricht kann entweder zu Hause bei den Schülerinnen, an einem anderen vereinbarten Ort oder online stattfinden.
              </p>

              <p>
                Die Auftragnehmenden können Zeit und Umfang ihrer Tätigkeit selbst bestimmen. Die Terminfestlegung erfolgt in Absprache mit den jeweiligen Schülerinnen bzw. deren Eltern. Sofern Stundenausfälle rechtzeitig mitgeteilt werden, entstehen hieraus keine Ansprüche gegen das CleverCoach-Nachhilfeinstitut.
              </p>

              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300">
                <p className="font-medium text-gray-800">
                  Die Auftragnehmenden verpflichten sich, während der Vertragsdauer und für die Dauer eines weiteren Schuljahres nach Vertragsbeendigung keine eigenen Geschäftsbeziehungen zu den ihnen zugewiesenen Schülerinnen und Schülern aufzunehmen.
                </p>
              </div>
            </div>
          </div>

          {/* Fee Section */}
          <div className="bg-white border border-gray-200 p-8 space-y-6 shadow-lg rounded-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 font-bold text-sm">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Fee</h3>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Die Auftragnehmenden akzeptieren, dass das Institut am Ende eines jeden Monats eine Gutschrift basierend auf den korrekt und vollständig im Lehrerportal dokumentierten Stunden erstellt, die als verbindliche Honorarabrechnung dient.
              </p>
              
              <p>
                Die Gutschriften werden unter der Voraussetzung, dass alle Stunden korrekt eingetragen wurden, zwischen dem 15. und 18. des Folgemonats auf das bei uns hinterlegte Bankkonto der Auftragnehmenden überwiesen.
              </p>

              <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-gray-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 mb-2">Hourly Rate</p>
                    <p className="text-sm text-gray-600">Unless otherwise agreed, the fee for the contractors is:</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      €{teacherData.fld_per_l_rate}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">for 60 minutes</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4 font-medium">
                  Cash payments are generally not possible.
                </p>
              </div>
            </div>
          </div>

          {/* Termination Section */}
          <div className="bg-white border border-gray-200 p-8 space-y-6 shadow-lg rounded-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 font-bold text-sm">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Termination</h3>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-gray-300">
              <p className="text-gray-700 leading-relaxed">
                Dieser Vertrag ist unbefristet. Die Auftragnehmenden sollten den Vertrag jedoch mit einer Frist von mindestens einem Monat schriftlich kündigen. Diese Kündigungsfrist gibt dem Institut die Möglichkeit, die Schülerinnen und Schüler währenddessen neu zu vermitteln.
              </p>
            </div>
          </div>

          {/* Miscellaneous Section */}
          <div className="bg-white border border-gray-200 p-8 space-y-6 shadow-lg rounded-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 font-bold text-sm">4</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Miscellaneous</h3>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300">
                <p className="font-medium text-gray-800">
                  Beide Parteien sind sich einig, dass es sich bei diesem Vertrag um einen Honorarvertrag für freie Mitarbeit handelt und nicht um einen Arbeitsvertrag.
                </p>
              </div>

              <p>
                Die Auftragnehmenden verpflichten sich, während der Vertragsdauer und auch nach Beendigung des Vertragsverhältnisses, keine Daten über Schülerinnen und Schüler oder sonstige geschäftliche Informationen des CleverCoach-Nachhilfeinstituts an Dritte weiterzugeben.
              </p>

              <p>
                Die Auftragnehmenden verpflichten sich, während der Vertragsdauer kein eigenes Nachhilfeinstitut zu eröffnen, zu betreiben oder sich in einer ähnlichen Form an einem Nachhilfeinstitut zu beteiligen, das in direkter Konkurrenz zum CleverCoach-Nachhilfeinstitut steht.
              </p>

              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300">
                <p className="font-medium text-gray-800">
                  Durch ihre Unterschrift versichern die Auftragnehmenden, dass alle Angaben zu ihrer Person wahrheitsgemäß gemacht wurden und dass sie den Vertragstext gelesen und verstanden haben. Ein Exemplar des Vertrages wurde den Auftragnehmenden digital ausgehändigt.
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation Section */}
          <div className="bg-white border border-gray-200 p-8 space-y-8 shadow-lg rounded-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Confirmation</h2>
                <p className="text-sm text-gray-600">Digital signature and contract acceptance</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-200">
                <Label className="text-lg font-semibold text-gray-800 mb-4 block">
                  Signature of teacher/guardian:
                </Label>
                {signatureUrl ? (
                  <div className="flex flex-col items-center space-y-4">
                    <img 
                      src={signatureUrl} 
                      alt="Signature" 
                      className="max-w-full h-auto border-2 border-gray-300 rounded-lg bg-white shadow-sm"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-signature.png';
                      }}
                    />
                  </div>
                ) : (
                  <div className="border-2 border-gray-300 rounded-lg bg-white p-8 text-center text-gray-500">
                    Keine Unterschrift vorhanden
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">Full name</Label>
                  <Input
                    id="fullName"
                    value={`${teacherData.fld_first_name} ${teacherData.fld_last_name}`}
                    readOnly
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-semibold text-gray-700">CleverCoach tutoring</Label>
                  <Input
                    id="companyName"
                    value="Tav und Uzun Gbr"
                    readOnly
                    className="bg-gray-50/50 border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-semibold text-gray-700">Date</Label>
                  <Input
                    id="date"
                    value={formatDate(teacherData.fld_onboard_date) || 'N/A'}
                    readOnly
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
                  <p className="text-sm text-gray-600">Company Signature</p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-gray-300">
                <p className="text-sm text-gray-700 font-medium text-center">
                  Mit Ihrer Anmeldung akzeptieren Sie unsere Allgemeinen Geschäftsbedingungen, wie sie auf unserer Website aufgeführt sind.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}