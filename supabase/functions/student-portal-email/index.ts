import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StudentPortalRequest {
  action: 'schedule_lesson' | 'view_progress' | 'payment_notification' | 'lesson_reminder' | 'homework_assignment';
  student_id: string;
  email?: string;
  lesson_data?: {
    date: string;
    time: string;
    subject: string;
    teacher_name: string;
    duration: number;
  };
  progress_data?: {
    lessons_completed: number;
    next_lesson_date: string;
    progress_notes: string;
  };
  payment_data?: {
    amount: number;
    due_date: string;
    invoice_number: string;
  };
  homework_data?: {
    assignment: string;
    due_date: string;
    subject: string;
  };
}

const generateLessonSchedulingEmail = (data: any) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Lesson Scheduling Request</h2>
      
      <p>Dear Student/Parent,</p>
      
      <p>We would like to schedule your next ${data.lesson_data.subject} lesson with ${data.lesson_data.teacher_name}.</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Proposed Lesson Details:</h3>
        <ul>
          <li><strong>Subject:</strong> ${data.lesson_data.subject}</li>
          <li><strong>Teacher:</strong> ${data.lesson_data.teacher_name}</li>
          <li><strong>Date:</strong> ${data.lesson_data.date}</li>
          <li><strong>Time:</strong> ${data.lesson_data.time}</li>
          <li><strong>Duration:</strong> ${data.lesson_data.duration} minutes</li>
        </ul>
      </div>
      
      <p>Please reply to this email with one of the following:</p>
      <ul>
        <li><strong>CONFIRM</strong> - to confirm the lesson as scheduled</li>
        <li><strong>RESCHEDULE</strong> - to request a different time (please include preferred times)</li>
        <li><strong>CANCEL</strong> - to cancel this lesson</li>
      </ul>
      
      <p>We look forward to hearing from you!</p>
      
      <p>Best regards,<br>CleverCoach Team</p>
    </div>
  `;
};

const generateProgressReportEmail = (data: any) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Student Progress Report</h2>
      
      <p>Dear Student/Parent,</p>
      
      <p>Here's your latest progress update:</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Progress Summary:</h3>
        <ul>
          <li><strong>Lessons Completed:</strong> ${data.progress_data.lessons_completed}</li>
          <li><strong>Next Lesson:</strong> ${data.progress_data.next_lesson_date}</li>
        </ul>
        
        <h4>Teacher's Notes:</h4>
        <p style="background: white; padding: 15px; border-left: 4px solid #2563eb;">
          ${data.progress_data.progress_notes}
        </p>
      </div>
      
      <p>Keep up the great work!</p>
      
      <p>Best regards,<br>CleverCoach Team</p>
    </div>
  `;
};

const generatePaymentNotificationEmail = (data: any) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Payment Due Notification</h2>
      
      <p>Dear Student/Parent,</p>
      
      <p>This is a friendly reminder about your upcoming payment:</p>
      
      <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <h3>Payment Details:</h3>
        <ul>
          <li><strong>Invoice Number:</strong> ${data.payment_data.invoice_number}</li>
          <li><strong>Amount Due:</strong> €${data.payment_data.amount}</li>
          <li><strong>Due Date:</strong> ${data.payment_data.due_date}</li>
        </ul>
      </div>
      
      <p>Please ensure payment is made by the due date to continue your lessons without interruption.</p>
      
      <p>If you have any questions about this invoice, please reply to this email.</p>
      
      <p>Best regards,<br>CleverCoach Team</p>
    </div>
  `;
};

const generateHomeworkAssignmentEmail = (data: any) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">New Homework Assignment</h2>
      
      <p>Dear Student,</p>
      
      <p>You have received a new homework assignment for ${data.homework_data.subject}:</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Assignment Details:</h3>
        <p><strong>Subject:</strong> ${data.homework_data.subject}</p>
        <p><strong>Due Date:</strong> ${data.homework_data.due_date}</p>
        
        <h4>Assignment:</h4>
        <div style="background: white; padding: 15px; border-left: 4px solid #2563eb;">
          ${data.homework_data.assignment}
        </div>
      </div>
      
      <p>Please complete this assignment by the due date and bring it to your next lesson.</p>
      
      <p>Good luck with your studies!</p>
      
      <p>Best regards,<br>CleverCoach Team</p>
    </div>
  `;
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

const generateLessonReminderEmail = (data: any) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Lesson Reminder</h2>
      
      <p>Dear Student/Parent,</p>
      
      <p>This is a reminder about your upcoming lesson:</p>
      
      <div style="background: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
        <h3>Lesson Details:</h3>
        <ul>
          <li><strong>Subject:</strong> ${data.lesson_data.subject}</li>
          <li><strong>Teacher:</strong> ${data.lesson_data.teacher_name}</li>
          <li><strong>Date:</strong> ${data.lesson_data.date}</li>
          <li><strong>Time:</strong> ${data.lesson_data.time}</li>
          <li><strong>Duration:</strong> ${data.lesson_data.duration} minutes</li>
        </ul>
      </div>
      
      <p>Please be ready 5 minutes before the scheduled time.</p>
      
      <p>If you need to reschedule or cancel, please reply to this email as soon as possible.</p>
      
      <p>Best regards,<br>CleverCoach Team</p>
    </div>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: StudentPortalRequest = await req.json();
    
    // Get student email if not provided
    let studentEmail = requestData.email;
    if (!studentEmail) {
      const { data: student } = await supabase
        .from('tbl_students')
        .select('fld_email')
        .eq('fld_id', requestData.student_id)
        .single();
      
      studentEmail = student?.fld_email;
    }

    if (!studentEmail) {
      throw new Error('Student email not found');
    }

    let emailHtml = '';
    let emailSubject = '';

    switch (requestData.action) {
      case 'schedule_lesson':
        emailHtml = generateLessonSchedulingEmail(requestData);
        emailSubject = `Lesson Scheduling Request - ${requestData.lesson_data?.subject}`;
        break;
        
      case 'view_progress':
        emailHtml = generateProgressReportEmail(requestData);
        emailSubject = 'Your Progress Report';
        break;
        
      case 'payment_notification':
        emailHtml = generatePaymentNotificationEmail(requestData);
        emailSubject = `Payment Due - Invoice ${requestData.payment_data?.invoice_number}`;
        break;
        
      case 'homework_assignment':
        emailHtml = generateHomeworkAssignmentEmail(requestData);
        emailSubject = `New Homework Assignment - ${requestData.homework_data?.subject}`;
        break;
        
      case 'lesson_reminder':
        emailHtml = generateLessonReminderEmail(requestData);
        emailSubject = `Lesson Reminder - ${requestData.lesson_data?.subject}`;
        break;
        
      default:
        throw new Error('Invalid action type');
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
        to: [{ email: studentEmail }]
      }],
      from: {
        email: fromEmail,
        name: "CleverCoach Student Portal"
      },
      reply_to: {
        email: "support@clevercoach.com"
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

    // Log the student portal activity (commented out since student_activities table doesn't exist in current structure)
    // await supabase
    //   .from('student_activities')
    //   .insert({
    //     student_id: requestData.student_id,
    //     activity_type_id: '00000000-0000-0000-0000-000000000002', // Email Communication activity type
    //     description: `Email sent: ${requestData.action}`,
    //     notes: `Subject: ${emailSubject}`,
    //     admin_user_id: 'system' // System-generated email
    //   });

    console.log("Student portal email sent successfully:", emailResponse);

    return new Response(JSON.stringify({
      success: true,
      message_id: "sent",
      action: requestData.action,
      recipient: studentEmail
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in student-portal-email function:", error);
    
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