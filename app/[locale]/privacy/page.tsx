import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title =
    locale === "es" ? "Política de Privacidad · NewsMap" : "Privacy Policy · NewsMap";
  return { title };
}

const LAST_UPDATED = "19 de mayo de 2026";
const LAST_UPDATED_EN = "May 19, 2026";
const CONTACT_EMAIL = "privacidad@newsmap.app";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold text-[var(--color-text)]">
        {title}
      </h2>
      <div className="text-sm text-[var(--color-text-2)] leading-relaxed space-y-2">
        {children}
      </div>
    </section>
  );
}

function PrivacyEs() {
  return (
    <article className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-bold text-[var(--color-text)]">
          Política de Privacidad
        </h1>
        <p className="text-xs text-[var(--color-text-3)]">
          Última actualización: {LAST_UPDATED}
        </p>
      </header>

      <p className="text-sm text-[var(--color-text-2)] leading-relaxed">
        NewsMap es un agregador de noticias que te permite suscribirte a fuentes
        periodísticas de todo el mundo. Esta política explica qué datos
        recopilamos, cómo los usamos y qué derechos tenés sobre ellos.
      </p>

      <Section title="1. Responsable del tratamiento">
        <p>
          NewsMap (en adelante, «nosotros» o «el servicio»). Para contactarnos
          sobre privacidad, escribí a{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-[var(--color-blue)] hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>

      <Section title="2. Datos que recopilamos">
        <p>
          <strong className="text-[var(--color-text)]">Cuenta:</strong> tu
          dirección de email, usada únicamente para autenticarte vía enlace
          mágico o Google OAuth (Supabase Auth). No almacenamos contraseñas.
        </p>
        <p>
          <strong className="text-[var(--color-text)]">Suscripciones:</strong>{" "}
          la lista de fuentes periodísticas a las que te suscribís, junto con
          las secciones seleccionadas. Estos datos se guardan en nuestra base de
          datos para personalizar tu feed.
        </p>
        <p>
          <strong className="text-[var(--color-text)]">
            Preferencias opcionales:
          </strong>{" "}
          idioma de la interfaz y, si lo activás, la hora de envío del resumen
          diario por email.
        </p>
        <p>
          <strong className="text-[var(--color-text)]">
            Datos técnicos mínimos:
          </strong>{" "}
          logs estándar del servidor (IP de origen, timestamp, URL solicitada).
          Se retienen por un máximo de 30 días y no se asocian a tu perfil.
        </p>
        <p>
          NewsMap <strong className="text-[var(--color-text)]">no</strong>{" "}
          recopila: historial de navegación fuera de la app, información
          financiera, ni datos de terceros.
        </p>
      </Section>

      <Section title="3. Cómo usamos tus datos">
        <ul className="list-disc list-inside space-y-1">
          <li>Autenticarte y mantener tu sesión activa.</li>
          <li>
            Mostrarte un feed personalizado con artículos de tus fuentes
            suscritas.
          </li>
          <li>
            Enviarte el resumen diario por email, si lo activaste en Ajustes.
          </li>
          <li>Mejorar el servicio y diagnosticar errores técnicos.</li>
        </ul>
        <p>
          No usamos tus datos para publicidad personalizada ni los cedemos a
          terceros con fines comerciales.
        </p>
      </Section>

      <Section title="4. Cookies y almacenamiento local">
        <p>
          Usamos una cookie de sesión segura (HTTP-only, SameSite=Lax) emitida
          por Supabase para mantener tu sesión activa. No usamos cookies de
          rastreo de terceros.
        </p>
        <p>
          Si en el futuro activamos Google AdSense, éste podrá instalar cookies
          propias de Google para mostrar anuncios relevantes. Actualizaremos
          esta política antes de hacerlo.
        </p>
      </Section>

      <Section title="5. Compartición con terceros">
        <p>Compartimos datos mínimos con los siguientes proveedores de servicio:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong className="text-[var(--color-text)]">Supabase</strong> —
            base de datos y autenticación (hosting en AWS us-east-1).
          </li>
          <li>
            <strong className="text-[var(--color-text)]">Vercel</strong> —
            hosting del frontend y funciones serverless.
          </li>
          <li>
            <strong className="text-[var(--color-text)]">Resend</strong> — envío
            de emails transaccionales (solo si activaste el resumen diario).
          </li>
          <li>
            <strong className="text-[var(--color-text)]">Inngest</strong> —
            ejecución de tareas en background (sin acceso a datos personales
            identificables).
          </li>
        </ul>
        <p>
          Ninguno de estos proveedores puede usar tus datos para sus propios
          fines comerciales.
        </p>
      </Section>

      <Section title="6. Retención de datos">
        <p>
          Tus datos se conservan mientras tu cuenta esté activa. Podés
          eliminarla en cualquier momento desde{" "}
          <strong className="text-[var(--color-text)]">
            Ajustes → Zona de peligro → Eliminar cuenta
          </strong>
          . La eliminación borra permanentemente tu email, suscripciones y
          preferencias de nuestra base de datos.
        </p>
      </Section>

      <Section title="7. Tus derechos">
        <p>
          Según la legislación aplicable (GDPR si sos de la UE, Ley 25.326 si
          sos de Argentina), tenés derecho a:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Acceder a los datos que tenemos sobre vos.</li>
          <li>Rectificarlos si son incorrectos.</li>
          <li>Solicitar su eliminación.</li>
          <li>Oponerte al tratamiento o solicitar su limitación.</li>
          <li>Portabilidad de datos.</li>
        </ul>
        <p>
          Para ejercer cualquiera de estos derechos, escribinos a{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-[var(--color-blue)] hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          . Responderemos en un plazo máximo de 30 días.
        </p>
      </Section>

      <Section title="8. Seguridad">
        <p>
          Toda comunicación entre tu navegador y nuestros servidores ocurre por
          HTTPS. Las credenciales de autenticación son gestionadas por Supabase
          usando estándares de la industria (JWT con rotación de tokens). No
          almacenamos contraseñas.
        </p>
      </Section>

      <Section title="9. Menores de edad">
        <p>
          NewsMap no está dirigido a menores de 13 años. No recopilamos
          conscientemente datos de menores.
        </p>
      </Section>

      <Section title="10. Cambios a esta política">
        <p>
          Si realizamos cambios materiales, te lo notificaremos por email (si
          tenés cuenta) o mediante un aviso visible en la app. La fecha de
          última actualización al inicio de esta página refleja siempre la
          versión vigente.
        </p>
      </Section>
    </article>
  );
}

function PrivacyEn() {
  return (
    <article className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-bold text-[var(--color-text)]">
          Privacy Policy
        </h1>
        <p className="text-xs text-[var(--color-text-3)]">
          Last updated: {LAST_UPDATED_EN}
        </p>
      </header>

      <p className="text-sm text-[var(--color-text-2)] leading-relaxed">
        NewsMap is a news aggregator that lets you subscribe to news sources
        from around the world. This policy explains what data we collect, how
        we use it, and what rights you have over it.
      </p>

      <Section title="1. Data controller">
        <p>
          NewsMap ("we", "us", or "the service"). For privacy-related inquiries,
          contact us at{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-[var(--color-blue)] hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>

      <Section title="2. Data we collect">
        <p>
          <strong className="text-[var(--color-text)]">Account:</strong> your
          email address, used only to authenticate you via magic link or Google
          OAuth (Supabase Auth). We do not store passwords.
        </p>
        <p>
          <strong className="text-[var(--color-text)]">Subscriptions:</strong>{" "}
          the list of news sources you subscribe to, along with your selected
          sections. This data is stored in our database to personalize your
          feed.
        </p>
        <p>
          <strong className="text-[var(--color-text)]">
            Optional preferences:
          </strong>{" "}
          interface language and, if enabled, your preferred time for the daily
          email digest.
        </p>
        <p>
          <strong className="text-[var(--color-text)]">
            Minimal technical data:
          </strong>{" "}
          standard server logs (origin IP, timestamp, requested URL). Retained
          for a maximum of 30 days and not linked to your profile.
        </p>
        <p>
          NewsMap does <strong className="text-[var(--color-text)]">not</strong>{" "}
          collect: browsing history outside the app, financial information, or
          third-party data.
        </p>
      </Section>

      <Section title="3. How we use your data">
        <ul className="list-disc list-inside space-y-1">
          <li>To authenticate you and maintain your active session.</li>
          <li>
            To show you a personalized feed with articles from your subscribed
            sources.
          </li>
          <li>
            To send you a daily digest email, if you enabled it in Settings.
          </li>
          <li>To improve the service and diagnose technical errors.</li>
        </ul>
        <p>
          We do not use your data for targeted advertising or share it with
          third parties for commercial purposes.
        </p>
      </Section>

      <Section title="4. Cookies and local storage">
        <p>
          We use a secure session cookie (HTTP-only, SameSite=Lax) issued by
          Supabase to keep your session active. We do not use third-party
          tracking cookies.
        </p>
        <p>
          If we enable Google AdSense in the future, Google may set its own
          cookies to serve relevant ads. We will update this policy before doing
          so.
        </p>
      </Section>

      <Section title="5. Sharing with third parties">
        <p>
          We share minimal data with the following service providers:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong className="text-[var(--color-text)]">Supabase</strong> —
            database and authentication (hosted on AWS us-east-1).
          </li>
          <li>
            <strong className="text-[var(--color-text)]">Vercel</strong> —
            frontend hosting and serverless functions.
          </li>
          <li>
            <strong className="text-[var(--color-text)]">Resend</strong> —
            transactional email delivery (only if you enabled the daily digest).
          </li>
          <li>
            <strong className="text-[var(--color-text)]">Inngest</strong> —
            background job execution (no access to personally identifiable
            data).
          </li>
        </ul>
        <p>
          None of these providers may use your data for their own commercial
          purposes.
        </p>
      </Section>

      <Section title="6. Data retention">
        <p>
          Your data is retained while your account is active. You can delete
          your account at any time from{" "}
          <strong className="text-[var(--color-text)]">
            Settings → Danger zone → Delete account
          </strong>
          . Deletion permanently removes your email, subscriptions, and
          preferences from our database.
        </p>
      </Section>

      <Section title="7. Your rights">
        <p>
          Under applicable law (GDPR if you are in the EU, or equivalent
          legislation), you have the right to:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Access the data we hold about you.</li>
          <li>Correct it if it is inaccurate.</li>
          <li>Request its deletion.</li>
          <li>Object to or restrict processing.</li>
          <li>Data portability.</li>
        </ul>
        <p>
          To exercise any of these rights, write to us at{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-[var(--color-blue)] hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          . We will respond within 30 days.
        </p>
      </Section>

      <Section title="8. Security">
        <p>
          All communication between your browser and our servers occurs over
          HTTPS. Authentication credentials are managed by Supabase using
          industry-standard practices (JWT with token rotation). We do not store
          passwords.
        </p>
      </Section>

      <Section title="9. Children">
        <p>
          NewsMap is not directed at children under 13. We do not knowingly
          collect data from minors.
        </p>
      </Section>

      <Section title="10. Changes to this policy">
        <p>
          If we make material changes, we will notify you by email (if you have
          an account) or through a prominent notice in the app. The last updated
          date at the top of this page always reflects the current version.
        </p>
      </Section>
    </article>
  );
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Errors" });

  const backLabel = locale === "es" ? "← Volver" : "← Back";

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-block text-xs text-[var(--color-text-3)] hover:text-[var(--color-text-2)] transition-colors"
        >
          {backLabel}
        </Link>

        <div className="rounded-[var(--radius-card)] bg-[var(--color-bg-2)] border border-[var(--color-border)] p-6 md:p-8">
          {locale === "es" ? <PrivacyEs /> : <PrivacyEn />}
        </div>
      </div>
    </div>
  );
}
