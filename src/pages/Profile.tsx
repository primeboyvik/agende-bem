import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { LogOut, User as UserIcon, Camera, Loader2, ArrowLeft } from "lucide-react";

export default function Profile() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnUrl = searchParams.get("returnUrl");
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [fullName, setFullName] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [authMode, setAuthMode] = useState<"login" | "signup">("login");

    // Auth Form State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [authLoading, setAuthLoading] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                getProfile(session.user);
            }
            setLoading(false);
            if (session?.user && returnUrl) {
                navigate(returnUrl);
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                getProfile(session.user);
                if (returnUrl) {
                    navigate(returnUrl);
                }
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const getProfile = async (currentUser: User) => {
        try {
            // First try to get from profiles table
            const { data, error } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', currentUser.id)
                .single();

            if (!error && data) {
                setFullName(data.full_name || "");
            } else {
                // Fallback to metadata
                setFullName(currentUser.user_metadata.full_name || "");
            }
        } catch (error) {
            console.error("Error loading profile:", error);
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthLoading(true);

        try {
            if (authMode === "signup") {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                });
                if (error) throw error;
                toast.success("Conta criada! Verifique seu email para confirmar.");
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                toast.success("Login realizado com sucesso!");
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setAuthLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setAuthLoading(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: fullName,
                    updated_at: new Date().toISOString(),
                    user_id: user.id
                });

            if (error) throw error;

            // Also update auth metadata for consistency
            await supabase.auth.updateUser({
                data: { full_name: fullName }
            });

            toast.success("Perfil atualizado com sucesso!");
            setIsEditing(false);
        } catch (error: any) {
            toast.error("Erro ao atualizar perfil: " + error.message);
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <Button
                        variant="ghost"
                        className="mb-8"
                        onClick={() => navigate("/")}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar ao Início
                    </Button>

                    <Card className="p-8 border-none bg-card/50 shadow-none sm:border-2 sm:border-border/50 sm:shadow-electric rounded-2xl">
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold mb-2">Bem-vindo ao Boo</h1>
                            <p className="text-muted-foreground">
                                {authMode === "login" ? "Faça login para gerenciar seus agendamentos" : "Crie sua conta para começar"}
                            </p>
                        </div>

                        <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as "login" | "signup")}>
                            <TabsList className="grid w-full grid-cols-2 mb-8">
                                <TabsTrigger value="login">Login</TabsTrigger>
                                <TabsTrigger value="signup">Cadastro</TabsTrigger>
                            </TabsList>

                            <form onSubmit={handleAuth} className="space-y-4">
                                {authMode === "signup" && (
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
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="bg-background"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Senha</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="bg-background"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-electric hover:opacity-90 text-primary-foreground font-semibold shadow-electric mt-4"
                                    disabled={authLoading}
                                >
                                    {authLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    {authMode === "login" ? "Entrar" : "Criar Conta"}
                                </Button>

                                <div className="relative my-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-border" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={async () => {
                                        const { error } = await supabase.auth.signInWithOAuth({
                                            provider: 'google',
                                            options: {
                                                redirectTo: window.location.origin + '/perfil'
                                            }
                                        });
                                        if (error) toast.error(error.message);
                                    }}
                                >
                                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                                    </svg>
                                    Google
                                </Button>
                            </form>
                        </Tabs>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-2xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <Button variant="ghost" onClick={() => navigate("/")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar
                    </Button>
                    <Button variant="outline" onClick={handleLogout} className="text-destructive hover:text-destructive">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                    </Button>
                </header>

                <Card className="p-8 border-none bg-card/50 shadow-none sm:border-2 sm:border-border/50 sm:shadow-electric rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-electric opacity-10" />

                    <div className="relative flex flex-col items-center mb-8">
                        <div className="w-32 h-32 rounded-full bg-gradient-electric p-[3px] shadow-glow mb-4">
                            <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                                {user?.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-16 h-16 text-muted-foreground" />
                                )}
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold">{fullName || "Usuário"}</h1>
                        <p className="text-muted-foreground">{user?.email}</p>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-md mx-auto">
                        <div className="space-y-2">
                            <Label>Nome Completo</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    disabled={!isEditing}
                                    className="bg-background"
                                />
                                {!isEditing ? (
                                    <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
                                        Editar
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                                            Cancelar
                                        </Button>
                                        <Button type="submit" disabled={authLoading}>
                                            {authLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                            Salvar
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Camera className="w-4 h-4" />
                                Foto de Perfil
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Para alterar sua foto, utilize o Gravatar associado ao seu email ou entre em contato com o suporte.
                            </p>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}
