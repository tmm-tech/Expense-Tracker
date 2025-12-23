// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog.tsx";
// import { Button } from "@/components/ui/button.tsx";
// import { Input } from "@/components/ui/input.tsx";
// import { Label } from "@/components/ui/label.tsx";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
// import { Textarea } from "@/components/ui/textarea.tsx";
// import { useMutation } from "convex/react";
// import { api } from "@/convex/_generated/api.js";
// import { toast } from "sonner";
// import { useState, useEffect } from "react";
// import { format } from "date-fns";
// import type { Doc, Id } from "@/convex/_generated/dataModel.d.ts";

// interface TransactionDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   editingId: Id<"transactions"> | null;
//   transactions: Doc<"transactions">[];
//   accounts: Doc<"accounts">[];
// }

// const INCOME_CATEGORIES = [
//   "Salary",
//   "Freelance",
//   "Business",
//   "Investment",
//   "Gift",
//   "Other Income",
// ];

// const EXPENSE_CATEGORIES = [
//   "Food & Dining",
//   "Transportation",
//   "Shopping",
//   "Entertainment",
//   "Bills & Utilities",
//   "Healthcare",
//   "Education",
//   "Travel",
//   "Other Expense",
// ];

// export function TransactionDialog({
//   open,
//   onOpenChange,
//   editingId,
//   transactions,
//   accounts,
// }: TransactionDialogProps) {
//   const createTransaction = useMutation(api.transactions.create);
//   const updateTransaction = useMutation(api.transactions.update);

//   const editingTransaction = editingId
//     ? transactions.find((t) => t._id === editingId)
//     : null;

//   const [type, setType] = useState<"income" | "expense">("expense");
//   const [category, setCategory] = useState("");
//   const [amount, setAmount] = useState("");
//   const [description, setDescription] = useState("");
//   const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
//   const [accountId, setAccountId] = useState<Id<"accounts"> | "">(""); 

//   useEffect(() => {
//     if (editingTransaction) {
//       setType(editingTransaction.type);
//       setCategory(editingTransaction.category);
//       setAmount(editingTransaction.amount.toString());
//       setDescription(editingTransaction.description);
//       setDate(format(editingTransaction.date, "yyyy-MM-dd"));
//       setAccountId(editingTransaction.accountId || "");
//     } else {
//       setType("expense");
//       setCategory("");
//       setAmount("");
//       setDescription("");
//       setDate(format(new Date(), "yyyy-MM-dd"));
//       setAccountId("");
//     }
//   }, [editingTransaction, open]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!category || !amount || !description) {
//       toast.error("Please fill in all fields");
//       return;
//     }

//     const amountNum = parseFloat(amount);
//     if (isNaN(amountNum) || amountNum <= 0) {
//       toast.error("Please enter a valid amount");
//       return;
//     }

//     try {
//       const dateTimestamp = new Date(date).getTime();

//       if (editingId) {
//         await updateTransaction({
//           id: editingId,
//           type,
//           category,
//           amount: amountNum,
//           description,
//           date: dateTimestamp,
//           accountId: accountId || undefined,
//         });
//         toast.success("Transaction updated");
//       } else {
//         await createTransaction({
//           type,
//           category,
//           amount: amountNum,
//           description,
//           date: dateTimestamp,
//           accountId: accountId || undefined,
//         });
//         toast.success("Transaction created");
//       }

//       onOpenChange(false);
//     } catch (error) {
//       toast.error("Failed to save transaction");
//     }
//   };

//   const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[500px]">
//         <DialogHeader>
//           <DialogTitle>
//             {editingId ? "Edit Transaction" : "Add Transaction"}
//           </DialogTitle>
//           <DialogDescription>
//             {editingId
//               ? "Update the transaction details"
//               : "Enter the details of your transaction"}
//           </DialogDescription>
//         </DialogHeader>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="type">Type</Label>
//             <Select
//               value={type}
//               onValueChange={(value: "income" | "expense") => {
//                 setType(value);
//                 setCategory("");
//               }}
//             >
//               <SelectTrigger id="type">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="income">Income</SelectItem>
//                 <SelectItem value="expense">Expense</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="category">Category</Label>
//             <Select value={category} onValueChange={setCategory}>
//               <SelectTrigger id="category">
//                 <SelectValue placeholder="Select a category" />
//               </SelectTrigger>
//               <SelectContent>
//                 {categories.map((cat) => (
//                   <SelectItem key={cat} value={cat}>
//                     {cat}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="account">Account (Optional)</Label>
//             <Select 
//               value={accountId.toString()} 
//               onValueChange={(value) => setAccountId(value === "none" ? "" : value as Id<"accounts">)}
//             >
//               <SelectTrigger id="account">
//                 <SelectValue placeholder="Select an account" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="none">No account</SelectItem>
//                 {accounts.map((account) => (
//                   <SelectItem key={account._id} value={account._id}>
//                     {account.name} ({account.type})
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="amount">Amount</Label>
//             <Input
//               id="amount"
//               type="number"
//               step="0.01"
//               placeholder="0.00"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="date">Date</Label>
//             <Input
//               id="date"
//               type="date"
//               value={date}
//               onChange={(e) => setDate(e.target.value)}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="description">Description</Label>
//             <Textarea
//               id="description"
//               placeholder="Enter transaction details"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               rows={3}
//             />
//           </div>

//           <div className="flex gap-3 pt-4">
//             <Button type="submit" className="flex-1">
//               {editingId ? "Update" : "Create"}
//             </Button>
//             <Button
//               type="button"
//               variant="secondary"
//               onClick={() => onOpenChange(false)}
//             >
//               Cancel
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }