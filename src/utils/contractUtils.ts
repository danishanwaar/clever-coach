// Utility functions for contract signing

/**
 * Generate a secure contract link for a teacher
 * @param teacherId - The teacher's ID
 * @returns A secure encoded link for contract signing
 */
export const generateContractLink = (teacherId: number): string => {
  // In production, you would use a more secure method like JWT tokens
  const encodedId = btoa(teacherId.toString());
  return `${window.location.origin}/teacher-contract-signing/${encodedId}`;
};

/**
 * Decode a contract link to get the teacher ID
 * @param encodedId - The encoded teacher ID from the URL
 * @returns The decoded teacher ID
 */
export const decodeContractLink = (encodedId: string): number => {
  try {
    return parseInt(atob(encodedId));
  } catch (error) {
    throw new Error('Invalid contract link');
  }
};

/**
 * Validate if a teacher is eligible for contract signing
 * @param status - The teacher's current status
 * @returns True if the teacher can sign a contract
 */
export const canSignContract = (status: string): boolean => {
  return status === 'Pending For Signature';
};

/**
 * Format teacher name for display
 * @param firstName - Teacher's first name
 * @param lastName - Teacher's last name
 * @returns Formatted full name
 */
export const formatTeacherName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim();
};

/**
 * Format subjects list for display
 * @param subjects - Array of subject names
 * @returns Comma-separated string of subjects
 */
export const formatSubjects = (subjects: string[]): string => {
  return subjects.join(', ');
};
