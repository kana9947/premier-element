export interface Shift {
  id: string;
  reference: string | null;
  title: string;
  description: string;
  address: string;
  city: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
  startDate: string;
  endDate: string | null;
  startTime: string;
  endTime: string;
  hourlyRate: number;
  estimatedTotal: number;
  postType: string | null;
  serviceType: string;
  isUrgent: boolean;
  isRecurring: boolean;
  requiredWorkers: number;
  requiredSkills: string[];
  breakDuration: string | null;
  dressCode: string | null;
  company: { companyName: string };
  responsable?: { firstName: string; lastName: string; email?: string; phone?: string } | null;
}

export interface MyShift {
  contractId: string;
  shift: Shift;
  hourlyRate: number;
  startDate: string;
  endDate: string | null;
}

export interface TimeDeclarationEntry {
  id: string;
  date: string;
  plannedHours: number;
  actualHours: number | null;
  hourlyRate: number;
  estimatedAmount: number;
  status: string;
  note: string | null;
  mission: { id: string; title: string; reference: string | null; startTime: string; endTime: string };
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  missionId: string | null;
  createdAt: string;
  mission?: { id: string; title: string; reference: string | null } | null;
}

export interface PaymentMethodData {
  id: string;
  transitNumber: string;
  institutionCode: string;
  folioNumber: string;
  sinMasked: string | null;
}
