import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { VisitTypeCard } from '@/components/scheduling/VisitTypeCard';
import { CalendarPicker } from '@/components/scheduling/CalendarPicker';
import { TimeSlotPicker } from '@/components/scheduling/TimeSlotPicker';
import { ClientForm, ClientFormData } from '@/components/scheduling/ClientForm';
import { useScheduling } from '@/hooks/useScheduling';
import { VisitType, TimeSlot, VISIT_TYPE_INFO } from '@/types/scheduling';
import { ArrowLeft, Zap, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Step = 'type' | 'datetime' | 'form' | 'success';

const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getAvailableDays, generateTimeSlots, createAppointment, isLoading } = useScheduling();

  const [step, setStep] = useState<Step>('type');
  const [visitType, setVisitType] = useState<VisitType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);

  // Check URL params for preselected type
  useEffect(() => {
    const tipo = searchParams.get('tipo') as VisitType | null;
    if (tipo && (tipo === 'inspiracao' || tipo === 'conexoes')) {
      setVisitType(tipo);
      setStep('datetime');
    }
  }, [searchParams]);

  // Load time slots when date changes
  useEffect(() => {
    if (selectedDate) {
      generateTimeSlots(selectedDate).then(setTimeSlots);
    }
  }, [selectedDate]);

  const handleSelectType = (type: VisitType) => {
    setVisitType(type);
    setStep('datetime');
  };

  const handleDateTimeNext = () => {
    if (selectedDate && selectedTime) {
      setStep('form');
    }
  };

  const handleFormSubmit = async (data: ClientFormData) => {
    if (!visitType || !selectedDate || !selectedTime) return;

    const clientData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      notes: data.notes,
    };

    const success = await createAppointment(visitType, selectedDate, selectedTime, clientData);

    if (success) {
      setAppointmentDetails({
        ...clientData,
        visitType,
        date: selectedDate,
        time: selectedTime,
      });
      setStep('success');
    }
  };

  const handleBack = () => {
    if (step === 'datetime') {
      setStep('type');
      setVisitType(null);
    } else if (step === 'form') {
      setStep('datetime');
    }
  };

  const availableDays = getAvailableDays();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 bg-gradient-electric rounded-lg shadow-electric">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gradient-electric">AgendaElectric</span>
          </Link>

          {step !== 'success' && step !== 'type' && (
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Progress Steps */}
        {step !== 'success' && (
          <div className="flex items-center justify-center gap-4 mb-12">
            {['type', 'datetime', 'form'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === s
                      ? 'bg-gradient-electric text-white shadow-electric'
                      : ['type', 'datetime', 'form'].indexOf(step) > i
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                >
                  {i + 1}
                </div>
                {i < 2 && (
                  <div className={`w-12 h-1 rounded ${['type', 'datetime', 'form'].indexOf(step) > i
                      ? 'bg-primary'
                      : 'bg-muted'
                    }`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Select Type */}
        {step === 'type' && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Escolha o Tipo de Visita</h1>
              <p className="text-muted-foreground">
                Selecione a experiência que melhor atende às suas necessidades
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <VisitTypeCard
                type="inspiracao"
                selected={visitType === 'inspiracao'}
                onClick={() => handleSelectType('inspiracao')}
              />
              <VisitTypeCard
                type="conexoes"
                selected={visitType === 'conexoes'}
                onClick={() => handleSelectType('conexoes')}
              />
            </div>
          </div>
        )}

        {/* Step 2: Select Date and Time */}
        {step === 'datetime' && visitType && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                <span className="text-sm font-medium text-primary">
                  {VISIT_TYPE_INFO[visitType].label}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-4">Escolha Data e Horário</h1>
              <p className="text-muted-foreground">
                Selecione o melhor momento para sua visita
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Selecione a Data</h3>
                <CalendarPicker
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  availableDays={availableDays}
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Selecione o Horário</h3>
                <Card className="p-6 border-none bg-card/50 shadow-none sm:border-2 sm:border-border/50 sm:shadow-electric rounded-2xl">
                  <TimeSlotPicker
                    slots={timeSlots}
                    selectedTime={selectedTime}
                    onSelectTime={setSelectedTime}
                  />
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
        {step === 'form' && visitType && selectedDate && selectedTime && (
          <div className="space-y-8 max-w-lg mx-auto">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Seus Dados</h1>
              <p className="text-muted-foreground">
                Preencha suas informações para confirmar o agendamento
              </p>
            </div>

            {/* Summary */}
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tipo:</span>
                <span className="font-medium">{VISIT_TYPE_INFO[visitType].label}</span>
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

            <ClientForm onSubmit={handleFormSubmit} isLoading={isLoading} />
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
                Seu agendamento foi realizado com sucesso. Você receberá uma confirmação por email.
              </p>
            </div>

            <Card className="p-6 bg-card border-2 border-primary/20 text-left">
              <h3 className="font-semibold mb-4 text-primary">Detalhes do Agendamento</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo de Visita:</span>
                  <span className="font-medium">{VISIT_TYPE_INFO[appointmentDetails.visitType].label}</span>
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
                  <span className="text-muted-foreground">Nome:</span>
                  <span className="font-medium">{appointmentDetails.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{appointmentDetails.email}</span>
                </div>
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button variant="outline" className="w-full sm:w-auto">
                  Voltar ao Início
                </Button>
              </Link>
              <Link to="/agendar">
                <Button className="w-full sm:w-auto bg-gradient-electric hover:opacity-90">
                  Novo Agendamento
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
