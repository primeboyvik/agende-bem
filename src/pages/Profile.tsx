import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { LogOut, User as UserIcon, Loader2, ArrowLeft, Calendar } from "lucide-react";
import Logo from '@/Logo.png';

export default function Profile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  
  const { user, profile, isLoading, signIn, signUp, signOut, updateProfile } = useAuth();
  
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");

  // Redirect if already logged in and has returnUrl
  useEffect(() => {
    if (!isLoading && user && returnUrl) {
      navigate(returnUrl);
    }
  }, [isLoading, user, returnUrl, navigate]);

  // Set edit name when profile loads
  useEffect(() => {
    if (profile?.full_name) {
      setEditName(profile.full_name);
    }
  }, [profile]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      if (authMode === "signup") {
        await signUp(email, password, fullName);
        toast.success("Conta criada! Verifique seu email para confirmar.");
      } else {
        await signIn(email, password);
        toast.success("Login realizado com sucesso!");
        if (returnUrl) {
          navigate(returnUrl);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Erro na autenticação");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      await updateProfile({ full_name: editName });
      toast.success("Perfil atualizado!");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar perfil");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Até logo!");
      navigate("/");
    } catch (error: any) {
      toast.error("Erro ao sair");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Login/Signup Form
  if (!user) {
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
                {authMode === "login" 
                  ? "Faça login para gerenciar seus agendamentos" 
                  : "Crie sua conta para começar"}
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
                    minLength={6}
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
              </form>
            </Tabs>

            {authMode === "signup" && (
              <p className="text-xs text-muted-foreground text-center mt-4">
                Você receberá um email para confirmar sua conta
              </p>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // Profile View (Logged In)
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <Link to="/">
              <img src={Logo} alt="Logo" className="h-8 w-auto" />
            </Link>
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
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
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <UserIcon className="w-16 h-16 text-muted-foreground" />
                )}
              </div>
            </div>
            <h1 className="text-3xl font-bold">{profile?.full_name || "Usuário"}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-md mx-auto">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-background"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-electric hover:opacity-90"
                  disabled={authLoading}
                >
                  {authLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Salvar
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 max-w-md mx-auto">
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-border/50">
                  <span className="text-muted-foreground">Nome</span>
                  <span className="font-medium">{profile?.full_name || "Não informado"}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border/50">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border/50">
                  <span className="text-muted-foreground">Membro desde</span>
                  <span className="font-medium">
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="w-full"
                >
                  Editar Perfil
                </Button>
                <Link to="/agendar" className="w-full">
                  <Button className="w-full bg-gradient-electric hover:opacity-90">
                    <Calendar className="w-4 h-4 mr-2" />
                    Novo Agendamento
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
