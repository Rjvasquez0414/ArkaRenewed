"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import type { SermonCategory } from "@/lib/types";

export function SermonFilters({
  categories,
  currentCategory,
  currentSearch,
}: {
  categories: SermonCategory[];
  currentCategory?: string;
  currentSearch?: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch ?? "");

  function navigate(category?: string, searchVal?: string) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (searchVal) params.set("search", searchVal);
    router.push(`/predicas?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(currentCategory, search);
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por título, predicador..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </form>

      {/* Category pills */}
      <div className="flex flex-wrap justify-center gap-2">
        <Badge
          variant={!currentCategory ? "default" : "outline"}
          className="cursor-pointer px-4 py-1.5"
          onClick={() => navigate(undefined, search)}
        >
          Todas
        </Badge>
        {categories.map((cat) => (
          <Badge
            key={cat.id}
            variant={currentCategory === cat.slug ? "default" : "outline"}
            className="cursor-pointer px-4 py-1.5"
            onClick={() => navigate(cat.slug, search)}
          >
            {cat.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
