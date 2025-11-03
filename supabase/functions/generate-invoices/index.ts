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
    
    // Extract user ID from authorization header - authentication is required
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header is required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let userId: number | null = null
    
    try {
      // Create a client with the user's JWT token to get user info
      const userSupabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          global: {
            headers: {
              Authorization: authHeader
            }
          }
        }
      )
      
      const { data: { user }, error: userError } = await userSupabase.auth.getUser()
      
      if (userError || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired authentication token' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Get the user ID from tbl_users table
      const { data: dbUser, error: dbUserError } = await userSupabase
        .from('tbl_users')
        .select('fld_id')
        .eq('auth_user_id', user.id)
        .single()
      
      if (dbUserError || !dbUser) {
        return new Response(
          JSON.stringify({ error: 'User not found in database' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      userId = dbUser.fld_id
    } catch (error) {
      console.error('Error extracting user ID:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to authenticate user' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Ensure userId was successfully obtained
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unable to determine user ID' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
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
      // Previous month (based on PHP logic)
      const lastMonth = new Date()
      lastMonth.setMonth(lastMonth.getMonth() - 1)
      month = lastMonth.getMonth() + 1
      year = lastMonth.getFullYear()
      // Last day of previous month (based on PHP generate-pm-* files)
      date = new Date(year, month, 0).toISOString().split('T')[0]
    }

    let result = { success: true, message: '', count: 0 }
    const isPreviousMonth = period === 'previous'

    if (type === 'receivables') {
      result = await generateStudentInvoices(supabaseClient, month, year, date, userId)
    } else if (type === 'payables') {
      result = await generateTeacherInvoices(supabaseClient, month, year, date, userId, isPreviousMonth)
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid type. Must be "receivables" or "payables"' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: result.success, 
        message: result.message,
        count: result.count,
        period: period,
        month: month,
        year: year
      }),
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

async function generateStudentInvoices(supabase: any, month: number, year: number, date: string, userId: number): Promise<{success: boolean, message: string, count: number}> {
  // Get distinct students with active lessons for the period
  const { data: students, error: studentsError } = await supabase
    .from('tbl_teachers_lessons_history')
    .select('fld_sid')
    .eq('fld_mon', month.toString().padStart(2, '0'))
    .eq('fld_year', year.toString())
    .eq('fld_status', 'Active')

  if (studentsError) {
    console.error('Error fetching students:', studentsError)
    return { success: false, message: 'Failed to fetch students', count: 0 }
  }

  const uniqueStudents = [...new Set(students.map(s => s.fld_sid))]

  try {
    for (const studentId of uniqueStudents) {
    // Get student registration fee info
    const { data: student, error: studentError } = await supabase
      .from('tbl_students')
      .select('fld_reg_fee, fld_rf_flag')
      .eq('fld_id', studentId)
      .single()

    if (studentError) throw studentError

    // Get lesson history for this student (matching legacy PHP structure)
    // Legacy SQL: select tlh.*, ss.FLD_CID, c.FLD_LP,c.FLD_LESSON_DUR,c.FLD_S_PER_LESSON_RATE,c.FLD_MIN_LESSON,
    //            s.FLD_S_FIRST_NAME,s.FLD_S_LAST_NAME,s.FLD_WH,su.FLD_SUBJECT
    //            from tbl_teachers_lessons_history tlh,tbl_students_subjects ss,
    //            tbl_students s,tbl_contracts c,tbl_subjects su
    //            where tlh.FLD_SSID=ss.FLD_ID and tlh.FLD_SID=s.FLD_ID
    //            and ss.FLD_CID=c.FLD_ID and ss.FLD_SUID=su.FLD_ID
    
    // Query lessons first
    const { data: lessons, error: lessonsError } = await supabase
      .from('tbl_teachers_lessons_history')
      .select('*')
      .eq('fld_sid', studentId)
      .eq('fld_mon', month.toString().padStart(2, '0'))
      .eq('fld_year', year.toString())
      .eq('fld_status', 'Active')
      .order('fld_ssid')
      .order('fld_edate')

    if (lessonsError) throw lessonsError

    if (lessons.length === 0) continue

    // Get student data once (used for all lessons)
    const { data: studentData, error: studentDataError } = await supabase
      .from('tbl_students')
      .select('fld_s_first_name, fld_s_last_name, fld_wh')
      .eq('fld_id', studentId)
      .single()

    if (studentDataError || !studentData) {
      throw new Error(`Student not found: ${studentId}`)
    }

    // Calculate totals (matching legacy PHP loop)
    let totalHours = 0
    let detail = ''
    let lhid = ''
    let contractId = ''
    let lessonDuration = ''
    let edate = ''
    let perLessonRate = 0
    let weeklyHours = parseFloat(String(studentData.fld_wh || '0'))
    let regFee = 0  // Initialize to 0, will be set if registration fee is added

    for (const lesson of lessons) {
      // Get student subject data (matching legacy join: tlh.FLD_SSID=ss.FLD_ID)
      const { data: studentSubject, error: ssError } = await supabase
        .from('tbl_students_subjects')
        .select(`
          fld_cid,
          tbl_contracts!fld_cid(
            fld_lp,
            fld_lesson_dur,
            fld_s_per_lesson_rate,
            fld_min_lesson
          ),
          tbl_subjects!fld_suid(
            fld_subject
          )
        `)
        .eq('fld_id', lesson.fld_ssid)
        .single()

      if (ssError || !studentSubject) {
        console.error('Error fetching student subject:', ssError)
        continue
      }

      const subject = studentSubject.tbl_subjects?.fld_subject || ''
      const contract = studentSubject.tbl_contracts
      if (!contract) {
        console.error('Contract not found for student subject:', lesson.fld_ssid)
        continue
      }

      // Matching legacy PHP: if (str_contains($FLD_DETAIL, $receivable_f['FLD_SUBJECT']))
      if (!detail.includes(subject)) {
        detail += `${subject} Tutoring ${contract.fld_lp}<br>`
      }

      lhid += `${lesson.fld_id},`
      totalHours += parseFloat(String(lesson.fld_lesson || '0'))
      contractId = studentSubject.fld_cid
      lessonDuration = contract.fld_lesson_dur
      edate = lesson.fld_edate
      perLessonRate = parseFloat(String(contract.fld_s_per_lesson_rate || '0'))

      // Update lesson status
      await supabase
        .from('tbl_teachers_lessons_history')
        .update({ fld_status: 'Invoice Created' })
        .eq('fld_id', lesson.fld_id)
    }

    // Calculate final hours based on PHP logic
    const finalHours = totalHours < weeklyHours && student.fld_rf_flag === 'Y' 
      ? weeklyHours 
      : totalHours

    // Create invoice with initial values (following PHP pattern)
    const { data: invoice, error: invoiceError } = await supabase
      .from('tbl_students_invoices')
      .insert({
        fld_sid: studentId,
        fld_lhid: lhid.slice(0, -1), // Remove trailing comma
        fld_invoice_total: 0, // Initial value, will be updated
        fld_invoice_hr: 0, // Always 0 in PHP
        fld_min_lesson: weeklyHours,
        fld_edate: date,
        fld_uname: userId,
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
        fld_ssid: null,
        fld_cid: contractId,
        fld_detail: detail,
        fld_len_lesson: lessonDuration,
        fld_l_date: edate,
        fld_lesson: finalHours,
        fld_s_rate: perLessonRate,
        fld_my: `${month.toString().padStart(2, '0')}.${year}`
      })

    if (detailError) throw detailError

    // Add registration fee detail if needed (based on PHP logic)
    if (student.fld_rf_flag === 'N') {
      // Add registration fee detail line
      await supabase
        .from('tbl_students_invoices_detail')
        .insert({
          fld_iid: invoice.fld_id,
          fld_ssid: null,
          fld_cid: null,
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
      
      // Set registration fee for total calculation
      regFee = parseFloat(String(student.fld_reg_fee || '0'))
    }

    // Calculate and update total (following PHP pattern)
    // $FLD_INVOICE_TOTAL_F = ($Final_Hours*$FLD_S_PER_LESSON_RATE) + $FLD_REG_FEE;
    // Ensure all values are parsed as floats to preserve decimal precision
    const totalAmount = (parseFloat(String(finalHours)) * parseFloat(String(perLessonRate))) + parseFloat(String(regFee))
    
    await supabase
      .from('tbl_students_invoices')
      .update({ fld_invoice_total: totalAmount })
      .eq('fld_id', invoice.fld_id)
    }

    return {
      success: true,
      message: `Successfully generated ${uniqueStudents.length} student invoices for ${month}/${year}`,
      count: uniqueStudents.length
    }
  } catch (error) {
    console.error('Error generating student invoices:', error)
    return { success: false, message: 'Failed to generate student invoices', count: 0 }
  }
}

async function generateTeacherInvoices(supabase: any, month: number, year: number, date: string, userId: number, isPreviousMonth: boolean = false): Promise<{success: boolean, message: string, count: number}> {
  // Get distinct teachers with pending lessons for the period
  const { data: teachers, error: teachersError } = await supabase
    .from('tbl_teachers_lessons_history')
    .select('fld_tid')
    .eq('fld_mon', month.toString().padStart(2, '0'))
    .eq('fld_year', year.toString())
    .eq('fld_status', 'Pending')

  if (teachersError) {
    console.error('Error fetching teachers:', teachersError)
    return { success: false, message: 'Failed to fetch teachers', count: 0 }
  }

  const uniqueTeachers = [...new Set(teachers.map(t => t.fld_tid))]

  try {
    for (const teacherId of uniqueTeachers) {
    // Create teacher invoice first (following PHP pattern)
    const { data: invoice, error: invoiceError } = await supabase
      .from('tbl_teachers_invoices')
      .insert({
        fld_tid: teacherId,
        fld_lhid: '', // Empty initially, will be updated
        fld_invoice_total: 0, // Initial value, will be updated
        fld_edate: date,
        fld_uname: userId,
        fld_status: 'Paid'
      })
      .select()
      .single()

    if (invoiceError) throw invoiceError

    // Get teacher lessons (following PHP pattern)
    // Legacy SQL: select tlh.*, ss.FLD_CID, c.FLD_LP,c.FLD_LESSON_DUR,
    //            s.FLD_S_FIRST_NAME,s.FLD_S_LAST_NAME,su.FLD_SUBJECT
    //            from tbl_teachers_lessons_history tlh,tbl_students_subjects ss,
    //            tbl_students s,tbl_contracts c,tbl_subjects su
    //            where tlh.FLD_SSID=ss.FLD_ID and tlh.FLD_SID=s.FLD_ID
    //            and ss.FLD_CID=c.FLD_ID and ss.FLD_SUID=su.FLD_ID
    
    // Query lessons first
    const { data: lessons, error: lessonsError } = await supabase
      .from('tbl_teachers_lessons_history')
      .select('*')
      .eq('fld_tid', teacherId)
      .eq('fld_mon', month.toString().padStart(2, '0'))
      .eq('fld_year', year.toString())
      .eq('fld_status', 'Pending')
      .order('fld_sid')
      .order('fld_edate')

    if (lessonsError) throw lessonsError

    if (lessons.length === 0) continue

    // Fetch related data for each lesson (matching legacy PHP joins)
    let totalAmount = 0
    let lhid = ''

    // Process lessons and create details (following PHP pattern)
    for (const lesson of lessons) {
      // Get student subject data
      const { data: studentSubject, error: ssError } = await supabase
        .from('tbl_students_subjects')
        .select(`
          fld_cid,
          tbl_contracts!fld_cid(
            fld_lp,
            fld_lesson_dur
          ),
          tbl_subjects!fld_suid(
            fld_subject
          )
        `)
        .eq('fld_id', lesson.fld_ssid)
        .single()

      if (ssError || !studentSubject) {
        console.error('Error fetching student subject:', ssError)
        continue
      }

      // Get student data
      const studentFieldSelect = isPreviousMonth
        ? 'fld_first_name, fld_last_name'
        : 'fld_s_first_name, fld_s_last_name'
      
      const { data: student, error: studentError } = await supabase
        .from('tbl_students')
        .select(studentFieldSelect)
        .eq('fld_id', lesson.fld_sid)
        .single()

      if (studentError || !student) {
        console.error('Error fetching student:', studentError)
        continue
      }

      const subject = studentSubject.tbl_subjects?.fld_subject || ''
      const contract = studentSubject.tbl_contracts
      if (!contract) {
        console.error('Contract not found for student subject:', lesson.fld_ssid)
        continue
      }

      // Create detail string based on PHP logic
      // Previous month uses parent name (FLD_FIRST_NAME, FLD_LAST_NAME), current month uses student name (FLD_S_FIRST_NAME, FLD_S_LAST_NAME)
      const customerName = isPreviousMonth
        ? `${(student as any).fld_first_name || ''} ${(student as any).fld_last_name || ''}`
        : `${(student as any).fld_s_first_name || ''} ${(student as any).fld_s_last_name || ''}`
      const detail = `${subject} Tutoring ${contract.fld_lp} ${customerName}`

      // Create invoice detail (based on PHP insert)
      const { error: detailError } = await supabase
        .from('tbl_teachers_invoices_detail')
        .insert({
          fld_iid: invoice.fld_id,
          fld_sid: lesson.fld_sid,
          fld_ssid: lesson.fld_ssid,
          fld_cid: studentSubject.fld_cid,
          fld_detail: detail,
          fld_len_lesson: contract.fld_lesson_dur,
          fld_l_date: lesson.fld_edate,
          fld_lesson: lesson.fld_lesson,
          fld_t_rate: lesson.fld_t_rate,
          fld_my: `${month.toString().padStart(2, '0')}.${year}`
        })

      if (detailError) throw detailError

      // Calculate total and build lesson history IDs (following PHP logic)
      // Ensure decimal precision is preserved
      totalAmount += parseFloat(String(lesson.fld_t_rate || '0')) * parseFloat(String(lesson.fld_lesson || '0'))
      lhid += `${lesson.fld_id},`

      // Update lesson status
      await supabase
        .from('tbl_teachers_lessons_history')
        .update({ fld_status: 'Active' })
        .eq('fld_id', lesson.fld_id)
    }

    // Update invoice with totals (following PHP pattern)
    await supabase
      .from('tbl_teachers_invoices')
      .update({
        fld_lhid: lhid.slice(0, -1), // Remove trailing comma
        fld_invoice_total: totalAmount
      })
      .eq('fld_id', invoice.fld_id)
    }

    return {
      success: true,
      message: `Successfully generated ${uniqueTeachers.length} teacher invoices for ${month}/${year}`,
      count: uniqueTeachers.length
    }
  } catch (error) {
    console.error('Error generating teacher invoices:', error)
    return { success: false, message: 'Failed to generate teacher invoices', count: 0 }
  }
}
