// import { Button } from "@/components/ui/button.tsx";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
// import { Download } from "lucide-react";
// import { useQuery } from "convex/react";
// import { api } from "@/convex/_generated/api.js";
// import Papa from "papaparse";
// import { format } from "date-fns";
// import { toast } from "sonner";

// export function CSVExport() {
//   const transactions = useQuery(api.transactions.list);
//   const budgets = useQuery(api.budgets.list);
//   const investments = useQuery(api.investments.list);

//   const exportTransactions = () => {
//     if (!transactions || transactions.length === 0) {
//       toast.error("No transactions to export");
//       return;
//     }

//     const exportData = transactions.map((t) => ({
//       Date: format(t.date, "yyyy-MM-dd"),
//       Type: t.type,
//       Category: t.category,
//       Amount: t.amount,
//       Description: t.description,
//     }));

//     const csv = Papa.unparse(exportData);
//     downloadCSV(csv, `transactions-${format(new Date(), "yyyy-MM-dd")}.csv`);
//     toast.success("Transactions exported successfully");
//   };

//   const exportBudgets = () => {
//     if (!budgets || budgets.length === 0) {
//       toast.error("No budgets to export");
//       return;
//     }

//     const exportData = budgets.map((b) => ({
//       Category: b.category,
//       Limit: b.limit,
//       Period: b.period,
//       "Start Date": format(b.startDate, "yyyy-MM-dd"),
//     }));

//     const csv = Papa.unparse(exportData);
//     downloadCSV(csv, `budgets-${format(new Date(), "yyyy-MM-dd")}.csv`);
//     toast.success("Budgets exported successfully");
//   };

//   const exportInvestments = () => {
//     if (!investments || investments.length === 0) {
//       toast.error("No investments to export");
//       return;
//     }

//     const exportData = investments.map((i) => ({
//       Type: i.type,
//       Name: i.name,
//       Symbol: i.symbol || "",
//       Quantity: i.quantity,
//       "Purchase Price": i.purchasePrice,
//       "Current Price": i.currentPrice,
//       "Purchase Date": format(i.purchaseDate, "yyyy-MM-dd"),
//     }));

//     const csv = Papa.unparse(exportData);
//     downloadCSV(csv, `investments-${format(new Date(), "yyyy-MM-dd")}.csv`);
//     toast.success("Investments exported successfully");
//   };

//   const downloadCSV = (csv: string, filename: string) => {
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = filename;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <div className="space-y-4">
//       <Card>
//         <CardHeader>
//           <CardTitle>Export Transactions</CardTitle>
//           <CardDescription>
//             Download all your transactions as a CSV file
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Button onClick={exportTransactions} className="gap-2" disabled={!transactions}>
//             <Download className="w-4 h-4" />
//             Export Transactions ({transactions?.length || 0} records)
//           </Button>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Export Budgets</CardTitle>
//           <CardDescription>
//             Download all your budgets as a CSV file
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Button onClick={exportBudgets} className="gap-2" disabled={!budgets}>
//             <Download className="w-4 h-4" />
//             Export Budgets ({budgets?.length || 0} records)
//           </Button>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Export Investments</CardTitle>
//           <CardDescription>
//             Download all your investments as a CSV file
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Button onClick={exportInvestments} className="gap-2" disabled={!investments}>
//             <Download className="w-4 h-4" />
//             Export Investments ({investments?.length || 0} records)
//           </Button>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }