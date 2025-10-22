import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const getFromEmail = async (): Promise<string> => {
  try {
    const { data: config } = await supabase
      .from('tbl_system_config')
      .select('fld_femail')
      .eq('fld_cflag', 'Active')
      .single();
    
    return config?.fld_femail || "kontakt@clevercoach-nachhilfe.de";
  } catch (error) {
    console.error("Error fetching from email:", error);
    return "kontakt@clevercoach-nachhilfe.de";
  }
};

const generateTeacherContractEmailTemplate = (recipientName: string, contractLink: string) => {
  return `
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc;">
    <tr>
    <td style="padding: 20px 0;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border: 1px solid #e2e8f0; border-collapse: collapse; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
    
    <!-- Header -->
    <tr>
    <td align="center" bgcolor="#0086A4" style="padding: 40px 30px;">
    <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    Welcome to CleverCoach! 🎓
    </h1>
    </td>
    </tr>
    
    <!-- Content -->
    <tr>
    <td bgcolor="#ffffff" style="padding: 40px 30px;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
    
    <!-- Greeting -->
    <tr>
    <td style="color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; padding-bottom: 20px;">
    <strong>Hello ${recipientName},</strong>
    </td>
    </tr>
    
    <!-- Intro -->
    <tr>
    <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 24px; padding-bottom: 24px;">
    Thank you for our pleasant conversation! Please find your teaching agreement below. Review and sign it to get started with your first students.
    </td>
    </tr>
    
    <!-- CTA Button -->
    <tr>
    <td style="padding: 10px 0 30px 0;">
    <a href="${contractLink}" style="display: inline-block; background-color: #0086A4; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(0, 134, 164, 0.2);">
    View & Sign Contract
    </a>
    </td>
    </tr>
    
    <!-- Important Note -->
    <tr>
    <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
    <p style="margin: 0; color: #92400e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 20px;">
    <strong>⚡ Quick Response Required:</strong> Timely communication is crucial. Students may find other tutors quickly, so please respond promptly to all requests.
    </p>
    </td>
    </tr>
    
    <!-- Quick Start Guide -->
    <tr>
    <td style="padding-top: 24px;">
    <h2 style="color: #0086A4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">
    Quick Start Guide
    </h2>
    </td>
    </tr>
    
    <!-- Step 1 -->
    <tr>
    <td style="padding: 12px 0;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
    <td width="30" valign="top">
    <div style="background-color: #0086A4; color: white; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold; font-size: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">1</div>
    </td>
    <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 20px;">
    Receive student requests via call, email, or WhatsApp
    </td>
    </tr>
    </table>
    </td>
    </tr>
    
    <!-- Step 2 -->
    <tr>
    <td style="padding: 12px 0;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
    <td width="30" valign="top">
    <div style="background-color: #0086A4; color: white; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold; font-size: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">2</div>
    </td>
    <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 20px;">
    Accept request → Get family contact details in your portal
    </td>
    </tr>
    </table>
    </td>
    </tr>
    
    <!-- Step 3 -->
    <tr>
    <td style="padding: 12px 0;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
    <td width="30" valign="top">
    <div style="background-color: #0086A4; color: white; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold; font-size: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">3</div>
    </td>
    <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 20px;">
    Contact the family and schedule an introductory meeting (15-30 min, unpaid)
    </td>
    </tr>
    </table>
    </td>
    </tr>
    
    <!-- Step 4 -->
    <tr>
    <td style="padding: 12px 0;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
    <td width="30" valign="top">
    <div style="background-color: #0086A4; color: white; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold; font-size: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">4</div>
    </td>
    <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 20px;">
    Confirm meeting in portal → We finalize contract with family → Start teaching!
    </td>
    </tr>
    </table>
    </td>
    </tr>
    
    <!-- Key Points -->
    <tr>
    <td style="padding-top: 30px;">
    <h3 style="color: #0086A4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">
    Important Points
    </h3>
    </td>
    </tr>
    
    <tr>
    <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 22px; padding-bottom: 8px;">
    • Submit hours by the 1st of each month for payment on the 15th-18th
    </td>
    </tr>
    
    <tr>
    <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 22px; padding-bottom: 8px;">
    • Minimum 4 lessons/month (unless agreed otherwise)
    </td>
    </tr>
    
    <tr>
    <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 22px; padding-bottom: 8px;">
    • Set yourself inactive in portal when unavailable
    </td>
    </tr>
    
    <!-- Questions -->
    <tr>
    <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 22px; padding-top: 24px;">
    Questions? We're here to help! Contact us anytime.
    </td>
    </tr>
    
    <!-- Closing -->
    <tr>
    <td style="padding-top: 30px; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px;">
    Best regards,<br/>
    <strong>CleverCoach Team</strong>
    </td>
    </tr>
    
    </table>
    </td>
    </tr>
    
    <!-- Footer -->
    <tr>
    <td bgcolor="#f8fafc" style="padding: 24px 30px; border-top: 1px solid #e2e8f0;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
    <td style="color: #94a3b8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; line-height: 18px;">
    <strong style="color: #64748b;">CleverCoach Nachhilfe</strong><br/>
    Tav & Uzun GbR<br/>
    Höschenhofweg 31, 47249 Duisburg<br/>
    Tel: 0203 39652097 | Email: kontakt@clevercoach-nachhilfe.de
    </td>
    </tr>
    <tr>
    <td style="padding-top: 16px; color: #94a3b8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px;">
    This is an automated message. Please do not reply to this email.
    </td>
    </tr>
    </table>
    </td>
    </tr>
    
    </table>
    </td>
    </tr>
    </table>
    </body>
    </html>
  `;
};

const generateStudentContractEmailTemplate = (recipientName: string, contractLink: string) => {
  return `
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc;">
    <tr>
    <td style="padding: 20px 0;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border: 1px solid #e2e8f0; border-collapse: collapse; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
    
    <!-- Header -->
    <tr>
    <td align="center" bgcolor="#0086A4" style="padding: 40px 30px;">
    <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    Der Nachhilfevertrag: Der letzte Schritt zum Erfolg
    </h1>
    </td>
    </tr>
    
    <!-- Content -->
    <tr>
    <td bgcolor="#ffffff" style="padding: 40px 30px;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
    
    <!-- Greeting -->
    <tr>
    <td style="color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; padding-bottom: 20px;">
    <strong>Hallo ${recipientName},</strong>
    </td>
    </tr>
    
    <!-- Intro -->
    <tr>
    <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 24px; padding-bottom: 24px;">
    vielen Dank für das angenehme Telefonat. Wir freuen uns, dass Sie sich für CleverCoach Nachhilfe entschieden haben.
    </td>
    </tr>
    
    <tr>
    <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 24px; padding-bottom: 24px;">
    Unter folgendem Link finden Sie Ihren Vertrag.
    </td>
    </tr>
    
    <tr>
    <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 24px; padding-bottom: 24px;">
    Bitte überprüfen Sie ihn und unterschreiben Sie ihn so bald wie möglich, damit der Unterricht weiter fortgesetzt werden kann.
    </td>
    </tr>
    
    <!-- CTA Button -->
    <tr>
    <td style="padding: 10px 0 30px 0;">
    <a href="${contractLink}" style="display: inline-block; background-color: #0086A4; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(0, 134, 164, 0.2);">
    Vertrag
    </a>
    </td>
    </tr>
    
    <tr>
    <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 24px; padding-bottom: 24px;">
    Sollten Sie Fragen haben oder weitere Erläuterungen benötigen, zögern Sie nicht, uns zu kontaktieren.
    </td>
    </tr>
    
    <tr>
    <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 24px; padding-bottom: 24px;">
    Wir freuen uns auf eine erfolgreiche Zusammenarbeit.
    </td>
    </tr>
    
    <tr>
    <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 24px; padding-bottom: 24px;">
    Vielen Dank, dass Sie sich für CleverCoach-Nachhilfe entschieden haben.
    </td>
    </tr>
    
    <!-- Closing -->
    <tr>
    <td style="padding-top: 30px; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px;">
    Mit freundlichen Grüßen,<br/>
    <strong>CleverCoach Nachhilfe Team</strong><br/>
    <strong>Tav & Uzun GbR</strong><br/>
    <strong>CleverCoach Nachhilfe</strong><br/>
    Höschenhofweg 31<br/>
    47249 Duisburg<br/>
    Tel: 0203 39652097<br/>
    E-Mail: Kontakt@clevercoach-nachhilfe.de
    </td>
    </tr>
    
    </table>
    </td>
    </tr>
    
    <!-- Footer -->
    <tr>
    <td bgcolor="#f8fafc" style="padding: 24px 30px; border-top: 1px solid #e2e8f0;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
    <td style="color: #94a3b8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; line-height: 18px;">
    <strong style="color: #64748b;">CleverCoach Nachhilfe</strong><br/>
    Tav & Uzun GbR<br/>
    Höschenhofweg 31, 47249 Duisburg<br/>
    Tel: 0203 39652097 | Email: kontakt@clevercoach-nachhilfe.de
    </td>
    </tr>
    <tr>
    <td style="padding-top: 16px; color: #94a3b8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px;">
    This is an automated message. Please do not reply to this email.
    </td>
    </tr>
    </table>
    </td>
    </tr>
    
    </table>
    </td>
    </tr>
    </table>
    </body>
    </html>
  `;
};

const generateStudentContractConfirmationTemplate = (recipientName: string, contractViewLink: string) => {
  return `
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc;">
    <tr>
    <td style="padding: 20px 0;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border: 1px solid #e2e8f0; border-collapse: collapse; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
    
    <!-- Header -->
    <tr>
    <td align="center" bgcolor="#0086A4" style="padding: 40px 30px;">
    <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    Vertragsbestätigung und Kopie
    </h1>
    </td>
    </tr>
    
    <!-- Content -->
    <tr>
    <td bgcolor="#ffffff" style="padding: 40px 30px;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
    
    <!-- Greeting -->
    <tr>
    <td style="color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; padding-bottom: 20px;">
    <strong>Hallo ${recipientName},</strong>
    </td>
    </tr>
    
    <!-- Confirmation -->
    <tr>
    <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 24px; padding-bottom: 24px;">
    wir freuen uns, Ihnen bestätigen zu können, dass wir Ihren unterschriebenen Vertrag erhalten haben.
    </td>
    </tr>
    
    <tr>
    <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 24px; padding-bottom: 24px;">
    Vielen Dank, dass Sie sich für uns entschieden haben!
    </td>
    </tr>
    
    <tr>
    <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 24px; padding-bottom: 24px;">
    Für Ihre Unterlagen können Sie eine Kopie des unterschriebenen Vertrags unter folgendem Link einsehen:
    </td>
    </tr>
    
    <!-- CTA Button -->
    <tr>
    <td style="padding: 10px 0 30px 0;">
    <a href="${contractViewLink}" style="display: inline-block; background-color: #0086A4; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(0, 134, 164, 0.2);">
    Vertrag ansehen
    </a>
    </td>
    </tr>
    
    <tr>
    <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 24px; padding-bottom: 24px;">
    Sollten Sie Fragen haben oder weitere Unterstützung benötigen, zögern Sie bitte nicht, uns zu kontaktieren. Unsere allgemeinen Geschäftsbedingungen (AGB) können Sie unter folgendem Link einsehen: https://clevercoach-nachhilfe.de/terms-of-service/. Dort finden Sie jederzeit alle Informationen zu Kündigungen, Pausierungen, Bezahlung, Ausnahmesituationen und weiteren relevanten Regelungen. Wir freuen uns darauf, mit Ihnen zusammenzuarbeiten.
    </td>
    </tr>
    
    <!-- Closing -->
    <tr>
    <td style="padding-top: 30px; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px;">
    Mit freundlichen Grüßen,<br/>
    <strong>CleverCoach Nachhilfe Team</strong><br/>
    <strong>Tav & Uzun GbR</strong><br/>
    <strong>CleverCoach Nachhilfe</strong><br/>
    Höschenhofweg 31<br/>
    47249 Duisburg<br/>
    Tel: 0203 39652097<br/>
    E-Mail: Kontakt@clevercoach-nachhilfe.de
    </td>
    </tr>
    
    </table>
    </td>
    </tr>
    
    <!-- Footer -->
    <tr>
    <td bgcolor="#f8fafc" style="padding: 24px 30px; border-top: 1px solid #e2e8f0;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
    <td style="color: #94a3b8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; line-height: 18px;">
    <strong style="color: #64748b;">CleverCoach Nachhilfe</strong><br/>
    Tav & Uzun GbR<br/>
    Höschenhofweg 31, 47249 Duisburg<br/>
    Tel: 0203 39652097 | Email: kontakt@clevercoach-nachhilfe.de
    </td>
    </tr>
    <tr>
    <td style="padding-top: 16px; color: #94a3b8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px;">
    This is an automated message. Please do not reply to this email.
    </td>
    </tr>
    </table>
    </td>
    </tr>
    
    </table>
    </td>
    </tr>
    </table>
    </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      contract_id, 
      contract_type = 'teacher', 
      action = 'send',
      base_url, 
      teacher_id,
      admin_user_id 
    } = await req.json();
    
    let recipientName: string;
    let recipientEmail: string;
    let contractLink: string;
    let emailSubject: string;
    let emailHtml: string;
    
    const baseUrl = base_url || Deno.env.get('SITE_URL') || 'https://clevercoach.com';

    if (contract_type === 'student' && contract_id) {
      // Fetch student contract data from database
      const { data: contract, error: contractError } = await supabase
        .from('tbl_contracts')
        .select(`
          fld_id,
          fld_sid,
          fld_status,
          student:tbl_students(
            fld_id,
            fld_first_name,
            fld_last_name,
            fld_email
          )
        `)
        .eq('fld_id', contract_id)
        .single();

      if (contractError || !contract) {
        throw new Error(`Contract not found: ${contractError?.message}`);
      }

      recipientName = `${contract.student.fld_first_name} ${contract.student.fld_last_name}`;
      recipientEmail = contract.student.fld_email;
      
      if (action === 'send') {
        // Generate secure contract link for signing
        const encodedId = btoa(contract_id.toString());
        contractLink = `${baseUrl}/student-contract-signing/${encodedId}`;
        emailSubject = "Der Nachhilfevertrag: Der letzte Schritt zum Erfolg";
        emailHtml = generateStudentContractEmailTemplate(recipientName, contractLink);
      } else if (action === 'confirmation') {
        // Generate contract view link for confirmation
        const encodedId = btoa(contract_id.toString());
        contractLink = `${baseUrl}/student-contract-view/${encodedId}`;
        emailSubject = "Vertragsbestätigung und Kopie";
        emailHtml = generateStudentContractConfirmationTemplate(recipientName, contractLink);
      }
      
      console.log(`Sending student contract ${action} email to:`, recipientEmail);

    } else if (contract_type === 'teacher' && contract_id) {
      // Fetch teacher data from database
      const { data: teacher, error: teacherError } = await supabase
        .from('tbl_teachers')
        .select(`
          fld_id,
          fld_status,
          fld_per_l_rate,
          fld_first_name,
          fld_last_name,
          fld_email,
          tbl_users:fld_uid (
            fld_id,
            fld_name,
            fld_email
          )
        `)
        .eq('fld_id', contract_id)
        .single();

      if (teacherError || !teacher) {
        throw new Error(`Teacher not found: ${teacherError?.message}`);
      }

      recipientName = `${teacher.fld_first_name} ${teacher.fld_last_name}`;
      recipientEmail = teacher.fld_email;
      
      // Generate secure contract link matching React implementation
      const encodedId = btoa(contract_id.toString());
      contractLink = `${baseUrl}/teacher-contract-signing/${encodedId}`;
      emailSubject = "Teaching Contract - CleverCoach";
      emailHtml = generateTeacherContractEmailTemplate(recipientName, contractLink);
      
      console.log("Sending teacher contract email to:", recipientEmail);

    } else {
      throw new Error("Invalid request: Please provide contract_id with appropriate contract_type");
    }

    // Send email via SendGrid
    const sendGridApiKey = Deno.env.get("SENDGRID_API_KEY");
    if (!sendGridApiKey) {
      throw new Error("SendGrid API key not configured");
    }

    // Get from email from company settings
    const fromEmail = await getFromEmail();

    const payload = {
      personalizations: [{
        to: [{ email: recipientEmail }]
      }],
      from: {
        email: fromEmail,
        name: "CleverCoach"
      },
      subject: emailSubject,
      content: [{
        type: "text/html",
        value: emailHtml
      }]
    };

    const emailResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendGridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      throw new Error(`SendGrid API error: ${emailResponse.status} - ${errorText}`);
    }

    console.log("Contract email sent successfully");

    // Update database with contract_sent_at timestamp and admin user
    if (contract_type === 'teacher' && teacher_id) {
      const updateData: any = {
        fld_onboard_date: new Date().toISOString()
      };
      
      // Set onboarded_by if admin_user_id is provided
      if (admin_user_id) {
        updateData.fld_onboard_uid = admin_user_id;
      }

      const { error: updateError } = await supabase
        .from('tbl_teachers')
        .update(updateData)
        .eq('fld_id', parseInt(teacher_id));

      if (updateError) {
        console.error('Error updating teacher onboard date:', updateError);
        // Don't fail the entire request, just log the error
      } else {
        console.log('Updated teacher onboard date and onboard uid');
      }
    } else if (contract_type === 'student' && contract_id) {
      // For students, we could update a contract record if needed
      // For now, we'll just log that the email was sent
      console.log('Student contract email sent - no database update needed for students table');
    }

    return new Response(JSON.stringify({
      success: true,
      message: `${contract_type === 'teacher' ? 'Teacher' : 'Student'} contract email sent successfully`,
      recipient: recipientEmail,
      contract_type
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-contract-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);