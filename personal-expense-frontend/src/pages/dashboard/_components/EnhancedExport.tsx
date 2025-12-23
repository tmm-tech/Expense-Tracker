// import { useQuery } from "convex/react";
// import { api } from "@/convex/_generated/api.js";
// import { useState } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
// import { Button } from "@/components/ui/button.tsx";
// import { Badge } from "@/components/ui/badge.tsx";
// import { Skeleton } from "@/components/ui/skeleton.tsx";
// import { 
//   Download, 
//   FileJson, 
//   FileSpreadsheet,
//   Database,
//   CheckCircle2,
//   Calendar,
//   Package
// } from "lucide-react";
// import { Label } from "@/components/ui/label.tsx";
// import { Checkbox } from "@/components/ui/checkbox.tsx";
// import Papa from "papaparse";

// type DataType = 
//   | "accounts"
//   | "transactions"
//   | "budgets"
//   | "investments"
//   | "recurringTransactions"
//   | "goals"
//   | "categories"
//   | "bills"
//   | "debts"
//   | "debtPayments"
//   | "netWorthSnapshots";

// export default function EnhancedExport() {
//   const allData = useQuery(api.backup.getAllUserData);
//   const [selectedTypes, setSelectedTypes] = useState<Record<DataType, boolean>>({
//     accounts: true,
//     transactions: true,
//     budgets: true,
//     investments: true,
//     recurringTransactions: true,
//     goals: true,
//     categories: true,
//     bills: true,
//     debts: true,
//     debtPayments: true,
//     netWorthSnapshots: true,
//   });
//   const [exportSuccess, setExportSuccess] = useState(false);

//   const dataTypeLabels: Record<DataType, string> = {
//     accounts: "Accounts",
//     transactions: "Transactions",
//     budgets: "Budgets",
//     investments: "Investments",
//     recurringTransactions: "Recurring Transactions",
//     goals: "Goals",
//     categories: "Categories",
//     bills: "Bills",
//     debts: "Debts",
//     debtPayments: "Debt Payments",
//     netWorthSnapshots: "Net Worth Snapshots",
//   };

//   const toggleDataType = (type: DataType) => {
//     setSelectedTypes((prev) => ({
//       ...prev,
//       [type]: !prev[type],
//     }));
//   };

//   const selectAll = () => {
//     const allSelected: Record<DataType, boolean> = {
//       accounts: true,
//       transactions: true,
//       budgets: true,
//       investments: true,
//       recurringTransactions: true,
//       goals: true,
//       categories: true,
//       bills: true,
//       debts: true,
//       debtPayments: true,
//       netWorthSnapshots: true,
//     };
//     setSelectedTypes(allSelected);
//   };

//   const selectNone = () => {
//     const noneSelected: Record<DataType, boolean> = {
//       accounts: false,
//       transactions: false,
//       budgets: false,
//       investments: false,
//       recurringTransactions: false,
//       goals: false,
//       categories: false,
//       bills: false,
//       debts: false,
//       debtPayments: false,
//       netWorthSnapshots: false,
//     };
//     setSelectedTypes(noneSelected);
//   };

//   const exportAsJSON = () => {
//     if (!allData) return;

//     const selectedData: Record<string, unknown[]> = {};
//     Object.entries(selectedTypes).forEach(([type, isSelected]) => {
//       if (isSelected) {
//         selectedData[type] = allData.data[type as DataType];
//       }
//     });

//     const exportObject = {
//       exportDate: new Date(allData.exportDate).toISOString(),
//       exportFormat: "JSON",
//       user: allData.user,
//       data: selectedData,
//     };

//     const blob = new Blob([JSON.stringify(exportObject, null, 2)], {
//       type: "application/json",
//     });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = `aurex-backup-${new Date().toISOString().split("T")[0]}.json`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);

//     setExportSuccess(true);
//     setTimeout(() => setExportSuccess(false), 3000);
//   };

//   const exportAsCSV = () => {
//     if (!allData) return;

//     const zip: Record<string, string> = {};

//     Object.entries(selectedTypes).forEach(([type, isSelected]) => {
//       if (isSelected) {
//         const data = allData.data[type as DataType];
//         if (data.length > 0) {
//           // Convert data to CSV with proper type handling
//           // eslint-disable-next-line @typescript-eslint/no-explicit-any
//           const csv = Papa.unparse(data as any);
//           zip[`${type}.csv`] = csv;
//         }
//       }
//     });

//     // Create a simple multi-file download by creating separate files
//     Object.entries(zip).forEach(([filename, content]) => {
//       const blob = new Blob([content], { type: "text/csv" });
//       const url = URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = url;
//       link.download = `aurex-${filename}`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       URL.revokeObjectURL(url);
//     });

//     setExportSuccess(true);
//     setTimeout(() => setExportSuccess(false), 3000);
//   };

//   const exportFullBackup = () => {
//     if (!allData) return;

//     const fullBackup = {
//       version: "1.0",
//       exportDate: new Date(allData.exportDate).toISOString(),
//       exportFormat: "FULL_BACKUP",
//       application: "Aurex Finance Tracker",
//       user: allData.user,
//       data: allData.data,
//       statistics: allData.statistics,
//     };

//     const blob = new Blob([JSON.stringify(fullBackup, null, 2)], {
//       type: "application/json",
//     });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = `aurex-full-backup-${new Date().toISOString().split("T")[0]}.json`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);

//     setExportSuccess(true);
//     setTimeout(() => setExportSuccess(false), 3000);
//   };

//   if (!allData) {
//     return (
//       <div className="space-y-6">
//         <Skeleton className="h-32 w-full" />
//         <Skeleton className="h-96 w-full" />
//       </div>
//     );
//   }

//   const selectedCount = Object.values(selectedTypes).filter(Boolean).length;

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <Card className="glass-card border-primary/20">
//         <CardHeader>
//           <div className="flex items-center gap-3">
//             <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
//               <Download className="h-6 w-6 text-primary" />
//             </div>
//             <div>
//               <CardTitle>Enhanced Data Export & Backup</CardTitle>
//               <CardDescription>
//                 Export your financial data in multiple formats or create a complete backup
//               </CardDescription>
//             </div>
//           </div>
//         </CardHeader>
//       </Card>

//       {/* Success Message */}
//       {exportSuccess && (
//         <Card className="glass-card border-green-500/50 bg-green-500/10">
//           <CardContent className="pt-6">
//             <div className="flex items-center gap-2 text-green-500">
//               <CheckCircle2 className="h-5 w-5" />
//               <span className="font-semibold">Export completed successfully!</span>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Statistics */}
//       <div className="grid gap-4 md:grid-cols-3">
//         <Card className="glass-card">
//           <CardHeader className="pb-3">
//             <CardDescription className="flex items-center gap-2">
//               <Calendar className="h-4 w-4" />
//               Export Date
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <p className="text-2xl font-bold">
//               {new Date(allData.exportDate).toLocaleDateString()}
//             </p>
//           </CardContent>
//         </Card>

//         <Card className="glass-card">
//           <CardHeader className="pb-3">
//             <CardDescription className="flex items-center gap-2">
//               <Database className="h-4 w-4" />
//               Total Records
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <p className="text-2xl font-bold">
//               {Object.values(allData.statistics).reduce((a, b) => a + b, 0)}
//             </p>
//           </CardContent>
//         </Card>

//         <Card className="glass-card">
//           <CardHeader className="pb-3">
//             <CardDescription className="flex items-center gap-2">
//               <Package className="h-4 w-4" />
//               Data Categories
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <p className="text-2xl font-bold">11</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Quick Export Options */}
//       <Card className="glass-card">
//         <CardHeader>
//           <CardTitle>Quick Export</CardTitle>
//           <CardDescription>
//             Export all your data in one click
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid gap-3 md:grid-cols-3">
//             <Button
//               onClick={exportFullBackup}
//               className="gap-2 h-auto py-4 flex-col"
//               variant="outline"
//             >
//               <Database className="h-8 w-8" />
//               <div className="text-center">
//                 <div className="font-semibold">Full Backup</div>
//                 <div className="text-xs text-muted-foreground">
//                   Complete JSON backup with metadata
//                 </div>
//               </div>
//             </Button>

//             <Button
//               onClick={exportAsJSON}
//               className="gap-2 h-auto py-4 flex-col"
//               variant="outline"
//             >
//               <FileJson className="h-8 w-8" />
//               <div className="text-center">
//                 <div className="font-semibold">JSON Export</div>
//                 <div className="text-xs text-muted-foreground">
//                   Selected data as JSON
//                 </div>
//               </div>
//             </Button>

//             <Button
//               onClick={exportAsCSV}
//               className="gap-2 h-auto py-4 flex-col"
//               variant="outline"
//             >
//               <FileSpreadsheet className="h-8 w-8" />
//               <div className="text-center">
//                 <div className="font-semibold">CSV Export</div>
//                 <div className="text-xs text-muted-foreground">
//                   Separate CSV files per table
//                 </div>
//               </div>
//             </Button>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Custom Export */}
//       <Card className="glass-card">
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <div>
//               <CardTitle>Custom Export</CardTitle>
//               <CardDescription>
//                 Select specific data types to export
//               </CardDescription>
//             </div>
//             <div className="flex gap-2">
//               <Button variant="outline" size="sm" onClick={selectAll}>
//                 Select All
//               </Button>
//               <Button variant="outline" size="sm" onClick={selectNone}>
//                 Clear All
//               </Button>
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
//             {(Object.keys(dataTypeLabels) as DataType[]).map((type) => (
//               <div
//                 key={type}
//                 className="glass rounded-lg border border-border p-4 hover:border-primary/50 transition-colors"
//               >
//                 <div className="flex items-start justify-between gap-3">
//                   <div className="flex items-start space-x-3">
//                     <Checkbox
//                       id={type}
//                       checked={selectedTypes[type]}
//                       onCheckedChange={() => toggleDataType(type)}
//                     />
//                     <div>
//                       <Label
//                         htmlFor={type}
//                         className="font-medium cursor-pointer"
//                       >
//                         {dataTypeLabels[type]}
//                       </Label>
//                       <p className="text-sm text-muted-foreground">
//                         {allData.statistics[
//                           `total${
//                             type.charAt(0).toUpperCase() + type.slice(1)
//                           }` as keyof typeof allData.statistics
//                         ]}{" "}
//                         records
//                       </p>
//                     </div>
//                   </div>
//                   {selectedTypes[type] && (
//                     <Badge variant="secondary" className="text-xs">
//                       Selected
//                     </Badge>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="flex items-center justify-between pt-4 border-t border-border">
//             <p className="text-sm text-muted-foreground">
//               {selectedCount} of {Object.keys(dataTypeLabels).length} data types selected
//             </p>
//             <div className="flex gap-2">
//               <Button
//                 onClick={exportAsJSON}
//                 disabled={selectedCount === 0}
//                 variant="default"
//                 className="gap-2"
//               >
//                 <FileJson className="h-4 w-4" />
//                 Export as JSON
//               </Button>
//               <Button
//                 onClick={exportAsCSV}
//                 disabled={selectedCount === 0}
//                 variant="default"
//                 className="gap-2"
//               >
//                 <FileSpreadsheet className="h-4 w-4" />
//                 Export as CSV
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Export Details */}
//       <Card className="glass-card">
//         <CardHeader>
//           <CardTitle>What's Included</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid gap-3 md:grid-cols-2">
//             <div className="space-y-2">
//               <h4 className="font-semibold text-sm">Full Backup Includes:</h4>
//               <ul className="text-sm text-muted-foreground space-y-1">
//                 <li>• All financial data with complete metadata</li>
//                 <li>• User preferences and settings</li>
//                 <li>• Export timestamp and version info</li>
//                 <li>• Data statistics and summary</li>
//                 <li>• Structured for easy restoration</li>
//               </ul>
//             </div>
//             <div className="space-y-2">
//               <h4 className="font-semibold text-sm">Custom Export:</h4>
//               <ul className="text-sm text-muted-foreground space-y-1">
//                 <li>• Choose specific data categories</li>
//                 <li>• JSON format for developers</li>
//                 <li>• CSV format for spreadsheet apps</li>
//                 <li>• Lightweight and flexible</li>
//                 <li>• Easy to import to other tools</li>
//               </ul>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }