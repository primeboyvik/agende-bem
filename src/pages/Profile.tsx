import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { LogOut, User as UserIcon, Loader2, ArrowLeft, Calendar, Save, Building2, Briefcase, MapPin, CreditCard, LayoutDashboard, Plus, Trash, Clock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Logo from '@/Logo.png';
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { lovable } from "@/integrations/lovable";

type ProfileTab = "data" | "address" | "payment" | "services";

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
  const [signupSuccess, setSignupSuccess] = useState(false);

  // -- PROFILE DATA STATES --
  const [phone, setPhone] = useState("");
  const [clientType, setClientType] = useState("usuario");
  const [sex, setSex] = useState("");
  const [gender, setGender] = useState("");
  const [profession, setProfession] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [cnpj, setCnpj] = useState("");

  // -- COMPLEX DATA STATES --
  const [addresses, setAddresses] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [myServices, setMyServices] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<ProfileTab>("data");

  // Inputs for adding new items
  const [newService, setNewService] = useState({ name: "", price: "", description: "", image: "" });
  const [newAddress, setNewAddress] = useState({ street: "", city: "", zip: "" });
  const [newCard, setNewCard] = useState({ number: "", holder: "", expiry: "" });

  // Availability
  const defaultAvailability = {
    seg: { enabled: true, start: "08:00", end: "18:00" },
    ter: { enabled: true, start: "08:00", end: "18:00" },
    qua: { enabled: true, start: "08:00", end: "18:00" },
    qui: { enabled: true, start: "08:00", end: "18:00" },
    sex: { enabled: true, start: "08:00", end: "18:00" },
    sab: { enabled: false, start: "08:00", end: "12:00" },
    dom: { enabled: false, start: "08:00", end: "12:00" },
  };
  const [availability, setAvailability] = useState(defaultAvailability);
  const daysMap = { seg: "Segunda", ter: "Terça", qua: "Quarta", qui: "Quinta", sex: "Sexta", sab: "Sábado", dom: "Domingo" };


  // Redirect if already logged in and has returnUrl
  useEffect(() => {
    if (!isLoading && user && returnUrl) {
      navigate(returnUrl);
    }
  }, [isLoading, user, returnUrl, navigate]);

  // Load Data from Supabase
  useEffect(() => {
    if (user) {
      // 1. Load Profile Data (merging metadata fallback for safety while migrating)
      const loadProfile = async () => {
        // We reload profile to ensure we have latest columns if they exist
        const { data: profileData } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();

        if (profileData) {
          setFullName(profileData.full_name || "");
          // @ts-ignore
          setPhone(profileData.phone || user.user_metadata?.phone || "");
          // @ts-ignore
          setClientType(profileData.user_type || user.user_metadata?.user_type || "usuario");
          // @ts-ignore
          setSex(profileData.sex || user.user_metadata?.sex || "");
          // @ts-ignore
          setGender(profileData.gender || user.user_metadata?.gender || "");
          // @ts-ignore
          setProfession(profileData.profession || user.user_metadata?.profession || "");
          // @ts-ignore
          setCompanyName(profileData.company_name || user.user_metadata?.company_name || "");
          // @ts-ignore
          setCnpj(profileData.cnpj || user.user_metadata?.cnpj || "");
        } else {
          // Fallback if profile row is missing (shouldn't happen for auth user)
          setFullName(user.user_metadata?.full_name || "");
        }

        // 2. Load Services from Table
        const { data: servicesData, error: servicesError } = await (supabase
          .from('services')
          .select('*') as any)
          .eq('user_id', user.id);

        if (servicesData && servicesData.length > 0) {
          setMyServices(servicesData);
        } else {
          // Fallback to metadata if table is empty (migration phase)
          setMyServices(user.user_metadata?.services || []);
        }

        // 3. Load Arrays from Metadata (Addresses/Cards)
        setAddresses(user.user_metadata?.addresses || []);
        setCards(user.user_metadata?.payment_methods || []);
      };

      loadProfile();
    }
  }, [user]);

  // ... inside component ...
  // ... existing effects ...

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      if (authMode === "signup") {
        await signUp(email, password, fullName);
        setSignupSuccess(true);
        toast.success("Conta criada! Verifique seu email.");
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

  const handleSaveAll = async () => {
    if (!user) return;
    setAuthLoading(true);

    try {
      // 1. Update Profile (Base Table - NOW WITH EXTENDED COLUMNS)
      const profileUpdates = {
        full_name: fullName,
        phone,
        user_type: clientType,
        sex,
        gender,
        profession,
        company_name: companyName,
        cnpj,
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // 2. Update User Metadata (Only for Addresses and Cards now)
      // We keep others in metadata as backup/read-only or for session ease
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          phone,
          user_type: clientType,
          company_name: companyName, // Keep syncing for now
          addresses: addresses,
          payment_methods: cards
          // Services are now in their own table, we don't overwrite metadata services to avoid confusion
          // or we could clear them to save space? Let's leave them for safety.
        }
      });

      if (metadataError) throw metadataError;

      toast.success("Dados do perfil salvos com sucesso!");
      setIsEditing(false);

    } catch (error: any) {
      console.error("Save Error:", error);
      toast.error("Erro ao salvar perfil: " + error.message);
    } finally {
      setAuthLoading(false);
    }
  }

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Até logo!");
      navigate("/");
    } catch (error: any) {
      toast.error("Erro ao sair");
    }
  };

  // Service Handlers (Direct DB Mode)
  const handleAddService = async () => {
    if (!newService.name || !newService.price) {
      toast.error("Preencha nome e valor do serviço");
      return;
    }

    try {
      const payload = {
        user_id: user!.id,
        title: newService.name,
        description: newService.description,
        price: parseFloat(newService.price) || 0,
        image_url: newService.image,
      };

      const { data, error } = await (supabase.from('services') as any).insert(payload).select().single();
      if (error) throw error;

      setMyServices([...myServices, data]);
      setNewService({ name: "", price: "", description: "", image: "" });
      toast.success("Serviço salvo!");
    } catch (error: any) {
      toast.error("Erro ao salvar serviço: " + error.message);
    }
  };

  const handleRemoveService = async (id: any) => {
    try {
      // Check if it's a real UUID (from DB)
      if (typeof id === 'string' && id.length > 20) {
        const { error } = await (supabase.from('services') as any).delete().eq('id', id);
        if (error) throw error;
      }
      // Update local state
      setMyServices(myServices.filter(s => s.id !== id));
      toast.success("Serviço removido");
    } catch (error: any) {
      toast.error("Erro ao remover: " + error.message);
    }
  };

  // Legacy local handlers -> Moved to direct DB above
  // Placeholder to keep TS happy if referenced elsewhere, but we replaced usage
  const addService = handleAddService;
  const removeService = handleRemoveService;

  const addAddress = () => {
    if (!newAddress.street) return;
    setAddresses([...addresses, { ...newAddress, id: Date.now(), zip: newAddress.zip }]);
    setNewAddress({ street: "", city: "", zip: "" });
  };

  const addCard = () => {
    if (!newCard.number) return;
    setCards([...cards, { ...newCard, last4: newCard.number.slice(-4), id: Date.now() }]);
    setNewCard({ number: "", holder: "", expiry: "" });
  };

  const removeAddress = async (id: any) => {
    setAddresses(addresses.filter(a => a.id !== id));
    // Metadata only
  };

  const removeCard = async (id: any) => {
    setCards(cards.filter(c => c.id !== id));
    // Metadata only
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
    if (signupSuccess) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
          <Card className="w-full max-w-md p-8 text-center space-y-6 shadow-electric border-primary/20 bg-card/50">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📧</span>
            </div>
            <h2 className="text-2xl font-bold">Verifique seu Email</h2>
            <p className="text-muted-foreground">
              Enviamos um link de confirmação para <strong>{email}</strong>.
            </p>
            <p className="text-sm">
              Por favor, clique no link enviada para ativar sua conta e realizar o login.
            </p>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => {
                setSignupSuccess(false);
                setAuthMode("login");
              }}
            >
              Voltar para Login
            </Button>
          </Card>
        </div>
      );
    }

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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Ou continue com</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={async () => {
                setAuthLoading(true);
                try {
                  const { error } = await lovable.auth.signInWithOAuth("google", {
                    redirect_uri: window.location.origin + "/perfil",
                  });
                  if (error) throw error;
                } catch (error: any) {
                  toast.error(error.message || "Erro ao fazer login com Google");
                  setAuthLoading(false);
                }
              }}
              disabled={authLoading}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar com Google
            </Button>

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
    <div className="min-h-screen bg-background pb-6">
      <Navbar />
      <div className="max-w-6xl mx-auto mt-6 px-6">
        <header className="flex justify-between items-center mb-8 bg-white/50 p-4 rounded-xl shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-lg">Minha Conta</span>
          </div>
          <div className="flex items-center gap-4">
            {isEditing && (
              <Button onClick={handleSaveAll} className="bg-green-600 hover:bg-green-700 text-white animate-pulse-glow" disabled={authLoading}>
                {authLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar Tudo
              </Button>
            )}
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Sair
            </Button>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0 space-y-2">
            <Button
              variant={activeTab === "data" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("data")}
            >
              <UserIcon className="w-4 h-4 mr-2" /> Meus Dados
            </Button>
            <Button
              variant={activeTab === "address" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("address")}
            >
              <MapPin className="w-4 h-4 mr-2" /> Endereços
            </Button>
            <Button
              variant={activeTab === "payment" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("payment")}
            >
              <CreditCard className="w-4 h-4 mr-2" /> Pagamento
            </Button>
            {(clientType === "empresa" || clientType === "prestador") && (
              <Button
                variant={activeTab === "services" ? "secondary" : "ghost"}
                className="w-full justify-start text-primary font-medium"
                onClick={() => setActiveTab("services")}
              >
                <Briefcase className="w-4 h-4 mr-2" /> Meus Serviços
              </Button>
            )}
          </aside>

          {/* Content Area */}
          <main className="flex-1">
            <Card className="p-8 shadow-electric border-none bg-white/80">
              {/* TAB: DATA */}
              {activeTab === "data" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Dados Pessoais</h2>
                    <Button onClick={() => isEditing ? handleSaveAll() : setIsEditing(true)} variant={isEditing ? "default" : "outline"}>
                      {isEditing ? "Salvar" : "Editar"}
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Nome Completo</Label>
                      <Input value={fullName} onChange={e => setFullName(e.target.value)} disabled={!isEditing} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={user.email || ""} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input value={phone} onChange={e => setPhone(e.target.value)} disabled={!isEditing} placeholder="(00) 00000-0000" />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Conta</Label>
                      <Select value={clientType} onValueChange={setClientType} disabled={!isEditing}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="usuario">Cliente</SelectItem>
                          <SelectItem value="empresa">Empresa</SelectItem>
                          <SelectItem value="prestador">Prestador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Company Specific */}
                  {clientType === 'empresa' && (
                    <div className="space-y-4 pt-4 border-t border-border">
                      <h3 className="font-semibold flex items-center gap-2"><Building2 className="w-4 h-4" /> Dados da Empresa</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Nome da Empresa (Razão Social)</Label>
                          <Input value={companyName} onChange={e => setCompanyName(e.target.value)} disabled={!isEditing} placeholder="Sua empresa" />
                        </div>
                        <div className="space-y-2">
                          <Label>CNPJ</Label>
                          <Input value={cnpj} onChange={e => setCnpj(e.target.value)} disabled={!isEditing} placeholder="00.000.000/0001-00" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Availability */}
                  {(clientType === 'empresa' || clientType === 'prestador') && (
                    <div className="space-y-4 pt-4 border-t border-border">
                      <h3 className="font-semibold flex items-center gap-2"><Clock className="w-4 h-4" /> Horários</h3>
                      <div className="space-y-2">
                        {Object.entries(daysMap).map(([key, label]) => (
                          <div key={key} className="flex items-center gap-4 text-sm">
                            <Checkbox
                              checked={availability[key as keyof typeof availability].enabled}
                              disabled={!isEditing}
                              onCheckedChange={(c) => setAvailability(prev => ({ ...prev, [key]: { ...prev[key as keyof typeof availability], enabled: !!c } }))}
                            />
                            <span className="w-20">{label}</span>
                            {availability[key as keyof typeof availability].enabled ? (
                              <>
                                <Input className="w-20" type="time" value={availability[key as keyof typeof availability].start} onChange={e => setAvailability(prev => ({ ...prev, [key]: { ...prev[key as keyof typeof availability], start: e.target.value } }))} disabled={!isEditing} />
                                <span>-</span>
                                <Input className="w-20" type="time" value={availability[key as keyof typeof availability].end} onChange={e => setAvailability(prev => ({ ...prev, [key]: { ...prev[key as keyof typeof availability], end: e.target.value } }))} disabled={!isEditing} />
                              </>
                            ) : <span className="text-muted-foreground">Fechado</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: ADDRESS */}
              {activeTab === "address" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold">Endereços</h2>
                  <div className="grid gap-4">
                    {addresses.map((addr) => (
                      <Card key={addr.id} className="p-4 flex justify-between items-center bg-muted/20">
                        <div>
                          <p className="font-medium">{addr.street}</p>
                          <p className="text-sm text-muted-foreground">{addr.city} - {addr.zip || addr.zip_code}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive"><Trash className="w-4 h-4" onClick={() => removeAddress(addr.id)} /></Button>
                      </Card>
                    ))}
                  </div>
                  <div className="p-4 border border-dashed rounded-lg space-y-3">
                    <h3 className="text-sm font-medium">Adicionar Novo Endereço</h3>
                    <Input placeholder="Rua / Avenida" value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} />
                    <div className="flex gap-2">
                      <Input placeholder="Cidade" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
                      <Input placeholder="CEP" value={newAddress.zip} onChange={e => setNewAddress({ ...newAddress, zip: e.target.value })} />
                    </div>
                    <Button size="sm" onClick={addAddress}><Plus className="w-4 h-4 mr-2" /> Adicionar</Button>
                  </div>
                </div>
              )}

              {/* TAB: PAYMENT */}
              {activeTab === "payment" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold">Métodos de Pagamento</h2>
                  <div className="grid gap-4">
                    {cards.map((card) => (
                      <Card key={card.id} className="p-4 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-6 h-6" />
                          <div>
                            <p className="font-medium">•••• •••• •••• {card.last4 || card.card_last4}</p>
                            <p className="text-xs opacity-70">{card.holder || card.card_holder}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300"><Trash className="w-4 h-4" onClick={() => removeCard(card.id)} /></Button>
                      </Card>
                    ))}
                  </div>
                  <div className="p-4 border border-dashed rounded-lg space-y-3">
                    <h3 className="text-sm font-medium">Adicionar Novo Cartão</h3>
                    <Input placeholder="Número do Cartão" value={newCard.number} onChange={e => setNewCard({ ...newCard, number: e.target.value })} />
                    <div className="flex gap-2">
                      <Input placeholder="Nome no Cartão" value={newCard.holder} onChange={e => setNewCard({ ...newCard, holder: e.target.value })} />
                      <Input placeholder="Validade (MM/AA)" value={newCard.expiry} onChange={e => setNewCard({ ...newCard, expiry: e.target.value })} />
                    </div>
                    <Button size="sm" onClick={addCard}><Plus className="w-4 h-4 mr-2" /> Adicionar</Button>
                  </div>
                </div>
              )}

              {/* TAB: SERVICES */}
              {activeTab === "services" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold">Gerenciar Serviços</h2>
                      <p className="text-sm text-muted-foreground">Estes serviços aparecerão na busca para os clientes.</p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {myServices.map((service) => (
                      <Card key={service.id} className="p-4 flex gap-4 items-center">
                        <div className="w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                          {service.image || service.image_url ? <img src={service.image || service.image_url} className="w-full h-full object-cover" /> : <Briefcase className="w-full h-full p-4 text-muted-foreground" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold">{service.name}</h3>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                          <p className="text-primary font-medium mt-1">R$ {service.price}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive"><Trash className="w-4 h-4" onClick={() => removeService(service.id)} /></Button>
                      </Card>
                    ))}
                  </div>

                  <div className="p-6 bg-muted/30 border border-dashed rounded-xl space-y-4">
                    <h3 className="font-semibold text-lg">Adicionar Serviço</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Nome do Serviço</Label>
                        <Input placeholder="Ex: Corte de Cabelo" value={newService.name} onChange={e => setNewService({ ...newService, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Valor (R$)</Label>
                        <Input placeholder="0.00" value={newService.price} onChange={e => setNewService({ ...newService, price: e.target.value })} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Descrição</Label>
                        <Textarea placeholder="Descreva o serviço..." value={newService.description} onChange={e => setNewService({ ...newService, description: e.target.value })} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Foto (URL Opcional)</Label>
                        <Input placeholder="https://..." value={newService.image} onChange={e => setNewService({ ...newService, image: e.target.value })} />
                      </div>
                    </div>
                    <Button className="w-full" onClick={addService}><Plus className="w-4 h-4 mr-2" /> Cadastrar Serviço</Button>
                  </div>
                </div>
              )}

            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
