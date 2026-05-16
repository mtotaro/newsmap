import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Infobae
      { protocol: "https", hostname: "*.infobae.com" },
      // La Nación
      { protocol: "https", hostname: "*.lanacion.com.ar" },
      // Clarín
      { protocol: "https", hostname: "*.clarin.com" },
      // Folha de SP
      { protocol: "https", hostname: "*.folha.uol.com.br" },
      { protocol: "https", hostname: "f.i.uol.com.br" },
      // O Globo
      { protocol: "https", hostname: "*.oglobo.globo.com" },
      // La Tercera
      { protocol: "https", hostname: "*.latercera.com" },
      // El Tiempo
      { protocol: "https", hostname: "*.eltiempo.com" },
      // Perú21
      { protocol: "https", hostname: "*.peru21.pe" },
      // El Universal
      { protocol: "https", hostname: "*.eluniversal.com.mx" },
      // Excélsior
      { protocol: "https", hostname: "*.excelsior.com.mx" },
      // BBC Mundo
      { protocol: "https", hostname: "*.bbc.com" },
      { protocol: "https", hostname: "*.bbc.co.uk" },
      { protocol: "https", hostname: "ichef.bbci.co.uk" },
      // France 24
      { protocol: "https", hostname: "*.france24.com" },
      // Deutsche Welle
      { protocol: "https", hostname: "*.dw.com" },
      // Al Jazeera English
      { protocol: "https", hostname: "*.aljazeera.com" },
      // Axios
      { protocol: "https", hostname: "*.axios.com" },
      // NPR
      { protocol: "https", hostname: "*.npr.org" },
      { protocol: "https", hostname: "media.npr.org" },
      // The Guardian (US + UK)
      { protocol: "https", hostname: "i.guim.co.uk" },
      { protocol: "https", hostname: "*.theguardian.com" },
      // Washington Post
      { protocol: "https", hostname: "*.washingtonpost.com" },
      { protocol: "https", hostname: "www.washingtonpost.com" },
      // New York Times
      { protocol: "https", hostname: "static01.nyt.com" },
      { protocol: "https", hostname: "*.nytimes.com" },
      // The Atlantic
      { protocol: "https", hostname: "*.theatlantic.com" },
      { protocol: "https", hostname: "cdn.theatlantic.com" },
      // The Independent
      { protocol: "https", hostname: "*.independent.co.uk" },
      // El País
      { protocol: "https", hostname: "*.elpais.com" },
      // El Mundo
      { protocol: "https", hostname: "*.e00-elmundo.uecdn.es" },
      { protocol: "https", hostname: "*.elmundo.es" },
      // El Confidencial
      { protocol: "https", hostname: "*.elconfidencial.com" },
      // La Vanguardia
      { protocol: "https", hostname: "*.lavanguardia.com" },
      // Le Monde
      { protocol: "https", hostname: "*.lemonde.fr" },
      // Der Spiegel
      { protocol: "https", hostname: "*.spiegel.de" },
      // La Repubblica
      { protocol: "https", hostname: "*.repubblica.it" },
    ],
  },
};

export default withNextIntl(nextConfig);
