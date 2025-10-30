import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useStudentInvoice, useTeacherInvoice } from '@/hooks/useInvoiceDetails';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/hooks/useInvoiceManagement';
import { generateStudentInvoicePDF, generateTeacherInvoicePDF } from '@/utils/invoicePdf';

const formatDate = (dateString: string | null) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

const InvoiceView = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') as 'receivables' | 'payables' | null;

  const invoiceId = id ? parseInt(id) : null;

  const { data: studentInvoiceData, isLoading: studentLoading } = useStudentInvoice(
    type === 'receivables' ? invoiceId : null
  );
  const { data: teacherInvoiceData, isLoading: teacherLoading } = useTeacherInvoice(
    type === 'payables' ? invoiceId : null
  );

  const isLoading = type === 'receivables' ? studentLoading : teacherLoading;
  const invoiceData = type === 'receivables' ? studentInvoiceData : teacherInvoiceData;

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading invoice...</div>
        </div>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">Invoice not found</div>
        </div>
      </div>
    );
  }

  const handleDownload = async () => {
    if (type === 'receivables' && studentInvoiceData) {
      await generateStudentInvoicePDF(studentInvoiceData as any);
      return;
    }
    if (type === 'payables' && teacherInvoiceData) {
      await generateTeacherInvoicePDF(teacherInvoiceData as any);
      return;
    }
  };

  if (type === 'receivables' && studentInvoiceData) {
    const { invoice, details, contract } = studentInvoiceData;
    const student = invoice.tbl_students!;
    
    // Group details as in PHP
    const groupedDetails = details.reduce((acc: any, detail: any) => {
      const key = `${detail.fld_ssid || 'none'}-${detail.fld_detail}-${detail.fld_len_lesson}-${detail.fld_s_rate}-${detail.fld_my}`;
      if (!acc[key]) {
        acc[key] = {
          ...detail,
          fld_lesson: 0,
          total: 0,
        };
      }
      acc[key].fld_lesson += detail.fld_lesson || 0;
      acc[key].total += (detail.fld_lesson || 0) * (detail.fld_s_rate || 0);
      return acc;
    }, {});

    const groupedDetailsArray = Object.values(groupedDetails);

    return (
      <div className="container mx-auto p-4 max-w-6xl print:p-0">
        {/* Header Actions - Hidden in print */}
        <div className="mb-6 print:hidden">
          <div className="flex items-center justify-between">
            <Link to={type === 'receivables' ? "/financials/receivables" : "/financials/payables"}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>

        <Card className="print:shadow-none print:border-0">
          <CardContent className="p-4 sm:p-8 print:p-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-4 mb-8">
              <div className="text-gray-700 space-y-1">
                <div className="font-semibold">Tav und Uzun Gbr</div>
                <div>CleverCoach Nachhilfe</div>
                <div>Höschenhofweg 31</div>
                <div>47249 Duisburg</div>
              </div>
              <div className="ml-auto text-right flex flex-col items-end pr-0">
                <img 
                  src="/clevercoach-logo.png" 
                  alt="CleverCoach Logo" 
                  className="h-36 w-auto mb-2"
                />
                <div className="text-gray-700">
                  <div className="text-sm mb-1">Telefon: 0203 39652097</div>
                  <div className="text-sm mb-1">E-Mail: kontakt@clevercoach-nachhilfe.de</div>
                  <div className="text-sm">Internet: www.clevercoach-nachhilfe.de</div>
                </div>
              </div>
            </div>

            {/* Student Details */}
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-8">
              <div className="text-gray-700 space-y-1">
                <div className="font-semibold">{student.fld_first_name} {student.fld_last_name}</div>
                <div>{student.fld_address}</div>
                <div>{student.fld_zip}, {student.fld_city}</div>
              </div>
              <div className="text-gray-700 space-y-1 text-right">
                <div>Rechnungsdatum: {formatDate(invoice.fld_edate)}</div>
                <div>Rechnungsnummer: {invoice.fld_id}</div>
                <div>Kundennummer: {student.fld_id}</div>
              </div>
            </div>

            {/* Invoice Title */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">The invoice</h1>
            </div>

            {/* Invoice Table */}
            <div className="mb-8 overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Leistungszeitraum</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Beschreibung</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Menge/Einheiten</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Dauer</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Einzelpreis (EUR)</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Summe (EUR)</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedDetailsArray.map((detail: any, index: number) => {
                    let finalLesson = Math.round(detail.fld_lesson);
                    
                    // Apply minimum lesson logic
                    if (detail.fld_detail !== 'Anmeldegebühr') {
                      if (invoice.fld_ch_hr === 'Y' && invoice.fld_min_lesson) {
                        if (finalLesson < invoice.fld_min_lesson) {
                          finalLesson = invoice.fld_min_lesson;
                        }
                      }
                    }

                    const rate = detail.fld_s_rate || 0;
                    const lineTotal = detail.fld_detail === 'Anmeldegebühr'
                      ? detail.total
                      : Number((rate * finalLesson).toFixed(2));

                    return (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="py-3 px-4 text-gray-700">{detail.fld_my}</td>
                        <td className="py-3 px-4 text-gray-700">{detail.fld_detail}</td>
                        <td className="py-3 px-4 text-center text-gray-700">{finalLesson}</td>
                        <td className="py-3 px-4 text-gray-700">{detail.fld_len_lesson}</td>
                        <td className="py-3 px-4 text-center text-gray-700">{formatCurrency(rate)}</td>
                        <td className="py-3 px-4 text-center text-gray-700 font-semibold">{formatCurrency(lineTotal)}</td>
                      </tr>
                    );
                  })}
                  <tr className="border-t-2 border-gray-300">
                    <td colSpan={5} className="py-3 px-4 text-right font-semibold text-gray-900">Invoice amount:</td>
                    <td className="py-3 px-4 text-center font-bold text-gray-900">{formatCurrency(invoice.fld_invoice_total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-sm italic text-gray-600 mb-6">
              Die erbrachten Bildungsleistungen sind gemäß § 4 Nr. 21 UStG von der Umsatzsteuer befreit.
            </p>

            {/* Payment Information */}
            {contract && (
              <div className="mb-6">
                {contract.fld_p_mode === 'Überweisung' ? (
                  <>
                    <p className="text-gray-700 mb-4">
                      Bitte überweisen Sie den Rechnungsbetrag innerhalb von 14 Tagen auf das folgende Bankkonto:
                    </p>
                    <div className="text-gray-700 space-y-1">
                      <div>Name: Tav und Uzun Gbr</div>
                      <div>Bankinstitut: Commerzbank</div>
                      <div>IBAN: DE82350400380422117200</div>
                      <div>BIC: COBADEFFXXX</div>
                    </div>
                  </>
                ) : contract.fld_p_mode === 'Lastschrift' ? (
                  <>
                    <p className="text-gray-700 mb-4">
                      Der Betrag wird vereinbarungsgemäß per SEPA-Lastschrift von Ihrem hinterlegten Konto abgebucht:
                    </p>
                    <div className="text-gray-700 space-y-1">
                      <div>Kontoinhaber/in: {student.fld_payer || 'N/A'}</div>
                      <div>Bankinstitut: {contract.fld_bi || 'N/A'}</div>
                      <div>IBAN: {contract.fld_iban || 'N/A'}</div>
                      <div>Mandatsreferenz: MANDE{student.fld_id}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-gray-700 mb-4">
                      Bitte überweisen Sie den Rechnungsbetrag innerhalb von 14 Tagen auf das folgende Bankkonto:
                    </p>
                    <div className="text-gray-700 space-y-1">
                      <div>Name: Tav und Uzun Gbr</div>
                      <div>Bankinstitut: Commerzbank</div>
                      <div>IBAN: DE82350400380422117200</div>
                      <div>BIC: COBADEFFXXX</div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 space-y-2">
              <div className="text-gray-700">Mit freundlichen Grüßen,</div>
              <div className="text-gray-700 font-semibold">Ihr CleverCoach-Team</div>
              <div className="text-xs text-center text-gray-500 mt-6">
                Diese Abrechnung wurde mittels EDV erstellt und ist auch ohne Unterschrift gültig.
              </div>
              <div className="text-xs text-center text-gray-500 mt-4">
                CleverCoach Nachhilfe – Tav und Uzun GbR – Höschenhofweg 31, 47249 Duisburg<br/>
                Bankverbindung: Commerzbank, IBAN: DE82350400380422117200 BIC: COBADEFFXXX<br/>
                Steuernummer: 5109 / 5709 / 1834  Finanzamt Duisburg
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (type === 'payables' && teacherInvoiceData) {
    const { invoice, details } = teacherInvoiceData;
    const teacher = invoice.tbl_teachers!;

    // Group details as in PHP
    const groupedDetails = details.reduce((acc: any, detail: any) => {
      const key = `${detail.fld_ssid || 'none'}-${detail.fld_detail}-${detail.fld_len_lesson}-${detail.fld_t_rate}-${detail.fld_my}`;
      if (!acc[key]) {
        acc[key] = {
          ...detail,
          fld_lesson: 0,
          total: 0,
        };
      }
      acc[key].fld_lesson += detail.fld_lesson || 0;
      acc[key].total += (detail.fld_lesson || 0) * (detail.fld_t_rate || 0);
      return acc;
    }, {});

    const groupedDetailsArray = Object.values(groupedDetails);

    return (
      <div className="container mx-auto p-4 max-w-6xl print:p-0">
        {/* Header Actions - Hidden in print */}
        <div className="mb-6 print:hidden">
          <div className="flex items-center justify-between">
            <Link to="/financials/payables">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Payables
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>

        <Card className="print:shadow-none print:border-0">
          <CardContent className="p-4 sm:p-8 print:p-4">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-4 mb-6">
                <div className="text-gray-700">
                  <div className="font-semibold">
                    {teacher.fld_first_name} {teacher.fld_last_name} - {teacher.fld_street} - {teacher.fld_zip} - {teacher.fld_city} - {teacher.fld_bakk_rno}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <img 
                    src="/clevercoach-logo.png" 
                    alt="CleverCoach Logo" 
                    className="h-24 w-auto mb-2"
                  />
                  <div className="text-gray-700">
                    <div className="text-sm mb-1">Telefon: 0203 39652097</div>
                    <div className="text-sm mb-1">E-Mail: kontakt@clevercoach-nachhilfe.de</div>
                    <div className="text-sm">Internet: www.clevercoach-nachhilfe.de</div>
                  </div>
                </div>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                Honorarabrechnung - Selbstgutschrift
              </h1>
            </div>

            {/* Company Details */}
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-8">
              <div className="text-gray-700 space-y-1">
                <div className="font-semibold">Tav und Uzun GbR</div>
                <div>CleverCoach Nachhilfe</div>
                <div>Höschenhofweg 31</div>
                <div>47249 Duisburg</div>
              </div>
              <div className="text-gray-700 space-y-1 text-right">
                <div>Datum der Ausstellung: {formatDate(invoice.fld_edate)}</div>
                <div>Lehrkraft-Nr.: {teacher.fld_id}</div>
                <div>Rechnungsnummer: {invoice.fld_id}</div>
              </div>
            </div>

            <p className="text-gray-700 font-bold mb-8">
              Vielen Dank für das Vertrauen in meine Dienste. Anbei übersende ich Ihnen meine Honorarabrechnung für den letzten Monat.
            </p>

            {/* Invoice Table */}
            <div className="mb-8 overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Leistungszeitraum</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Beschreibung</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Menge/Einheiten</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Dauer</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Einzelpreis (EUR)</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Summe (EUR)</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedDetailsArray.map((detail: any, index: number) => {
                    const lessonCount = Math.round(detail.fld_lesson);
                    const rate = detail.fld_t_rate || 0;
                    const lineTotal = detail.total;

                    return (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="py-3 px-4 text-gray-700">{detail.fld_my}</td>
                        <td className="py-3 px-4 text-gray-700">{detail.fld_detail}</td>
                        <td className="py-3 px-4 text-center text-gray-700">{lessonCount}</td>
                        <td className="py-3 px-4 text-gray-700">{detail.fld_len_lesson}</td>
                        <td className="py-3 px-4 text-center text-gray-700">{formatCurrency(rate)}</td>
                        <td className="py-3 px-4 text-center text-gray-700 font-semibold">{formatCurrency(lineTotal)}</td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td colSpan={5} className="py-3 px-4 text-right font-semibold text-gray-900">Gesamtsumme der Honorarleistungen:</td>
                    <td className="py-3 px-4 text-center font-bold text-gray-900">{formatCurrency(invoice.fld_invoice_total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-sm italic text-gray-600 mb-6">
              Die erbrachten Bildungsleistungen sind gemäß § 4 Nr. 21 UStG von der Umsatzsteuer befreit.
            </p>

            <p className="text-gray-700 mb-4">
              Ich bitte Sie, die Gesamtsumme innerhalb der vereinbarten Frist gemäß dem Honorarvertrag zu begleichen.
            </p>
            <p className="text-gray-700 mb-8">
              IBAN: {teacher.fld_bank_act || 'N/A'}
            </p>

            {/* Footer */}
            <div className="mt-8 space-y-2">
              <div className="text-gray-700">
                Mit Freundlichen Grüßen<br/>
                {teacher.fld_first_name} {teacher.fld_last_name}
              </div>
              <div className="text-xs text-center text-gray-500 mt-6">
                Diese Abrechnung wurde mittels EDV erstellt und ist auch ohne Unterschrift gültig.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default InvoiceView;

