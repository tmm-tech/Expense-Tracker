import { useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FolderIcon,
  PencilIcon,
  Trash2Icon,
  LockIcon,
} from "lucide-react";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";
import type { Category } from "@/types/category";

/* =========================
   Types (REST)
========================= */
interface CategoryListProps {
  categories: Category[] | undefined;
  onEdit: (id: string) => void;
}

/* =========================
   Component
========================= */

export function CategoryList({ categories, onEdit }: CategoryListProps) {
  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/api/categories/${id}`, { method: "DELETE" });
      toast.success("Category deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete category");
    }
  };

  /* -------------------------
     Loading
  -------------------------- */
  if (categories === undefined) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  /* -------------------------
     Empty
  -------------------------- */
  if (categories.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderIcon />
          </EmptyMedia>
          <EmptyTitle>No categories yet</EmptyTitle>
          <EmptyDescription>
            Create custom categories to organize your finances
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  /* -------------------------
     Grouping
  -------------------------- */
  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");
  const goalCategories = categories.filter((c) => c.type === "goal");

  const renderCategoryCard = (category: Category) => {
    const IconComponent =
      category.icon && category.icon in LucideIcons
        ? (LucideIcons as Record<string, any>)[category.icon]
        : FolderIcon;

    return (
      <Card key={category.id} className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{
                backgroundColor: category.color
                  ? `${category.color}20`
                  : "hsl(var(--muted))",
              }}
            >
              <IconComponent
                className="h-5 w-5"
                style={{
                  color: category.color || "hsl(var(--foreground))",
                }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate">{category.name}</h3>
                {category.isDefault && (
                  <LockIcon className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
              <p className="text-sm text-muted-foreground capitalize">
                {category.type}
              </p>
            </div>

            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(category.id)}
              >
                <PencilIcon className="h-4 w-4" />
              </Button>

              {!category.isDefault && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(category.id)}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {incomeCategories.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            Income Categories ({incomeCategories.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {incomeCategories.map(renderCategoryCard)}
          </div>
        </section>
      )}

      {expenseCategories.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            Expense Categories ({expenseCategories.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {expenseCategories.map(renderCategoryCard)}
          </div>
        </section>
      )}

      {goalCategories.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            Goal Categories ({goalCategories.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {goalCategories.map(renderCategoryCard)}
          </div>
        </section>
      )}
    </div>
  );
}