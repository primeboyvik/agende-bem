import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Loader2, ArrowRight, User, Building2, Briefcase } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function Onboarding() {
    const navigate = useNavigate();
    const { user, profile, isLoading } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [clientType, setClientType] = useState<"usuario" | "empresa" | "prestador">("usuario");

    useEffect(() => {
        if (!isLoading && !user) {
            navigate("/perfil");
        }
    }, [isLoading, user, navigate]);

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || user?.user_metadata?.full_name || "");
        } else if (user) {
            setFullName(user.user_metadata?.full_name || "");
        }
    }, [profile, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    phone,
                    user_type: clientType,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', user.id);

            if (error) throw error;

            toast.success("Cadastro concluído com sucesso!");
            const returnUrl = new URLSearchParams(window.location.search).get("returnUrl");
            navigate(returnUrl || "/perfil");
        } catch (error: any) {
            toast.error("Erro ao salvar dados: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-lg">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">Quase lá!</h1>
                        <p className="text-muted-foreground">
                            Precisamos de apenas mais alguns detalhes para personalizar sua experiência.
                        </p>
                    </div>

                    <Card className="p-8 border-none bg-card/50 shadow-none sm:border-2 sm:border-border/50 sm:shadow-electric rounded-2xl">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Nome Completo</Label>
                                <Input
                                    id="fullName"
                                    placeholder="Seu nome"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    className="bg-background"
                                />
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                                <Input
                                    id="phone"
                                    placeholder="(00) 00000-0000"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    className="bg-background"
                                />
                            </div>

                            {/* Client Type */}
                            <div className="space-y-3">
                                <Label>Como você pretende usar a plataforma?</Label>
                                <RadioGroup
                                    value={clientType}
                                    onValueChange={(v) => setClientType(v as any)}
                                    className="grid gap-4 pt-2"
                                >
                                    <div>
                                        <RadioGroupItem value="usuario" id="usuario" className="peer sr-only" />
                                        <Label
                                            htmlFor="usuario"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                                        >
                                            <User className="mb-3 h-6 w-6" />
                                            <div className="text-center">
                                                <span className="block font-semibold">Usuário Pessoal</span>
                                                <span className="text-xs text-muted-foreground mt-1 block">Para agendar serviços para mim</span>
                                            </div>
                                        </Label>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <RadioGroupItem value="empresa" id="empresa" className="peer sr-only" />
                                            <Label
                                                htmlFor="empresa"
                                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all h-full"
                                            >
                                                <Building2 className="mb-3 h-6 w-6" />
                                                <div className="text-center">
                                                    <span className="block font-semibold">Empresa</span>
                                                    <span className="text-xs text-muted-foreground mt-1 block">Gestão de equipe</span>
                                                </div>
                                            </Label>
                                        </div>

                                        <div>
                                            <RadioGroupItem value="prestador" id="prestador" className="peer sr-only" />
                                            <Label
                                                htmlFor="prestador"
                                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all h-full"
                                            >
                                                <Briefcase className="mb-3 h-6 w-6" />
                                                <div className="text-center">
                                                    <span className="block font-semibold">Prestador</span>
                                                    <span className="text-xs text-muted-foreground mt-1 block">Oferecer serviços</span>
                                                </div>
                                            </Label>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-electric hover:opacity-90 text-primary-foreground font-semibold shadow-electric h-12 text-lg"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                ) : (
                                    <>
                                        Concluir Cadastro
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}
