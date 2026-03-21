import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb, ensureSchema } from '@/lib/db'
import { addDays, addMonths, startOfDay } from 'date-fns'
import { getUpcomingOccurrences, getNextRefillDates } from '@/lib/schedule'

export async function GET() {
  await ensureSchema()
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()
  const userRes = await db.execute({ sql: 'SELECT id, name, email, phone, dob, address FROM users WHERE id = ?', args: [session.id] })
  const user = userRes.rows[0]
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const apptRes = await db.execute({ sql: 'SELECT * FROM appointments WHERE user_id = ?', args: [session.id] })
  const rxRes = await db.execute({ sql: 'SELECT * FROM prescriptions WHERE user_id = ?', args: [session.id] })
  const appointments = apptRes.rows as any[]
  const prescriptions = rxRes.rows as any[]

  const now = startOfDay(new Date())
  const in7 = addDays(now, 7)
  const in3mo = addMonths(now, 3)

  const upcomingAppts: any[] = []
  for (const appt of appointments) {
    const dates = getUpcomingOccurrences(appt.datetime as string, appt.repeat as any, appt.end_date as string | null, now, in7)
    for (const d of dates) upcomingAppts.push({ ...appt, occurrenceDate: d.toISOString() })
  }
  upcomingAppts.sort((a, b) => a.occurrenceDate.localeCompare(b.occurrenceDate))

  const upcomingRefills: any[] = []
  for (const rx of prescriptions) {
    const dates = getNextRefillDates(rx.refill_on as string, rx.refill_schedule as string, now, in7)
    for (const d of dates) upcomingRefills.push({ ...rx, occurrenceDate: d.toISOString() })
  }
  upcomingRefills.sort((a, b) => a.occurrenceDate.localeCompare(b.occurrenceDate))

  const allAppts: any[] = []
  for (const appt of appointments) {
    const dates = getUpcomingOccurrences(appt.datetime as string, appt.repeat as any, appt.end_date as string | null, now, in3mo)
    for (const d of dates) allAppts.push({ ...appt, occurrenceDate: d.toISOString() })
  }
  allAppts.sort((a, b) => a.occurrenceDate.localeCompare(b.occurrenceDate))

  const allRefills: any[] = []
  for (const rx of prescriptions) {
    const dates = getNextRefillDates(rx.refill_on as string, rx.refill_schedule as string, now, in3mo)
    for (const d of dates) allRefills.push({ ...rx, occurrenceDate: d.toISOString() })
  }
  allRefills.sort((a, b) => a.occurrenceDate.localeCompare(b.occurrenceDate))

  return NextResponse.json({ user, upcomingAppts, upcomingRefills, allAppts, allRefills })
}