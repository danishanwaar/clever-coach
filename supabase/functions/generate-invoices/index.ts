import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, period } = await req.json()
    
    if (!type || !period) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let month: number
    let year: number
    let date: string

    if (period === 'current') {
      const now = new Date()
      month = now.getMonth() + 1
      year = now.getFullYear()
      date = now.toISOString().split('T')[0]
    } else {
      // Previous month
      const lastMonth = new Date()
      lastMonth.setMonth(lastMonth.getMonth() - 1)
      month = lastMonth.getMonth() + 1
      year = lastMonth.getFullYear()
      date = new Date(year, month - 1, 0).toISOString().split('T')[0] // Last day of previous month
    }

    if (type === 'receivables') {
      await generateStudentInvoices(supabaseClient, month, year, date)
    } else if (type === 'payables') {
      await generateTeacherInvoices(supabaseClient, month, year, date)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Invoices generated successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error generating invoices:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function generateStudentInvoices(supabase: any, month: number, year: number, date: string) {
  // Get distinct students with active lessons for the period
  const { data: students, error: studentsError } = await supabase
    .from('tbl_teachers_lessons_history')
    .select('fld_sid')
    .eq('fld_mon', month.toString().padStart(2, '0'))
    .eq('fld_year', year.toString())
    .eq('fld_status', 'Active')

  if (studentsError) throw studentsError

  const uniqueStudents = [...new Set(students.map(s => s.fld_sid))]

  for (const studentId of uniqueStudents) {
    // Get student registration fee info
    const { data: student, error: studentError } = await supabase
      .from('tbl_students')
      .select('fld_reg_fee, fld_rf_flag')
      .eq('fld_id', studentId)
      .single()

    if (studentError) throw studentError

    // Get lesson history for this student
    const { data: lessons, error: lessonsError } = await supabase
      .from('tbl_teachers_lessons_history')
      .select(`
        *,
        tbl_students_subjects!inner(
          fld_cid,
          tbl_contracts!inner(
            fld_lp,
            fld_lesson_dur,
            fld_s_per_lesson_rate,
            fld_min_lesson
          ),
          tbl_subjects!inner(fld_subject)
        ),
        tbl_students!inner(
          fld_s_first_name,
          fld_s_last_name,
          fld_wh
        )
      `)
      .eq('fld_sid', studentId)
      .eq('fld_mon', month.toString().padStart(2, '0'))
      .eq('fld_year', year.toString())
      .eq('fld_status', 'Active')
      .order('fld_ssid')
      .order('fld_edate')

    if (lessonsError) throw lessonsError

    if (lessons.length === 0) continue

    // Calculate totals
    let totalHours = 0
    let detail = ''
    let lhid = ''
    let contractId = ''
    let lessonDuration = ''
    let edate = ''
    let perLessonRate = 0
    let weeklyHours = 0

    for (const lesson of lessons) {
      const subject = lesson.tbl_students_subjects.tbl_subjects.fld_subject
      const contract = lesson.tbl_students_subjects.tbl_contracts
      const student = lesson.tbl_students

      if (!detail.includes(subject)) {
        detail += `${subject} Tutoring ${contract.fld_lp}<br>`
      }

      lhid += `${lesson.fld_id},`
      totalHours += lesson.fld_lesson
      weeklyHours = student.fld_wh
      contractId = lesson.tbl_students_subjects.fld_cid
      lessonDuration = contract.fld_lesson_dur
      edate = lesson.fld_edate
      perLessonRate = contract.fld_s_per_lesson_rate

      // Update lesson status
      await supabase
        .from('tbl_teachers_lessons_history')
        .update({ fld_status: 'Invoice Created' })
        .eq('fld_id', lesson.fld_id)
    }

    // Calculate final hours
    const finalHours = totalHours < weeklyHours && student.fld_rf_flag === 'Y' 
      ? weeklyHours 
      : totalHours

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('tbl_students_invoices')
      .insert({
        fld_sid: studentId,
        fld_lhid: lhid.slice(0, -1), // Remove trailing comma
        fld_invoice_total: 0,
        fld_invoice_hr: 0,
        fld_min_lesson: weeklyHours,
        fld_edate: date,
        fld_uname: 1, // TODO: Get from auth context
        fld_status: 'Paid'
      })
      .select()
      .single()

    if (invoiceError) throw invoiceError

    // Create invoice detail
    const { error: detailError } = await supabase
      .from('tbl_students_invoices_detail')
      .insert({
        fld_iid: invoice.fld_id,
        fld_ssid: 0,
        fld_cid: contractId,
        fld_detail: detail,
        fld_len_lesson: lessonDuration,
        fld_l_date: edate,
        fld_lesson: finalHours,
        fld_s_rate: perLessonRate,
        fld_my: `${month.toString().padStart(2, '0')}.${year}`
      })

    if (detailError) throw detailError

    // Add registration fee if needed
    if (student.fld_rf_flag === 'N') {
      await supabase
        .from('tbl_students_invoices_detail')
        .insert({
          fld_iid: invoice.fld_id,
          fld_ssid: 0,
          fld_cid: 0,
          fld_detail: 'Anmeldegebühr',
          fld_len_lesson: 1,
          fld_l_date: date,
          fld_lesson: 1,
          fld_s_rate: student.fld_reg_fee,
          fld_my: `${month.toString().padStart(2, '0')}.${year}`
        })

      // Update student registration flag
      await supabase
        .from('tbl_students')
        .update({ fld_rf_flag: 'Y' })
        .eq('fld_id', studentId)
    }

    // Calculate and update total
    const totalAmount = (finalHours * perLessonRate) + (student.fld_rf_flag === 'N' ? student.fld_reg_fee : 0)
    
    await supabase
      .from('tbl_students_invoices')
      .update({ fld_invoice_total: totalAmount })
      .eq('fld_id', invoice.fld_id)
  }
}

async function generateTeacherInvoices(supabase: any, month: number, year: number, date: string) {
  // Get distinct teachers with pending lessons for the period
  const { data: teachers, error: teachersError } = await supabase
    .from('tbl_teachers_lessons_history')
    .select('fld_tid')
    .eq('fld_mon', month.toString().padStart(2, '0'))
    .eq('fld_year', year.toString())
    .eq('fld_status', 'Pending')

  if (teachersError) throw teachersError

  const uniqueTeachers = [...new Set(teachers.map(t => t.fld_tid))]

  for (const teacherId of uniqueTeachers) {
    // Create teacher invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('tbl_teachers_invoices')
      .insert({
        fld_tid: teacherId,
        fld_lhid: '',
        fld_invoice_total: 0,
        fld_edate: date,
        fld_uname: 1, // TODO: Get from auth context
        fld_status: 'Paid'
      })
      .select()
      .single()

    if (invoiceError) throw invoiceError

    // Get teacher lessons
    const { data: lessons, error: lessonsError } = await supabase
      .from('tbl_teachers_lessons_history')
      .select(`
        *,
        tbl_students_subjects!inner(
          fld_cid,
          tbl_contracts!inner(fld_lp, fld_lesson_dur),
          tbl_subjects!inner(fld_subject)
        ),
        tbl_students!inner(fld_s_first_name, fld_s_last_name)
      `)
      .eq('fld_tid', teacherId)
      .eq('fld_mon', month.toString().padStart(2, '0'))
      .eq('fld_year', year.toString())
      .eq('fld_status', 'Pending')
      .order('fld_sid')
      .order('fld_edate')

    if (lessonsError) throw lessonsError

    let totalAmount = 0
    let lhid = ''

    for (const lesson of lessons) {
      const subject = lesson.tbl_students_subjects.tbl_subjects.fld_subject
      const contract = lesson.tbl_students_subjects.tbl_contracts
      const student = lesson.tbl_students

      const detail = `${subject} Tutoring ${contract.fld_lp} ${student.fld_s_first_name} ${student.fld_s_last_name}`

      // Create invoice detail
      await supabase
        .from('tbl_teachers_invoices_detail')
        .insert({
          fld_iid: invoice.fld_id,
          fld_sid: lesson.fld_sid,
          fld_ssid: lesson.fld_ssid,
          fld_cid: lesson.tbl_students_subjects.fld_cid,
          fld_detail: detail,
          fld_len_lesson: contract.fld_lesson_dur,
          fld_l_date: lesson.fld_edate,
          fld_lesson: lesson.fld_lesson,
          fld_t_rate: lesson.fld_t_rate,
          fld_my: `${month.toString().padStart(2, '0')}.${year}`
        })

      totalAmount += lesson.fld_t_rate * lesson.fld_lesson
      lhid += `${lesson.fld_id},`

      // Update lesson status
      await supabase
        .from('tbl_teachers_lessons_history')
        .update({ fld_status: 'Active' })
        .eq('fld_id', lesson.fld_id)
    }

    // Update invoice with totals
    await supabase
      .from('tbl_teachers_invoices')
      .update({
        fld_lhid: lhid.slice(0, -1), // Remove trailing comma
        fld_invoice_total: totalAmount
      })
      .eq('fld_id', invoice.fld_id)
  }
}
