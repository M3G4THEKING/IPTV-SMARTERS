/**
 * Metadata management for page titles and descriptions
 * Handles SEO metadata for all pages in all languages
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import {
  getFileFromGitHub,
  hasGithubAdminContext,
  updateFileOnGitHub,
} from "./github";

export interface PageMetadata {
  title: string;
  description: string;
}

export interface MetadataContent {
  homepage: PageMetadata;
  blog: PageMetadata;
  blogListing: PageMetadata;
  legal: {
    refundPolicy: PageMetadata;
    privacyPolicy: PageMetadata;
    termsOfService: PageMetadata;
  };
  installation: {
    windows: PageMetadata;
    ios: PageMetadata;
    firestick: PageMetadata;
    smartTv: PageMetadata;
    guide: PageMetadata;
  };
  reseller: PageMetadata;
}

function mergePageMetadataDefaults<T>(defaults: T, incoming: any): T {
  if (!incoming || typeof incoming !== 'object') return defaults;

  // Shallow merge at each level is enough here because all leaves are PageMetadata objects
  return {
    ...(defaults as any),
    ...(incoming as any),
    homepage: { ...(defaults as any).homepage, ...(incoming as any).homepage },
    blog: { ...(defaults as any).blog, ...(incoming as any).blog },
    blogListing: { ...(defaults as any).blogListing, ...(incoming as any).blogListing },
    reseller: { ...(defaults as any).reseller, ...(incoming as any).reseller },
    legal: {
      ...(defaults as any).legal,
      ...(incoming as any).legal,
      refundPolicy: { ...(defaults as any).legal?.refundPolicy, ...(incoming as any).legal?.refundPolicy },
      privacyPolicy: { ...(defaults as any).legal?.privacyPolicy, ...(incoming as any).legal?.privacyPolicy },
      termsOfService: { ...(defaults as any).legal?.termsOfService, ...(incoming as any).legal?.termsOfService },
    },
    installation: {
      ...(defaults as any).installation,
      ...(incoming as any).installation,
      windows: { ...(defaults as any).installation?.windows, ...(incoming as any).installation?.windows },
      ios: { ...(defaults as any).installation?.ios, ...(incoming as any).installation?.ios },
      firestick: { ...(defaults as any).installation?.firestick, ...(incoming as any).installation?.firestick },
      smartTv: { ...(defaults as any).installation?.smartTv, ...(incoming as any).installation?.smartTv },
      guide: { ...(defaults as any).installation?.guide, ...(incoming as any).installation?.guide },
    },
  } as T;
}

function metadataFilePath(locale: string): string {
  return `data/metadata/${locale}.json`;
}

async function readLocalMetadataFile(locale: string): Promise<MetadataContent | null> {
  try {
    const absolute = path.join(process.cwd(), metadataFilePath(locale));
    const raw = await fs.readFile(absolute, "utf8");
    return JSON.parse(raw) as MetadataContent;
  } catch {
    return null;
  }
}

async function writeLocalMetadataFile(locale: string, jsonContent: string): Promise<void> {
  const absolute = path.join(process.cwd(), metadataFilePath(locale));
  await fs.mkdir(path.dirname(absolute), { recursive: true });
  await fs.writeFile(absolute, `${jsonContent}\n`, "utf8");
}

async function fetchMetadataGithubSha(filePath: string): Promise<string> {
  if (!hasGithubAdminContext()) {
    return "";
  }
  try {
    const file = await getFileFromGitHub(filePath);
    return file.sha;
  } catch {
    return "";
  }
}

/**
 * Get metadata file for a locale (local repo JSON first — matches what the site reads)
 */
export async function getMetadataFile(locale: string): Promise<{
  content: MetadataContent;
  sha: string;
  path: string;
}> {
  const filePath = metadataFilePath(locale);
  const defaults = getDefaultMetadata(locale);
  const sha = await fetchMetadataGithubSha(filePath);
  const local = await readLocalMetadataFile(locale);

  if (local) {
    return {
      content: mergePageMetadataDefaults<MetadataContent>(defaults, local),
      sha,
      path: filePath,
    };
  }

  try {
    const file = await getFileFromGitHub(filePath);
    const parsed = JSON.parse(file.content);
    return {
      content: mergePageMetadataDefaults<MetadataContent>(defaults, parsed),
      sha: file.sha,
      path: file.path,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("404") || message.includes("Not Found")) {
      return {
        content: defaults,
        sha: "",
        path: filePath,
      };
    }
    throw error;
  }
}

/**
 * Update metadata file
 */
export async function updateMetadataFile(
  locale: string,
  content: MetadataContent,
  sha: string
): Promise<void> {
  const filePath = metadataFilePath(locale);
  const normalized = mergePageMetadataDefaults<MetadataContent>(
    getDefaultMetadata(locale),
    content
  );
  const jsonContent = JSON.stringify(normalized, null, 2);

  await writeLocalMetadataFile(locale, jsonContent);

  if (!hasGithubAdminContext()) {
    return;
  }

  let remoteSha = sha;
  if (!remoteSha) {
    remoteSha = await fetchMetadataGithubSha(filePath);
  }

  try {
    await updateFileOnGitHub({
      path: filePath,
      content: jsonContent,
      message: `Update ${locale} page metadata via admin dashboard`,
      sha: remoteSha || undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isStaleSha =
      /sha/i.test(message) && (/does not match/i.test(message) || /409/.test(message));
    if (!isStaleSha) {
      throw error;
    }
    const freshSha = await fetchMetadataGithubSha(filePath);
    await updateFileOnGitHub({
      path: filePath,
      content: jsonContent,
      message: `Update ${locale} page metadata via admin dashboard (retry)`,
      sha: freshSha || undefined,
    });
  }
}

/**
 * Get all metadata files
 */
export async function getAllMetadata(): Promise<Record<string, {
  content: MetadataContent;
  sha: string;
  path: string;
}>> {
  const locales = ['en', 'es', 'fr', 'ca', 'uk'];
  const metadata: Record<string, any> = {};

  for (const locale of locales) {
    try {
      const data = await getMetadataFile(locale);
      metadata[locale] = data;
    } catch (error) {
      console.error(`Failed to fetch ${locale} metadata:`, error);
      // Use default if fetch fails
      metadata[locale] = {
        content: getDefaultMetadata(locale),
        sha: '',
        path: `data/metadata/${locale}.json`,
      };
    }
  }

  return metadata;
}

/**
 * Get default metadata structure for a locale
 */
export function getDefaultMetadata(locale: string): MetadataContent {
  const defaults: Record<string, MetadataContent> = {
    en: {
      homepage: {
        title: "Best IPTV Subscription Service | IPTV Smarters Pro | 20,000+ Channels | Free Test | Instant Activation",
        description: "Get the #1 IPTV subscription service with IPTV Smarters Pro. Access 20,000+ live TV channels, movies, and series in 4K quality. 99.9% uptime guarantee. Free test available. Works on Windows, Android, iOS, Mac, Smart TV, Firestick. Instant activation. Premium IPTV subscription plans starting from €19.99. IPTV Smarters Pro codes and accounts available.",
      },
      blog: {
        title: "IPTV Blog | Latest News, Guides & Tips",
        description: "Stay updated with the latest IPTV news, installation guides, tips, and best practices. Learn how to get the most out of your IPTV subscription.",
      },
      blogListing: {
        title: "IPTV Blog | Latest Articles & Guides",
        description: "Browse our collection of IPTV articles, installation guides, tips, and industry news. Everything you need to know about IPTV streaming.",
      },
      legal: {
        refundPolicy: {
          title: "Refund Policy | StreamPro IPTV",
          description: "Read StreamPro IPTV’s refund policy, including eligibility, timelines, and how to request a refund for your IPTV subscription.",
        },
        privacyPolicy: {
          title: "Privacy Policy | StreamPro IPTV",
          description: "Learn how StreamPro IPTV collects, uses, and protects your personal data when you use our IPTV service and website.",
        },
        termsOfService: {
          title: "Terms of Service | StreamPro IPTV",
          description: "Review the terms and conditions for using StreamPro IPTV services, website, and IPTV subscriptions.",
        },
      },
      installation: {
        windows: {
          title: "How to Install IPTV Smarters Pro on Windows | Step-by-Step Guide",
          description: "Complete step-by-step guide to install IPTV Smarters Pro on Windows PC. Download, install, and configure IPTV Smarters Pro on Windows. Free installation support available.",
        },
        ios: {
          title: "How to Install IPTV Smarters Pro on iOS | iPhone & iPad Guide",
          description: "Complete guide to install IPTV Smarters Pro on iPhone and iPad. Step-by-step instructions for iOS installation. Free support available.",
        },
        firestick: {
          title: "How to Install IPTV Smarters Pro on Firestick | Amazon Fire TV Guide",
          description: "Complete guide to install IPTV Smarters Pro on Amazon Firestick and Fire TV. Easy step-by-step instructions. Free installation support.",
        },
        smartTv: {
          title: "How to Install IPTV Smarters Pro on Smart TV | Complete Guide",
          description: "Complete guide to install IPTV Smarters Pro on Smart TV. Works with Samsung, LG, Android TV, and more. Step-by-step instructions.",
        },
        guide: {
          title: "IPTV Installation Guide | Complete Setup Instructions",
          description: "Complete IPTV installation guide for all devices. Learn how to install IPTV Smarters Pro on Windows, Android, iOS, Smart TV, and Firestick.",
        },
      },
      reseller: {
        title: "IPTV Reseller Program | Start Your IPTV Business",
        description: "Join our IPTV reseller program and start your own IPTV business. Competitive prices, white-label solutions, and dedicated support. Become an IPTV reseller today.",
      },
    },
    es: {
      homepage: {
        title: "Mejor Servicio IPTV | IPTV Smarters Pro | 20,000+ Canales | Prueba Gratis | Activación Instantánea",
        description: "Obtén el servicio de suscripción IPTV #1 con IPTV Smarters Pro. Accede a más de 20,000 canales de TV en vivo, películas y series en calidad 4K. Garantía de 99.9% de tiempo de actividad. Prueba gratuita disponible. Funciona en Windows, Android, iOS, Mac, Smart TV, Firestick. Activación instantánea. Planes de suscripción IPTV premium desde €19.99. Códigos y cuentas IPTV Smarters Pro disponibles.",
      },
      blog: {
        title: "Blog IPTV | Últimas Noticias, Guías y Consejos",
        description: "Mantente actualizado con las últimas noticias de IPTV, guías de instalación, consejos y mejores prácticas. Aprende cómo aprovechar al máximo tu suscripción IPTV.",
      },
      blogListing: {
        title: "Blog IPTV | Últimos Artículos y Guías",
        description: "Explora nuestra colección de artículos IPTV, guías de instalación, consejos y noticias de la industria. Todo lo que necesitas saber sobre streaming IPTV.",
      },
      legal: {
        refundPolicy: {
          title: "Política de Reembolso | StreamPro IPTV",
          description: "Consulta la política de reembolso de StreamPro IPTV, incluyendo elegibilidad, plazos y cómo solicitar un reembolso de tu suscripción IPTV.",
        },
        privacyPolicy: {
          title: "Política de Privacidad | StreamPro IPTV",
          description: "Descubre cómo StreamPro IPTV recopila, utiliza y protege tus datos personales al usar nuestro servicio IPTV y el sitio web.",
        },
        termsOfService: {
          title: "Términos de Servicio | StreamPro IPTV",
          description: "Revisa los términos y condiciones para usar los servicios StreamPro IPTV, el sitio web y las suscripciones IPTV.",
        },
      },
      installation: {
        windows: {
          title: "Cómo Instalar IPTV Smarters Pro en Windows | Guía Paso a Paso",
          description: "Guía completa paso a paso para instalar IPTV Smarters Pro en PC con Windows. Descarga, instala y configura IPTV Smarters Pro en Windows. Soporte de instalación gratuito disponible.",
        },
        ios: {
          title: "Cómo Instalar IPTV Smarters Pro en iOS | Guía para iPhone e iPad",
          description: "Guía completa para instalar IPTV Smarters Pro en iPhone e iPad. Instrucciones paso a paso para instalación en iOS. Soporte gratuito disponible.",
        },
        firestick: {
          title: "Cómo Instalar IPTV Smarters Pro en Firestick | Guía Amazon Fire TV",
          description: "Guía completa para instalar IPTV Smarters Pro en Amazon Firestick y Fire TV. Instrucciones fáciles paso a paso. Soporte de instalación gratuito.",
        },
        smartTv: {
          title: "Cómo Instalar IPTV Smarters Pro en Smart TV | Guía Completa",
          description: "Guía completa para instalar IPTV Smarters Pro en Smart TV. Funciona con Samsung, LG, Android TV y más. Instrucciones paso a paso.",
        },
        guide: {
          title: "Guía de Instalación IPTV | Instrucciones de Configuración Completas",
          description: "Guía completa de instalación IPTV para todos los dispositivos. Aprende cómo instalar IPTV Smarters Pro en Windows, Android, iOS, Smart TV y Firestick.",
        },
      },
      reseller: {
        title: "Programa de Revendedor IPTV | Inicia Tu Negocio IPTV",
        description: "Únete a nuestro programa de revendedor IPTV y comienza tu propio negocio IPTV. Precios competitivos, soluciones white-label y soporte dedicado. Conviértete en revendedor IPTV hoy.",
      },
    },
    fr: {
      homepage: {
        title: "Meilleur Service IPTV | IPTV Smarters Pro | 20,000+ Chaînes | Essai Gratuit | Activation Instantanée",
        description: "Obtenez le service d'abonnement IPTV #1 avec IPTV Smarters Pro. Accédez à plus de 20,000 chaînes TV en direct, films et séries en qualité 4K. Garantie de disponibilité 99.9%. Essai gratuit disponible. Fonctionne sur Windows, Android, iOS, Mac, Smart TV, Firestick. Activation instantanée. Plans d'abonnement IPTV premium à partir de 19,99€. Codes et comptes IPTV Smarters Pro disponibles.",
      },
      blog: {
        title: "Blog IPTV | Dernières Actualités, Guides et Conseils",
        description: "Restez informé des dernières actualités IPTV, guides d'installation, conseils et meilleures pratiques. Apprenez à tirer le meilleur parti de votre abonnement IPTV.",
      },
      blogListing: {
        title: "Blog IPTV | Derniers Articles et Guides",
        description: "Parcourez notre collection d'articles IPTV, guides d'installation, conseils et actualités de l'industrie. Tout ce que vous devez savoir sur le streaming IPTV.",
      },
      legal: {
        refundPolicy: {
          title: "Politique de Remboursement | StreamPro IPTV",
          description: "Consultez la politique de remboursement StreamPro IPTV, l’éligibilité, les délais et comment demander un remboursement pour votre abonnement IPTV.",
        },
        privacyPolicy: {
          title: "Politique de Confidentialité | StreamPro IPTV",
          description: "Découvrez comment StreamPro IPTV collecte, utilise et protège vos données personnelles lorsque vous utilisez notre service IPTV et notre site web.",
        },
        termsOfService: {
          title: "Conditions d'Utilisation | StreamPro IPTV",
          description: "Consultez les conditions d’utilisation des services StreamPro IPTV, du site web et des abonnements IPTV.",
        },
      },
      installation: {
        windows: {
          title: "Comment Installer IPTV Smarters Pro sur Windows | Guide Étape par Étape",
          description: "Guide complet étape par étape pour installer IPTV Smarters Pro sur PC Windows. Téléchargez, installez et configurez IPTV Smarters Pro sur Windows. Support d'installation gratuit disponible.",
        },
        ios: {
          title: "Comment Installer IPTV Smarters Pro sur iOS | Guide iPhone et iPad",
          description: "Guide complet pour installer IPTV Smarters Pro sur iPhone et iPad. Instructions étape par étape pour l'installation iOS. Support gratuit disponible.",
        },
        firestick: {
          title: "Comment Installer IPTV Smarters Pro sur Firestick | Guide Amazon Fire TV",
          description: "Guide complet pour installer IPTV Smarters Pro sur Amazon Firestick et Fire TV. Instructions faciles étape par étape. Support d'installation gratuit.",
        },
        smartTv: {
          title: "Comment Installer IPTV Smarters Pro sur Smart TV | Guide Complet",
          description: "Guide complet pour installer IPTV Smarters Pro sur Smart TV. Fonctionne avec Samsung, LG, Android TV et plus encore. Instructions étape par étape.",
        },
        guide: {
          title: "Guide d'Installation IPTV | Instructions de Configuration Complètes",
          description: "Guide complet d'installation IPTV pour tous les appareils. Apprenez à installer IPTV Smarters Pro sur Windows, Android, iOS, Smart TV et Firestick.",
        },
      },
      reseller: {
        title: "Programme de Revendeur IPTV | Démarrez Votre Entreprise IPTV",
        description: "Rejoignez notre programme de revendeur IPTV et démarrez votre propre entreprise IPTV. Prix compétitifs, solutions white-label et support dédié. Devenez revendeur IPTV dès aujourd'hui.",
      },
    },
  };

  return defaults[locale] || defaults.en;
}
