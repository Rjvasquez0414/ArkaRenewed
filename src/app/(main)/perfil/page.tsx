import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/profiles";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, Calendar } from "lucide-react";

export const metadata = { title: "Mi Perfil" };

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const initials = profile.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold">Mi Perfil</h1>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-8 sm:flex-row sm:items-start">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{profile.full_name || "Sin nombre"}</h2>
              <Badge variant="secondary">{profile.role}</Badge>
            </div>
            {profile.bio && <p className="text-sm text-muted-foreground">{profile.bio}</p>}
            <Separator />
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4" />{user.email}
              </span>
              {profile.phone && (
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />{profile.phone}
                </span>
              )}
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Miembro desde {new Date(profile.created_at).toLocaleDateString("es", { month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
