import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Video, Award, Heart, ArrowRight, Cross, Users, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary via-secondary to-secondary/95 text-secondary-foreground">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(184,134,11,0.3),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(184,134,11,0.2),transparent_50%)]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-sm text-gold-light">
              <Sparkles className="h-4 w-4" />
              Bienvenido a Arka Iglesia
            </div>
            <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Acércate a Cristo{" "}
              <span className="text-gold">a través de la Palabra</span>
            </h1>
            <p className="mt-6 text-lg text-secondary-foreground/70 sm:text-xl">
              Descubre cursos bíblicos, prédicas inspiradoras y devocionales que
              transformarán tu vida espiritual. Crece en fe junto a nuestra comunidad.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="text-base px-8" asChild>
                <Link href="/cursos">
                  Explorar cursos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 border-white/30 text-white hover:bg-white/10" asChild>
                <Link href="/predicas">Ver prédicas</Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full">
            <path
              d="M0 40L48 36C96 32 192 24 288 28C384 32 480 48 576 52C672 56 768 48 864 40C960 32 1056 24 1152 28C1248 32 1344 48 1392 56L1440 64V80H0V40Z"
              className="fill-background"
            />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold sm:text-4xl">
              Todo lo que necesitas para{" "}
              <span className="text-primary">crecer en fe</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Herramientas diseñadas para tu crecimiento espiritual
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: BookOpen,
                title: "Cursos Bíblicos",
                description:
                  "Estudios estructurados con lecciones, materiales y certificados al completar.",
                color: "bg-primary/10 text-primary",
                border: "border-t-primary/40",
              },
              {
                icon: Video,
                title: "Prédicas y Devocionales",
                description:
                  "Videos de prédicas dominicales y devocionales diarios para tu edificación.",
                color: "bg-blue-100 text-blue-700",
                border: "border-t-blue-400/40",
              },
              {
                icon: Award,
                title: "Certificados",
                description:
                  "Obtén certificados al completar cursos. Registra tu progreso espiritual.",
                color: "bg-green-100 text-green-700",
                border: "border-t-green-400/40",
              },
              {
                icon: Heart,
                title: "Comunidad",
                description:
                  "Conecta con otros creyentes y comparte tu camino de fe.",
                color: "bg-rose-100 text-rose-700",
                border: "border-t-rose-400/40",
              },
            ].map((feature) => (
              <Card key={feature.title} className={`border-border/50 border-t-2 ${feature.border} shadow-sm hover:shadow-lg transition-all hover:-translate-y-1`}>
                <CardContent className="pt-6">
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Verse of the day placeholder */}
      <section className="bg-cream py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-primary/20 bg-card p-8 shadow-sm sm:p-12">
            <Cross className="mx-auto mb-4 h-8 w-8 text-primary" />
            <blockquote className="font-[family-name:var(--font-heading)] text-2xl font-medium italic text-foreground sm:text-3xl">
              &ldquo;Porque de tal manera amó Dios al mundo, que ha dado a su Hijo
              unigénito, para que todo aquel que en él cree, no se pierda, mas
              tenga vida eterna.&rdquo;
            </blockquote>
            <p className="mt-4 text-muted-foreground">Juan 3:16</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { icon: BookOpen, value: "20+", label: "Cursos disponibles" },
              { icon: Video, value: "100+", label: "Prédicas y devocionales" },
              { icon: Users, value: "500+", label: "Miembros activos" },
              { icon: Award, value: "300+", label: "Certificados otorgados" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="mx-auto mb-3 h-8 w-8 text-primary/60" />
                <p className="font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-secondary py-20 text-secondary-foreground">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold sm:text-4xl">
            Comienza tu camino hoy
          </h2>
          <p className="mt-4 text-lg text-secondary-foreground/70">
            Regístrate gratis y accede a todos nuestros cursos bíblicos, prédicas
            y recursos espirituales.
          </p>
          <div className="mt-8">
            <Button size="lg" className="text-base px-8" asChild>
              <Link href="/register">
                Crear cuenta gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
