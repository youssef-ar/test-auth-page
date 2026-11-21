import type { Locale } from "intlayer";
import { CompanyStatus } from "@/components/company/company-status";
import type { Sector } from "@/components/sectors/sectors";
import type { Company } from "@/features/companies/schema";

// Server-side data behind GET /api/companies: the companies shown on the cards around the auth screens.
// Fictional companies. Kept in a server module rather than the database so the provided Prisma schema
// stays untouched; swapping this for a Prisma query later would not change the endpoint contract.

type CompanyRecord = {
  id: string;
  name: string;
  brandColor: string;
  description: Record<"fr" | "en", string>;
  sectors: Sector[];
  status: CompanyStatus;
};

const COMPANIES: CompanyRecord[] = [
  {
    id: "medilink",
    name: "Medilink",
    brandColor: "#1E63C4",
    description: {
      fr: "Plateforme numérique facilitant la prise de rendez-vous médicaux et la gestion des consultations",
      en: "Digital platform that makes booking medical appointments and managing consultations easy",
    },
    sectors: ["HEALTHCARE", "SOFTWARE", "ARTIFICIAL_INTELLIGENCE"],
    status: CompanyStatus.CLOSED,
  },
  {
    id: "voltaria",
    name: "Voltaria",
    brandColor: "#2E9E5B",
    description: {
      fr: "Fournisseur d’électricité verte pour les PME, avec un suivi de la consommation en temps réel",
      en: "Green electricity supplier for small businesses, with real-time consumption tracking",
    },
    sectors: ["ENERGY", "ECOLOGY"],
    status: CompanyStatus.ACTIVE,
  },
  {
    id: "juristo",
    name: "Juristo",
    brandColor: "#8C6A3F",
    description: {
      fr: "Assistant juridique qui analyse et résume les contrats commerciaux",
      en: "Legal assistant that analyses and summarises commercial contracts",
    },
    sectors: ["LEGAL", "ARTIFICIAL_INTELLIGENCE"],
    status: CompanyStatus.ACTIVE,
  },
  {
    id: "finoria",
    name: "Finoria",
    brandColor: "#B8892B",
    description: {
      fr: "Logiciel de trésorerie et de prévisions financières pour les startups",
      en: "Cash management and financial forecasting software for startups",
    },
    sectors: ["FINANCE", "SOFTWARE"],
    status: CompanyStatus.ACTIVE,
  },
  {
    id: "orbitale",
    name: "Orbitale",
    brandColor: "#5B48C9",
    description: {
      fr: "Constellation de nanosatellites assurant la connectivité des zones isolées",
      en: "Nanosatellite constellation bringing connectivity to remote areas",
    },
    sectors: ["SPACE", "TELECOMMUNICATIONS"],
    status: CompanyStatus.ACTIVE,
  },
  {
    id: "cuisto",
    name: "Cuisto",
    brandColor: "#C8553D",
    description: {
      fr: "Livraison de paniers repas préparés par des producteurs locaux",
      en: "Delivery of meal kits prepared by local producers",
    },
    sectors: ["FOOD", "DISTRIBUTION"],
    status: CompanyStatus.INACTIVE,
  },
  {
    id: "agrisens",
    name: "Agrisens",
    brandColor: "#7A9A1F",
    description: {
      fr: "Capteurs connectés qui optimisent l’irrigation des exploitations agricoles",
      en: "Connected sensors that optimise irrigation on farms",
    },
    sectors: ["AGRICULTURE", "NEW_TECHNOLOGIES"],
    status: CompanyStatus.ACQUIRED,
  },
  {
    id: "batimo",
    name: "Batimo",
    brandColor: "#6B7A8F",
    description: {
      fr: "Gestion de chantiers et suivi des travaux pour les promoteurs immobiliers",
      en: "Construction site management and progress tracking for property developers",
    },
    sectors: ["CONSTRUCTION", "REAL_ESTATE", "SOFTWARE"],
    status: CompanyStatus.ACQUIRED,
  },
  {
    id: "kinetik",
    name: "Kinetik",
    brandColor: "#12A673",
    description: {
      fr: "Programmes d’entraînement personnalisés, suivis par des coachs certifiés",
      en: "Personalised training programmes, followed by certified coaches",
    },
    sectors: ["SPORTS", "HEALTHCARE"],
    status: CompanyStatus.ACTIVE,
  },
  {
    id: "lumen-bio",
    name: "Lumen Bio",
    brandColor: "#2A9DB5",
    description: {
      fr: "Tests de diagnostic rapide à partir d’échantillons de salive",
      en: "Rapid diagnostic tests from saliva samples",
    },
    sectors: ["BIOTECHNOLOGY", "HEALTHCARE"],
    status: CompanyStatus.ACTIVE,
  },
];

export const getCompanies = (locale: Locale): Company[] =>
  COMPANIES.map(({ description, ...company }) => ({
    ...company,
    description: locale in description ? description[locale as keyof typeof description] : description.fr,
  }));
