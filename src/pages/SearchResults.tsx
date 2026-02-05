import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star, ArrowLeft, Loader2, Briefcase } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types for search results
interface ServiceResult {
    id: string;
    title: string;
    description?: string;
    price: number;
    user_id: string;
}

interface ProfileResult {
    user_id: string;
    full_name?: string;
    company_name?: string;
    user_type?: string;
    city?: string;
    profession?: string;
}

export default function SearchResults() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q")?.toLowerCase() || "";
    const navigate = useNavigate();

    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [debugError, setDebugError] = useState<any>(null);
    const [userInfo, setUserInfo] = useState<any>(null);

    useEffect(() => {
        // Check Auth State for Debugging
        supabase.auth.getSession().then(({ data }) => {
            setUserInfo(data.session?.user ? { role: data.session.user.role, id: data.session.user.id } : "No Session");
        });

        const fetchResults = async () => {
            setLoading(true);
            setDebugError(null);
            try {
                let companyMatches: any[] = [];
                let profileDetails: any[] = [];
                let serviceMatches: ServiceResult[] = [];

                // 1. Fetch Companies (Source of Truth for Businesses)
                let companyQuery = supabase
                    .from('companys')
                    .select('user_id, company_name, cnpj');

                if (query) {
                    companyQuery = companyQuery.ilike('company_name', `%${query}%`);
                }

                const { data: companies, error: companyError } = await companyQuery;
                if (companyError) {
                    console.error("Error fetching companies:", companyError);
                    throw companyError;
                }

                // Debug log
                console.log("Found companies:", companies);

                companyMatches = companies || [];

                // 2. Fetch Profiles for these companies (to get city, profession, etc)
                // FIXED: Must use user_id to join with profiles, not company_name
                const companyUserIds = companyMatches.map(c => c.user_id);

                if (companyUserIds.length > 0) {
                    const { data: profiles, error: profileError } = await supabase
                        .from('profiles')
                        .select('user_id, full_name, profession, user_type')
                        .in('user_id', companyUserIds);

                    if (profileError) throw profileError;
                    profileDetails = profiles || [];
                }

                // 3. Search in Services (if query exists)
                if (query) {
                    const { data: services, error: serviceError } = await (supabase
                        .from('services')
                        .select('id, title, description, price, user_id, image_url') as any)
                        .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

                    if (!serviceError && services) {
                        serviceMatches = services;
                    }
                }

                // 4. Combine Results
                const combinedMap = new Map();

                // Add Company Matches first
                companyMatches.forEach(company => {
                    const profile = profileDetails.find(p => p.user_id === company.user_id);

                    combinedMap.set(company.user_id, {
                        id: company.user_id,
                        name: company.company_name || profile?.full_name || "Empresa",
                        type: 'empresa', // Sourced from Companys table, so it IS a company
                        cnpj: company.cnpj,
                        rating: 4.8,
                        address: profile?.city || "Localização não informada",
                        description: profile?.profession || "Prestador de Serviços",
                        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80",
                        services: []
                    });
                });

                // Add Service Matches (checking if we need to fetch missing parent profiles)
                // Note: For simplicity, we are assuming service providers SHOULD be in 'companys' or 'profiles'. 
                // Since user wants 'companys' to be the list, we focus on that. 
                // Use services to populate the 'services' array of the company.

                // Fetch all services for the found companies to display as tags
                if (companyUserIds.length > 0) {
                    const { data: allServices } = await (supabase
                        .from('services')
                        .select('title, user_id') as any)
                        .in('user_id', companyUserIds);

                    if (allServices) {
                        allServices.forEach((svc: any) => {
                            if (combinedMap.has(svc.user_id)) {
                                const entry = combinedMap.get(svc.user_id);
                                if (!entry.services.includes(svc.title)) {
                                    entry.services.push(svc.title);
                                }
                            }
                        });
                    }
                }

                setResults(Array.from(combinedMap.values()));

            } catch (error) {
                console.error("Search error:", error);
                setDebugError(error);
                toast.error("Erro ao buscar resultados: " + (error as any).message);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    return (
        <div className="min-h-screen bg-background pb-12">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 pt-12">
                <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 transition-all" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                </Button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Resultados da busca</h1>
                    <p className="text-muted-foreground mt-2">
                        {query ? `Exibindo ${results.length} resultados para "${query}"` : `Exibindo todos os ${results.length} parceiros`}
                    </p>
                </div>

                {/* DEBUG SECTION - REMOVE AFTER FIXING */}
                <div className="bg-slate-100 p-4 rounded mb-4 text-xs font-mono overflow-auto max-h-60 border border-red-500">
                    <p className="font-bold text-red-600">DEBUG INFO:</p>
                    <p>Loading: {loading.toString()}</p>
                    <p>User: {JSON.stringify(userInfo)}</p>
                    <p>Results Count: {results.length}</p>
                    {debugError && <p className="text-red-600 font-bold">ERROR: {JSON.stringify(debugError, null, 2)}</p>}
                    <p>Sample Result: {JSON.stringify(results[0], null, 2)}</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : results.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {results.map((company) => (
                            <Card key={company.id} className="overflow-hidden border-none shadow-electric hover:shadow-glow transition-all duration-300 group">
                                <div className="h-48 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                                    <img
                                        src={company.image}
                                        alt={company.name}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute bottom-4 left-4 z-20">
                                        <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full mb-2 inline-block">
                                            {company.type === 'empresa' ? 'Empresa' : 'Profissional'}
                                        </span>
                                        <h3 className="text-white font-bold text-xl">{company.name}</h3>
                                    </div>
                                </div>
                                <div className="p-6 bg-card">
                                    <div className="flex items-center gap-1 text-yellow-500 mb-2">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="text-sm font-medium text-foreground">{company.rating}</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-muted-foreground mb-4 text-sm">
                                        <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                                        <span>{company.address}</span>
                                    </div>
                                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                                        {company.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {company.services && company.services.length > 0 ? (
                                            company.services.slice(0, 3).map((service: string, index: number) => (
                                                <span key={index} className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">
                                                    {service}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">Serviços sob consulta</span>
                                        )}
                                        {company.services && company.services.length > 3 && (
                                            <span className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">
                                                +{company.services.length - 3}
                                            </span>
                                        )}
                                    </div>
                                    <Button className="w-full bg-gradient-electric text-white shadow-md hover:shadow-lg" onClick={() => navigate(`/agendar?company=${company.id}`)}>
                                        Agendar
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-full max-w-sm mx-auto mb-6">
                            <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center mx-auto">
                                <Briefcase className="w-12 h-12 text-muted-foreground/50" />
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Nenhum resultado encontrado</h3>
                        <p className="text-muted-foreground">
                            Tente buscar por outros termos como "Cabelo", "Unha" ou o nome da empresa.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
