// User types a partner can serve.
// The short code is the canonical value stored/used across the app.

export interface UserType {
  name: string;
  code: string;
}

export const USER_TYPES: UserType[] = [
  { name: 'Student', code: 'ST' },
  { name: 'Working Professional', code: 'WP' },
  { name: 'Dependant', code: 'DP' },
  { name: 'Traveler', code: 'TR' },
  { name: 'Company', code: 'CO' },
  { name: 'All', code: 'AL' },
  { name: 'Others', code: 'OT' },
];

/** Lookup a user type by its short code. */
export function getUserTypeByCode(code: string): UserType | undefined {
  return USER_TYPES.find((u) => u.code === code);
}

/** Human-readable user type name for a code, falling back to the code itself. */
export function userTypeNameFromCode(code: string): string {
  return getUserTypeByCode(code)?.name ?? code;
}
