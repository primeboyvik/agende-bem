import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Appointment, Client, VISIT_TYPE_INFO, DAY_NAMES } from '@/types/scheduling';
import {
  Zap,
  Calendar,
  Users,
  Settings,
  LogOut,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Logo from '@/Logo.png';

type Database = {
  public: {
    Tables: {
      appointments: {
        Row: Appointment;
      };
      clients: {
        Row: Client;
      };
    };
  };
};

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // Check auth state
  useEffect(() => {
    const checkAuth = () => {
      const mockSession = localStorage.getItem("mock_session");
      setIsAuthenticated(!!mockSession);
      setIsLoading(false);

      if (mockSession) {
        fetchData();
      }
    };

    checkAuth();
  }, []);

  const fetchData = async () => {
    // Keep real fetch or mock it? User said "autenticação real" not needed.
    // We will keep real fetch for now as it might assume public access or we don't care about data privacy for simulation.
    // If it fails due to RLS, that's expected for "simulation" if we don't fix RLS, but let's try to keep it.

    // Fetch appointments with client data
    const { data: appointmentsData } = await supabase
      .from('appointments')
      .select(`
        *,
        client:clients(*)
      `)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });

    setAppointments(appointmentsData || []);

    // Fetch clients
    const { data: clientsData } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    setClients(clientsData || []);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    // Mock Login
    setTimeout(() => {
      localStorage.setItem("mock_session", "true");
      localStorage.setItem("user_email", email);
      setIsAuthenticated(true);
      fetchData(); // Load data after login

      toast({
        title: 'Bem-vindo!',
        description: 'Login realizado com sucesso (Simulação).',
      });
      setAuthLoading(false);
    }, 1000);
  };

  const handleLogout = async () => {
    localStorage.removeItem("mock_session");
    localStorage.removeItem("user_email");
    setIsAuthenticated(false);
    toast({
      title: 'Até logo!',
      description: 'Você saiu do sistema.',
    });
  };

  const updateAppointmentStatus = async (id: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    // ... Mock or real update? Let's try real first, ignoring RLS for now or assuming public.
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Atualizado!',
        description: 'Status do agendamento atualizado.',
      });
      fetchData();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-muted text-muted-foreground border-border">Pendente</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">Confirmado</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30">Concluído</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 border-2 border-border/50">
          <div className="text-center mb-8">
            <div className="p-3 bg-gradient-electric rounded-xl inline-flex shadow-electric mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground text-sm mt-2">
              Faça login para acessar
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@exemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={authLoading}
              className="w-full bg-gradient-electric hover:opacity-90"
            >
              {authLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Entrar
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
              ← Voltar ao site
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={Logo} alt="Admin Logo" className="h-8 w-auto" />
            <span className="text-lg font-bold">Admin</span>
          </div>

          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="appointments" className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Agendamentos
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Config
            </TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Agendamentos</h2>
              <Badge variant="outline" className="text-sm">
                {appointments.length} agendamentos
              </Badge>
            </div>

            {appointments.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">Nenhum agendamento ainda</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {appointments.map((apt) => (
                  <Card key={apt.id} className="p-4 border-2 border-border/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{apt.client?.name || 'Cliente'}</h3>
                          {getStatusBadge(apt.status)}
                          <Badge
                            variant="secondary"
                            className={
                              apt.visit_type === 'inspiracao'
                                ? 'bg-secondary/20 text-secondary-foreground'
                                : 'bg-accent/20 text-accent-foreground'
                            }
                          >
                            {VISIT_TYPE_INFO[apt.visit_type as keyof typeof VISIT_TYPE_INFO]?.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(parseISO(apt.appointment_date), "dd/MM/yyyy")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {apt.appointment_time.slice(0, 5)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {apt.client?.email} {apt.client?.phone && `• ${apt.client.phone}`}
                        </p>
                        {apt.notes && (
                          <p className="text-sm bg-muted/50 p-2 rounded">
                            {apt.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {apt.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}
                              className="bg-primary"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Confirmar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Cancelar
                            </Button>
                          </>
                        )}
                        {apt.status === 'confirmed' && (
                          <Button
                            size="sm"
                            onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Concluir
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Clientes</h2>
              <Badge variant="outline" className="text-sm">
                {clients.length} clientes
              </Badge>
            </div>

            {clients.length === 0 ? (
              <Card className="p-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">Nenhum cliente cadastrado</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {clients.map((client) => (
                  <Card key={client.id} className="p-4 border-2 border-border/50">
                    <h3 className="font-semibold">{client.name}</h3>
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                    {client.phone && (
                      <p className="text-sm text-muted-foreground">{client.phone}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Desde {format(parseISO(client.created_at), "dd/MM/yyyy")}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <h2 className="text-2xl font-bold">Configurações</h2>
            <Card className="p-6 border-2 border-border/50">
              <h3 className="font-semibold mb-4">Horários de Atendimento</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Os horários padrão estão configurados para Segunda a Sexta, das 09:00 às 18:00.
              </p>
              <div className="grid gap-2">
                {[1, 2, 3, 4, 5].map((day) => (
                  <div key={day} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="font-medium">{DAY_NAMES[day]}</span>
                    <span className="text-muted-foreground">09:00 - 18:00</span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
