import { cn } from '@/lib/utils';
import { TimeSlot } from '@/types/scheduling';
import { Clock } from 'lucide-react';

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedTime?: string;
  onSelectTime: (time: string) => void;
}

export function TimeSlotPicker({ slots, selectedTime, onSelectTime }: TimeSlotPickerProps) {
  const availableSlots = slots.filter((slot) => slot.available);
  const unavailableSlots = slots.filter((slot) => !slot.available);

  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Selecione uma data para ver os horários disponíveis</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Horários Disponíveis
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {slots.map((slot) => (
          <button
            key={slot.time}
            onClick={() => slot.available && onSelectTime(slot.time)}
            disabled={!slot.available}
            className={cn(
              'px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden',
              slot.available
                ? selectedTime === slot.time
                  ? 'bg-gradient-electric text-white shadow-electric scale-105'
                  : 'bg-secondary/50 hover:bg-primary/10 hover:text-primary hover:scale-105 text-foreground border border-transparent hover:border-primary/20'
                : 'bg-muted/30 text-muted-foreground/30 cursor-not-allowed opacity-50'
            )}
          >
            {slot.time}
            {slot.available && selectedTime === slot.time && (
              <span className="absolute inset-0 bg-white/20 animate-pulse-glow" />
            )}
          </button>
        ))}
      </div>
      {availableSlots.length === 0 && (
        <p className="text-center text-destructive text-sm">
          Nenhum horário disponível nesta data
        </p>
      )}
    </div>
  );
}
