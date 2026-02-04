
export interface Company {
    id: string;
    name: string;
    type: "Empresa" | "Profissional";
    description: string;
    services: string[];
    rating: number;
    address: string;
    image: string;
}

export const mockCompanies: Company[] = [
    {
        id: "1",
        name: "Barbearia do Silva",
        type: "Empresa",
        description: "A melhor barbearia da cidade, com profissionais qualificados e ambiente climatizado.",
        services: ["Corte de Cabelo", "Barba", "Sobrancelha", "Pigmentação"],
        rating: 4.8,
        address: "Rua das Flores, 123 - Centro",
        image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFyYmVyc2hvcHxlbnwwfHwwfHx8MA%3D%3D"
    },
    {
        id: "2",
        name: "Clínica Estética Bella",
        type: "Empresa",
        description: "Tratamentos estéticos faciais e corporais com tecnologia de ponta.",
        services: ["Limpeza de Pele", "Botox", "Drenagem Linfática"],
        rating: 4.9,
        address: "Av. Paulista, 1000 - Bela Vista",
        image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2xpbmljJTIwZXN0aGV0aWN8ZW58MHx8MHx8fDA%3D"
    },
    {
        id: "3",
        name: "João Paulo",
        type: "Profissional",
        description: "Consultor Financeiro Pessoal e Empresarial.",
        services: ["Consultoria Financeira", "Planejamento de Investimentos"],
        rating: 5.0,
        address: "Atendimento Online / Presencial",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGJ1c2luZXNzbWFufGVufDB8fDB8fHww"
    },
    {
        id: "4",
        name: "Oficina Mecânica Rápida",
        type: "Empresa",
        description: "Especialistas em reparos rápidos, troca de óleo e revisão geral.",
        services: ["Troca de Óleo", "Alinhamento", "Balanceamento", "Revisão"],
        rating: 4.5,
        address: "Av. Industrial, 500 - Zona Norte",
        image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWVjaGFuaWN8ZW58MHx8MHx8fDA%3D"
    },
    {
        id: "5",
        name: "Pet Shop Amigo Fiel",
        type: "Empresa",
        description: "Cuidado e carinho para o seu melhor amigo. Banho, tosa e veterinário.",
        services: ["Banho e Tosa", "Consulta Veterinária", "Vacinação"],
        rating: 4.7,
        address: "Rua dos Animais, 88 - Jardim Pet",
        image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGV0JTIwZ3Jvb21pbmd8ZW58MHx8MHx8fDA%3D"
    }
];

export const getCompanies = (): Company[] => {
    const dynamicCompaniesStr = localStorage.getItem("registered_companies");
    let dynamicCompanies: Company[] = [];
    if (dynamicCompaniesStr) {
        try {
            dynamicCompanies = JSON.parse(dynamicCompaniesStr);
        } catch (e) {
            console.error("Failed to parse dynamic companies", e);
        }
    }
    return [...mockCompanies, ...dynamicCompanies];
};

