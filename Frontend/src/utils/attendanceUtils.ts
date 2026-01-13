/**
 * Format attendance method for display
 * @param method - The raw method value from database
 * @returns Formatted method name
 */
export const formatAttendanceMethod = (method: string | undefined | null): string => {
  if (!method) return 'N/A';
  
  const methodMap: Record<string, string> = {
    'manual': 'Manual',
    'qr_scan': 'QR Scan',
    'biometric_fingerprint': 'Fingerprint',
    'biometric_face': 'Face ID',
    'card': 'Card'
  };
  
  return methodMap[method] || method;
};
