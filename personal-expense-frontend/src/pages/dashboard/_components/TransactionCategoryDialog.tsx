"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as LucideIcons from "lucide-react";
import type { Category } from "@/types/category";

/* =========================
   TYPES
========================= */

type TransactionCategoryType = "income" | "expense"|"transfer";

interface TransactionCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "income" | "expense" | "transfer";
  onCategoryCreated: (category: Category) => void;
}


interface CreateCategoryResponse {
  success: boolean;
  data: Category;
  message?: string;
}
/* =========================
   SCHEMA
========================= */

const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(50, "Category name must be 50 characters or less"),

  type: z.enum(["income", "expense", "transfer"]),

  icon: z.string().optional(),

  color: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

/* =========================
   CONSTANTS
========================= */

const popularIcons = [
  "DollarSign",
  "Briefcase",
  "Laptop",
  "TrendingUp",
  "Building",
  "UtensilsCrossed",
  "Car",
  "ShoppingBag",
  "Film",
  "Receipt",
  "Heart",
  "GraduationCap",
  "Home",
  "Shield",
  "MoreHorizontal",
  "Target",
  "PiggyBank",
  "Palmtree",
  "Wallet",
  "CreditCard",
];

const colorOptions = [
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f59e0b" },
  { name: "Yellow", value: "#eab308" },
  { name: "Green", value: "#10b981" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Gray", value: "#6b7280" },
];

/* =========================
   COMPONENT
========================= */

export function TransactionCategoryDialog({
  open,
  onOpenChange,
  type,
  onCategoryCreated,
}: TransactionCategoryDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),

    defaultValues: {
      name: "",
      type: type,
      icon: "Folder",
      color: "#3b82f6",
    },
  });

  const selectedIcon = form.watch("icon");
  const selectedColor = form.watch("color");

  /* =========================
     RESET WHEN OPENED
  ========================= */

  useEffect(() => {
    if (!open) return;

    form.reset({
      name: "",
      type: type,
      icon: "Folder",
      color: "#3b82f6",
    });
  }, [open, type, form]);

  /* =========================
     CREATE CATEGORY
  ========================= */

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setIsSubmitting(true);

      const response =
        await apiFetch<CreateCategoryResponse>(
          "/categories",
          {
            method: "POST",
            body: JSON.stringify({
              name: data.name.trim(),
              type: data.type,
              icon: data.icon || "Folder",
              color: data.color || "#3b82f6",
            }),
          },
        );

      const category = response.data;

      toast.success(
        `"${category.name}" category created`,
      );

      /*
       * Give the parent the actual database
       * category so it can assign it to the
       * imported transaction.
       */
      onCategoryCreated?.(category);

      onOpenChange(false);

      form.reset({
        name: "",
        type: type,
        icon: "Folder",
        color: "#3b82f6",
      });
    } catch (error: any) {
      console.error(
        "Create transaction category error:",
        error,
      );

      toast.error(
        error?.error ||
        error?.message ||
        "Failed to create category",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (isSubmitting) return;
        onOpenChange(value);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Add New Category
          </DialogTitle>

          <DialogDescription>
            Create a category for this imported
            transaction.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
          >
            {/* =========================
                CATEGORY NAME
            ========================= */}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Category Name
                  </FormLabel>

                  <FormControl>
                    <Input
                      placeholder="e.g. Groceries"
                      autoFocus
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* =========================
                TYPE
            ========================= */}

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Transaction Type
                  </FormLabel>

                  <FormControl>
                    <div className="flex h-10 items-center rounded-md border bg-muted px-3 text-sm">
                      {field.value === "expense"
                        ? "Expense"
                        : field.value === "income"
                          ? "Income"
                          : "Transfer"}
                    </div>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* =========================
                ICON
            ========================= */}

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Icon
                  </FormLabel>

                  <FormControl>
                    <div className="grid grid-cols-5 gap-2">
                      {popularIcons.map(
                        (iconName) => {
                          const Icon =
                            (
                              LucideIcons as Record<
                                string,
                                any
                              >
                            )[iconName];

                          return (
                            <button
                              key={iconName}
                              type="button"
                              title={iconName}
                              onClick={() =>
                                field.onChange(
                                  iconName,
                                )
                              }
                              className={`
                                flex h-11 w-11
                                items-center
                                justify-center
                                rounded-lg
                                border
                                transition
                                ${selectedIcon ===
                                  iconName
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:border-primary/50"
                                }
                              `}
                            >
                              {Icon && (
                                <Icon className="h-5 w-5" />
                              )}
                            </button>
                          );
                        },
                      )}
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* =========================
                COLOR
            ========================= */}

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Color
                  </FormLabel>

                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map(
                        (color) => (
                          <button
                            key={color.value}
                            type="button"
                            title={color.name}
                            onClick={() =>
                              field.onChange(
                                color.value,
                              )
                            }
                            className={`
                              h-9 w-9
                              rounded-lg
                              border-2
                              transition
                              ${selectedColor ===
                                color.value
                                ? "border-foreground scale-110"
                                : "border-transparent"
                              }
                            `}
                            style={{
                              backgroundColor:
                                color.value,
                            }}
                          />
                        ),
                      )}
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* =========================
                ACTIONS
            ========================= */}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() =>
                  onOpenChange(false)
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Creating..."
                  : "Create Category"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}