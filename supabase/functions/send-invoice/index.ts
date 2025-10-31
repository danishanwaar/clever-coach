import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendInvoiceRequest {
  invoiceId: number;
  email: string;
  type: 'receivables' | 'payables'; // 'receivables' = student invoice, 'payables' = teacher invoice
  studentId?: number;
  teacherId?: number;
  baseUrl?: string;
}

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

const generateInvoiceEmail = (
  recipientName: string,
  recipientSalutation: string,
  invoiceId: number,
  invoiceUrl: string,
  fromName: string,
  fromEmail: string,
  isTeacher: boolean = false
): string => {
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
                    Ihre Rechnung
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
                        <strong>Sehr geehrte/r ${recipientSalutation} ${recipientName},</strong>
                      </td>
                    </tr>
                    
                    <!-- Intro -->
                    <tr>
                      <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 24px; padding-bottom: 20px;">
                        wir hoffen, dass Sie diese Nachricht wohlbehalten erreicht. Ihre Rechnung für diesen Monat wurde ausgestellt. Sie können die Rechnung über den folgenden Link einsehen und herunterladen:
                      </td>
                    </tr>
                    
                    <!-- CTA Button -->
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${invoiceUrl}" style="display: inline-block; background-color: #0086A4; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(0, 134, 164, 0.2);">
                          Rechnung anzeigen →
                        </a>
                      </td>
                    </tr>
                    
                    <!-- Additional Info -->
                    <tr>
                      <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 24px; padding-bottom: 20px;">
                        Sollten Sie Fragen zur Rechnung haben oder weitere Unterstützung benötigen, stehen wir Ihnen gerne zur Verfügung.
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 24px; padding-bottom: 20px;">
                        Vielen Dank, dass Sie sich für CleverCoach entschieden haben.
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 24px; padding-bottom: 20px;">
                        Wir freuen uns auf die weitere erfolgreiche Zusammenarbeit.
                      </td>
                    </tr>
                    
                    <!-- Closing -->
                    <tr>
                      <td style="padding-top: 30px; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px;">
                        Mit freundlichen Grüßen,<br/>
                        <strong>${fromName}</strong>
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
                        Tel: 0203 39652097 | Email: ${fromEmail}
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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoiceId, email, type, studentId, teacherId, baseUrl }: SendInvoiceRequest = await req.json();
    
    const sendGridApiKey = Deno.env.get("SENDGRID_API_KEY");
    if (!sendGridApiKey) {
      throw new Error("SendGrid API key not configured");
    }

    // Validate that either studentId or teacherId is provided
    if (!studentId && !teacherId) {
      throw new Error('Either studentId or teacherId must be provided');
    }

    // Determine if this is a teacher invoice based on type and provided ID
    const isTeacher = type === 'payables' || !!teacherId;

    // Get from email from company settings
    const fromEmail = await getFromEmail();

    // Fetch recipient data (student or teacher)
    let recipientName = '';
    let recipientSalutation = '';
    
    if (isTeacher && teacherId) {
      // Fetch teacher data
      const { data: teacher, error: teacherError } = await supabase
        .from('tbl_teachers')
        .select('fld_first_name, fld_last_name, fld_sal')
        .eq('fld_id', teacherId)
        .single();

      if (teacherError || !teacher) {
        throw new Error('Teacher not found');
      }

      recipientName = `${teacher.fld_first_name} ${teacher.fld_last_name}`;
      recipientSalutation = teacher.fld_sal || '';
    } else if (studentId) {
      // Fetch student data
      const { data: student, error: studentError } = await supabase
        .from('tbl_students')
        .select('fld_first_name, fld_last_name, fld_sal')
        .eq('fld_id', studentId)
        .single();

      if (studentError || !student) {
        throw new Error('Student not found');
      }

      recipientName = `${student.fld_first_name} ${student.fld_last_name}`;
      recipientSalutation = student.fld_sal || '';
    } else {
      throw new Error('Invalid request: missing studentId or teacherId');
    }

    // Get system configuration for sender name
    const { data: config } = await supabase
      .from('tbl_system_config')
      .select('fld_fname, fld_femail')
      .eq('fld_cflag', 'Active')
      .single();

    const fromName = config?.fld_fname || 'CleverCoach Team';

    // Generate invoice URL - use correct route based on type
    const siteUrl = baseUrl || Deno.env.get('SITE_URL') || 'https://clevercoach-nachhilfe.de';
    const invoiceUrl = `${siteUrl}/invoices/view/${invoiceId}?type=${type}`;

    // Generate email content
    const htmlContent = generateInvoiceEmail(
      recipientName,
      recipientSalutation,
      invoiceId,
      invoiceUrl,
      fromName,
      fromEmail,
      isTeacher
    );

    // Prepare the email payload
    const payload = {
      personalizations: [{
        to: [{ email }],
      }],
      from: {
        email: fromEmail,
        name: fromName
      },
      subject: 'Ihre Rechnung',
      content: [{
        type: "text/html",
        value: htmlContent
      }]
    };

    console.log("Sending invoice email with payload:", JSON.stringify(payload, null, 2));

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendGridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SendGrid API error:", response.status, errorText);
      throw new Error(`SendGrid API error: ${response.status} - ${errorText}`);
    }

    console.log("Invoice email sent successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Invoice email sent successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-invoice function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send invoice email" 
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
