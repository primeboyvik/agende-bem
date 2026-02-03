import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { VisitTypeCard } from '@/components/scheduling/VisitTypeCard';
import { Calendar, Sparkles, ArrowRight, Zap } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-electric opacity-5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-electric-cyan/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-electric-blue/20 rounded-full blur-3xl" />
        
        <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-electric rounded-lg shadow-electric">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient-electric">AgendaElectric</span>
          </div>
          <Link to="/admin">
            <Button variant="outline" size="sm">
              Área Admin
            </Button>
          </Link>
        </nav>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Sistema de Agendamento Online</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Agende sua{' '}
            <span className="text-gradient-electric">visita</span>
            {' '}de forma simples
          </h1>
          
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Escolha o tipo de experiência que deseja vivenciar e reserve seu horário 
            em poucos cliques. Rápido, fácil e sem complicações.
          </p>

          <Link to="/agendar">
            <Button size="lg" className="bg-gradient-electric hover:opacity-90 text-primary-foreground font-semibold px-8 py-6 text-lg shadow-electric group">
              Agendar Agora
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Visit Types Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Escolha sua Experiência</h2>
            <p className="text-muted-foreground">
              Oferecemos dois tipos de visitas para atender às suas necessidades
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Link to="/agendar?tipo=inspiracao">
              <VisitTypeCard type="inspiracao" />
            </Link>
            <Link to="/agendar?tipo=conexoes">
              <VisitTypeCard type="conexoes" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Como Funciona</h2>
            <p className="text-muted-foreground">
              Agende em 3 passos simples
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Escolha o Tipo',
                description: 'Selecione entre Visita Inspiração ou Conexões',
              },
              {
                step: '2',
                title: 'Selecione Data e Hora',
                description: 'Veja os horários disponíveis no calendário',
              },
              {
                step: '3',
                title: 'Confirme seus Dados',
                description: 'Preencha suas informações e pronto!',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-gradient-electric rounded-full flex items-center justify-center mx-auto mb-4 shadow-electric">
                  <span className="text-xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="p-8 bg-gradient-electric rounded-3xl shadow-glow">
            <Calendar className="w-12 h-12 text-white mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Pronto para agendar?
            </h2>
            <p className="text-white/80 mb-6">
              Reserve seu horário agora e garanta sua visita
            </p>
            <Link to="/agendar">
              <Button size="lg" variant="secondary" className="font-semibold px-8">
                Começar Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2024 AgendaElectric. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
