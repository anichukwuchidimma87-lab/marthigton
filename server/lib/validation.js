export function requireObjectBody(request) {
  if (!request.body || typeof request.body !== "object" || Array.isArray(request.body)) {
    throw Object.assign(new Error("Request body must be a JSON object."), { status: 400 });
  }
  return request.body;
}

export function requiredText(value, field, maxLength) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > maxLength) {
    throw Object.assign(new Error(`${field} is required and must be at most ${maxLength} characters.`), {
      status: 400,
    });
  }
  return value.trim();
}

export function optionalText(value, field, maxLength) {
  if (value === undefined || value === "") return undefined;
  if (typeof value !== "string" || value.trim().length > maxLength) {
    throw Object.assign(new Error(`${field} must be at most ${maxLength} characters.`), {
      status: 400,
    });
  }
  return value.trim();
}

export function normalizeReferralCode(value) {
  const code = optionalText(value, "Referral code", 64)?.toLowerCase();
  if (code && !/^[a-z0-9_-]+$/.test(code)) {
    throw Object.assign(new Error("Referral code contains unsupported characters."), {
      status: 400,
    });
  }
  return code;
}

export function normalizeEmail(value) {
  if (typeof value !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    throw Object.assign(new Error("A valid email address is required."), { status: 400 });
  }
  return value.trim().toLowerCase();
}

export function normalizePhone(value) {
  if (typeof value !== "string" || !/^\+?[0-9 ().-]{7,32}$/.test(value.trim())) {
    throw Object.assign(new Error("A valid phone number is required."), { status: 400 });
  }
  const digitCount = value.replace(/\D/g, "").length;
  if (digitCount < 7 || digitCount > 15) {
    throw Object.assign(new Error("Phone numbers must contain 7 to 15 digits."), { status: 400 });
  }
  return value.trim();
}

export function futureDate(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw Object.assign(new Error(`${field} is required.`), { status: 400 });
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date <= new Date()) {
    throw Object.assign(new Error(`${field} must be a valid future date and time.`), {
      status: 400,
    });
  }
  return date;
}
