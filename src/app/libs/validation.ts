import "server-only";
import { ValidationError } from "./errors";

const USERNAME_BLACKLIST = new Set([
  "main",
  "admin",
  "administrator",
  "root",
  "system",
  "moderator",
  "mod",
  "support",
  "help",
  "api",
  "www",
  "mail",
  "ftp",
  "webmaster",
  "postmaster",
  "hostmaster",
  "info",
  "noreply",
  "no-reply",
  "staff",
  "official",
  "chirra",
  "test",
  "demo",
  "guest",
  "anonymous",
  "null",
  "undefined",
]);

export function validateUsername(username: string): void {
  // Length
  if (username.length < 3) {
    throw new ValidationError("Username must be at least 3 characters long");
  }
  if (username.length > 30) {
    throw new ValidationError("Username must be at most 30 characters long");
  }

  // Regex
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    throw new ValidationError(
      "Username can only contain letters, numbers, and underscores",
    );
  }

  // Blacklist check
  if (USERNAME_BLACKLIST.has(username.toLowerCase())) {
    throw new ValidationError("This username is reserved and cannot be used");
  }

  // Cannot start with underscore
  if (username.startsWith("_")) {
    throw new ValidationError("Username cannot start with an underscore");
  }
}

export function validatePassword(password: string): void {
  // Length
  if (password.length < 8) {
    throw new ValidationError("Password must be at least 8 characters long");
  }
  if (password.length > 128) {
    throw new ValidationError("Password must be at most 128 characters long");
  }

  // Strength
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const passedChecks = [
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
  ].filter(Boolean).length;

  if (passedChecks < 3) {
    throw new ValidationError(
      "Password must contain at least 3 of the following: uppercase letter, lowercase letter, number, special character",
    );
  }
}

export function validateEmail(email: string): void {
  // Regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format");
  }

  // Length
  if (email.length > 254) {
    throw new ValidationError("Email address is too long");
  }

  // Typos
  const typosCorrected = [
    { wrong: "gmial.com", correct: "gmail.com" },
    { wrong: "gmail.co", correct: "gmail.com" },
    { wrong: "gmial.co", correct: "gmail.com" },
    { wrong: "gmai.com", correct: "gmail.com" },
    { wrong: "yahooo.com", correct: "yahoo.com" },
    { wrong: "hotmial.com", correct: "hotmail.com" },
    { wrong: "hotmai.com", correct: "hotmail.com" },
  ];

  const emailSplit = email.split("@");
  if (emailSplit.length !== 2) {
    throw new ValidationError("Invalid email format");
  }

  const domain = emailSplit[1].toLowerCase();
  const typo = typosCorrected.find((t) => t.wrong === domain);
  if (typo) {
    throw new ValidationError(`Did you mean ${emailSplit[0]}@${typo.correct}?`);
  }
}
