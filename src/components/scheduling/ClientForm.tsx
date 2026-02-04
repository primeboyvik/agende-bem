import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { User, Mail, Phone, FileText, Loader2 } from 'lucide-react';

const clientFormSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
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
    email?: string;
    phone?: string;
    notes?: string;
  };
}

export function ClientForm({ onSubmit, isLoading, defaultValues }: ClientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues,
  });

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
        </div>

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
