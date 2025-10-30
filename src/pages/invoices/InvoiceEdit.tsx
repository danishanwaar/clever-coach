import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useStudentInvoice, useTeacherInvoice, useUpdateInvoiceDetail, useAddInvoiceDetail, useDeleteInvoiceDetail, useUpdateInvoiceDate } from '@/hooks/useInvoiceDetails';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const formatDate = (dateString: string | null) => {
  if (!dateString) return '';
  return dateString.split('T')[0]; // Convert to YYYY-MM-DD format for input
};

const InvoiceEdit = () => {
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

  // Local UI state for realtime edits (optimistic UI)
  const [detailsState, setDetailsState] = useState<any[]>([]);
  const [originalDetails, setOriginalDetails] = useState<any[]>([]);
  const [invoiceDate, setInvoiceDate] = useState<string>('');
  const [originalDate, setOriginalDate] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // New detail form state
  const [newDetail, setNewDetail] = useState({
    fld_my: '',
    fld_detail: '',
    fld_lesson: '',
    fld_len_lesson: '',
    fld_s_rate: '',
    fld_t_rate: '',
  });

  // Fetch lesson durations for dropdown
  const { data: lessonDurations = [] } = useQuery({
    queryKey: ['lesson-durations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tbl_lesson_durations')
        .select('fld_l_duration')
        .order('fld_l_duration');
      
      if (error) throw error;
      return data.map(d => d.fld_l_duration);
    },
  });

  // Map URL type to hook domain type
  const domainType: 'student' | 'teacher' = type === 'payables' ? 'teacher' : 'student';
  const updateDetailMutation = useUpdateInvoiceDetail(domainType);
  const addDetailMutation = useAddInvoiceDetail(domainType);
  const deleteDetailMutation = useDeleteInvoiceDetail(domainType);
  const updateDateMutation = useUpdateInvoiceDate(domainType);

  // Hydrate local state whenever the invoice data loads/changes
  useEffect(() => {
    const data = (type === 'receivables' ? studentInvoiceData : teacherInvoiceData);
    if (data?.details) {
      setDetailsState(data.details);
      setOriginalDetails(data.details);
    }
    if (data?.invoice?.fld_edate) {
      const d = formatDate(data.invoice.fld_edate);
      setInvoiceDate(d);
      setOriginalDate(d);
    }
  }, [type, studentInvoiceData, teacherInvoiceData]);

  const handleUpdateDetail = (detailId: number, field: string, value: any) => {
    setDetailsState(prev => prev.map(d => d.fld_id === detailId ? { ...d, [field]: value } : d));
  };

  const handleAddDetail = () => {
    if (!newDetail.fld_detail || !newDetail.fld_lesson || !(newDetail.fld_s_rate || newDetail.fld_t_rate)) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Stage locally with a temporary id
    const tempId = `temp-${Date.now()}`;
    const staged: any = {
      fld_id: tempId,
      fld_my: newDetail.fld_my,
      fld_detail: newDetail.fld_detail,
      fld_lesson: parseFloat(newDetail.fld_lesson),
      fld_len_lesson: newDetail.fld_len_lesson,
    };
    if (domainType === 'student') staged.fld_s_rate = parseFloat(newDetail.fld_s_rate || '0');
    else staged.fld_t_rate = parseFloat(newDetail.fld_t_rate || newDetail.fld_s_rate || '0');
    setDetailsState(prev => ([...prev, staged]));

    // Reset form inputs
    setNewDetail({
      fld_my: '',
      fld_detail: '',
      fld_lesson: '',
      fld_len_lesson: '',
      fld_s_rate: '',
      fld_t_rate: '',
    });
  };

  const handleDeleteDetail = (detailId: any) => {
    // Mark for deletion (do not persist immediately)
    setDetailsState(prev => prev.filter(d => d.fld_id !== detailId));
  };

  const handleUpdateDate = (date: string) => {
    setInvoiceDate(date);
  };

  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      // Save date if changed
      if (invoiceDate !== originalDate) {
        await updateDateMutation.mutateAsync({ invoiceId: invoiceId!, date: invoiceDate });
        setOriginalDate(invoiceDate);
      }

      // Build maps for comparison
      const originalById = new Map(originalDetails.map((d: any) => [d.fld_id, d]));

      for (const d of detailsState) {
        if (!d.fld_id || typeof d.fld_id !== 'number') {
          // New detail: add
          const detailObj: any = {
            fld_my: d.fld_my,
            fld_detail: d.fld_detail,
            fld_lesson: Number(d.fld_lesson) || 0,
            fld_len_lesson: d.fld_len_lesson,
          };
          if (domainType === 'student') detailObj.fld_s_rate = Number(d.fld_s_rate) || 0;
          else detailObj.fld_t_rate = Number(d.fld_t_rate) || 0;

          await addDetailMutation.mutateAsync({
            invoiceId: invoiceId!,
            detail: detailObj,
          });
          continue;
        }

        const orig = originalById.get(d.fld_id);
        if (!orig) continue;

        const fields: Array<keyof typeof d> = domainType === 'student'
          ? ['fld_my','fld_detail','fld_lesson','fld_len_lesson','fld_s_rate']
          : ['fld_my','fld_detail','fld_lesson','fld_len_lesson','fld_t_rate'];
        for (const f of fields) {
          const newVal = d[f];
          const oldVal = orig[f];
          if (newVal !== oldVal) {
            await updateDetailMutation.mutateAsync({
              invoiceId: invoiceId!,
              detailId: d.fld_id,
              field: f as string,
              value: newVal,
            });
          }
        }
      }

      // Deleted rows: any original not present in current detailsState
      const currentIds = new Set(detailsState.filter(x => typeof x.fld_id === 'number').map((x:any)=>x.fld_id));
      for (const o of originalDetails) {
        if (!currentIds.has(o.fld_id)) {
          await deleteDetailMutation.mutateAsync({ invoiceId: invoiceId!, detailId: o.fld_id });
        }
      }

      setOriginalDetails(detailsState);
      toast.success('Invoice saved');
    } catch (e:any) {
      toast.error(e?.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

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

  if (type === 'receivables' && studentInvoiceData) {
    const { invoice, details, contract } = studentInvoiceData;
    const student = invoice.tbl_students!;
    // Compute total locally from staged details
    const computedStudentTotal = detailsState.reduce((sum, d) => {
      let lesson = Math.round(Number(d.fld_lesson) || 0);
      const rate = Number(d.fld_s_rate) || 0;
      if (d.fld_detail !== 'Anmeldegebühr') {
        if (invoice.fld_ch_hr === 'Y' && invoice.fld_min_lesson) {
          if (lesson < invoice.fld_min_lesson) lesson = invoice.fld_min_lesson;
        }
      }
      const lineTotal = d.fld_detail === 'Anmeldegebühr' ? (Number(d.fld_lesson) || 0) * rate : lesson * rate;
      return sum + lineTotal;
    }, 0);

    return (
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header Actions */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <Link to={type === 'receivables' ? "/financials/receivables" : "/financials/payables"}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button onClick={handleSaveAll} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Edit Student Invoice #{invoice.fld_id}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-8">
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
                  className="h-24 sm:h-36 w-auto mb-2"
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
                <div className="flex items-center gap-2">
                  <span>Rechnungsdatum:</span>
                  <Input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => handleUpdateDate(e.target.value)}
                    className="w-40"
                  />
                </div>
                <div>Rechnungsnummer: {invoice.fld_id}</div>
                <div>Kundennummer: {student.fld_id}</div>
              </div>
            </div>

            {/* Invoice Title */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Rechnung</h1>
            </div>

            {/* Invoice Table */}
            <div className="mb-8 overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-sm sm:text-base">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Leistungszeitraum</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Beschreibung</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Menge/Einheiten</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Dauer</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Einzelpreis (EUR)</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Summe (EUR)</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Add new detail row */}
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <td className="py-3 px-4">
                      <Input
                        placeholder="MM.YYYY"
                        value={newDetail.fld_my}
                        onChange={(e) => setNewDetail(prev => ({ ...prev, fld_my: e.target.value }))}
                        className="w-24"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <Textarea
                        placeholder="Description"
                        value={newDetail.fld_detail}
                        onChange={(e) => setNewDetail(prev => ({ ...prev, fld_detail: e.target.value }))}
                        rows={2}
                        className="w-32"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Input
                        type="number"
                        placeholder="0"
                        value={newDetail.fld_lesson}
                        onChange={(e) => setNewDetail(prev => ({ ...prev, fld_lesson: e.target.value }))}
                        className="w-20"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <Select
                        value={newDetail.fld_len_lesson}
                        onValueChange={(value) => setNewDetail(prev => ({ ...prev, fld_len_lesson: value }))}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder="Duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {lessonDurations.map((duration) => (
                            <SelectItem key={duration} value={duration}>
                              {duration}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={newDetail.fld_s_rate}
                        onChange={(e) => setNewDetail(prev => ({ ...prev, fld_s_rate: e.target.value }))}
                        className="w-20"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        size="sm"
                        onClick={handleAddDetail}
                        disabled={addDetailMutation.isPending}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </td>
                    <td className="py-3 px-4"></td>
                  </tr>

                  {/* Existing details */}
                  {detailsState.map((detail, index) => {
                    let finalLesson = Math.round(detail.fld_lesson || 0);
                    
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
                      ? (detail.fld_lesson || 0) * rate
                      : Number((rate * finalLesson).toFixed(2));

                    return (
                      <tr key={detail.fld_id} className="border-b border-gray-200">
                        <td className="py-3 px-4">
                          <Input
                            value={detail.fld_my || ''}
                            onChange={(e) => handleUpdateDetail(detail.fld_id, 'fld_my', e.target.value)}
                            className="w-24"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <Textarea
                            value={detail.fld_detail || ''}
                            onChange={(e) => handleUpdateDetail(detail.fld_id, 'fld_detail', e.target.value)}
                            rows={2}
                            className="w-32"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Input
                            type="number"
                            value={finalLesson}
                            onChange={(e) => handleUpdateDetail(detail.fld_id, 'fld_lesson', parseFloat(e.target.value) || 0)}
                            className="w-20"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <Input
                            value={detail.fld_len_lesson || ''}
                            onChange={(e) => handleUpdateDetail(detail.fld_id, 'fld_len_lesson', e.target.value)}
                            className="w-24"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Input
                            type="number"
                            step="0.01"
                            value={rate}
                            onChange={(e) => handleUpdateDetail(detail.fld_id, 'fld_s_rate', parseFloat(e.target.value) || 0)}
                            className="w-20"
                          />
                        </td>
                        <td className="py-3 px-4 text-center font-semibold">
                          {"€"}{lineTotal.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteDetail(detail.fld_id)}
                            disabled={deleteDetailMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  
                  <tr>
                    <td colSpan={5} className="py-3 px-4 text-right font-semibold text-gray-900">Rechnungsbetrag:</td>
                    <td className="py-3 px-4 text-center font-bold text-gray-900">{"€"}{computedStudentTotal.toFixed(2)}</td>
                    <td className="py-3 px-4"></td>
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
    // Compute total locally from staged details
    const computedTeacherTotal = detailsState.reduce((sum, d) => {
      const lesson = Math.round(Number(d.fld_lesson) || 0);
      const rate = Number(d.fld_t_rate) || 0;
      return sum + lesson * rate;
    }, 0);

    return (
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header Actions */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <Link to="/financials/payables">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Payables
              </Button>
            </Link>
            <div className="flex gap-2"></div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Edit Teacher Invoice #{invoice.fld_id}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-4 mb-6">
                <div className="text-gray-700">
                  <div className="font-semibold">
                    {teacher.fld_first_name} {teacher.fld_last_name} - {teacher.fld_street} - {teacher.fld_zip} - {teacher.fld_city} - {teacher.fld_bakk_rno}
                  </div>
                </div>
                <div className="text-right sm:ml-4">
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
                <div className="flex items-center gap-2">
                  <span>Datum der Ausstellung:</span>
                  <Input
                    type="date"
                    value={formatDate(invoice.fld_edate)}
                    onChange={(e) => handleUpdateDate(e.target.value)}
                    className="w-full sm:w-40"
                  />
                </div>
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
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Add new detail row */}
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <td className="py-3 px-4">
                      <Input
                        placeholder="MM.YYYY"
                        value={newDetail.fld_my}
                        onChange={(e) => setNewDetail(prev => ({ ...prev, fld_my: e.target.value }))}
                        className="w-24"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <Textarea
                        placeholder="Description"
                        value={newDetail.fld_detail}
                        onChange={(e) => setNewDetail(prev => ({ ...prev, fld_detail: e.target.value }))}
                        rows={2}
                        className="w-32"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Input
                        type="number"
                        placeholder="0"
                        value={newDetail.fld_lesson}
                        onChange={(e) => setNewDetail(prev => ({ ...prev, fld_lesson: e.target.value }))}
                        className="w-20"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <Select
                        value={newDetail.fld_len_lesson}
                        onValueChange={(value) => setNewDetail(prev => ({ ...prev, fld_len_lesson: value }))}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder="Duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {lessonDurations.map((duration) => (
                            <SelectItem key={duration} value={duration}>
                              {duration}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={newDetail.fld_t_rate}
                        onChange={(e) => setNewDetail(prev => ({ ...prev, fld_t_rate: e.target.value }))}
                        className="w-20"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        size="sm"
                        onClick={handleAddDetail}
                        disabled={addDetailMutation.isPending}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </td>
                    <td className="py-3 px-4"></td>
                  </tr>

                  {/* Existing details */}
                  {detailsState.map((detail, index) => {
                    const lessonCount = Math.round(detail.fld_lesson || 0);
                    const rate = detail.fld_t_rate || 0;
                    const lineTotal = (detail.fld_lesson || 0) * rate;

                    return (
                      <tr key={detail.fld_id} className="border-b border-gray-200">
                        <td className="py-3 px-4">
                          <Input
                            value={detail.fld_my || ''}
                            onChange={(e) => handleUpdateDetail(detail.fld_id, 'fld_my', e.target.value)}
                            className="w-24"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <Textarea
                            value={detail.fld_detail || ''}
                            onChange={(e) => handleUpdateDetail(detail.fld_id, 'fld_detail', e.target.value)}
                            rows={2}
                            className="w-32"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Input
                            type="number"
                            value={lessonCount}
                            onChange={(e) => handleUpdateDetail(detail.fld_id, 'fld_lesson', parseFloat(e.target.value) || 0)}
                            className="w-20"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <Input
                            value={detail.fld_len_lesson || ''}
                            onChange={(e) => handleUpdateDetail(detail.fld_id, 'fld_len_lesson', e.target.value)}
                            className="w-24"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Input
                            type="number"
                            step="0.01"
                            value={rate}
                            onChange={(e) => handleUpdateDetail(detail.fld_id, 'fld_t_rate', parseFloat(e.target.value) || 0)}
                            className="w-20"
                          />
                        </td>
                        <td className="py-3 px-4 text-center font-semibold">
                          {"€"}{lineTotal.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteDetail(detail.fld_id)}
                            disabled={deleteDetailMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  
                  <tr>
                    <td colSpan={5} className="py-3 px-4 text-right font-semibold text-gray-900">Gesamtsumme der Honorarleistungen:</td>
                    <td className="py-3 px-4 text-center font-bold text-gray-900">{"€"}{computedTeacherTotal.toFixed(2)}</td>
                    <td className="py-3 px-4"></td>
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

export default InvoiceEdit;
