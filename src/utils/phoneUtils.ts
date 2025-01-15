export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  // If it already starts with +, return as is
  if (phone.startsWith('+')) {
    return phone
  }
  
  // If it's a US number without country code (10 digits), add +1
  if (cleaned.length === 10) {
    return `+1${cleaned}`
  }
  
  // For all other cases, just add +
  return `+${cleaned}`
}