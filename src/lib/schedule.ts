import { addWeeks, addMonths, addDays, isAfter, isBefore, parseISO } from 'date-fns'

export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly'

export function getUpcomingOccurrences(
  startDateStr: string,
  repeat: RepeatType,
  endDateStr: string | null | undefined,
  rangeStart: Date,
  rangeEnd: Date
): Date[] {
  const start = parseISO(startDateStr)
  const endDate = endDateStr ? parseISO(endDateStr) : null
  const results: Date[] = []

  if (repeat === 'none') {
    if (isAfter(start, rangeStart) && isBefore(start, rangeEnd)) {
      results.push(start)
    }
    return results
  }

  let current = start
  while (isBefore(current, rangeStart)) {
    current = advance(current, repeat)
  }

  while (isBefore(current, rangeEnd)) {
    if (endDate && isAfter(current, endDate)) break
    results.push(current)
    current = advance(current, repeat)
  }

  return results
}

function advance(date: Date, repeat: RepeatType): Date {
  switch (repeat) {
    case 'daily': return addDays(date, 1)
    case 'weekly': return addWeeks(date, 1)
    case 'monthly': return addMonths(date, 1)
    default: return addMonths(date, 1)
  }
}

export function getNextRefillDates(
  refillOnStr: string,
  schedule: string,
  rangeStart: Date,
  rangeEnd: Date
): Date[] {
  return getUpcomingOccurrences(refillOnStr, schedule as RepeatType, null, rangeStart, rangeEnd)
}