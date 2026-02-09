import { useForm, useFieldArray } from 'react-hook-form';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { User, Mail, Phone, FileText, Loader2, Users } from 'lucide-react';

const clientFormSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  document: z.string().min(11, 'Documento inválido (Mín. 11 caracteres)'),
  numberOfPeople: z.coerce.number().min(1, 'Pelo menos 1 pessoa').default(1),
  participants: z.array(z.object({
    name: z.string().min(2, 'Nome obrigatório'),
    document: z.string().min(11, 'Documento obrigatório'),
  })).optional(),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientFormSchema>;

interface ClientFormProps {
  onSubmit: (data: ClientFormData) => void;
  isLoading?: boolean;
  defaultValues?: {
    name?: string;
    document?: string;
    numberOfPeople?: number;
    participants?: { name: string; document: string }[];
    email?: string;
    phone?: string;
    notes?: string;
  };
}

export function ClientForm({ onSubmit, isLoading, defaultValues }: ClientFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      numberOfPeople: 1,
      participants: [],
      ...defaultValues
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "participants",
  });

  const numberOfPeople = watch('numberOfPeople');

  useEffect(() => {
    const currentCount = (fields.length + 1); // +1 for the main client
    const targetCount = numberOfPeople || 1;

    if (targetCount > currentCount) {
      // Add more
      for (let i = currentCount; i < targetCount; i++) {
        append({ name: '', document: '' });
      }
    } else if (targetCount < currentCount) {
      // Remove excess
      for (let i = currentCount; i > targetCount; i--) {
        remove(i - 2); // index matches fields array
      }
    }
  }, [numberOfPeople, append, remove, fields.length]);




  return (
    <Card className="p-6 border-2 border-border/50 bg-card">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Nome Completo *
          </Label>
          <Input
            id="name"
            placeholder="Seu nome"
            {...register('name')}
            className="border-input focus:ring-2 focus:ring-primary"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="document" className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Documento (CPF/RG) *
          </Label>
          <Input
            id="document"
            placeholder="000.000.000-00"
            {...register('document')}
            className="border-input focus:ring-2 focus:ring-primary"
          />
          {errors.document && (
            <p className="text-sm text-destructive">{errors.document.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="numberOfPeople" className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Quantas pessoas?
          </Label>
          <Input
            id="numberOfPeople"
            type="number"
            min={1}
            placeholder="1"
            {...register('numberOfPeople')}
            className="border-input focus:ring-2 focus:ring-primary"
          />
          {errors.numberOfPeople && (
            <p className="text-sm text-destructive">{errors.numberOfPeople.message}</p>
          )}

        </div>

        {/* Dynamic Participants Fields */}
        {fields.map((field, index) => (
          <div key={field.id} className="p-4 border rounded-lg bg-muted/20 space-y-4">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <User className="w-4 h-4" /> Participante {index + 2}
            </h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input
                  {...register(`participants.${index}.name` as const)}
                  placeholder="Nome do participante"
                />
                {errors.participants?.[index]?.name && (
                  <p className="text-sm text-destructive">{errors.participants[index]?.name?.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Documento</Label>
                <Input
                  {...register(`participants.${index}.document` as const)}
                  placeholder="CPF/RG"
                />
                {errors.participants?.[index]?.document && (
                  <p className="text-sm text-destructive">{errors.participants[index]?.document?.message}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            {...register('email')}
            className="border-input focus:ring-2 focus:ring-primary"
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" />
            Telefone (opcional)
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(11) 99999-9999"
            {...register('phone')}
            className="border-input focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Observações (opcional)
          </Label>
          <Textarea
            id="notes"
            placeholder="Alguma informação adicional..."
            {...register('notes')}
            className="border-input focus:ring-2 focus:ring-primary resize-none"
            rows={3}
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-electric hover:opacity-90 text-primary-foreground font-semibold py-6 shadow-electric"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Agendando...
            </>
          ) : (
            'Confirmar Agendamento'
          )}
        </Button>
      </form>
    </Card>
  );
}
