"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";

interface UserRow {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
  created_at: string;
}

const roleBadgeVariant: Record<string, "default" | "secondary" | "destructive"> = {
  superadmin: "destructive",
  admin: "default",
  user: "secondary",
};

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      setUsers(data ?? []);
    }
    load();
  }, []);

  const filtered = users.filter((u) =>
    u.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold">Usuarios</h2>
        <p className="text-muted-foreground">{users.length} usuarios registrados</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar usuarios..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">No se encontraron usuarios</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((user) => {
            const initials = user.full_name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() || "U";

            return (
              <Card key={user.id}>
                <CardContent className="flex items-center gap-4 py-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{user.full_name || "Sin nombre"}</p>
                    <p className="text-xs text-muted-foreground">
                      Registrado el {new Date(user.created_at).toLocaleDateString("es")}
                    </p>
                  </div>
                  <Badge variant={roleBadgeVariant[user.role] ?? "secondary"}>
                    {user.role}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
