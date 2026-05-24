import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ScrollToTop from "@/components/ScrollToTop";
import { locales, type Locale, getTranslations } from "@/lib/i18n";

import { buildLocaleHomepageMetadata } from "@/lib/utils/homepage-route-metadata";
import {
  getFaqPricingAnswerText,
  getStandardProductOffers,
} from "@/lib/seo/schema-pricing";
import { getHomeFaqMainEntity } from "@/lib/seo/home-faq-schema";
import { getContactEmailForLocale } from "@/lib/utils/contact-email";

// Generate structured data for SEO
function generateStructuredData(locale: Locale, baseUrl: string) {
  const organizationNameMap: Record<Locale, string> = {
    en: "StreamPro",
    ca: "StreamPro",
    uk: "StreamPro",
    es: "StreamPro",
    fr: "StreamPro",
  };

  const organizationDescMap: Record<Locale, string> = {
    en: "Premium IPTV streaming service with crystal-clear quality, 99.9% uptime, and full device compatibility",
    ca: "Premium IPTV streaming for Canada with crystal-clear quality, 99.9% uptime, and full device compatibility",
    uk: "Premium IPTV streaming for the United Kingdom with crystal-clear quality, 99.9% uptime, and full device compatibility",
    es: "Servicio de streaming IPTV premium con calidad cristalina, 99.9% de tiempo de actividad y compatibilidad total con dispositivos",
    fr: "Service de streaming IPTV premium avec une qualité cristalline, 99.9% de disponibilité et compatibilité totale des appareils",
  };

  const productNameMap: Record<Locale, string> = {
    en: "Premium IPTV Streaming Service",
    ca: "Premium IPTV Streaming Service Canada",
    uk: "Premium IPTV Streaming Service UK",
    es: "Servicio de Streaming IPTV Premium",
    fr: "Service de Streaming IPTV Premium",
  };

  const productDescMap: Record<Locale, string> = {
    en: "Premium IPTV streaming service with over 20,000 live TV channels, 4K quality, and support for all devices. Free test available.",
    ca: "Premium IPTV for Canada with 20,000+ live channels, 4K quality, CAD plans, and support for all devices. Free trial available.",
    uk: "Premium IPTV for the UK with 20,000+ live channels, 4K quality, GBP plans, and support for all devices. Free trial available.",
    es: "Servicio de streaming IPTV premium con más de 20,000 canales de TV en vivo, calidad 4K y soporte para todos los dispositivos. Prueba gratuita disponible.",
    fr: "Service de streaming IPTV premium avec plus de 20,000 chaînes TV en direct, qualité 4K et support pour tous les appareils. Essai gratuit disponible.",
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: organizationNameMap[locale],
    description: organizationDescMap[locale],
    url: `${baseUrl}/${locale}/`, // Include trailing slash for consistency
    logo: `${baseUrl}/logo/Logo3-removebg-preview.png`,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      email: getContactEmailForLocale(locale),
      availableLanguage:
        locale === "en"
          ? ["English"]
          : locale === "ca"
            ? ["English", "en-CA"]
            : locale === "uk"
              ? ["English", "en-GB"]
              : locale === "es"
                ? ["Spanish", "Español"]
                : ["French", "Français"],
    },
    sameAs: [],
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productNameMap[locale],
    description: productDescMap[locale],
    image: [`${baseUrl}/images/hero.png`],
    brand: {
      "@type": "Brand",
      name: "StreamPro",
    },
    category:
      locale === "en" || locale === "ca" || locale === "uk"
        ? "IPTV Streaming Service"
        : locale === "es"
          ? "Servicio de Streaming IPTV"
          : "Service de Streaming IPTV",
    offers: getStandardProductOffers(locale, baseUrl),
    featureList: locale === "en" || locale === "ca" || locale === "uk"
      ? [
          "20,000+ Live TV Channels",
          "4K & HD Quality Streaming",
          "99.9% Uptime Guarantee",
          "All Devices Supported",
          "24/7 Customer Support",
          "Free Test Available",
          "Instant Activation",
          "VOD Library Access",
        ]
      : locale === "es"
      ? [
          "Más de 20,000 Canales de TV en Vivo",
          "Streaming en Calidad 4K y HD",
          "Garantía de 99.9% de Tiempo de Actividad",
          "Todos los Dispositivos Compatibles",
          "Soporte al Cliente 24/7",
          "Prueba Gratuita Disponible",
          "Activación Instantánea",
          "Acceso a Biblioteca VOD",
        ]
      : [
          "Plus de 20,000 Chaînes TV en Direct",
          "Streaming en Qualité 4K et HD",
          "Garantie de Disponibilité 99.9%",
          "Tous les Appareils Compatibles",
          "Support Client 24/7",
          "Essai Gratuit Disponible",
          "Activation Instantanée",
          "Accès à la Bibliothèque VOD",
        ],
  };

  // FAQ Schema for homepage
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity:
      getHomeFaqMainEntity(locale) ??
      (locale === "es"
      ? [
          {
            "@type": "Question",
            name: "¿Qué es IPTV Smarters Pro?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "IPTV Smarters Pro es un servicio de streaming IPTV premium que proporciona acceso a más de 20,000 canales de TV en vivo, películas y series en calidad 4K. Funciona en todos los dispositivos incluyendo Windows, Android, iOS, Mac y Smart TVs.",
            },
          },
          {
            "@type": "Question",
            name: "¿Cuánto cuesta la suscripción IPTV?",
            acceptedAnswer: {
              "@type": "Answer",
              text: getFaqPricingAnswerText(locale),
            },
          },
          {
            "@type": "Question",
            name: "¿Hay una prueba gratuita disponible?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Sí, ofrecemos una prueba gratuita de nuestro servicio IPTV para que puedas experimentar la calidad antes de comprar. Contáctanos por WhatsApp para obtener tu prueba gratuita.",
            },
          },
          {
            "@type": "Question",
            name: "¿Qué dispositivos son compatibles?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Nuestro servicio IPTV funciona en todos los dispositivos incluyendo PC con Windows, teléfonos y tabletas Android, dispositivos iOS (iPhone/iPad), computadoras Mac, Smart TVs, Firestick, Roku, Apple TV y más.",
            },
          },
          {
            "@type": "Question",
            name: "¿Cómo instalo IPTV Smarters Pro?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Proporcionamos guías de instalación detalladas para todos los dispositivos. Visita nuestra página de guía de instalación para instrucciones paso a paso para Windows, Android, iOS, Smart TV y Firestick.",
            },
          },
          {
            "@type": "Question",
            name: "¿Puedo ver la Copa Mundial FIFA 2026 con IPTV Smarters Pro?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Puedes usar IPTV Smarters Pro con nuestra suscripción IPTV para disfrutar canales de fútbol compatibles y ver los partidos. La disponibilidad de canales depende de los broadcasters regionales y los derechos—solicita primero una prueba gratuita para confirmar la lista en tu zona.",
            },
          },
          {
            "@type": "Question",
            name: "¿Ofrecen una prueba gratuita de IPTV antes del Mundial?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Sí. Ofrecemos una prueba gratuita para que puedas comprobar la calidad del streaming, la compatibilidad con tu dispositivo y los canales que te interesan antes del Mundial FIFA 2026.",
            },
          },
          {
            "@type": "Question",
            name: "¿En qué dispositivos puedo ver el Mundial por IPTV?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Nuestro servicio funciona en PC Windows, teléfonos y tabletas Android, dispositivos iOS, Mac, Smart TV, Firestick, Roku y Apple TV—para que puedas ver el Mundial 2026 en la pantalla que prefieras.",
            },
          },
          {
            "@type": "Question",
            name: "¿El Mundial se transmite en HD o 4K?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Estamos enfocados en un streaming estable en HD/4K. Para obtener mejores resultados durante los partidos, usa una conexión a internet estable y el dispositivo recomendado para tu plan.",
            },
          },
        ]
      : [
          {
            "@type": "Question",
            name: "Qu'est-ce que IPTV Smarters Pro?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "IPTV Smarters Pro est un service de streaming IPTV premium qui fournit l'accès à plus de 20,000 chaînes TV en direct, films et séries en qualité 4K. Il fonctionne sur tous les appareils incluant Windows, Android, iOS, Mac et Smart TVs.",
            },
          },
          {
            "@type": "Question",
            name: "Combien coûte l'abonnement IPTV?",
            acceptedAnswer: {
              "@type": "Answer",
              text: getFaqPricingAnswerText(locale),
            },
          },
          {
            "@type": "Question",
            name: "Un essai gratuit est-il disponible?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Oui, nous offrons un essai gratuit de notre service IPTV afin que vous puissiez expérimenter la qualité avant d'acheter. Contactez-nous via WhatsApp pour obtenir votre essai gratuit.",
            },
          },
          {
            "@type": "Question",
            name: "Quels appareils sont pris en charge?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Notre service IPTV fonctionne sur tous les appareils incluant PC Windows, téléphones et tablettes Android, appareils iOS (iPhone/iPad), ordinateurs Mac, Smart TVs, Firestick, Roku, Apple TV et plus encore.",
            },
          },
          {
            "@type": "Question",
            name: "Comment installer IPTV Smarters Pro?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Nous fournissons des guides d'installation détaillés pour tous les appareils. Visitez notre page de guide d'installation pour des instructions étape par étape pour Windows, Android, iOS, Smart TV et Firestick.",
            },
          },
          {
            "@type": "Question",
            name: "Puis-je regarder la Coupe du Monde FIFA 2026 avec IPTV Smarters Pro ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Vous pouvez utiliser IPTV Smarters Pro avec notre abonnement IPTV pour profiter de chaînes de football compatibles et regarder les matchs. La disponibilité dépend des diffuseurs régionaux et des droits—demandez d’abord un essai gratuit pour confirmer la liste dans votre zone.",
            },
          },
          {
            "@type": "Question",
            name: "Proposez-vous un essai IPTV gratuit avant la Coupe du Monde ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Oui. Nous proposons un essai IPTV gratuit afin que vous puissiez vérifier la qualité du streaming, la compatibilité avec vos appareils et les chaînes qui vous intéressent avant la Coupe du Monde FIFA 2026.",
            },
          },
          {
            "@type": "Question",
            name: "Sur quels appareils puis-je regarder la Coupe du Monde en IPTV ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Notre service fonctionne sur PC Windows, téléphones et tablettes Android, appareils iOS, ordinateurs Mac, Smart TV, Firestick, Roku et Apple TV—pour que vous puissiez regarder la Coupe du Monde 2026 sur l’écran de votre choix.",
            },
          },
          {
            "@type": "Question",
            name: "Le streaming des matchs sera-t-il en HD ou 4K ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Nous privilégions un streaming stable en HD/4K. Pour de meilleures performances pendant les jours de match, utilisez une connexion internet stable et l’appareil recommandé pour votre formule.",
            },
          },
        ]),
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name:
          locale === "en" || locale === "ca" || locale === "uk"
            ? "Home"
            : locale === "es"
              ? "Inicio"
              : "Accueil",
        item: `${baseUrl}/${locale}`,
      },
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: organizationNameMap[locale],
    url: `${baseUrl}/${locale}/`,
    inLanguage:
      locale === "en"
        ? "en-US"
        : locale === "ca"
          ? "en-CA"
          : locale === "uk"
            ? "en-GB"
            : locale === "es"
              ? "es-ES"
              : "fr-FR",
    publisher: {
      "@type": "Organization",
      name: organizationNameMap[locale],
      url: `${baseUrl}/${locale}/`,
    },
  };

  return { organizationSchema, productSchema, faqSchema, breadcrumbSchema, websiteSchema };
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  
  // Validate locale before processing - prevent errors from invalid routes like /placeholder-image.png
  if (!locales.includes(localeParam as Locale)) {
    // Return basic metadata for invalid locales (will be handled by notFound() in layout)
    return {
      title: "Page Not Found",
      description: "The page you are looking for does not exist.",
    };
  }
  
  const locale = localeParam as Locale;
  return buildLocaleHomepageMetadata(locale);
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.pro-iptvsmarters.com";
  const { organizationSchema, productSchema, faqSchema, breadcrumbSchema, websiteSchema } =
    generateStructuredData(locale as Locale, baseUrl);

  return (
    <LanguageProvider initialLocale={locale as Locale}>
      <div data-locale={locale} className="w-full overflow-x-clip">
      <ScrollToTop />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {children}
      </div>
    </LanguageProvider>
  );
}

