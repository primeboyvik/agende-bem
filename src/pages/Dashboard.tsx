import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, User, Building2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Navbar } from "@/components/Navbar";

export default function Dashboard() {
    const navigate = useNavigate();
    const [userType, setUserType] = useState("usuario");
    const [userName, setUserName] = useState("");

    useEffect(() => {
        const storedType = localStorage.getItem("user_type") || "usuario";
        const storedName = localStorage.getItem("user_name") || "Usuário";
        setUserType(storedType);
        setUserName(storedName);
    }, []);

    const MockAppointment = () => (
        <Card className="p-6 border-none shadow-electric bg-white/50 backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
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
        <Card className="p-6 border-none shadow-electric bg-white/50 backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
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
        <div className="min-h-screen bg-background">
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

                    <div className="grid md:grid-cols-2 gap-6">
                        {(userType === "empresa" || userType === "prestador") ? (
                            <MockCommitment />
                        ) : (
                            <MockAppointment />
                        )}

                        {/* Stats or Quick Actions Card */}
                        <Card className="p-6 border-none shadow-sm bg-white/50 backdrop-blur-sm">
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
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
