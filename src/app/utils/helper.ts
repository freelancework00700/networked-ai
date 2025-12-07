export function maskPhoneNumber(phoneNumber: string): string {
  // mask phone number, showing only first 4 and last 2 digits
  if (phoneNumber.length <= 6) {
    return phoneNumber;
  }

  // get first 4 and last 2 digits
  const lastTwo = phoneNumber.slice(-2);
  const firstFour = phoneNumber.slice(0, 4);
  const maskedMiddle = phoneNumber.slice(4, -2).replace(/\d/g, '*');

  // return masked phone number
  return firstFour + maskedMiddle + lastTwo;
}

export function maskEmail(email: string): string {
  // mask email, showing only first 2 and last 2 characters before @, then the domain
  const atIndex = email.indexOf('@');

  // if no @ found, return as is
  if (atIndex === -1) {
    return email;
  }

  const localPart = email.slice(0, atIndex);
  const domain = email.slice(atIndex);

  // if local part is 4 characters or less, return as is
  if (localPart.length <= 4) {
    return email;
  }

  // get first 2 and last 2 characters of local part
  const firstTwo = localPart.slice(0, 2);
  const lastTwo = localPart.slice(-2);
  const maskedMiddle = localPart.slice(2, -2).replace(/./g, '*');

  // return masked email
  return firstTwo + maskedMiddle + lastTwo + domain;
}
