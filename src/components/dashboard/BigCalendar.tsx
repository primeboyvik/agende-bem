import { useMemo, useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Appointment {
    id: string;
    appointment_date: string;
    appointment_time: string;
    // Add other fields if necessary
    client?: { name: string };
    service?: { title: string };
    // We handle potential 'any' type from Supabase for now
    [key: string]: any;
}

interface BigCalendarProps {
    appointments: Appointment[];
}

export function BigCalendar({ appointments }: BigCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const days = useMemo(() => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const startDate = startOfWeek(monthStart, { locale: ptBR });
        const endDate = endOfWeek(monthEnd, { locale: ptBR });

        return eachDayOfInterval({ start: startDate, end: endDate });
    }, [currentDate]);

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const getDayAppointments = (date: Date) => {
        return appointments.filter(app => {
            // Handle potential string vs date object issues
            const appDate = new Date(app.appointment_date + 'T12:00:00');
            return isSameDay(appDate, date);
        });
    };

    return (
        <Card className="p-6 border-none shadow-electric bg-white/80 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 capitalize">
                    {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                </h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={prevMonth}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden border border-border">
                {/* Header */}
                {weekDays.map(day => (
                    <div key={day} className="bg-background/50 p-3 text-center text-sm font-semibold text-muted-foreground">
                        {day}
                    </div>
                ))}

                {/* Days */}
                {days.map((day, idx) => {
                    const dayApps = getDayAppointments(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isToday = isSameDay(day, new Date());

                    return (
                        <div
                            key={day.toISOString()}
                            className={cn(
                                "min-h-[120px] bg-background p-2 transition-colors hover:bg-muted/30 relative group",
                                !isCurrentMonth && "bg-muted/10 text-muted-foreground/50",
                                isToday && "bg-blue-50/50"
                            )}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={cn(
                                    "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                                    isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                                )}>
                                    {format(day, 'd')}
                                </span>
                                {dayApps.length > 0 && (
                                    <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                                        {dayApps.length}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-1">
                                {dayApps.slice(0, 3).map((app) => (
                                    <Dialog key={app.id}>
                                        <DialogTrigger asChild>
                                            <div className="text-xs p-1 rounded bg-primary/10 text-primary border-l-2 border-primary truncate cursor-pointer hover:bg-primary/20 transition-colors">
                                                {app.appointment_time.slice(0, 5)} - {app.client?.name || "Cliente"}
                                            </div>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Detalhes do Agendamento</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 pt-4">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-5 h-5 text-muted-foreground" />
                                                    <span>
                                                        {format(new Date(app.appointment_date + 'T12:00:00'), "dd 'de' MMMM", { locale: ptBR })} às {app.appointment_time}
                                                    </span>
                                                </div>
                                                {/* Add more details here based on available data */}
                                                <div className="p-4 bg-muted rounded-lg space-y-2">
                                                    <p><strong>Cliente:</strong> {app.client?.name || "Não informado"}</p>
                                                    <p><strong>Serviço:</strong> {app.service?.title || "Não informado"}</p>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                ))}
                                {dayApps.length > 3 && (
                                    <div className="text-xs text-muted-foreground pl-1">
                                        + {dayApps.length - 3} mais
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
