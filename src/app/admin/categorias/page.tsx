"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { createCourseCategory, updateCourseCategory, deleteCourseCategory } from "@/lib/actions/courses";
import { createSermonCategory, updateSermonCategory, deleteSermonCategory } from "@/lib/actions/sermons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, BookOpen, Video } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
}

function CategoryForm({
  category,
  onSubmit,
  onClose,
}: {
  category?: Category;
  onSubmit: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await onSubmit(formData);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(category ? "Categoría actualizada" : "Categoría creada");
      onClose();
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" defaultValue={category?.name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" name="description" defaultValue={category?.description ?? ""} rows={3} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={loading}>
          {category ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}

function CategoryList({
  categories,
  type,
  onRefresh,
}: {
  categories: Category[];
  type: "course" | "sermon";
  onRefresh: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const updateFn = type === "course" ? updateCourseCategory : updateSermonCategory;
  const deleteFn = type === "course" ? deleteCourseCategory : deleteSermonCategory;
  const createFn = type === "course" ? createCourseCategory : createSermonCategory;

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar esta categoría?")) return;
    const result = await deleteFn(id);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Categoría eliminada");
      onRefresh();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{categories.length} categorías</p>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-2 h-4 w-4" />Nueva categoría</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Crear categoría</DialogTitle></DialogHeader>
            <CategoryForm
              onSubmit={async (fd) => {
                const r = await createFn(fd);
                if (r.success) onRefresh();
                return r;
              }}
              onClose={() => setShowCreate(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {categories.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">No hay categorías aún</p>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between rounded-lg border p-4">
              {editingId === cat.id ? (
                <div className="flex-1">
                  <CategoryForm
                    category={cat}
                    onSubmit={async (fd) => {
                      const r = await updateFn(cat.id, fd);
                      if (r.success) onRefresh();
                      return r;
                    }}
                    onClose={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <>
                  <div>
                    <p className="font-medium">{cat.name}</p>
                    {cat.description && (
                      <p className="text-sm text-muted-foreground">{cat.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => setEditingId(cat.id)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(cat.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoriasPage() {
  const [courseCategories, setCourseCategories] = useState<Category[]>([]);
  const [sermonCategories, setSermonCategories] = useState<Category[]>([]);

  async function loadCategories() {
    const supabase = createClient();
    const [cc, sc] = await Promise.all([
      supabase.from("course_categories").select("*").order("sort_order"),
      supabase.from("sermon_categories").select("*").order("sort_order"),
    ]);
    setCourseCategories(cc.data ?? []);
    setSermonCategories(sc.data ?? []);
  }

  useEffect(() => { loadCategories(); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold">Categorías</h2>
        <p className="text-muted-foreground">Gestiona las categorías de cursos y prédicas</p>
      </div>

      <Tabs defaultValue="courses">
        <TabsList>
          <TabsTrigger value="courses"><BookOpen className="mr-2 h-4 w-4" />Cursos</TabsTrigger>
          <TabsTrigger value="sermons"><Video className="mr-2 h-4 w-4" />Prédicas</TabsTrigger>
        </TabsList>
        <TabsContent value="courses">
          <Card>
            <CardHeader><CardTitle>Categorías de Cursos</CardTitle></CardHeader>
            <CardContent>
              <CategoryList categories={courseCategories} type="course" onRefresh={loadCategories} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sermons">
          <Card>
            <CardHeader><CardTitle>Categorías de Prédicas</CardTitle></CardHeader>
            <CardContent>
              <CategoryList categories={sermonCategories} type="sermon" onRefresh={loadCategories} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
