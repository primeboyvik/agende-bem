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
    <Card className="p-6 border-none bg-card/50 shadow-none sm:border-2 sm:border-border/50 sm:shadow-electric rounded-2xl">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => date && onSelectDate(date)}
        disabled={isDateDisabled}
        locale={ptBR}
        className="rounded-md pointer-events-auto flex justify-center p-0"
        classNames={{
          months: "space-y-4",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center mb-4",
          caption_label: "text-lg font-bold text-foreground",
          nav: "space-x-1 flex items-center bg-transparent",
          nav_button: cn(
            "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity",
            "hover:bg-primary/10 rounded-full flex items-center justify-center"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-10 font-normal text-[0.8rem] uppercase tracking-wider mb-2",
          row: "flex w-full mt-2",
          cell: cn(
            "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-transparent",
            "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
          ),
          day: cn(
            "h-10 w-10 p-0 font-medium aria-selected:opacity-100 rounded-full",
            "hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-110"
          ),
          day_selected: cn(
            "bg-gradient-electric text-white shadow-electric",
            "hover:bg-primary hover:text-white focus:bg-primary focus:text-white",
            "hover:opacity-90"
          ),
          day_today: "bg-gradient-electric text-accent-foreground border border-accent/20 font-bold",
          day_outside: "text-muted-foreground/30 opacity-50",
          day_disabled: "text-muted-foreground/30 opacity-80 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground/30 hover:scale-100",
          day_hidden: "invisible",
        }}
      />
    </Card>
  );
}
