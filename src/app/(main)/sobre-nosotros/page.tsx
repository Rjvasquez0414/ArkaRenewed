import { Cross, Heart, BookOpen, Users } from "lucide-react";

export const metadata = {
  title: "Sobre Nosotros",
  description: "Conoce más sobre Arka Iglesia y nuestra misión",
};

export default function SobreNosotrosPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <Cross className="mx-auto mb-4 h-12 w-12 text-primary" />
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold sm:text-4xl">
          Sobre Arka Iglesia
        </h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
          Somos una comunidad de fe comprometida con acercar a las personas a Cristo
          a través de la enseñanza bíblica, la adoración y el servicio. Nuestra plataforma
          digital es una extensión de nuestro ministerio, llevando la palabra de Dios
          a cada rincón.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
        {[
          {
            icon: Heart,
            title: "Nuestra Misión",
            description: "Guiar a cada persona hacia una relación profunda con Jesucristo a través de la enseñanza sólida y el amor genuino.",
          },
          {
            icon: BookOpen,
            title: "Nuestra Visión",
            description: "Ser una iglesia que forma discípulos comprometidos, equipados para impactar su entorno con el evangelio.",
          },
          {
            icon: Users,
            title: "Nuestros Valores",
            description: "Fe, integridad, servicio, comunidad y excelencia en todo lo que hacemos para la gloria de Dios.",
          },
        ].map((item) => (
          <div key={item.title} className="text-center">
            <item.icon className="mx-auto mb-4 h-10 w-10 text-primary/70" />
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
