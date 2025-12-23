// import { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
// import { Button } from "@/components/ui/button.tsx";
// import { Input } from "@/components/ui/input.tsx";
// import { Label } from "@/components/ui/label.tsx";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
// import { Search, X, Calendar, DollarSign, Tag, Filter } from "lucide-react";
// import { startOfWeek, startOfMonth, subDays, startOfDay, endOfDay } from "date-fns";
// import type { Doc, Id } from "@/convex/_generated/dataModel.d.ts";

// interface TransactionFiltersProps {
//   transactions: Doc<"transactions">[];
//   accounts: Doc<"accounts">[];
//   onFilteredTransactionsChange: (filtered: Doc<"transactions">[]) => void;
// }

// type DatePreset = "all" | "today" | "week" | "month" | "30days" | "custom";

// export default function TransactionFilters({
//   transactions,
//   accounts,
//   onFilteredTransactionsChange,
// }: TransactionFiltersProps) {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [datePreset, setDatePreset] = useState<DatePreset>("all");
//   const [customStartDate, setCustomStartDate] = useState("");
//   const [customEndDate, setCustomEndDate] = useState("");
//   const [selectedType, setSelectedType] = useState<"all" | "income" | "expense">("all");
//   const [selectedCategory, setSelectedCategory] = useState<string>("all");
//   const [selectedAccount, setSelectedAccount] = useState<string>("all");
//   const [minAmount, setMinAmount] = useState("");
//   const [maxAmount, setMaxAmount] = useState("");

//   // Get unique categories from transactions
//   const categories = Array.from(new Set(transactions.map((t) => t.category))).sort();

//   // Auto-apply filters when any filter changes
//   useEffect(() => {
//     applyFilters();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [
//     searchQuery,
//     datePreset,
//     customStartDate,
//     customEndDate,
//     selectedType,
//     selectedCategory,
//     selectedAccount,
//     minAmount,
//     maxAmount,
//     transactions,
//   ]);

//   const applyFilters = () => {
//     let filtered = [...transactions];

//     // Search filter (description)
//     if (searchQuery.trim()) {
//       const query = searchQuery.toLowerCase();
//       filtered = filtered.filter((t) =>
//         t.description.toLowerCase().includes(query)
//       );
//     }

//     // Date range filter
//     if (datePreset !== "all") {
//       const now = Date.now();
//       let startDate = 0;
//       let endDate = now;

//       switch (datePreset) {
//         case "today":
//           startDate = startOfDay(new Date()).getTime();
//           endDate = endOfDay(new Date()).getTime();
//           break;
//         case "week":
//           startDate = startOfWeek(new Date()).getTime();
//           break;
//         case "month":
//           startDate = startOfMonth(new Date()).getTime();
//           break;
//         case "30days":
//           startDate = subDays(new Date(), 30).getTime();
//           break;
//         case "custom":
//           if (customStartDate) {
//             startDate = new Date(customStartDate).getTime();
//           }
//           if (customEndDate) {
//             endDate = endOfDay(new Date(customEndDate)).getTime();
//           }
//           break;
//       }

//       filtered = filtered.filter((t) => t.date >= startDate && t.date <= endDate);
//     }

//     // Type filter
//     if (selectedType !== "all") {
//       filtered = filtered.filter((t) => t.type === selectedType);
//     }

//     // Category filter
//     if (selectedCategory !== "all") {
//       filtered = filtered.filter((t) => t.category === selectedCategory);
//     }

//     // Account filter
//     if (selectedAccount !== "all") {
//       if (selectedAccount === "none") {
//         filtered = filtered.filter((t) => !t.accountId);
//       } else {
//         filtered = filtered.filter((t) => t.accountId === selectedAccount);
//       }
//     }

//     // Amount range filter
//     if (minAmount) {
//       const min = parseFloat(minAmount);
//       if (!isNaN(min)) {
//         filtered = filtered.filter((t) => t.amount >= min);
//       }
//     }
//     if (maxAmount) {
//       const max = parseFloat(maxAmount);
//       if (!isNaN(max)) {
//         filtered = filtered.filter((t) => t.amount <= max);
//       }
//     }

//     onFilteredTransactionsChange(filtered);
//   };

//   const clearFilters = () => {
//     setSearchQuery("");
//     setDatePreset("all");
//     setCustomStartDate("");
//     setCustomEndDate("");
//     setSelectedType("all");
//     setSelectedCategory("all");
//     setSelectedAccount("all");
//     setMinAmount("");
//     setMaxAmount("");
//     onFilteredTransactionsChange(transactions);
//   };

//   const hasActiveFilters =
//     searchQuery ||
//     datePreset !== "all" ||
//     selectedType !== "all" ||
//     selectedCategory !== "all" ||
//     selectedAccount !== "all" ||
//     minAmount ||
//     maxAmount;

//   return (
//     <Card className="glass-card mb-6">
//       <CardHeader>
//         <div className="flex items-center justify-between">
//           <CardTitle className="flex items-center gap-2">
//             <Filter className="h-5 w-5" />
//             Filter Transactions
//           </CardTitle>
//           {hasActiveFilters && (
//             <Button variant="outline" size="sm" onClick={clearFilters}>
//               <X className="h-4 w-4 mr-1" />
//               Clear Filters
//             </Button>
//           )}
//         </div>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         {/* Search */}
//         <div className="space-y-2">
//           <Label htmlFor="search" className="flex items-center gap-2">
//             <Search className="h-4 w-4" />
//             Search Description
//           </Label>
//           <Input
//             id="search"
//             placeholder="Search transactions..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="glass"
//           />
//         </div>

//         {/* Date Range */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="space-y-2">
//             <Label htmlFor="datePreset" className="flex items-center gap-2">
//               <Calendar className="h-4 w-4" />
//               Date Range
//             </Label>
//             <Select value={datePreset} onValueChange={(value) => setDatePreset(value as DatePreset)}>
//               <SelectTrigger id="datePreset" className="glass">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Time</SelectItem>
//                 <SelectItem value="today">Today</SelectItem>
//                 <SelectItem value="week">This Week</SelectItem>
//                 <SelectItem value="month">This Month</SelectItem>
//                 <SelectItem value="30days">Last 30 Days</SelectItem>
//                 <SelectItem value="custom">Custom Range</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {datePreset === "custom" && (
//             <>
//               <div className="space-y-2">
//                 <Label htmlFor="startDate">Start Date</Label>
//                 <Input
//                   id="startDate"
//                   type="date"
//                   value={customStartDate}
//                   onChange={(e) => setCustomStartDate(e.target.value)}
//                   className="glass"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="endDate">End Date</Label>
//                 <Input
//                   id="endDate"
//                   type="date"
//                   value={customEndDate}
//                   onChange={(e) => setCustomEndDate(e.target.value)}
//                   className="glass"
//                 />
//               </div>
//             </>
//           )}
//         </div>

//         {/* Type, Category, Account */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="space-y-2">
//             <Label htmlFor="type">Type</Label>
//             <Select value={selectedType} onValueChange={(value) => setSelectedType(value as typeof selectedType)}>
//               <SelectTrigger id="type" className="glass">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Types</SelectItem>
//                 <SelectItem value="income">Income</SelectItem>
//                 <SelectItem value="expense">Expense</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="category" className="flex items-center gap-2">
//               <Tag className="h-4 w-4" />
//               Category
//             </Label>
//             <Select value={selectedCategory} onValueChange={setSelectedCategory}>
//               <SelectTrigger id="category" className="glass">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Categories</SelectItem>
//                 {categories.map((cat) => (
//                   <SelectItem key={cat} value={cat}>
//                     {cat}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="account">Account</Label>
//             <Select value={selectedAccount} onValueChange={setSelectedAccount}>
//               <SelectTrigger id="account" className="glass">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Accounts</SelectItem>
//                 <SelectItem value="none">No Account</SelectItem>
//                 {accounts.map((acc) => (
//                   <SelectItem key={acc._id} value={acc._id}>
//                     {acc.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </div>

//         {/* Amount Range */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <Label htmlFor="minAmount" className="flex items-center gap-2">
//               <DollarSign className="h-4 w-4" />
//               Min Amount
//             </Label>
//             <Input
//               id="minAmount"
//               type="number"
//               step="0.01"
//               placeholder="0.00"
//               value={minAmount}
//               onChange={(e) => setMinAmount(e.target.value)}
//               className="glass"
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="maxAmount">Max Amount</Label>
//             <Input
//               id="maxAmount"
//               type="number"
//               step="0.01"
//               placeholder="999999.99"
//               value={maxAmount}
//               onChange={(e) => setMaxAmount(e.target.value)}
//               className="glass"
//             />
//           </div>
//         </div>

//         {/* Results info - removed Apply button since filters auto-apply */}
//       </CardContent>
//     </Card>
//   );
// }