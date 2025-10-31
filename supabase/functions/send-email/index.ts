import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  template_type?: string;
  data?: Record<string, any>;
  from?: string;
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

const generateTeacherApplicationThankYouEmail = (firstName: string, lastName: string): string => {
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
    Application Received! 🎓
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
    <strong>Hello ${firstName} ${lastName},</strong>
    </td>
    </tr>
    
    <!-- Intro -->
    <tr>
    <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 24px; padding-bottom: 20px;">
    Thank you for applying to become a tutor at <strong>CleverCoach Nachhilfe</strong>! We've successfully received your application.
    </td>
    </tr>
    
    <!-- Status Card -->
    <tr>
    <td style="background-color: #f0f9ff; border-left: 4px solid #0086A4; padding: 20px; border-radius: 4px; margin-bottom: 24px;">
    <p style="margin: 0; color: #0c4a6e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 22px;">
    <strong>📋 Application Status:</strong> Under Review<br/>
    <strong>⏱️ Expected Response:</strong> Within 2-3 business days
    </p>
    </td>
    </tr>
    
    <!-- Next Steps -->
    <tr>
    <td style="padding-top: 24px;">
    <h2 style="color: #0086A4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">
    What Happens Next?
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
    Our team will review your application and qualifications
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
    If approved, you'll receive a contract via email to sign
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
    Once signed, you'll get access to your teacher portal and can start teaching!
    </td>
    </tr>
    </table>
    </td>
    </tr>
    
    <!-- Important Note -->
    <tr>
    <td style="padding-top: 24px;">
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px;">
    <p style="margin: 0; color: #92400e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 20px;">
    <strong>💡 Keep Your Phone Handy:</strong> We may contact you via phone or email for any additional information or to schedule an interview.
            </p>
          </div>
    </td>
    </tr>
    
    <!-- Closing -->
    <tr>
    <td style="padding-top: 30px; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px;">
    Best regards,<br/>
    <strong>The CleverCoach Team</strong>
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


const generateAdminContractNotificationEmail = (teacherName: string, subjects: string, city: string, phone: string): string => {
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
    Contract Signed! 📝
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
    <strong>Hallo Admin-Team,</strong>
    </td>
    </tr>
    
    <!-- Intro -->
    <tr>
    <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 24px; padding-bottom: 24px;">
    wir freuen uns, Ihnen mitteilen zu können, dass die folgende Lehrkraft die Honorarvereinbarung erfolgreich unterzeichnet hat.
    </td>
    </tr>
    
    <!-- Teacher Details -->
    <tr>
    <td style="background-color: #f0f9ff; border: 1px solid #0086A4; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
    <h3 style="margin: 0 0 16px 0; color: #0086A4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 600;">
    📋 Teacher Details
    </h3>
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
    <td style="color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; padding-bottom: 8px;">
    Name:
    </td>
    </tr>
    <tr>
    <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 20px; padding-bottom: 12px;">
    ${teacherName}
    </td>
    </tr>
    <tr>
    <td style="color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; padding-bottom: 8px;">
    Subjects:
    </td>
    </tr>
    <tr>
    <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 20px; padding-bottom: 12px;">
    ${subjects}
    </td>
    </tr>
    <tr>
    <td style="color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; padding-bottom: 8px;">
    City:
    </td>
    </tr>
    <tr>
    <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 20px; padding-bottom: 12px;">
    ${city}
    </td>
    </tr>
    <tr>
    <td style="color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; padding-bottom: 8px;">
    Phone:
    </td>
    </tr>
    <tr>
    <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 20px;">
    ${phone}
    </td>
    </tr>
    </table>
    </td>
    </tr>
    
    <!-- Closing -->
    <tr>
    <td style="padding-top: 30px; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px;">
    Best regards,<br/>
    <strong>CleverCoach System</strong>
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

const generateTeacherWelcomeEmail = (firstName: string, email: string, tempPassword: string, portalUrl: string): string => {
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
    Welcome to CleverCoach! 🎉
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
    <strong>Congratulations ${firstName}!</strong>
    </td>
    </tr>
    
    <!-- Intro -->
    <tr>
    <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 24px; padding-bottom: 24px;">
    Your teaching contract has been successfully signed! Your account is now active and you can start accessing your teacher portal.
    </td>
    </tr>
    
    <!-- Credentials Card -->
    <tr>
    <td style="background-color: #f0f9ff; border: 1px solid #0086A4; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
    <h3 style="margin: 0 0 16px 0; color: #0086A4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 600;">
    🔑 Your Login Credentials
    </h3>
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 12px;">
    <tr>
    <td style="color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; padding-bottom: 8px;">
    Email:
    </td>
    </tr>
    <tr>
    <td style="background-color: #ffffff; border: 1px solid #cbd5e1; padding: 10px 12px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 14px; color: #334155;">
    ${email}
    </td>
    </tr>
    </table>
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
    <td style="color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; padding-bottom: 8px;">
    Temporary Password:
    </td>
    </tr>
    <tr>
    <td style="background-color: #ffffff; border: 1px solid #cbd5e1; padding: 10px 12px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 14px; color: #334155;">
    ${tempPassword}
    </td>
    </tr>
    </table>
    </td>
    </tr>
    
    <!-- Warning Card -->
    <tr>
    <td style="padding-top: 20px;">
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px;">
    <p style="margin: 0; color: #92400e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 20px;">
    <strong>🔒 Security Notice:</strong> Please change your password after your first login to ensure your account security.
    </p>
    </div>
    </td>
    </tr>
    
    <!-- CTA Button -->
    <tr>
    <td align="center" style="padding: 30px 0;">
    <a href="${portalUrl}" style="display: inline-block; background-color: #0086A4; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(0, 134, 164, 0.2);">
    Access Teacher Portal →
    </a>
    </td>
    </tr>
    
    <!-- Getting Started -->
    <tr>
    <td style="padding-top: 10px;">
    <h2 style="color: #0086A4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">
    Getting Started
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
    Log in to your teacher portal using the credentials above
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
    Change your password in settings for security
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
    Wait for student requests via email, phone, or WhatsApp
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
    Accept requests and start teaching amazing students!
    </td>
    </tr>
    </table>
    </td>
    </tr>
    
    <!-- Important Points -->
    <tr>
    <td style="padding-top: 30px;">
    <h3 style="color: #0086A4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">
    Important Reminders
    </h3>
    </td>
    </tr>
    
    <tr>
    <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 22px; padding-bottom: 8px;">
    • Submit your teaching hours by the 1st of each month for payment on the 15th-18th
    </td>
    </tr>
    
    <tr>
    <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 22px; padding-bottom: 8px;">
    • Respond promptly to student requests (they may find other tutors quickly)
    </td>
    </tr>
    
    <tr>
    <td style="color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 22px; padding-bottom: 8px;">
    • Set yourself as inactive in the portal when you're unavailable
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
    <strong>The CleverCoach Team</strong>
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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailData: EmailRequest = await req.json();
    
    const sendGridApiKey = Deno.env.get("SENDGRID_API_KEY");
    if (!sendGridApiKey) {
      throw new Error("SendGrid API key not configured");
    }

    // Get from email from company settings
    const fromEmail = await getFromEmail();

    // Generate HTML content if template_type is provided
    let htmlContent = emailData.html;
    
    if (emailData.template_type === 'teacher_welcome' && emailData.data) {
      // Always fetch temp password from user metadata using teacher_id
      if (!emailData.data.teacher_id) {
        throw new Error('teacher_id is required for teacher_welcome emails');
      }

      // Get teacher details from current structure
      const { data: teacher, error: teacherError } = await supabase
        .from('tbl_teachers')
        .select('fld_id, fld_first_name, fld_email, fld_uid')
        .eq('fld_id', emailData.data.teacher_id)
        .single();

      if (teacherError || !teacher) {
        console.error('Error fetching teacher:', teacherError);
        throw new Error('Teacher not found');
      }

      // Get user details to access auth_user_id
      const { data: user, error: userError } = await supabase
        .from('tbl_users')
        .select('fld_id, fld_auth_user_id')
        .eq('fld_id', teacher.fld_uid)
        .single();

      if (userError || !user) {
        console.error('User not found for teacher:', teacher.fld_uid, userError);
        throw new Error('User account not found for teacher.');
      }

      if (!user.fld_auth_user_id) {
        console.error('Teacher has no auth_user_id:', emailData.data.teacher_id);
        throw new Error('Teacher account not properly set up - missing auth_user_id');
      }

      // Get auth user to retrieve temp password from metadata
      const { data: authUser, error: authUserError } = await supabase.auth.admin.getUserById(
        user.fld_auth_user_id
      );

      if (authUserError || !authUser) {
        console.error('Auth user not found for teacher:', user.fld_auth_user_id, authUserError);
        throw new Error('Teacher authentication account not found.');
      }

      // Get existing temp password from user metadata
      const tempPassword = authUser.user.user_metadata?.temp_password;

      if (!tempPassword) {
        console.error('No temp password in metadata for teacher:', emailData.data.teacher_id);
        throw new Error('Temporary password not found. Teacher may need to reset password.');
      }

      console.log('Retrieved temp password for teacher:', emailData.data.teacher_id);

      htmlContent = generateTeacherWelcomeEmail(
        teacher.fld_first_name,
        teacher.fld_email,
        tempPassword,
        emailData.data.portal_url || 'https://clevercoach-nachhilfe.de'
      );
    } else if (emailData.template_type === 'admin_contract_notification' && emailData.data) {
      htmlContent = generateAdminContractNotificationEmail(
        emailData.data.teacherName,
        emailData.data.subjects,
        emailData.data.city,
        emailData.data.phone
      );
    } else if (emailData.template_type === 'teacher_application_thankyou' && emailData.data) {
      htmlContent = generateTeacherApplicationThankYouEmail(
        emailData.data.first_name,
        emailData.data.last_name
      );
    }

    // Prepare the email payload
    const payload: any = {
      personalizations: [{
        to: Array.isArray(emailData.to) 
          ? emailData.to.map(email => ({ email }))
          : [{ email: emailData.to }],
        ...(emailData.templateData && { dynamic_template_data: emailData.templateData })
      }],
      from: {
        email: emailData.from || fromEmail,
        name: "CleverCoach"
      },
      subject: emailData.subject,
    };

    // Add content based on whether it's a template or regular email
    if (emailData.templateId) {
      payload.template_id = emailData.templateId;
    } else {
      payload.content = [];
      if (emailData.text) {
        payload.content.push({
          type: "text/plain",
          value: emailData.text
        });
      }
      if (htmlContent) {
        payload.content.push({
          type: "text/html",
          value: htmlContent
        });
      }
    }

    console.log("Sending email with payload:", JSON.stringify(payload, null, 2));

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

    console.log("Email sent successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send email" 
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