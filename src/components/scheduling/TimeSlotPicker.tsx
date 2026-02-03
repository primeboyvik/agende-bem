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
      <h4 className="text-sm font-medium text-muted-foreground">Horários Disponíveis</h4>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {slots.map((slot) => (
          <button
            key={slot.time}
            onClick={() => slot.available && onSelectTime(slot.time)}
            disabled={!slot.available}
            className={cn(
              'px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
              slot.available
                ? selectedTime === slot.time
                  ? 'bg-primary text-primary-foreground shadow-electric'
                  : 'bg-muted hover:bg-primary/20 hover:text-primary text-foreground'
                : 'bg-muted/50 text-muted-foreground/50 cursor-not-allowed line-through'
            )}
          >
            {slot.time}
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
