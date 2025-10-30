import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

// Currency formatter with dot decimal separator (e.g., 1,234.56 €)
function formatEUR(amount: number): string {
  const n = Number(amount || 0);
  const parts = n.toFixed(2).split('.');
  const intWithGroups = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${intWithGroups}.${parts[1]} €`;
}

async function loadImageAsDataURL(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateStudentInvoiceById(invoiceId: number) {
  const { data: invoice, error: invoiceError } = await supabase
    .from('tbl_students_invoices')
    .select(`*, tbl_students!fld_sid (fld_id, fld_first_name, fld_last_name, fld_address, fld_zip, fld_city, fld_payer)`) 
    .eq('fld_id', invoiceId)
    .single();
  if (invoiceError) throw invoiceError;

  const { data: details } = await supabase
    .from('tbl_students_invoices_detail')
    .select('*')
    .eq('fld_iid', invoiceId);

  const { data: contract } = await supabase
    .from('tbl_contracts')
    .select('*')
    .eq('fld_sid', invoice.fld_sid)
    .order('fld_id', { ascending: false })
    .limit(1)
    .single();

  await generateStudentInvoicePDF({ invoice, details: details || [], contract });
}

export async function generateTeacherInvoiceById(invoiceId: number) {
  const { data: invoice, error: invoiceError } = await supabase
    .from('tbl_teachers_invoices')
    .select(`*, tbl_teachers!fld_tid (fld_id, fld_first_name, fld_last_name, fld_street, fld_zip, fld_city, fld_bakk_rno, fld_bank_act)`) 
    .eq('fld_id', invoiceId)
    .single();
  if (invoiceError) throw invoiceError;

  const { data: details } = await supabase
    .from('tbl_teachers_invoices_detail')
    .select('*')
    .eq('fld_iid', invoiceId);

  await generateTeacherInvoicePDF({ invoice, details: details || [] });
}

// Helpers that return Blob instead of downloading, for batch ZIP downloads
export async function generateStudentInvoiceBlobById(invoiceId: number): Promise<{ filename: string; blob: Blob }> {
  const { data: invoice } = await supabase
    .from('tbl_students_invoices')
    .select(`*, tbl_students!fld_sid (fld_id, fld_first_name, fld_last_name, fld_address, fld_zip, fld_city, fld_payer)`) 
    .eq('fld_id', invoiceId)
    .single();
  const { data: details } = await supabase
    .from('tbl_students_invoices_detail')
    .select('*')
    .eq('fld_iid', invoiceId);
  const { data: contract } = await supabase
    .from('tbl_contracts')
    .select('*')
    .eq('fld_sid', invoice.fld_sid)
    .order('fld_id', { ascending: false })
    .limit(1)
    .single();

  const student = invoice.tbl_students;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 20;
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  doc.text('Tav und Uzun Gbr', 20, y); y += 5;
  doc.text('CleverCoach Tutoring', 20, y); y += 5;
  doc.text('Höschenhofweg 31', 20, y); y += 5;
  doc.text('47249 Duisburg', 20, y);
  const logo = await loadImageAsDataURL('/clevercoach-logo.png');
  if (logo) {
    const logoW = 52; const logoH = 26; const logoX = pageWidth - 15 - logoW; const logoY = 14;
    doc.addImage(logo, 'PNG', logoX, logoY, logoW, logoH, undefined, 'FAST');
  }
  doc.text('Telefon: 0203 39652097', pageWidth - 20, 46, { align: 'right' });
  doc.text('E-Mail: kontakt@clevercoach-nachhilfe.de', pageWidth - 20, 52, { align: 'right' });
  doc.text('Internet: www.clevercoach-nachhilfe.de', pageWidth - 20, 58, { align: 'right' });
  y = 80;
  doc.text(`${student.fld_first_name} ${student.fld_last_name}`, 20, y); y += 5;
  doc.text(`${student.fld_address || ''}`, 20, y); y += 5;
  doc.text(`${student.fld_zip || ''}, ${student.fld_city || ''}`, 20, y);
  doc.text(`Rechnungsdatum: ${new Date(invoice.fld_edate).toLocaleDateString('de-DE')}`, pageWidth - 20, 80, { align: 'right' });
  doc.text(`Rechnungsnummer: ${invoice.fld_id}`, pageWidth - 20, 85, { align: 'right' });
  doc.text(`Kundennummer: ${student.fld_id}`, pageWidth - 20, 90, { align: 'right' });
  y = 110; doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.text('Rechnung', 20, y); y += 10; doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  const grouped = (details || []).reduce((acc: any, d: any) => {
    const key = `${d.fld_ssid || 'none'}-${d.fld_detail}-${d.fld_len_lesson}-${d.fld_s_rate}-${d.fld_my}`;
    if (!acc[key]) acc[key] = { ...d, fld_lesson: 0, total: 0 };
    acc[key].fld_lesson += d.fld_lesson || 0;
    acc[key].total += (d.fld_lesson || 0) * (d.fld_s_rate || 0);
    return acc;
  }, {});
  const rows = Object.values(grouped);
  const headers = ['Leistungszeitraum', 'Beschreibung', 'Menge', 'Dauer', 'Einzelpreis', 'Summe'];
  const colWidths = [30, 60, 20, 20, 20, 20];
  const tableX = 20; const tableWidth = colWidths.reduce((a,b)=>a+b,0);
  const colX: number[] = []; let cursor = tableX; colWidths.forEach(w=>{ colX.push(cursor); cursor += w; });
  doc.setFontSize(9); doc.setFont('helvetica','bold'); headers.forEach((h,i)=>{ doc.text(h, colX[i] + 1, y); }); const headerBottomY = y + 2; y += 7; doc.setFontSize(10); doc.setFont('helvetica','normal'); doc.setDrawColor(0); doc.setLineWidth(0.3); doc.line(tableX, headerBottomY, tableX + tableWidth, headerBottomY);
  rows.forEach((d: any) => {
    if (y > pageHeight - 40) { doc.addPage(); y = 20; }
    let finalLesson = Math.round(d.fld_lesson);
    if (d.fld_detail !== 'Anmeldegebühr') {
      if (invoice.fld_ch_hr === 'Y' && invoice.fld_min_lesson && finalLesson < invoice.fld_min_lesson) finalLesson = invoice.fld_min_lesson;
    }
    const rate = d.fld_s_rate || 0; const lineTotal = d.fld_detail === 'Anmeldegebühr' ? d.total : Number((rate * finalLesson).toFixed(2));
    doc.text(d.fld_my || '', colX[0] + 1, y);
    doc.text(d.fld_detail || '', colX[1] + 1, y);
    doc.text(String(finalLesson), colX[2] + 1, y);
    doc.text(d.fld_len_lesson || '', colX[3] + 1, y);
    doc.text(formatEUR(rate), colX[4] + colWidths[4] - 2, y, { align: 'right' });
    doc.text(formatEUR(lineTotal), colX[5] + colWidths[5] - 2, y, { align: 'right' });
    doc.setDrawColor(200); doc.line(tableX, y + 2, tableX + tableWidth, y + 2); y += 6;
  });
  y+=6; doc.setFont('helvetica','bold'); doc.text('Rechnungsbetrag:', pageWidth - 90, y); doc.text(formatEUR(invoice.fld_invoice_total || 0), pageWidth - 20, y, { align: 'right' }); y+=12;

  // Payment information (match single-PDF behavior)
  doc.setFont('helvetica','normal');
  if (contract) {
    if (contract.fld_p_mode === 'Lastschrift') {
      doc.text('Der Betrag wird vereinbarungsgemäß per SEPA-Lastschrift von Ihrem hinterlegten Konto abgebucht:', 20, y); y+=8;
      doc.text(`Kontoinhaber: ${student.fld_payer || 'N/A'}`, 20, y); y+=5;
      doc.text(`Bankinstitut: ${contract.fld_bi || 'N/A'}`, 20, y); y+=5;
      doc.text(`IBAN: ${contract.fld_iban || 'N/A'}`, 20, y); y+=5;
      doc.text(`Mandatsreferenz: MANDE${student.fld_id}`, 20, y); y+=12;
    } else {
      doc.text('Bitte überweisen Sie den Rechnungsbetrag innerhalb von 14 Tagen auf das folgende Bankkonto:', 20, y); y+=8;
      doc.text('Name: Tav und Uzun Gbr', 20, y); y+=5;
      doc.text('Bankinstitut: Commerzbank', 20, y); y+=5;
      doc.text('IBAN: DE82350400380422117200', 20, y); y+=5;
      doc.text('BIC: COBADEFFXXX', 20, y); y+=12;
    }
  }

  // Footer
  doc.setFontSize(9); doc.setFont('helvetica','italic');
  doc.text('Die erbrachten Bildungsleistungen sind gemäß § 4 Nr. 21 UStG von der Umsatzsteuer befreit.', 20, y); y+=12; doc.setFont('helvetica','normal');
  doc.setFontSize(8);
  doc.text('Diese Abrechnung wurde mittels EDV erstellt und ist auch ohne Unterschrift gültig.', pageWidth/2, pageHeight-30, { align: 'center' });
  doc.text('CleverCoach Tutoring – Tav und Uzun GbR – Höschenhofweg 31, 47249 Duisburg', pageWidth/2, pageHeight-22, { align: 'center' });
  doc.text('Bankverbindung: Commerzbank, IBAN: DE82350400380422117200 BIC: COBADEFFXXX', pageWidth/2, pageHeight-18, { align: 'center' });
  doc.text('Steuernummer: 5109 / 5709 / 1834  Finanzamt Duisburg', pageWidth/2, pageHeight-14, { align: 'center' });
  const blob = doc.output('blob');
  const filename = `Invoice_${student.fld_last_name}_${student.fld_first_name}_${invoice.fld_id}.pdf`;
  return { filename, blob };
}

export async function generateTeacherInvoiceBlobById(invoiceId: number): Promise<{ filename: string; blob: Blob }> {
  const { data: invoice } = await supabase
    .from('tbl_teachers_invoices')
    .select(`*, tbl_teachers!fld_tid (fld_id, fld_first_name, fld_last_name, fld_street, fld_zip, fld_city, fld_bakk_rno, fld_bank_act)`) 
    .eq('fld_id', invoiceId)
    .single();
  const { data: details } = await supabase
    .from('tbl_teachers_invoices_detail')
    .select('*')
    .eq('fld_iid', invoiceId);

  const teacher = invoice.tbl_teachers;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;
  doc.setFontSize(10); doc.setFont('helvetica','normal');
  doc.text('Tav und Uzun Gbr', 20, y); y+=5; doc.text('CleverCoach Nachhilfe', 20, y); y+=5; doc.text('Höschenhofweg 31', 20, y); y+=5; doc.text('47249 Duisburg', 20, y);
  const logo = await loadImageAsDataURL('/clevercoach-logo.png');
  if (logo) { const logoW = 52; const logoH = 26; const logoX = pageWidth - 15 - logoW; const logoY = 14; doc.addImage(logo, 'PNG', logoX, logoY, logoW, logoH, undefined, 'FAST'); }
  doc.text('Telefon: 0203 39652097', pageWidth - 20, 46, { align: 'right' });
  doc.text('E-Mail: kontakt@clevercoach-nachhilfe.de', pageWidth - 20, 52, { align: 'right' });
  doc.text('Internet: www.clevercoach-nachhilfe.de', pageWidth - 20, 58, { align: 'right' });
  doc.text(`Rechnungsdatum: ${new Date(invoice.fld_edate).toLocaleDateString('de-DE')}`, pageWidth - 20, 80, { align: 'right' });
  doc.text(`Rechnungsnummer: ${invoice.fld_id}`, pageWidth - 20, 85, { align: 'right' });
  doc.text(`Lehrkraft-Nr.: ${teacher.fld_id}`, pageWidth - 20, 90, { align: 'right' });
  y = 110; doc.setFontSize(14); doc.setFont('helvetica','bold'); doc.text('Honorarabrechnung - Selbstgutschrift', 20, y); y+=10;
  const grouped = (details || []).reduce((acc: any, d: any) => {
    const key = `${d.fld_ssid || 'none'}-${d.fld_detail}-${d.fld_len_lesson}-${d.fld_t_rate}-${d.fld_my}`; if (!acc[key]) acc[key] = { ...d, fld_lesson: 0, total: 0 }; acc[key].fld_lesson += d.fld_lesson || 0; acc[key].total += (d.fld_lesson || 0) * (d.fld_t_rate || 0); return acc;
  }, {});
  const rows = Object.values(grouped);
  const headers = ['Leistungszeitraum', 'Beschreibung', 'Menge', 'Dauer', 'Einzelpreis', 'Summe']; const colWidths = [30, 60, 20, 20, 20, 20]; const tableX = 20; const tableWidth = colWidths.reduce((a,b)=>a+b,0); const colX: number[] = []; let cursor2 = tableX; colWidths.forEach(w=>{ colX.push(cursor2); cursor2 += w; });
  doc.setFontSize(9); doc.setFont('helvetica','bold'); headers.forEach((h,i)=>{ doc.text(h, colX[i] + 1, y); }); const headerBottomY2 = y + 2; y += 7; doc.setFontSize(10); doc.setFont('helvetica','normal'); doc.setDrawColor(0); doc.setLineWidth(0.3); doc.line(tableX, headerBottomY2, tableX + tableWidth, headerBottomY2);
  rows.forEach((d: any) => { const lessonCount = Math.round(d.fld_lesson); const rate = d.fld_t_rate || 0; const lineTotal = d.total || lessonCount * rate; doc.text(d.fld_my || '', colX[0] + 1, y); doc.text(d.fld_detail || '', colX[1] + 1, y); doc.text(String(lessonCount), colX[2] + 1, y); doc.text(d.fld_len_lesson || '', colX[3] + 1, y); doc.text(formatEUR(rate), colX[4] + colWidths[4] - 2, y, { align: 'right' }); doc.text(formatEUR(Number(lineTotal)), colX[5] + colWidths[5] - 2, y, { align: 'right' }); doc.setDrawColor(200); doc.line(tableX, y + 2, tableX + tableWidth, y + 2); y += 6; });
  y+=6; doc.setFont('helvetica','bold'); doc.text('Gesamtsumme der Honorarleistungen:', pageWidth - 100, y); doc.text(formatEUR(invoice.fld_invoice_total || 0), pageWidth - 20, y, { align: 'right' });
  const blob = doc.output('blob');
  const filename = `TeacherInvoice_${teacher.fld_last_name}_${teacher.fld_first_name}_${invoice.fld_id}.pdf`;
  return { filename, blob };
}

export async function generateStudentInvoicePDF({ invoice, details, contract }: any) {
  const student = invoice.tbl_students;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 20;

  // Helpers already defined at top

  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  doc.text('Tav und Uzun Gbr', 20, y); y += 5;
  doc.text('CleverCoach Tutoring', 20, y); y += 5;
  doc.text('Höschenhofweg 31', 20, y); y += 5;
  doc.text('47249 Duisburg', 20, y);

  // Logo + contact
  const logo = await loadImageAsDataURL('/clevercoach-logo.png');
  if (logo) {
    // Draw logo at extreme top-right with generous size for clarity
    const logoW = 52; // mm
    const logoH = 26; // mm (keeps aspect ratio visually)
    const logoX = pageWidth - 15 - logoW; // 15mm right margin
    const logoY = 14; // near top
    doc.addImage(logo, 'PNG', logoX, logoY, logoW, logoH, undefined, 'FAST');
  }
  // place contact lines just beneath the logo
  doc.text('Telefon: 0203 39652097', pageWidth - 20, 46, { align: 'right' });
  doc.text('E-Mail: kontakt@clevercoach-nachhilfe.de', pageWidth - 20, 52, { align: 'right' });
  doc.text('Internet: www.clevercoach-nachhilfe.de', pageWidth - 20, 58, { align: 'right' });

  y = 80;
  doc.text(`${student.fld_first_name} ${student.fld_last_name}`, 20, y); y += 5;
  doc.text(`${student.fld_address || ''}`, 20, y); y += 5;
  doc.text(`${student.fld_zip || ''}, ${student.fld_city || ''}`, 20, y);

  doc.text(`Rechnungsdatum: ${new Date(invoice.fld_edate).toLocaleDateString('de-DE')}`, pageWidth - 20, 80, { align: 'right' });
  doc.text(`Rechnungsnummer: ${invoice.fld_id}`, pageWidth - 20, 85, { align: 'right' });
  doc.text(`Kundennummer: ${student.fld_id}`, pageWidth - 20, 90, { align: 'right' });
  // keep meta concise to match original

  y = 110; doc.setFontSize(14); doc.setFont('helvetica', 'bold');
  doc.text('Rechnung', 20, y); y += 10; doc.setFontSize(10); doc.setFont('helvetica', 'normal');

  const grouped = details.reduce((acc: any, d: any) => {
    const key = `${d.fld_ssid || 'none'}-${d.fld_detail}-${d.fld_len_lesson}-${d.fld_s_rate}-${d.fld_my}`;
    if (!acc[key]) acc[key] = { ...d, fld_lesson: 0, total: 0 };
    acc[key].fld_lesson += d.fld_lesson || 0;
    acc[key].total += (d.fld_lesson || 0) * (d.fld_s_rate || 0);
    return acc;
  }, {});
  const rows = Object.values(grouped);

  const headers = ['Leistungszeitraum', 'Beschreibung', 'Menge', 'Dauer', 'Einzelpreis', 'Summe'];
  // Total width ≈ 170 (A4 width ~210 - margins 20*2)
  const colWidths = [30, 60, 20, 20, 20, 20];
  const tableX = 20; // left margin for table
  const tableWidth = colWidths.reduce((a,b)=>a+b,0);
  // Compute absolute x positions for columns
  const colX: number[] = [];
  let cursor = tableX;
  colWidths.forEach(w => { colX.push(cursor); cursor += w; });

  // Simple header row
  doc.setFontSize(9); doc.setFont('helvetica','bold');
  headers.forEach((h,i)=>{ doc.text(h, colX[i] + 1, y); });
  const headerBottomY = y + 2;
  y += 7; doc.setFontSize(10); doc.setFont('helvetica','normal');
  doc.setDrawColor(0); doc.setLineWidth(0.3);
  doc.line(tableX, headerBottomY, tableX + tableWidth, headerBottomY);

  rows.forEach((d: any) => {
    if (y > pageHeight - 40) { doc.addPage(); y = 20; }
    let finalLesson = Math.round(d.fld_lesson);
    if (d.fld_detail !== 'Anmeldegebühr') {
      if (invoice.fld_ch_hr === 'Y' && invoice.fld_min_lesson && finalLesson < invoice.fld_min_lesson) {
        finalLesson = invoice.fld_min_lesson;
      }
    }
    const rate = d.fld_s_rate || 0;
    const lineTotal = d.fld_detail === 'Anmeldegebühr' ? d.total : Number((rate * finalLesson).toFixed(2));
    // Draw row values
    doc.text(d.fld_my || '', colX[0] + 1, y);
    doc.text(d.fld_detail || '', colX[1] + 1, y);
    doc.text(String(finalLesson), colX[2] + 1, y);
    doc.text(d.fld_len_lesson || '', colX[3] + 1, y);
    doc.text(formatEUR(rate), colX[4] + colWidths[4] - 2, y, { align: 'right' });
    doc.text(formatEUR(lineTotal), colX[5] + colWidths[5] - 2, y, { align: 'right' });
    // Row separator
    doc.setDrawColor(200);
    doc.line(tableX, y + 2, tableX + tableWidth, y + 2);
    y += 6;
  });
  // No vertical borders for simple look

  y+=6; doc.setFont('helvetica','bold');
  doc.text('Rechnungsbetrag:', pageWidth - 90, y);
  doc.text(formatEUR(invoice.fld_invoice_total || 0), pageWidth - 20, y, { align: 'right' }); y+=12;

  doc.setFontSize(9); doc.setFont('helvetica','italic');
  doc.text('Die erbrachten Bildungsleistungen sind gemäß § 4 Nr. 21 UStG von der Umsatzsteuer befreit.', 20, y); y+=12; doc.setFont('helvetica','normal');

  if (contract) {
    if (contract.fld_p_mode === 'Lastschrift') {
      doc.text('Der Betrag wird vereinbarungsgemäß per SEPA-Lastschrift von Ihrem hinterlegten Konto abgebucht:', 20, y); y+=8;
      doc.text(`Kontoinhaber: ${student.fld_payer || 'N/A'}`, 20, y); y+=5;
      doc.text(`Bankinstitut: ${contract.fld_bi || 'N/A'}`, 20, y); y+=5;
      doc.text(`IBAN: ${contract.fld_iban || 'N/A'}`, 20, y); y+=5;
      doc.text(`Mandatsreferenz: MANDE${student.fld_id}`, 20, y); y+=12;
    } else {
      doc.text('Bitte überweisen Sie den Rechnungsbetrag innerhalb von 14 Tagen auf das folgende Bankkonto:', 20, y); y+=8;
      doc.text('Name: Tav und Uzun Gbr', 20, y); y+=5;
      doc.text('Bankinstitut: Commerzbank', 20, y); y+=5;
      doc.text('IBAN: DE82350400380422117200', 20, y); y+=5;
      doc.text('BIC: COBADEFFXXX', 20, y); y+=12;
    }
  }

  doc.setFontSize(8);
  doc.text('Diese Abrechnung wurde mittels EDV erstellt und ist auch ohne Unterschrift gültig.', pageWidth/2, pageHeight-30, { align: 'center' });
  doc.text('CleverCoach Tutoring – Tav und Uzun GbR – Höschenhofweg 31, 47249 Duisburg', pageWidth/2, pageHeight-22, { align: 'center' });
  doc.text('Bankverbindung: Commerzbank, IBAN: DE82350400380422117200 BIC: COBADEFFXXX', pageWidth/2, pageHeight-18, { align: 'center' });
  doc.text('Steuernummer: 5109 / 5709 / 1834  Finanzamt Duisburg', pageWidth/2, pageHeight-14, { align: 'center' });

  doc.save(`Invoice_${student.fld_last_name}_${student.fld_first_name}_${invoice.fld_id}.pdf`);
}

export async function generateTeacherInvoicePDF({ invoice, details }: any) {
  const teacher = invoice.tbl_teachers;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Helpers already defined at top
  doc.setFontSize(10); doc.setFont('helvetica','normal');
  doc.text('Tav und Uzun Gbr', 20, y); y+=5;
  doc.text('CleverCoach Nachhilfe', 20, y); y+=5;
  doc.text('Höschenhofweg 31', 20, y); y+=5;
  doc.text('47249 Duisburg', 20, y);
  const logo = await loadImageAsDataURL('/clevercoach-logo.png');
  if (logo) {
    const logoW = 52;
    const logoH = 26;
    const logoX = pageWidth - 15 - logoW;
    const logoY = 14;
    doc.addImage(logo, 'PNG', logoX, logoY, logoW, logoH, undefined, 'FAST');
  }
  doc.text('Telefon: 0203 39652097', pageWidth - 20, 46, { align: 'right' });
  doc.text('E-Mail: kontakt@clevercoach-nachhilfe.de', pageWidth - 20, 52, { align: 'right' });
  doc.text('Internet: www.clevercoach-nachhilfe.de', pageWidth - 20, 58, { align: 'right' });

  doc.text(`Rechnungsdatum: ${new Date(invoice.fld_edate).toLocaleDateString('de-DE')}`, pageWidth - 20, 80, { align: 'right' });
  doc.text(`Rechnungsnummer: ${invoice.fld_id}`, pageWidth - 20, 85, { align: 'right' });
  doc.text(`Lehrkraft-Nr.: ${teacher.fld_id}`, pageWidth - 20, 90, { align: 'right' });

  y = 110; doc.setFontSize(14); doc.setFont('helvetica','bold');
  doc.text('Honorarabrechnung - Selbstgutschrift', 20, y); y+=10;

  const grouped = details.reduce((acc: any, d: any) => {
    const key = `${d.fld_ssid || 'none'}-${d.fld_detail}-${d.fld_len_lesson}-${d.fld_t_rate}-${d.fld_my}`;
    if (!acc[key]) acc[key] = { ...d, fld_lesson: 0, total: 0 };
    acc[key].fld_lesson += d.fld_lesson || 0;
    acc[key].total += (d.fld_lesson || 0) * (d.fld_t_rate || 0);
    return acc;
  }, {});
  const rows = Object.values(grouped);

  const headers = ['Leistungszeitraum', 'Beschreibung', 'Menge', 'Dauer', 'Einzelpreis', 'Summe'];
  const colWidths = [30, 60, 20, 20, 20, 20];
  const tableX = 20; const tableWidth = colWidths.reduce((a,b)=>a+b,0);
  const colX: number[] = []; let cursor2 = tableX; colWidths.forEach(w=>{ colX.push(cursor2); cursor2 += w; });
  // Simple header row
  doc.setFontSize(9); doc.setFont('helvetica','bold');
  headers.forEach((h,i)=>{ doc.text(h, colX[i] + 1, y); });
  const headerBottomY2 = y + 2;
  y += 7; doc.setFontSize(10); doc.setFont('helvetica','normal');
  doc.setDrawColor(0); doc.setLineWidth(0.3);
  doc.line(tableX, headerBottomY2, tableX + tableWidth, headerBottomY2);

  rows.forEach((d: any) => {
    let lessonCount = Math.round(d.fld_lesson);
    const rate = d.fld_t_rate || 0;
    const lineTotal = d.total || lessonCount * rate;
    doc.text(d.fld_my || '', colX[0] + 1, y);
    doc.text(d.fld_detail || '', colX[1] + 1, y);
    doc.text(String(lessonCount), colX[2] + 1, y);
    doc.text(d.fld_len_lesson || '', colX[3] + 1, y);
    doc.text(formatEUR(rate), colX[4] + colWidths[4] - 2, y, { align: 'right' });
    doc.text(formatEUR(Number(lineTotal)), colX[5] + colWidths[5] - 2, y, { align: 'right' });
    doc.setDrawColor(200); doc.line(tableX, y + 2, tableX + tableWidth, y + 2);
    y += 6;
  });
  // No vertical borders

  y+=6; doc.setFont('helvetica','bold');
  doc.text('Gesamtsumme der Honorarleistungen:', pageWidth - 100, y);
  doc.text(formatEUR(invoice.fld_invoice_total || 0), pageWidth - 20, y, { align: 'right' });

  doc.save(`TeacherInvoice_${teacher.fld_last_name}_${teacher.fld_first_name}_${invoice.fld_id}.pdf`);
}


