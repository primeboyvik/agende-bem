import { useSearchParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCompanies } from "@/data/mockCompanies";
import { MapPin, Star, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function SearchResults() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q")?.toLowerCase() || "";
    const navigate = useNavigate();

    const companies = getCompanies();

    const results = companies.filter(company =>
        company.name.toLowerCase().includes(query) ||
        company.services.some(service => service.toLowerCase().includes(query)) ||
        company.description.toLowerCase().includes(query)
    );

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
                        Exibindo {results.length} resultados para "{searchParams.get("q")}"
                    </p>
                </div>

                {results.length > 0 ? (
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
                                            {company.type}
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
                                        {company.services.slice(0, 3).map((service, index) => (
                                            <span key={index} className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">
                                                {service}
                                            </span>
                                        ))}
                                        {company.services.length > 3 && (
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
                            <img src="https://illustrations.popsy.co/gray/surr-searching.svg" alt="No results" className="w-full h-auto opacity-50" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Nenhum resultado encontrado</h3>
                        <p className="text-muted-foreground">
                            Tente buscar por outros termos ou verifique a ortografia.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
