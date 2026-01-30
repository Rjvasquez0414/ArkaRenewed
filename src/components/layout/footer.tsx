import Link from "next/link";
import { Cross } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-secondary text-secondary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Cross className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-[family-name:var(--font-heading)] text-xl font-bold">
                Arka Iglesia
              </span>
            </div>
            <p className="text-sm text-secondary-foreground/70">
              Acercándote a Cristo a través de la palabra, cursos bíblicos y comunidad.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-secondary-foreground/50">
              Explorar
            </h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/cursos" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">Cursos Bíblicos</Link></li>
              <li><Link href="/predicas" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">Prédicas</Link></li>
              <li><Link href="/sobre-nosotros" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">Sobre Nosotros</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-secondary-foreground/50">
              Mi Cuenta
            </h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/perfil" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">Mi Perfil</Link></li>
              <li><Link href="/perfil/progreso" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">Mi Progreso</Link></li>
              <li><Link href="/perfil/certificados" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">Certificados</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-secondary-foreground/50">
              Contacto
            </h3>
            <ul className="space-y-3 text-sm text-secondary-foreground/70">
              <li>info@arkaiglesia.com</li>
              <li>Síguenos en redes sociales</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-secondary-foreground/10 pt-8 text-center text-sm text-secondary-foreground/50">
          <p>&copy; {new Date().getFullYear()} Arka Iglesia. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
