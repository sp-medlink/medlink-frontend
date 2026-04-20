export interface Prescription {
  id: string;
  appointmentId: string;
  doctorId: string;
  drugName: string;
  dose: string;
  frequency: string;
  durationDays: number | null;
  notes: string;
  createdAt: string;
}
