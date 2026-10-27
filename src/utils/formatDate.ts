import { Timestamp } from 'firebase/firestore'

/**
 * Formata um objeto Date, Timestamp ou string ISO para o padrão exibido no Figma:
 * Exemplo: "21/05/2022 - 19:30 hrs"
 */
export function formatPollDate(
  dateInput: Date | Timestamp | string | number | null | undefined,
): string {
  if (!dateInput) return '--/--/---- --:-- hrs'

  let date: Date

  if (dateInput instanceof Timestamp) {
    date = dateInput.toDate()
  } else if (dateInput instanceof Date) {
    date = dateInput
  } else if (typeof dateInput === 'string' || typeof dateInput === 'number') {
    date = new Date(dateInput)
  } else if (typeof (dateInput as { seconds?: number }).seconds === 'number') {
    date = new Date((dateInput as { seconds: number }).seconds * 1000)
  } else {
    return '--/--/---- --:-- hrs'
  }

  if (isNaN(date.getTime())) {
    return '--/--/---- --:-- hrs'
  }

  const pad = (n: number) => n.toString().padStart(2, '0')
  const day = pad(date.getDate())
  const month = pad(date.getMonth() + 1)
  const year = date.getFullYear()
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())

  return `${day}/${month}/${year} - ${hours}:${minutes} hrs`
}

/**
 * Formata para o input datetime-local: "YYYY-MM-DDTHH:mm"
 */
export function toDateTimeLocalString(date: Date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())

  return `${year}-${month}-${day}T${hours}:${minutes}`
}
