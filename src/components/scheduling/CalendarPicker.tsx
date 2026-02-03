import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format, addDays, isBefore, startOfToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarPickerProps {
  selectedDate?: Date;
  onSelectDate: (date: Date) => void;
  availableDays?: number[];
}

export function CalendarPicker({ selectedDate, onSelectDate, availableDays = [1, 2, 3, 4, 5] }: CalendarPickerProps) {
  const today = startOfToday();

  const isDateDisabled = (date: Date) => {
    // Disable past dates
    if (isBefore(date, today)) return true;
    // Disable days not in available days (0 = Sunday, 6 = Saturday)
    const dayOfWeek = date.getDay();
    return !availableDays.includes(dayOfWeek);
  };

  return (
    <Card className="p-4 border-2 border-border/50 bg-card shadow-electric">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => date && onSelectDate(date)}
        disabled={isDateDisabled}
        locale={ptBR}
        className="rounded-md pointer-events-auto"
        classNames={{
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent/20 text-accent-foreground",
          day: cn(
            "h-10 w-10 p-0 font-normal aria-selected:opacity-100",
            "hover:bg-primary/10 hover:text-primary transition-colors"
          ),
        }}
      />
    </Card>
  );
}
