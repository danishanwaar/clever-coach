import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStudentContractDownload } from '@/hooks/useStudentContractDownload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Download, FileText, User, GraduationCap, CreditCard, Calendar, Euro } from 'lucide-react';

export default function StudentContractDownload() {
  const { id } = useParams<{ id: string }>();
  const studentId = parseInt(id || '0');
  
  const { data, isLoading, error } = useStudentContractDownload(studentId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4" />
          <span>Contract not found or no active contract available</span>
        </div>
      </div>
    );
  }

  const { contract, student, level, contractNumber } = data;

  // Format lesson type
  const lessonType = contract.fld_lesson_dur === 'Onsite' ? 'Präsenz' : contract.fld_lesson_dur;

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">CleverCoach - Nachhilfe</h1>
              <p className="text-blue-100">Höschenhofweg 31, 47249 Duisburg</p>
              <p className="text-blue-100 text-sm">Telefon: 0203 39652097 | E-Mail: kontakt@clevercoach-nachhilfe.de</p>
            </div>
            <div className="flex items-center space-x-2">
              <Link to={`/students/${studentId}/contracts`}>
                <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-blue-600">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Contracts
                </Button>
              </Link>
              <Button size="sm" className="bg-white text-blue-600 hover:bg-gray-100">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Anmeldung für Privatunterricht<br />
              Vertragspartner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Contract Partner Section */}
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Vertragspartner
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="last_name">Nachname</Label>
                  <Input
                    id="last_name"
                    value={student.fld_last_name}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="first_name">Vorname</Label>
                  <Input
                    id="first_name"
                    value={student.fld_first_name}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Straße</Label>
                  <Input
                    id="address"
                    value={student.fld_address}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="zip">PLZ</Label>
                  <Input
                    id="zip"
                    value={student.fld_zip}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="city">Stadt</Label>
                  <Input
                    id="city"
                    value={student.fld_city}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Festnetz</Label>
                  <Input
                    id="phone"
                    value={student.fld_phone}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="mobile">Mobil</Label>
                  <Input
                    id="mobile"
                    value={student.fld_mobile}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={student.fld_email}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Student Section */}
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                Schüler/Schülerin
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="s_last_name">Name</Label>
                  <Input
                    id="s_last_name"
                    value={student.fld_s_last_name}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="s_first_name">Name Schüler/Schülerin</Label>
                  <Input
                    id="s_first_name"
                    value={student.fld_s_first_name}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="lesson_type">Art der Nachhilfe</Label>
                  <Input
                    id="lesson_type"
                    value={lessonType}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="school">Schulform</Label>
                  <Input
                    id="school"
                    value={student.fld_school}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="level">Klasse</Label>
                  <Input
                    id="level"
                    value={level?.fld_level || 'N/A'}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Billing Model Section */}
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Abrechnungsmodell<br />
                <span className="text-lg font-normal">Individuell</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Startdatum</Label>
                  <Input
                    id="start_date"
                    value={contract.fld_start_date}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">Endtermin</Label>
                  <Input
                    id="end_date"
                    value={contract.fld_end_date}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="contract_duration">Mindestvertragslaufzeit</Label>
                  <Input
                    id="contract_duration"
                    value={`${student.fld_ct} Monat(e)`}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="monthly_hours">Mindeststunden im Monat</Label>
                  <Input
                    id="monthly_hours"
                    value={student.fld_wh.toString()}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="lesson_duration">Unterrichtsdauer</Label>
                  <Input
                    id="lesson_duration"
                    value={contract.fld_lesson_dur}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Contract Details */}
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Euro className="h-5 w-5 mr-2" />
                Vertragsdetails
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price_per_lesson">Preis pro Einheit</Label>
                  <Input
                    id="price_per_lesson"
                    value={`${contract.fld_s_per_lesson_rate} €`}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="registration_fee">einmalige Anmeldegebühr</Label>
                  <Input
                    id="registration_fee"
                    value={`${contract.fld_reg_fee} €`}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Section */}
            {contract.fld_p_mode === 'Lastschrift' ? (
              <div>
                <h2 className="text-xl font-bold mb-4">SEPA-Lastschriftmandat</h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 mb-2">
                    Hiermit ermächtige ich den Zahlungsempfänger, Zahlungen von meinem Konto mittels Lastschrift einzuziehen. 
                    Zugleich weise ich mein Kreditinstitut an, die auf mein Konto gezogenen Lastschriften einzulösen.
                  </p>
                  <p className="text-sm text-gray-700">
                    Hinweis: Ich kann innerhalb von acht Wochen, beginnend mit dem Belastungsdatum, die Erstattung des belasteten Betrags verlangen. 
                    Es gelten dabei die mit meinem Kreditinstitut vereinbarten Bedingungen.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="account_holder">Kontoinhaber</Label>
                    <Input
                      id="account_holder"
                      value={student.fld_payer}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bank_institution">Bankinstitut</Label>
                    <Input
                      id="bank_institution"
                      value={contract.fld_bi}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="iban">IBAN (22 Zeichen)</Label>
                    <Input
                      id="iban"
                      value={contract.fld_iban}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold mb-4">Zahlungsmethode</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Rechnung:</strong> Sie erhalten die Rechnung monatlich per E-Mail zwischen dem 3. und 6. des Monats.
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    Ich stimme zu, die Zahlungen gemäß den vereinbarten Zahlungsbedingungen zu leisten. Die bevorzugte Zahlungsmethode ist per Rechnung. 
                    Ich verpflichte mich, alle Rechnungsbeträge innerhalb der vereinbarten Frist von 14 Tagen zu begleichen.
                  </p>
                  <p className="text-sm text-gray-700 mb-2">Ich werde die Zahlung auf folgendes Bankkonto überweisen:</p>
                  <div className="mt-2 text-sm">
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
            <div>
              <h2 className="text-xl font-bold mb-4">Bestätigung</h2>
              
              {/* Signature Display */}
              <div className="mb-6">
                <Label>Unterschrift:</Label>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  {contract.fld_signature ? (
                    <img 
                      src={`/uploads/signatures/${contract.fld_signature}`} 
                      alt="Contract Signature" 
                      className="max-w-full h-auto"
                    />
                  ) : (
                    <div className="text-gray-500 text-center py-8">
                      No signature available
                    </div>
                  )}
                </div>
              </div>

              {/* Contract Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <Label htmlFor="location">Ort</Label>
                  <Input
                    id="location"
                    value={student.fld_city}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="company">CleverCoach Nachhilfe</Label>
                  <Input
                    id="company"
                    value="Tav und Uzun Gbr"
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="contract_date">Datum</Label>
                  <Input
                    id="contract_date"
                    value={formatDate(contract.fld_edtim)}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>

              {/* Company Signature */}
              <div className="mb-6">
                <div className="flex justify-center">
                  <img 
                    src="/uploads/c-signature.png" 
                    alt="Company Signature" 
                    className="max-w-48 h-auto"
                  />
                </div>
              </div>

              {/* Legal Text */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  Ich bestätige die Richtigkeit meiner Angaben und erkläre, dass ich wirtschaftlich in der Lage bin, 
                  die vereinbarten Unterrichtsgebühren fristgerecht zu begleichen. Die Vertragsbedingungen sowie die 
                  Allgemeinen Geschäftsbedingungen (AGB) und Datenschutzbestimmungen wurden mir erläutert. Ich habe 
                  sie verstanden und erkenne sie verbindlich an. Die AGB enthalten unter anderem Regelungen zur 
                  Kündigung, Pausierung sowie zur Einhaltung der vertraglich vereinbarten Mindeststunden. Sie sind 
                  jederzeit einsehbar unter: www.clevercoach-nachhilfe.de. Mir ist bekannt, dass sich der Vertrag 
                  bei Nicht-Kündigung jeweils automatisch um einen weiteren Monat verlängert.
                </p>
              </div>

              {/* Contract Number */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  <strong>Vertragsnummer:</strong> {contractNumber}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
