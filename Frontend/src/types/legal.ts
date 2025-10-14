export interface LegalCase {
  id: string;
  title: string;
  stage: string; // e.g. "Investigation", "Discovery", "Hearing", "Closed"
  counsel: string; // e.g. external law firm or internal legal team
  nextDate?: string; // ISO date string for next hearing or milestone
}