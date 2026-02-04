import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TimeSlotPicker } from '@/components/scheduling/TimeSlotPicker';
import { ClientForm, ClientFormData } from '@/components/scheduling/ClientForm';
import { useScheduling } from '@/hooks/useScheduling';
<<<<<<< HEAD
import { TimeSlot } from '@/types/scheduling';
import { ArrowLeft, CheckCircle, MapPin, Star } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import Logo from '@/Logo.png';
import { Calendar } from "@/components/ui/calendar";
import { getCompanies, Company } from '@/data/mockCompanies';

type Step = 'service' | 'datetime' | 'form' | 'success';
=======
import { useAuth } from '@/hooks/useAuth';
import { VisitType, TimeSlot, VISIT_TYPE_INFO } from '@/types/scheduling';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Logo from '@/Logo.png';

type Step = 'type' | 'datetime' | 'form' | 'success';
>>>>>>> bc8d421ec2458693cc292b982902705ef57900ae

const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
<<<<<<< HEAD
  const { toast } = useToast();
  const { generateTimeSlots, createAppointment, isLoading } = useScheduling();
=======
  const { user, profile, isLoading: authLoading } = useAuth();
  const { getAvailableDays, generateTimeSlots, createAppointment, isLoading } = useScheduling();
>>>>>>> bc8d421ec2458693cc292b982902705ef57900ae

  const companyId = searchParams.get('company');
  const [company, setCompany] = useState<Company | null>(null);

  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);

  // Load Company Data
  useEffect(() => {
    if (companyId) {
      const companies = getCompanies();
      const found = companies.find(c => c.id === companyId);
      if (found) {
        setCompany(found);
      } else {
        toast({ title: "Empresa não encontrada", variant: "destructive" });
      }
    }
  }, [companyId]);

  // Protect route - redirect to login if not authenticated
  useEffect(() => {
<<<<<<< HEAD
    const mockSession = localStorage.getItem("mock_session");
    if (!mockSession) {
      toast({
        title: "Login necessário",
        description: "Por favor, faça login para continuar o agendamento.",
        variant: "default",
      });
      navigate(`/perfil?returnUrl=/agendar${companyId ? `?company=${companyId}` : ''}`);
    }
  }, [navigate, companyId]);
=======
    if (!authLoading && !user) {
      navigate("/perfil?returnUrl=/agendar");
    }
  }, [authLoading, user, navigate]);
>>>>>>> bc8d421ec2458693cc292b982902705ef57900ae

  // Load time slots when date changes
  useEffect(() => {
    if (selectedDate) {
      generateTimeSlots(selectedDate).then(setTimeSlots);
    }
  }, [selectedDate, generateTimeSlots]);

  const handleDateTimeNext = () => {
    if (selectedDate && selectedTime) {
      setStep('form');
    }
  };

  const handleFormSubmit = async (data: ClientFormData) => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    const clientData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      notes: data.notes,
    };

    // Mock success strictly
    const success = true;

    // Simulate API call
    if (success) {
      setTimeout(() => {
        setAppointmentDetails({
          ...clientData,
          service: selectedService,
          companyName: company?.name || "Agende Bem",
          date: selectedDate,
          time: selectedTime,
        });
        setStep('success');
      }, 1500);
    }
  };

  const handleBack = () => {
    if (step === 'datetime') {
      setStep('service');
      setSelectedService(null);
    } else if (step === 'form') {
      setStep('datetime');
    }
  };

<<<<<<< HEAD
=======
  const availableDays = getAvailableDays();

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

>>>>>>> bc8d421ec2458693cc292b982902705ef57900ae
  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={Logo} alt="Logo" className="h-8 w-auto" />
          </Link>

          {step !== 'success' && step !== 'service' && (
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Company Header Info (Only if company is loaded) */}
        {company && step !== 'success' && (
          <div className="mb-8 p-6 bg-card rounded-xl shadow-sm border flex items-start gap-4">
            <div className="w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
              <img src={company.image} alt={company.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{company.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <MapPin className="w-4 h-4" /> {company.address}
              </div>
              <div className="flex items-center gap-1 text-sm text-yellow-500 mt-1">
                <Star className="w-4 h-4 fill-current" /> {company.rating}
              </div>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        {step !== 'success' && (
          <div className="flex items-center justify-center gap-4 mb-12">
            {['service', 'datetime', 'form'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
<<<<<<< HEAD
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === s
                    ? 'bg-gradient-electric text-white shadow-electric'
                    : ['service', 'datetime', 'form'].indexOf(step) > i
=======
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === s
                      ? 'bg-gradient-electric text-white shadow-electric'
                      : ['type', 'datetime', 'form'].indexOf(step) > i
>>>>>>> bc8d421ec2458693cc292b982902705ef57900ae
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i + 1}
                </div>
                {i < 2 && (
<<<<<<< HEAD
                  <div className={`w-12 h-1 rounded ${['service', 'datetime', 'form'].indexOf(step) > i
                    ? 'bg-primary'
                    : 'bg-muted'
                    }`} />
=======
                  <div
                    className={`w-12 h-1 rounded ${
                      ['type', 'datetime', 'form'].indexOf(step) > i
                        ? 'bg-primary'
                        : 'bg-muted'
                    }`}
                  />
>>>>>>> bc8d421ec2458693cc292b982902705ef57900ae
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
              {company ? (
                company.services.map((service, index) => (
                  <Card
                    key={index}
                    className={`p-6 cursor-pointer hover:border-primary transition-all ${selectedService === service ? 'border-2 border-primary bg-primary/5' : ''}`}
                    onClick={() => {
                      setSelectedService(service);
                      setStep('datetime');
                    }}
                  >
                    <h3 className="font-bold text-lg">{service}</h3>
                    <p className="text-muted-foreground text-sm mt-2">Duração aprox: 1h</p>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 text-center py-12 text-muted-foreground">
                  Nenhuma empresa selecionada ou encontrada. <br />
                  <Link to="/search" className="text-primary underline">Voltar para busca</Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Select Date and Time */}
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
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Client Form */}
        {step === 'form' && selectedService && selectedDate && selectedTime && (
          <div className="space-y-8 max-w-lg mx-auto">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Seus Dados</h1>
              <p className="text-muted-foreground">
                Confirme seus dados para o agendamento
              </p>
            </div>

            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Serviço:</span>
                <span className="font-medium">{selectedService}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">Empresa:</span>
                <span className="font-medium">{company?.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">Data:</span>
                <span className="font-medium">
                  {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">Horário:</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
            </Card>

            <ClientForm 
              onSubmit={handleFormSubmit} 
              isLoading={isLoading}
              defaultValues={{
                name: profile?.full_name || '',
                email: user.email || '',
              }}
            />
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
<<<<<<< HEAD
                Seu agendamento em <strong>{appointmentDetails.companyName}</strong> foi realizado.
=======
                Seu agendamento foi realizado com sucesso.
>>>>>>> bc8d421ec2458693cc292b982902705ef57900ae
              </p>
            </div>

            <Card className="p-6 bg-card border-2 border-primary/20 text-left">
              <h3 className="font-semibold mb-4 text-primary">Comprovante</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
<<<<<<< HEAD
                  <span className="text-muted-foreground">Serviço:</span>
                  <span className="font-medium">{appointmentDetails.service}</span>
=======
                  <span className="text-muted-foreground">Tipo de Visita:</span>
                  <span className="font-medium">
                    {VISIT_TYPE_INFO[appointmentDetails.visitType].label}
                  </span>
>>>>>>> bc8d421ec2458693cc292b982902705ef57900ae
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
