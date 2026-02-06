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

    // Fetch user appointments
    const { data: appointments } = useQuery({
        queryKey: ['dashboard-appointments', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];

            // Check if user is a client (user_id = client_id) OR provider (user_id = provider_id/service owner)
            // First find the client record for this user's email
            const email = user.email;
            if (!email) return [];

            const { data: clientData } = await supabase
                .from('clients')
                .select('id, name')
                .eq('email', email)
                .maybeSingle();

            if (!clientData) return [];

            const { data, error } = await supabase
                .from('appointments')
                .select('*, client:clients!client_id(name)')
                .eq('client_id', clientData.id);

            if (error) throw error;

            return (data || []).map(app => ({
                ...app,
                client: { name: (app.client as any)?.name || 'Cliente' },
            }));
        },
        enabled: !!user?.id
    });

    // Extract dates for highlighting (Not used anymore as we removed small calendar)
    // const appointmentDates = appointments?.map(app => {
    //      const datePart = app.appointment_date.split('T')[0]; 
    //      return new Date(datePart + 'T12:00:00'); 
    // }) || [];

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const MockAppointment = () => (
        <Card className="p-6 border-none shadow-electric bg-white/50 backdrop-blur-sm h-full flex flex-col justify-between">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                Seu Próximo Agendamento
            </h3>
            <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-border/50">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-lg">Barbearia do Silva</h4>
                        <p className="text-muted-foreground">Corte de Cabelo + Barba</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Amanhã, 14:00
                            </span>
                            <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                Centro
                            </span>
                        </div>
                    </div>
                </div>
                <Button className="w-full bg-gradient-electric text-white shadow-lg hover:shadow-xl transition-all">
                    Ver Detalhes
                </Button>
            </div>
        </Card>
    );

    const MockCommitment = () => (
        <Card className="p-6 border-none shadow-electric bg-white/50 backdrop-blur-sm h-full flex flex-col justify-between">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                Seu Próximo Compromisso
            </h3>
            <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-border/50">
                    <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <User className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-lg">Cliente: João Paulo</h4>
                        <p className="text-muted-foreground">Serviço: Consultoria Financeira</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Hoje, 16:30
                            </span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="w-full border-green-500 text-green-600 hover:bg-green-50">
                        Confirmar
                    </Button>
                    <Button variant="outline" className="w-full border-red-500 text-red-600 hover:bg-red-50">
                        Cancelar
                    </Button>
                </div>
            </div>
        </Card>
    );

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
                            {(userType === "empresa" || userType === "prestador") ? (
                                <MockCommitment />
                            ) : (
                                <MockAppointment />
                            )}
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
