// import { Button } from "@/components/ui/button.tsx";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
// import { Input } from "@/components/ui/input.tsx";
// import { Upload, AlertCircle, CheckCircle } from "lucide-react";
// import { useAction } from "convex/react";
// import { api } from "@/convex/_generated/api.js";
// import { useState } from "react";
// import { toast } from "sonner";

// export function CSVImport() {
//   const [isImporting, setIsImporting] = useState(false);
//   const [importType, setImportType] = useState<"transactions" | "budgets" | "investments" | null>(null);
//   const [result, setResult] = useState<{
//     imported: number;
//     total: number;
//     errors: string[];
//   } | null>(null);

//   const importTransactions = useAction(api.csvImport.importTransactions);
//   const importBudgets = useAction(api.csvImport.importBudgets);
//   const importInvestments = useAction(api.csvImport.importInvestments);

//   const handleFileChange = async (
//     event: React.ChangeEvent<HTMLInputElement>,
//     type: "transactions" | "budgets" | "investments"
//   ) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     // Validate file type
//     if (!file.name.endsWith(".csv")) {
//       toast.error("Please upload a CSV file");
//       event.target.value = "";
//       return;
//     }

//     // Validate file size (5MB max)
//     if (file.size > 5 * 1024 * 1024) {
//       toast.error("File size must be less than 5MB");
//       event.target.value = "";
//       return;
//     }

//     setIsImporting(true);
//     setImportType(type);
//     setResult(null);

//     try {
//       const csvContent = await file.text();
//       let importResult;

//       switch (type) {
//         case "transactions":
//           importResult = await importTransactions({ csvContent });
//           break;
//         case "budgets":
//           importResult = await importBudgets({ csvContent });
//           break;
//         case "investments":
//           importResult = await importInvestments({ csvContent });
//           break;
//       }

//       setResult(importResult);

//       if (importResult.imported > 0) {
//         toast.success(`Successfully imported ${importResult.imported} ${type}`);
//       }

//       if (importResult.errors.length > 0) {
//         toast.warning(`${importResult.errors.length} rows had errors`);
//       }
//     } catch (error) {
//       toast.error(`Import failed: ${error instanceof Error ? error.message : "Unknown error"}`);
//     } finally {
//       setIsImporting(false);
//       event.target.value = "";
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <Card>
//         <CardHeader>
//           <CardTitle>Import Transactions</CardTitle>
//           <CardDescription>
//             Upload a CSV file with columns: Date, Type, Category, Amount, Description
//             <br />
//             <span className="text-xs">Date format: yyyy-mm-dd, Type: income or expense</span>
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="flex items-center gap-2">
//             <Input
//               type="file"
//               accept=".csv"
//               onChange={(e) => handleFileChange(e, "transactions")}
//               disabled={isImporting && importType === "transactions"}
//               className="flex-1"
//             />
//             <Upload className="w-4 h-4 text-muted-foreground" />
//           </div>
//           {isImporting && importType === "transactions" && (
//             <p className="text-sm text-muted-foreground">Importing transactions...</p>
//           )}
//           {result && importType === "transactions" && (
//             <ImportResult result={result} />
//           )}
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Import Budgets</CardTitle>
//           <CardDescription>
//             Upload a CSV file with columns: Category, Limit, Period, Start Date
//             <br />
//             <span className="text-xs">Period: weekly, monthly, or yearly. Date format: yyyy-mm-dd</span>
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="flex items-center gap-2">
//             <Input
//               type="file"
//               accept=".csv"
//               onChange={(e) => handleFileChange(e, "budgets")}
//               disabled={isImporting && importType === "budgets"}
//               className="flex-1"
//             />
//             <Upload className="w-4 h-4 text-muted-foreground" />
//           </div>
//           {isImporting && importType === "budgets" && (
//             <p className="text-sm text-muted-foreground">Importing budgets...</p>
//           )}
//           {result && importType === "budgets" && (
//             <ImportResult result={result} />
//           )}
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Import Investments</CardTitle>
//           <CardDescription>
//             Upload a CSV file with columns: Type, Name, Symbol, Quantity, Purchase Price, Current Price, Purchase Date
//             <br />
//             <span className="text-xs">Type: Stocks, Bonds, Crypto, Real Estate, Mutual Funds, ETFs, or Other</span>
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="flex items-center gap-2">
//             <Input
//               type="file"
//               accept=".csv"
//               onChange={(e) => handleFileChange(e, "investments")}
//               disabled={isImporting && importType === "investments"}
//               className="flex-1"
//             />
//             <Upload className="w-4 h-4 text-muted-foreground" />
//           </div>
//           {isImporting && importType === "investments" && (
//             <p className="text-sm text-muted-foreground">Importing investments...</p>
//           )}
//           {result && importType === "investments" && (
//             <ImportResult result={result} />
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// function ImportResult({ result }: { result: { imported: number; total: number; errors: string[] } }) {
//   return (
//     <div className="space-y-3">
//       <div className="rounded border border-accent bg-accent/10 p-3">
//         <div className="flex items-center gap-2 text-sm font-medium text-accent">
//           <CheckCircle className="h-4 w-4" />
//           Successfully imported {result.imported} of {result.total} records
//         </div>
//       </div>
//       {result.errors.length > 0 && (
//         <div className="rounded border border-destructive bg-destructive/10 p-3">
//           <div className="mb-2 flex items-center gap-2 text-sm font-medium text-destructive">
//             <AlertCircle className="h-4 w-4" />
//             Errors ({result.errors.length})
//           </div>
//           <div className="max-h-40 space-y-1 overflow-y-auto">
//             {result.errors.slice(0, 10).map((error, i) => (
//               <p key={i} className="text-xs text-destructive">
//                 {error}
//               </p>
//             ))}
//             {result.errors.length > 10 && (
//               <p className="text-xs text-muted-foreground">
//                 ...and {result.errors.length - 10} more errors
//               </p>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }