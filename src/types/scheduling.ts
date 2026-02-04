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
    description: 'Duração de 2 horas, onde você irá explorar as estruturas do Ágora e conhecer os projetos estruturantes do Ágora Tech Park.',
    icon: 'Lightbulb',
    color: 'secondary',
  },
  conexoes: {
    label: 'Visita Conexões',
    description: 'Duração de 1 dia (8 horas), além de conhecer todos os projetos e estruturas do Ágora Tech Park, você irá se conectar com os negócios inovadores de forma qualificada. O valor investido no Ágora Tour Conexões é direcionado para o desenvolvimento dos universitários participantes do projeto Liga Ágora, além da administração do programa.',
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
