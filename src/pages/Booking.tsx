import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TimeSlotPicker } from '@/components/scheduling/TimeSlotPicker';
import { ClientForm, ClientFormData } from '@/components/scheduling/ClientForm';
import { useAuth } from '@/hooks/useAuth';
import { useScheduling } from '@/hooks/useScheduling';
import { TimeSlot } from '@/types/scheduling';
import { ArrowLeft, CheckCircle, MapPin, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import Logo from '@/Logo.png';
import { Calendar } from "@/components/ui/calendar";
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';

type Step = 'service' | 'identity' | 'datetime' | 'confirmation' | 'success';

interface ProviderData {
  user_id: string;
  full_name: string | null;
  company_name: string | null;
  city: string | null;
  profession: string | null;
  logo_url: string | null;
  business_description: string | null;
}

interface ServiceData {
  id: string;
  title: string;
  description: string | null;
  price: number;
}

const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { generateTimeSlots, createAppointment, isLoading } = useScheduling();
  const { user, isLoading: authLoading } = useAuth();

  const companyId = searchParams.get('company');
  const [provider, setProvider] = useState<ProviderData | null>(null);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loadingProvider, setLoadingProvider] = useState(true);

  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [clientData, setClientData] = useState<ClientFormData | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);

  // Load Provider Data from Supabase
  useEffect(() => {
    const fetchProvider = async () => {
      if (!companyId) {
        setLoadingProvider(false);
        return;
      }

      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles_public')
          .select('user_id, full_name, company_name, city, profession, logo_url, business_description')
          .eq('user_id', companyId)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching provider:', profileError);
          toast({ title: "Erro ao carregar dados da empresa", variant: "destructive" });
          setLoadingProvider(false);
          return;
        }

        if (!profileData) {
          toast({ title: "Empresa não encontrada", variant: "destructive" });
          setLoadingProvider(false);
          return;
        }

        setProvider(profileData);

        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('id, title, description, price')
          .eq('user_id', companyId);

        if (servicesError) {
          console.error('Error fetching services:', servicesError);
        } else {
          setServices(servicesData || []);
        }
      } catch (error) {
        console.error('Error:', error);
        toast({ title: "Erro ao carregar dados", variant: "destructive" });
      } finally {
        setLoadingProvider(false);
      }
    };

    fetchProvider();
  }, [companyId, toast]);

  // Protect route
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Login necessário",
        description: "Por favor, faça login para continuar o agendamento.",
        variant: "default",
      });
      navigate(`/perfil?returnUrl=/agendar${companyId ? `?company=${companyId}` : ''}`);
    }
  }, [user, authLoading, navigate, companyId]);

  // Load time slots when date changes
  useEffect(() => {
    if (selectedDate) {
      generateTimeSlots(selectedDate).then(setTimeSlots);
    }
  }, [selectedDate]);

  const handleDateTimeNext = () => {
    if (selectedDate && selectedTime) {
      setStep('confirmation');
    }
  };

  const handleIdentitySubmit = (data: ClientFormData) => {
    setClientData(data);
    setStep('datetime');
  };

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !companyId || !clientData) return;
    const data = clientData;

    try {
      // Create or find the client record
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('email', data.email)
        .maybeSingle();

      let clientId: string;

      if (existingClient) {
        clientId = existingClient.id;
        await supabase
          .from('clients')
          .update({ name: data.name, phone: data.phone, document: data.document })
          .eq('id', clientId);
      } else {
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({ name: data.name, email: data.email, phone: data.phone, document: data.document })
          .select('id')
          .single();

        if (clientError) throw clientError;
        clientId = newClient.id;
      }

      // Insert appointment with provider_id
      const appointmentPayload = {
        client_id: clientId,
        provider_id: companyId,
        service_name: selectedService,
        visit_type: searchParams.get('tipo') || 'inspiracao',
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        appointment_time: selectedTime + ':00',
        notes: data.notes,
        status: 'pending',
        number_of_people: data.numberOfPeople,
        participants: data.participants,
      };

      const { error: appointmentError } = await (supabase.from('appointments').insert as any)(appointmentPayload);

      if (appointmentError) throw appointmentError;

      setAppointmentDetails({
        ...data,
        service: selectedService,
        companyName: provider?.company_name || provider?.full_name || "Agende Bem",
        date: selectedDate,
        time: selectedTime,
      });
      setStep('success');

      toast({ title: "Agendamento confirmado!", description: "Seu horário foi reservado com sucesso." });

      // Send confirmation email via edge function
      try {
        const { error: emailFunctionError } = await supabase.functions.invoke('send-booking-email', {
          body: {
            clientName: data.name,
            clientEmail: data.email,
            serviceName: selectedService,
            providerName: provider?.company_name || provider?.full_name || 'Boo',
            appointmentDate: format(selectedDate, "dd/MM/yyyy"),
            appointmentTime: selectedTime,
            participants: data.participants,
            numberOfPeople: data.numberOfPeople,
          },
        });

        if (emailFunctionError) throw emailFunctionError;

        toast({
          title: "Email enviado!",
          description: `Uma confirmação foi enviada para ${data.email}.`,
          duration: 5000,
        });
      } catch (emailError: any) {
        console.warn('Email de confirmação não enviado:', emailError);
        toast({
          title: "Aviso",
          description: "O agendamento foi confirmado, mas houve um erro ao enviar o email.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      toast({ title: "Erro ao agendar", description: error.message || "Tente novamente.", variant: "destructive" });
    }
  };

  const handleBack = () => {
    if (step === 'identity') {
      setStep('service');
      setSelectedService(null);
    } else if (step === 'datetime') {
      setStep('identity');
    } else if (step === 'confirmation') {
      setStep('datetime');
    }
  };

  const providerDisplayName = provider?.company_name || provider?.full_name || "Prestador";

  return (
    <div className="min-h-screen bg-background pb-12">
      <Navbar />

      {/* Back Button Sub-header */}
      {step !== 'success' && step !== 'service' && (
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Company Header Info (Only if company is loaded) */}
        {provider && step !== 'success' && (
          <div className="mb-8 p-6 bg-card rounded-xl shadow-sm border flex items-start gap-4">
            <div className="w-20 h-20 rounded-md overflow-hidden bg-primary/10 flex-shrink-0 flex items-center justify-center">
              {provider.logo_url ? (
                <img src={provider.logo_url} alt={providerDisplayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-primary">
                  {providerDisplayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{providerDisplayName}</h1>
              {provider.business_description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2 md:line-clamp-none">
                  {provider.business_description}
                </p>
              )}
              {provider.city && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="w-4 h-4" /> {provider.city}
                </div>
              )}
              {!provider.business_description && provider.profession && (
                <p className="text-sm text-muted-foreground mt-1">{provider.profession}</p>
              )}
            </div>
          </div>
        )}

        {/* Progress Steps */}
        {step !== 'success' && (
          <div className="flex items-center justify-center gap-4 mb-12">
            {['service', 'identity', 'datetime', 'confirmation'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === s
                    ? 'bg-gradient-electric text-white shadow-electric'
                    : ['service', 'identity', 'datetime', 'confirmation'].indexOf(step) > i
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                    }`}
                >
                  {i + 1}
                </div>
                {i < 3 && (
                  <div className={`w-12 h-1 rounded ${['service', 'identity', 'datetime', 'confirmation'].indexOf(step) > i
                    ? 'bg-primary'
                    : 'bg-muted'
                    }`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Select Service */}
        {step === 'service' && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Escolha o Serviço</h1>
              <p className="text-muted-foreground">
                Selecione o serviço que deseja agendar
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {loadingProvider ? (
                <div className="col-span-2 text-center py-12 text-muted-foreground">
                  Carregando serviços...
                </div>
              ) : provider && services.length > 0 ? (
                services.map((service) => (
                  <Card
                    key={service.id}
                    className={`p-6 cursor-pointer hover:border-primary transition-all ${selectedService === service.title ? 'border-2 border-primary bg-primary/5' : ''}`}
                    onClick={() => {
                      setSelectedService(service.title);
                      setStep('identity');
                    }}
                  >
                    <h3 className="font-bold text-lg">{service.title}</h3>
                    {service.description && (
                      <p className="text-muted-foreground text-sm mt-1">{service.description}</p>
                    )}
                    <p className="text-primary font-semibold mt-2">
                      R$ {service.price.toFixed(2).replace('.', ',')}
                    </p>
                  </Card>
                ))
              ) : provider && services.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-muted-foreground">
                  Este prestador ainda não cadastrou serviços.
                </div>
              ) : (
                <div className="col-span-2 text-center py-12 text-muted-foreground">
                  Nenhuma empresa selecionada ou encontrada. <br />
                  <Link to="/search" className="text-primary underline">Voltar para busca</Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Identity - Client Info & Number of People */}
        {step === 'identity' && selectedService && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                <span className="text-sm font-medium text-primary">
                  {selectedService}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-4">Seus Dados</h1>
              <p className="text-muted-foreground">
                Preencha suas informações e o número de pessoas
              </p>
            </div>

            <div className="max-w-lg mx-auto">
              <ClientForm
                onSubmit={handleIdentitySubmit}
                isLoading={isLoading}
                defaultValues={clientData ? {
                  name: clientData.name,
                  email: clientData.email,
                  phone: clientData.phone,
                  document: clientData.document,
                  numberOfPeople: clientData.numberOfPeople,
                  participants: clientData.participants?.map(p => ({ name: p.name || '', document: p.document || '' })),
                  notes: clientData.notes,
                } : user ? {
                  name: user.user_metadata?.full_name || '',
                  email: user.email || '',
                } : undefined}
              />
            </div>
          </div>
        )}

        {/* Step 3: Select Date and Time */}
        {step === 'datetime' && selectedService && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                <span className="text-sm font-medium text-primary">
                  {selectedService}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-4">Escolha Data e Horário</h1>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={ptBR}
                  className="rounded-md border shadow"
                  disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6} // Simple mock disabling weekends
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Selecione o Horário</h3>
                <Card className="p-6 border-none bg-card/50 shadow-none sm:border-2 sm:border-border/50 sm:shadow-electric rounded-2xl">
                  {selectedDate ? (
                    <TimeSlotPicker
                      slots={timeSlots}
                      selectedTime={selectedTime}
                      onSelectTime={setSelectedTime}
                    />
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      Selecione um dia no calendário
                    </div>
                  )}
                </Card>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                size="lg"
                disabled={!selectedDate || !selectedTime}
                onClick={handleDateTimeNext}
                className="bg-gradient-electric hover:opacity-90 text-primary-foreground font-semibold px-12 shadow-electric"
              >
                Revisar e Confirmar
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 'confirmation' && selectedService && selectedDate && selectedTime && clientData && (
          <div className="space-y-8 max-w-lg mx-auto">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Confirmar Agendamento</h1>
              <p className="text-muted-foreground">
                Revise os detalhes do seu agendamento
              </p>
            </div>

            <Card className="p-6 bg-card border-2 border-primary/20">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-muted-foreground">Serviço</span>
                  <span className="font-semibold text-lg">{selectedService}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-muted-foreground">Empresa</span>
                  <span className="font-medium">{providerDisplayName}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-muted-foreground">Data e Hora</span>
                  <div className="text-right">
                    <div className="font-medium">{format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</div>
                    <div className="text-primary font-bold">{selectedTime}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-muted-foreground">Cliente</span>
                  <div className="text-right">
                    <div className="font-medium">{clientData.name}</div>
                    <div className="text-sm text-muted-foreground">{clientData.email}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Documento</span>
                  <span className="font-medium">{clientData.document}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-muted-foreground">Pessoas</span>
                  <span className="font-medium">{clientData.numberOfPeople || 1}</span>
                </div>
                {clientData.participants && clientData.participants.length > 0 && (
                  <div className="pt-4 border-t">
                    <span className="text-muted-foreground block mb-2">Participantes</span>
                    <div className="space-y-2">
                      {clientData.participants.map((p, i) => (
                        <div key={i} className="text-sm">
                          <span className="font-medium">{p.name}</span> <span className="text-muted-foreground">({p.document})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Button
              onClick={handleConfirmBooking}
              disabled={isLoading}
              className="w-full bg-gradient-electric hover:opacity-90 text-primary-foreground font-semibold py-6 shadow-electric text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Confirmando...
                </>
              ) : (
                'Confirmar Agendamento'
              )}
            </Button>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && appointmentDetails && (
          <div className="text-center space-y-8 max-w-lg mx-auto">
            <div className="w-20 h-20 bg-gradient-electric rounded-full flex items-center justify-center mx-auto shadow-glow animate-pulse-glow">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>

            <div>
              <h1 className="text-3xl font-bold mb-4">Agendamento Confirmado!</h1>
              <p className="text-muted-foreground">
                Seu agendamento em <strong>{appointmentDetails.companyName}</strong> foi realizado.
              </p>
            </div>

            <Card className="p-6 bg-card border-2 border-primary/20 text-left">
              <h3 className="font-semibold mb-4 text-primary">Comprovante</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Serviço:</span>
                  <span className="font-medium">{appointmentDetails.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data:</span>
                  <span className="font-medium">
                    {format(appointmentDetails.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Horário:</span>
                  <span className="font-medium">{appointmentDetails.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="font-medium">{appointmentDetails.name}</span>
                </div>
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button variant="outline" className="w-full sm:w-auto">
                  Ir para Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Booking;
