import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VisitType, Appointment, TimeSlot, AvailableSlot } from '@/types/scheduling';
import { format, addHours, setHours, setMinutes, isBefore, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export function useScheduling() {
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch available slots configuration
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      const { data, error } = await supabase
        .from('available_slots')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching slots:', error);
        return;
      }

      setAvailableSlots(data || []);
    };

    fetchAvailableSlots();
  }, []);

  // Get available days of week
  const getAvailableDays = (): number[] => {
    return [...new Set(availableSlots.map((slot) => slot.day_of_week))];
  };

  // Generate time slots for a specific date
  const generateTimeSlots = async (date: Date): Promise<TimeSlot[]> => {
    const dayOfWeek = date.getDay();
    const dateStr = format(date, 'yyyy-MM-dd');

    // Get slot configuration for this day
    const daySlots = availableSlots.filter((slot) => slot.day_of_week === dayOfWeek);
    
    if (daySlots.length === 0) {
      return [];
    }

    // Fetch existing appointments for this date
    const { data: existingAppointments } = await supabase
      .from('appointments')
      .select('appointment_time')
      .eq('appointment_date', dateStr)
      .neq('status', 'cancelled');

    const bookedTimes = new Set(
      existingAppointments?.map((apt) => apt.appointment_time) || []
    );

    // Generate time slots (1 hour intervals)
    const slots: TimeSlot[] = [];
    
    for (const daySlot of daySlots) {
      const startHour = parseInt(daySlot.start_time.split(':')[0]);
      const endHour = parseInt(daySlot.end_time.split(':')[0]);

      for (let hour = startHour; hour < endHour; hour++) {
        const timeStr = `${hour.toString().padStart(2, '0')}:00`;
        slots.push({
          time: timeStr,
          available: !bookedTimes.has(timeStr + ':00'),
        });
      }
    }

    return slots;
  };

  // Create appointment
  const createAppointment = async (
    visitType: VisitType,
    date: Date,
    time: string,
    clientData: { name: string; email: string; phone?: string; notes?: string }
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      // First, create or find the client
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('email', clientData.email)
        .maybeSingle();

      let clientId: string;

      if (existingClient) {
        clientId = existingClient.id;
        // Update client info
        await supabase
          .from('clients')
          .update({ name: clientData.name, phone: clientData.phone })
          .eq('id', clientId);
      } else {
        // Create new client
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            name: clientData.name,
            email: clientData.email,
            phone: clientData.phone,
          })
          .select('id')
          .single();

        if (clientError) {
          throw clientError;
        }
        clientId = newClient.id;
      }

      // Create appointment
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          client_id: clientId,
          visit_type: visitType,
          appointment_date: format(date, 'yyyy-MM-dd'),
          appointment_time: time + ':00',
          notes: clientData.notes,
          status: 'pending',
        });

      if (appointmentError) {
        throw appointmentError;
      }

      toast({
        title: 'Agendamento Confirmado!',
        description: 'Você receberá uma confirmação por email.',
      });

      return true;
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      toast({
        title: 'Erro ao agendar',
        description: error.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    availableSlots,
    getAvailableDays,
    generateTimeSlots,
    createAppointment,
    isLoading,
  };
}
