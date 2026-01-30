import Link from "next/link";
import { User, BarChart3, Award, Heart } from "lucide-react";

const profileLinks = [
  { href: "/perfil", label: "Mi Perfil", icon: User },
  { href: "/perfil/progreso", label: "Mi Progreso", icon: BarChart3 },
  { href: "/perfil/certificados", label: "Certificados", icon: Award },
  { href: "/perfil/favoritos", label: "Favoritos", icon: Heart },
];

export default function PerfilLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {profileLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
