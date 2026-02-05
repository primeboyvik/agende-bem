import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { VisitTypeCard } from '@/components/scheduling/VisitTypeCard';
import { Navbar } from '@/components/Navbar';
import { PricingSection } from '@/components/landing/PricingSection';
import { Calendar, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const Index = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Feather Animation
  const featherY = useTransform(scrollYProgress, [0, 1], ["0%", "200%"]); // Moves down deeper
  const featherRotate = useTransform(scrollYProgress, [0, 1], [0, 720]); // Spins more
  const featherOpacity = useTransform(scrollYProgress, [0, 0.1, 0.8, 1], [0, 1, 1, 0]); // Fades in then out
  const featherX = useTransform(scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    ["-100%", "100%", "-50%", "120%", "-100%"]
  ); // Swaying motion

  // Scroll Reveal Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-background relative overflow-hidden">

      {/* Floating Feather */}
      <motion.img
        src="/Pena.jpg"
        alt="Feather"
        style={{
          y: featherY,
          x: featherX,
          rotate: featherRotate,
          opacity: featherOpacity,
          top: '0%', // Start inside the header area
          left: '50%',
        }}
        className="fixed w-16 md:w-24 z-20 pointer-events-none mix-blend-multiply filter contrast-125"
        initial={{ y: 0, opacity: 0 }}
      />

      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/Image_fx.jpg"
            alt="Background"
            className="w-full h-full object-cover opacity-80"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600 opacity-10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

        <Navbar />

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-left">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary hover:cursor-pointer justify-center place-items-center flex items-center">Sistema de Agendamento Online</span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Quer{' '}
            <span className="text-gradient-electric">melhorar</span>
            <br />
            sua gestão de{' '}
            <span className="text-gradient-electric">tempo?</span>

            {' '}<br />

            <span className="text-gradient-electric">Pick a Boo!</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg text-white font-bold text-muted-foreground mb-12 max-w-2xl"
          >
            O seu gerenciamento de tempo de uma forma que você nunca viu. Coordene, coopere e organize seu ecossistema!
            <br />
            <br />
            Vem ser feliz com a gente!

          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link to="/search">
              <Button size="lg" className="bg-gradient-electric hover:opacity-90 text-primary-foreground font-semibold px-8 py-6 text-lg shadow-electric group">
                Agendar Agora
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 duration-300 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Smooth transition to next section */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-background pointer-events-none" />
      </header>

      {/* Visit Types Section */}
      <motion.section
        className="py-20 px-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Escolha sua Experiência</h2>
            <p className="text-muted-foreground">
              Declare o jeito como você recebe seus visitantes!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Link to="/agendar?tipo=inspiracao">
              <VisitTypeCard type="inspiracao" />
            </Link>
            <Link to="/agendar?tipo=conexoes">
              <VisitTypeCard type="conexoes" />
            </Link>
            <Link to="/agendar?tipo=visita_tecnica">
              <VisitTypeCard type="visita_tecnica" />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* How it Works Section */}
      <motion.section
        className="py-20 px-6 bg-muted/30"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
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
                title: 'Se cadastre!',
                description: 'Crie sua conta e nos diga quem é você!',
              },
              {
                step: '2',
                title: 'Veja o que te interessa e quem está perto de você!',
                description: 'Observe as oportunidades ao seu redor!',
              },
              {
                step: '3',
                title: 'Marque seus horários!',
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
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-20 px-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="max-w-2xl mx-auto text-center">
          <div className="p-8 bg-gradient-electric rounded-3xl shadow-glow">
            <Calendar className="w-12 h-12 text-white mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Pronto para agendar?
            </h2>
            <p className="text-white/80 mb-6">
              Se cadastre e venha marcar seus compromissos com a gente!
            </p>
            <Link to="/search">
              <Button size="lg" variant="secondary" className="font-semibold px-8">
                Começar Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2026 Boo. Todos os direitos reservados. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
