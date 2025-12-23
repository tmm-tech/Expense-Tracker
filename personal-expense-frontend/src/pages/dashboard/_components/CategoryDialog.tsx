// import { useMutation } from "convex/react";
// import { api } from "@/convex/_generated/api.js";
// import type { Doc, Id } from "@/convex/_generated/dataModel.d.ts";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog.tsx";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form.tsx";
// import { Input } from "@/components/ui/input.tsx";
// import { Button } from "@/components/ui/button.tsx";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select.tsx";
// import { toast } from "sonner";
// import { ConvexError } from "convex/values";
// import { useState } from "react";
// import * as LucideIcons from "lucide-react";

// const categorySchema = z.object({
//   name: z.string().min(1, "Name is required"),
//   type: z.enum(["income", "expense", "goal"]),
//   icon: z.string().optional(),
//   color: z.string().optional(),
// });

// type CategoryFormData = z.infer<typeof categorySchema>;

// interface CategoryDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   editingId?: Id<"categories"> | null;
//   categories: Doc<"categories">[];
// }

// const popularIcons = [
//   "DollarSign", "Briefcase", "Laptop", "TrendingUp", "Building",
//   "UtensilsCrossed", "Car", "ShoppingBag", "Film", "Receipt",
//   "Heart", "GraduationCap", "Home", "Shield", "MoreHorizontal",
//   "Target", "PiggyBank", "Palmtree", "Wallet", "CreditCard",
// ];

// const colorOptions = [
//   { name: "Red", value: "#ef4444" },
//   { name: "Orange", value: "#f59e0b" },
//   { name: "Yellow", value: "#eab308" },
//   { name: "Green", value: "#10b981" },
//   { name: "Blue", value: "#3b82f6" },
//   { name: "Indigo", value: "#6366f1" },
//   { name: "Purple", value: "#8b5cf6" },
//   { name: "Pink", value: "#ec4899" },
//   { name: "Gray", value: "#6b7280" },
// ];

// export function CategoryDialog({
//   open,
//   onOpenChange,
//   editingId,
//   categories,
// }: CategoryDialogProps) {
//   const createCategory = useMutation(api.categories.create);
//   const updateCategory = useMutation(api.categories.update);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const editingCategory = editingId
//     ? categories.find((c) => c._id === editingId)
//     : null;

//   const form = useForm<CategoryFormData>({
//     resolver: zodResolver(categorySchema),
//     defaultValues: editingCategory
//       ? {
//           name: editingCategory.name,
//           type: editingCategory.type,
//           icon: editingCategory.icon || "",
//           color: editingCategory.color || "",
//         }
//       : {
//           name: "",
//           type: "expense",
//           icon: "FolderIcon",
//           color: "#3b82f6",
//         },
//   });

//   const selectedIcon = form.watch("icon");
//   const selectedColor = form.watch("color");

//   const onSubmit = async (data: CategoryFormData) => {
//     setIsSubmitting(true);
//     try {
//       if (editingCategory) {
//         await updateCategory({
//           id: editingCategory._id,
//           name: data.name,
//           icon: data.icon,
//           color: data.color,
//         });
//         toast.success("Category updated");
//       } else {
//         await createCategory({
//           name: data.name,
//           type: data.type,
//           icon: data.icon,
//           color: data.color,
//         });
//         toast.success("Category created");
//       }

//       form.reset();
//       onOpenChange(false);
//     } catch (error) {
//       if (error instanceof ConvexError) {
//         const { message } = error.data as { code: string; message: string };
//         toast.error(`Error: ${message}`);
//       } else {
//         toast.error(
//           `Failed to ${editingCategory ? "update" : "create"} category`
//         );
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="glass-strong max-w-md">
//         <DialogHeader>
//           <DialogTitle>
//             {editingCategory ? "Edit" : "New"} Category
//           </DialogTitle>
//           <DialogDescription>
//             Create custom categories to organize your finances
//           </DialogDescription>
//         </DialogHeader>

//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//             <FormField
//               control={form.control}
//               name="name"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Category Name</FormLabel>
//                   <FormControl>
//                     <Input placeholder="e.g. Groceries, Gym" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {!editingCategory && (
//               <FormField
//                 control={form.control}
//                 name="type"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Type</FormLabel>
//                     <Select
//                       onValueChange={field.onChange}
//                       defaultValue={field.value}
//                     >
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select type" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         <SelectItem value="income">Income</SelectItem>
//                         <SelectItem value="expense">Expense</SelectItem>
//                         <SelectItem value="goal">Goal</SelectItem>
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}

//             <FormField
//               control={form.control}
//               name="icon"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Icon</FormLabel>
//                   <FormControl>
//                     <div className="grid grid-cols-5 gap-2">
//                       {popularIcons.map((iconName) => {
//                         const Icon = iconName in LucideIcons
//                           ? (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName]
//                           : undefined;
//                         return (
//                           <button
//                             key={iconName}
//                             type="button"
//                             onClick={() => field.onChange(iconName)}
//                             className={`flex h-12 w-12 items-center justify-center rounded-lg border transition-colors ${
//                               selectedIcon === iconName
//                                 ? "border-primary bg-primary/10"
//                                 : "border-border hover:border-primary/50"
//                             }`}
//                           >
//                             {Icon && <Icon className="h-5 w-5" />}
//                           </button>
//                         );
//                       })}
//                     </div>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="color"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Color</FormLabel>
//                   <FormControl>
//                     <div className="flex flex-wrap gap-2">
//                       {colorOptions.map((color) => (
//                         <button
//                           key={color.value}
//                           type="button"
//                           onClick={() => field.onChange(color.value)}
//                           className={`h-10 w-10 rounded-lg border-2 transition-all ${
//                             selectedColor === color.value
//                               ? "border-foreground scale-110"
//                               : "border-transparent"
//                           }`}
//                           style={{ backgroundColor: color.value }}
//                           title={color.name}
//                         />
//                       ))}
//                     </div>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <div className="flex justify-end gap-3 pt-4">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => onOpenChange(false)}
//                 disabled={isSubmitting}
//               >
//                 Cancel
//               </Button>
//               <Button type="submit" disabled={isSubmitting}>
//                 {isSubmitting
//                   ? "Saving..."
//                   : editingCategory
//                     ? "Update"
//                     : "Create"}
//               </Button>
//             </div>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// }