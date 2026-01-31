import Link from "next/link";
import { LayoutDashboard, BookOpen, Video, Users, FolderOpen, Home } from "lucide-react";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/cursos", label: "Cursos", icon: BookOpen },
  { href: "/admin/predicas", label: "Prédicas", icon: Video },
  { href: "/admin/categorias", label: "Categorías", icon: FolderOpen },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-border bg-card lg:block">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href="/admin" className="font-[family-name:var(--font-heading)] text-lg font-bold">
            Panel Admin
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Volver al sitio
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b border-border px-6 lg:px-8">
          <h1 className="text-lg font-semibold">Administración</h1>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            Ir al inicio
          </Link>
        </header>
        <div className="p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
