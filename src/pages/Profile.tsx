import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { LogOut, User as UserIcon, Camera, Loader2, ArrowLeft, Clock, Building2, Briefcase, MapPin, CreditCard, LayoutDashboard, Plus, Trash } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Logo from '@/Logo.png';
import { Company, getCompanies } from "@/data/mockCompanies";

type ProfileTab = "data" | "address" | "payment" | "services";

export default function Profile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>("data");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  // -- STATE --
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [clientType, setClientType] = useState("usuario");
  const [sex, setSex] = useState("");
  const [gender, setGender] = useState("");
  const [profession, setProfession] = useState("");

  // Company
  const [companyName, setCompanyName] = useState("");
  const [cnpj, setCnpj] = useState("");
  // Services (Legacy field, kept for compatibility if needed, but new system uses list)
  // const [services, setServices] = useState(""); 

  // New Arrays
  const [addresses, setAddresses] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [myServices, setMyServices] = useState<any[]>([]);

  // Inputs for adding new items
  const [newService, setNewService] = useState({ name: "", price: "", description: "", image: "" });
  const [newAddress, setNewAddress] = useState({ street: "", city: "", zip: "" });
  const [newCard, setNewCard] = useState({ number: "", holder: "", expiry: "" });

  const [isEditing, setIsEditing] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [password, setPassword] = useState(""); // For auth form

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

  // -- EFFECTS --
  useEffect(() => {
    const mockSession = localStorage.getItem("mock_session");
    if (mockSession) {
      setSession({ user: { email: localStorage.getItem("user_email") || "user@example.com" } } as any);
      setFullName(localStorage.getItem("user_name") || "");
      setEmail(localStorage.getItem("user_email") || "user@example.com");
      setPhone(localStorage.getItem("user_phone") || "");
      setClientType(localStorage.getItem("user_type") || "usuario");
      setSex(localStorage.getItem("user_sex") || "");
      setGender(localStorage.getItem("user_gender") || "");
      setProfession(localStorage.getItem("user_profession") || "");
      setCompanyName(localStorage.getItem("user_company_name") || "");
      setCnpj(localStorage.getItem("user_cnpj") || "");

      // Load Complex Data
      const savedAvailability = localStorage.getItem("user_availability");
      if (savedAvailability) setAvailability(JSON.parse(savedAvailability));

      const savedAddresses = localStorage.getItem("user_addresses");
      if (savedAddresses) setAddresses(JSON.parse(savedAddresses));

      const savedCards = localStorage.getItem("user_cards");
      if (savedCards) setCards(JSON.parse(savedCards));

      const savedServices = localStorage.getItem("user_my_services");
      if (savedServices) setMyServices(JSON.parse(savedServices));
    }
    setLoading(false);

    if (mockSession && returnUrl) {
      navigate(returnUrl);
    }
  }, [returnUrl, navigate]);

  // -- HANDLERS --
  const handleLogout = async () => {
    localStorage.removeItem("mock_session");
    // Clear critical data
    navigate("/");
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setTimeout(() => {
      localStorage.setItem("mock_session", "true");
      localStorage.setItem("user_email", email);
      if (fullName) localStorage.setItem("user_name", fullName);

      setSession({ user: { email } } as any);
      toast.success("Bem-vindo(a)!");
      setAuthLoading(false);

      if (returnUrl) navigate(returnUrl);
      else navigate("/dashboard");
    }, 1000);
  };

  const saveChanges = (silent = false) => {
    localStorage.setItem("user_name", fullName);
    localStorage.setItem("user_email", email);
    localStorage.setItem("user_phone", phone);
    localStorage.setItem("user_type", clientType);
    localStorage.setItem("user_sex", sex);
    localStorage.setItem("user_gender", gender);
    localStorage.setItem("user_profession", profession);
    localStorage.setItem("user_company_name", companyName);
    localStorage.setItem("user_cnpj", cnpj);

    localStorage.setItem("user_availability", JSON.stringify(availability));
    localStorage.setItem("user_addresses", JSON.stringify(addresses));
    localStorage.setItem("user_cards", JSON.stringify(cards));
    localStorage.setItem("user_my_services", JSON.stringify(myServices));

    if ((clientType === 'empresa' || clientType === 'prestador')) {
      updatePublicCompanyRegistry();
    }

    if (!silent) {
      toast.success("Perfil atualizado!");
      setIsEditing(false);
    }
  };

  // Sync current user to the public "searchable" list
  const updatePublicCompanyRegistry = () => {
    const storedCompaniesStr = localStorage.getItem("registered_companies");
    let companies: Company[] = storedCompaniesStr ? JSON.parse(storedCompaniesStr) : [];

    // Remove existing entry for this user to update it
    // We use email as ID for this mock logic since we don't have real IDs
    const userId = email || "current_user"; // Simplification
    companies = companies.filter(c => c.id !== userId);

    const newCompany: Company = {
      id: userId,
      name: clientType === 'empresa' ? companyName : fullName,
      type: clientType === 'empresa' ? "Empresa" : "Profissional",
      description: clientType === 'empresa' ? "Empresa parceira Agende Bem" : `Profissional: ${profession}`,
      services: myServices.map(s => s.name),
      rating: 5.0, // Default for new
      address: addresses.length > 0 ? `${addresses[0].street} - ${addresses[0].city}` : "Endereço não informado",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&q=60&w=500" // Default placeholder
    };

    if (newCompany.name) { // Only save if has name
      companies.push(newCompany);
      localStorage.setItem("registered_companies", JSON.stringify(companies));
      // toast.success("Dados da empresa sincronizados com a busca!");
    }
  };

  // Add Item Handlers
  const addService = () => {
    if (!newService.name || !newService.price) return;
    setMyServices([...myServices, { ...newService, id: Date.now() }]);
    setNewService({ name: "", price: "", description: "", image: "" });
    saveChanges(true); // Auto save
  };

  const addAddress = () => {
    if (!newAddress.street) return;
    setAddresses([...addresses, { ...newAddress, id: Date.now() }]);
    setNewAddress({ street: "", city: "", zip: "" });
    saveChanges(true);
  };

  const addCard = () => {
    if (!newCard.number) return;
    setCards([...cards, { ...newCard, last4: newCard.number.slice(-4), id: Date.now() }]);
    setNewCard({ number: "", holder: "", expiry: "" });
    saveChanges(true);
  };

  const removeService = (id: number) => {
    setMyServices(myServices.filter(s => s.id !== id));
    saveChanges(true);
  };

  // -- RENDERERS --
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  if (!session) {
    // Not Logged In
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Button variant="ghost" className="mb-8" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Início
          </Button>

          <Card className="p-8 border-none bg-card/50 shadow-none sm:border-2 sm:border-border/50 sm:shadow-electric rounded-2xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Bem-vindo ao Boo</h1>
              <p className="text-muted-foreground">{authMode === "login" ? "Faça login para continuar" : "Crie sua conta"}</p>
            </div>

            <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as any)}>
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>
              <form onSubmit={handleAuth} className="space-y-4">
                {authMode === "signup" && (
                  <Input placeholder="Nome Completo" value={fullName} onChange={e => setFullName(e.target.value)} required className="bg-background" />
                )}
                <Input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-background" />
                <Input placeholder="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="bg-background" />
                <Button type="submit" className="w-full bg-gradient-electric text-white shadow-electric mt-4" disabled={authLoading}>
                  {authLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (authMode === "login" ? "Entrar" : "Criar Conta")}
                </Button>
              </form>
            </Tabs>
          </Card>
        </div>
      </div>
    )
  }

  // Logged In + Sidebar
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 bg-white/50 p-4 rounded-xl shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/dashboard")}>
            <img src={Logo} alt="Logo" className="h-8 w-auto" />
            <span className="font-semibold text-lg">Minha Conta</span>
          </div>
          <div className="flex items-center gap-4">
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
                    <Button onClick={() => isEditing ? saveChanges() : setIsEditing(true)} variant={isEditing ? "default" : "outline"}>
                      {isEditing ? "Salvar Alterações" : "Editar"}
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Nome Completo</Label>
                      <Input value={fullName} onChange={e => setFullName(e.target.value)} disabled={!isEditing} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={email} onChange={e => setEmail(e.target.value)} disabled={!isEditing} />
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
                          <p className="text-sm text-muted-foreground">{addr.city} - {addr.zip}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive"><Trash className="w-4 h-4" onClick={() => {
                          setAddresses(addresses.filter(a => a.id !== addr.id));
                          saveChanges(true);
                        }} /></Button>
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
                            <p className="font-medium">•••• •••• •••• {card.last4}</p>
                            <p className="text-xs opacity-70">{card.holder}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300"><Trash className="w-4 h-4" onClick={() => {
                          setCards(cards.filter(c => c.id !== card.id));
                          saveChanges(true);
                        }} /></Button>
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
                          {service.image ? <img src={service.image} className="w-full h-full object-cover" /> : <Briefcase className="w-full h-full p-4 text-muted-foreground" />}
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
                        <Input placeholder="0,00" value={newService.price} onChange={e => setNewService({ ...newService, price: e.target.value })} />
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
