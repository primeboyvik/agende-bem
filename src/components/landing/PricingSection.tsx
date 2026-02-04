
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
    {
        name: 'Básico',
        price: '79,99',
        description: 'Para quem está começando a se organizar.',
        features: ['Acesso à agenda básica', 'Lembretes por e-mail', 'Suporte por e-mail'],
        highlight: false,
    },
    {
        name: 'Profissional',
        price: '159,99',
        description: 'Ideal para profissionais que buscam eficiência.',
        features: [
            'Tudo do Básico',
            'Lembretes por SMS e WhatsApp',
            'Relatórios de produtividade',
            'Suporte prioritário',
        ],
        highlight: true,
    },
    {
        name: 'Empresarial',
        price: '259,99',
        description: 'Para equipes que precisam de controle total.',
        features: [
            'Tudo do Profissional',
            'Painel de gestão de equipe',
            'API para integrações',
            'Gerente de conta dedicado',
        ],
        highlight: false,
    },
];

export const PricingSection = () => {
    return (
        <section className="py-20 px-6 bg-background">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Planos Flexíveis</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Escolha o plano ideal para você ou sua empresa e comece a transformar sua gestão de tempo hoje mesmo.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-start">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative rounded-3xl p-8 transition-all duration-300 hover:scale-105 ${plan.highlight
                                ? 'bg-gradient-electric text-white shadow-electric ring-4 ring-blue-400/30'
                                : 'bg-card border border-border hover:border-primary/50 text-card-foreground shadow-lg'
                                }`}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-blue-600 px-4 py-1 rounded-full text-sm font-bold shadow-md">
                                    Mais Popular
                                </div>
                            )}

                            <h3 className={`text-2xl font-bold mb-2 ${plan.highlight ? 'text-white' : ''}`}>
                                {plan.name}
                            </h3>
                            <div className="mb-4">
                                <span className="text-sm opacity-80">R$</span>
                                <span className="text-4xl font-bold mx-1">{plan.price}</span>
                                <span className="text-sm opacity-80">/mês</span>
                            </div>
                            <p className={`mb-6 text-sm ${plan.highlight ? 'text-blue-50' : 'text-muted-foreground'}`}>
                                {plan.description}
                            </p>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm">
                                        <div
                                            className={`rounded-full p-1 mt-0.5 ${plan.highlight ? 'bg-white/20' : 'bg-primary/10'
                                                }`}
                                        >
                                            <Check className={`w-3 h-3 ${plan.highlight ? 'text-white' : 'text-primary'}`} />
                                        </div>
                                        <span className={plan.highlight ? 'text-blue-50' : ''}>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link to={`/agendar?plan=${plan.name}`}>
                                <Button
                                    className={`w-full font-bold h-12 text-base ${plan.highlight
                                        ? 'bg-white text-blue-600 hover:bg-blue-50'
                                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                                        }`}
                                >
                                    Escolher {plan.name}
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
