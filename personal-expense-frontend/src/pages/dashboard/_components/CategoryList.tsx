// import { useQuery, useMutation } from "convex/react";
// import { api } from "@/convex/_generated/api.js";
// import type { Doc, Id } from "@/convex/_generated/dataModel.d.ts";
// import { Button } from "@/components/ui/button.tsx";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card.tsx";
// import {
//   Empty,
//   EmptyContent,
//   EmptyDescription,
//   EmptyHeader,
//   EmptyMedia,
//   EmptyTitle,
// } from "@/components/ui/empty.tsx";
// import { Badge } from "@/components/ui/badge.tsx";
// import { Skeleton } from "@/components/ui/skeleton.tsx";
// import {
//   FolderIcon,
//   PencilIcon,
//   Trash2Icon,
//   LockIcon,
// } from "lucide-react";
// import { toast } from "sonner";
// import { ConvexError } from "convex/values";
// import * as LucideIcons from "lucide-react";
// import { useEffect } from "react";

// interface CategoryListProps {
//   categories: Doc<"categories">[];
//   onEdit: (id: Id<"categories">) => void;
// }

// export function CategoryList({ categories, onEdit }: CategoryListProps) {
//   const removeCategory = useMutation(api.categories.remove);
//   const initializeDefaults = useMutation(api.categories.initializeDefaults);

//   // Initialize default categories on first load if empty
//   useEffect(() => {
//     if (categories !== undefined && categories.length === 0) {
//       initializeDefaults({});
//     }
//   }, [categories, initializeDefaults]);

//   const handleDelete = async (id: Id<"categories">) => {
//     try {
//       await removeCategory({ id });
//       toast.success("Category deleted");
//     } catch (error) {
//       if (error instanceof ConvexError) {
//         const { message } = error.data as { code: string; message: string };
//         toast.error(`Error: ${message}`);
//       } else {
//         toast.error("Failed to delete category");
//       }
//     }
//   };

//   if (categories === undefined) {
//     return (
//       <div className="space-y-4">
//         {Array.from({ length: 3 }).map((_, i) => (
//           <Skeleton key={i} className="h-32 w-full" />
//         ))}
//       </div>
//     );
//   }

//   if (categories.length === 0) {
//     return (
//       <Empty>
//         <EmptyHeader>
//           <EmptyMedia variant="icon">
//             <FolderIcon />
//           </EmptyMedia>
//           <EmptyTitle>No categories yet</EmptyTitle>
//           <EmptyDescription>
//             Create custom categories to organize your finances
//           </EmptyDescription>
//         </EmptyHeader>
//       </Empty>
//     );
//   }

//   const incomeCategories = categories.filter((c) => c.type === "income");
//   const expenseCategories = categories.filter((c) => c.type === "expense");
//   const goalCategories = categories.filter((c) => c.type === "goal");

//   const renderCategoryCard = (category: Doc<"categories">) => {
//     // Get the icon component dynamically
//     const IconComponent = category.icon && category.icon in LucideIcons
//       ? (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[category.icon]
//       : FolderIcon;

//     return (
//       <Card key={category._id} className="glass-card">
//         <CardContent className="p-4">
//           <div className="flex items-center gap-3">
//             <div
//               className="flex h-10 w-10 items-center justify-center rounded-lg"
//               style={{
//                 backgroundColor: category.color
//                   ? `${category.color}20`
//                   : "hsl(var(--muted))",
//               }}
//             >
//               {IconComponent && (
//                 <IconComponent
//                   className="h-5 w-5"
//                   style={{ color: category.color || "hsl(var(--foreground))" }}
//                 />
//               )}
//             </div>
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center gap-2">
//                 <h3 className="font-medium truncate">{category.name}</h3>
//                 {category.isDefault && (
//                   <LockIcon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
//                 )}
//               </div>
//               <p className="text-sm text-muted-foreground capitalize">
//                 {category.type}
//               </p>
//             </div>
//             <div className="flex gap-1">
//               <Button
//                 size="sm"
//                 variant="ghost"
//                 onClick={() => onEdit(category._id)}
//               >
//                 <PencilIcon className="h-4 w-4" />
//               </Button>
//               {!category.isDefault && (
//                 <Button
//                   size="sm"
//                   variant="ghost"
//                   onClick={() => handleDelete(category._id)}
//                 >
//                   <Trash2Icon className="h-4 w-4" />
//                 </Button>
//               )}
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   };

//   return (
//     <div className="space-y-6">
//       {incomeCategories.length > 0 && (
//         <div>
//           <h3 className="mb-3 text-sm font-medium text-muted-foreground">
//             Income Categories ({incomeCategories.length})
//           </h3>
//           <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
//             {incomeCategories.map(renderCategoryCard)}
//           </div>
//         </div>
//       )}

//       {expenseCategories.length > 0 && (
//         <div>
//           <h3 className="mb-3 text-sm font-medium text-muted-foreground">
//             Expense Categories ({expenseCategories.length})
//           </h3>
//           <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
//             {expenseCategories.map(renderCategoryCard)}
//           </div>
//         </div>
//       )}

//       {goalCategories.length > 0 && (
//         <div>
//           <h3 className="mb-3 text-sm font-medium text-muted-foreground">
//             Goal Categories ({goalCategories.length})
//           </h3>
//           <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
//             {goalCategories.map(renderCategoryCard)}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }