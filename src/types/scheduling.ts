export type VisitType = 'inspiracao' | 'conexoes';

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface AvailableSlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  client_id: string;
  visit_type: VisitType;
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  client?: Client;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export const VISIT_TYPE_INFO = {
  inspiracao: {
    label: 'Visita Inspiração',
    description: 'Uma experiência para despertar novas ideias e perspectivas',
    icon: 'Lightbulb',
    color: 'secondary',
  },
  conexoes: {
    label: 'Visita Conexões',
    description: 'Fortaleça relacionamentos e crie novas oportunidades',
    icon: 'Users',
    color: 'accent',
  },
} as const;

export const DAY_NAMES = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
] as const;
