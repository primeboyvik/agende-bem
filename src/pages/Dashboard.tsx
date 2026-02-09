import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, Clock, MapPin, User, Building2, Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ptBR } from "date-fns/locale";
import { BigCalendar } from "@/components/dashboard/BigCalendar";

export default function Dashboard() {
    const navigate = useNavigate();
    const { user, profile, isLoading } = useAuth();

    const userType = profile?.user_type || "usuario";
    const userName = profile?.full_name || user?.email || "Usuário";

    // Fetch user appointments (as client AND as provider)
    const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
        queryKey: ['dashboard-appointments', user?.id, user?.email],
        queryFn: async () => {
            if (!user?.id) return [];

            const results: any[] = [];

            // 1. As PROVIDER: appointments where provider_id = user.id
            const { data: providerApps } = await supabase
                .from('appointments')
                .select('*, client:clients!client_id(name)')
                .eq('provider_id', user.id);

            if (providerApps) {
                results.push(...providerApps.map(app => ({
                    ...app,
                    client: { name: (app.client as any)?.name || 'Cliente' },
                    role: 'provider' as const,
                })));
            }

            // 2. As CLIENT: find client record by email, then fetch appointments
            const email = user.email;
            if (email) {
                const { data: clientData } = await supabase
                    .from('clients')
                    .select('id')
                    .eq('email', email)
                    .maybeSingle();

                if (clientData) {
                    const { data: clientApps } = await supabase
                        .from('appointments')
                        .select('*') // We need provider_id from here
                        .eq('client_id', clientData.id);

                    if (clientApps && clientApps.length > 0) {
                        // Fetch provider profiles for these appointments
                        const providerIds = [...new Set(clientApps.map(app => app.provider_id).filter(Boolean))];

                        let providersMap: Record<string, any> = {};
                        if (providerIds.length > 0) {
                            const { data: profiles } = await supabase
                                .from('profiles')
                                .select('user_id, company_name, full_name, city')
                                .in('user_id', providerIds);

                            if (profiles) {
                                providersMap = profiles.reduce((acc, curr) => ({
                                    ...acc,
                                    [curr.user_id]: curr
                                }), {});
                            }
                        }

                        const existingIds = new Set(results.map(r => r.id));
                        results.push(...clientApps
                            .filter(app => !existingIds.has(app.id))
                            .map(app => {
                                const provider = app.provider_id ? providersMap[app.provider_id] : null;
                                return {
                                    ...app,
                                    role: 'client' as const,
                                    provider_name: provider?.company_name || provider?.full_name || 'Prestador',
                                    location: provider?.city || 'Local a definir'
                                };
                            }));
                    }
                }
            }

            return results;
        },
        enabled: !!user?.id
    });

    const nextAppointment = appointments?.filter(app => {
        const appDate = new Date(`${app.appointment_date}T${app.appointment_time}`);
        return appDate >= new Date() && (app.status === 'confirmed' || app.status === 'pending');
    }).sort((a, b) => {
        const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
        const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
        return dateA.getTime() - dateB.getTime();
    })[0];

    // Helper to format date/time
    const formatAppointmentDate = (dateStr: string, timeStr: string) => {
        const date = new Date(`${dateStr}T${timeStr}`);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const isToday = date.toDateString() === today.toDateString();
        const isTomorrow = date.toDateString() === tomorrow.toDateString();

        const time = timeStr.substring(0, 5); // HH:MM

        if (isToday) return `Hoje, ${time}`;
        if (isTomorrow) return `Amanhã, ${time}`;

        return `${date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}, ${time}`;
    };

    if (isLoading || isLoadingAppointments) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const NextAppointment = ({ appointment }: { appointment: any }) => {
        if (!appointment) {
            return (
                <Card className="p-6 border-none shadow-electric bg-white/50 backdrop-blur-sm h-full flex flex-col justify-center items-center text-center">
                    <CalendarIcon className="w-12 h-12 text-muted-foreground/20 mb-4" />
                    <h3 className="text-xl font-semibold text-muted-foreground">Nenhum agendamento futuro</h3>
                    <p className="text-sm text-muted-foreground mt-2">Agende um novo serviço agora mesmo!</p>
                    <Button onClick={() => navigate("/agendar")} className="mt-4 bg-primary/10 text-primary hover:bg-primary/20">
                        Novo Agendamento
                    </Button>
                </Card>
            );
        }

        const isProvider = userType === 'empresa' || userType === 'prestador';
        // If user is provider, show Client name. If user is client, show Provider name.
        const title = isProvider
            ? `Cliente: ${(appointment.client as any)?.name || 'Cliente'}`
            : (appointment.provider_name || 'Prestador');

        const subtitle = appointment.service_name || 'Serviço Agendado';

        return (
            <Card className="p-6 border-none shadow-electric bg-white/50 backdrop-blur-sm h-full flex flex-col justify-between">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    {isProvider ? 'Próximo Compromisso' : 'Seu Próximo Agendamento'}
                </h3>
                <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-border/50">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isProvider ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                            {isProvider ? <User className="w-6 h-6 text-green-600" /> : <Building2 className="w-6 h-6 text-primary" />}
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg">{title}</h4>
                            <p className="text-muted-foreground">{subtitle}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {formatAppointmentDate(appointment.appointment_date, appointment.appointment_time)}
                                </span>
                                {!isProvider && appointment.location && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {appointment.location}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    {isProvider ? (
                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" className="w-full border-green-500 text-green-600 hover:bg-green-50">
                                Confirmar
                            </Button>
                            <Button variant="outline" className="w-full border-red-500 text-red-600 hover:bg-red-50">
                                Cancelar
                            </Button>
                        </div>
                    ) : (
                        <Button className="w-full bg-gradient-electric text-white shadow-lg hover:shadow-xl transition-all">
                            Ver Detalhes
                        </Button>
                    )}
                </div>
            </Card>
        );
    };

    return (
        <div className="min-h-screen bg-background pb-10">
            <Navbar />
            <div className="p-6 pt-10">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                                Olá, {userName}!
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Aqui está o resumo do seu dia.
                            </p>
                        </div>
                        <Button onClick={() => navigate("/agendar")} className="bg-primary hover:bg-primary/90">
                            Novo Agendamento
                        </Button>
                    </div>

                    {/* Top Row: Next Appointment and Quick Actions Side-by-Side */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Left: Next Appointment/Commitment */}
                        <div>
                            <NextAppointment appointment={nextAppointment} />
                        </div>

                        {/* Right: Quick Actions */}
                        <div>
                            <Card className="p-6 border-none shadow-sm bg-white/50 backdrop-blur-sm h-full">
                                <h3 className="text-xl font-semibold mb-4">Acesso Rápido</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button variant="ghost" className="h-auto py-4 flex flex-col gap-2 border border-border/50 hover:bg-primary/5 hover:border-primary/50 transition-all">
                                        <User className="w-8 h-8 text-primary" />
                                        <span>Meu Perfil</span>
                                    </Button>
                                    <Button variant="ghost" className="h-auto py-4 flex flex-col gap-2 border border-border/50 hover:bg-primary/5 hover:border-primary/50 transition-all">
                                        <Clock className="w-8 h-8 text-primary" />
                                        <span>Histórico</span>
                                    </Button>
                                    <Button variant="ghost" className="h-auto py-4 flex flex-col gap-2 border border-border/50 hover:bg-primary/5 hover:border-primary/50 transition-all" onClick={() => navigate("/search")}>
                                        <MapPin className="w-8 h-8 text-primary" />
                                        <span>Explorar</span>
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Bottom Row: Full Width Calendar */}
                    <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-primary" />
                            Sua Agenda
                        </h3>
                        <BigCalendar appointments={appointments || []} />
                    </div>
                </div>
            </div>
        </div>
    );
}
