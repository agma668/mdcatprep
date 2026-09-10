export interface TimeSpentData {
  totalMinutes: number;
  weeklyMinutes: number;
  weeklyGoalMinutes: number;
  subjects: { subject: string; minutes: number }[];
}
