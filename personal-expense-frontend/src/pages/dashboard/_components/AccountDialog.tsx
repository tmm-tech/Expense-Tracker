// import { useEffect, useState } from "react";
// import { useMutation } from "convex/react";
// import { api } from "@/convex/_generated/api.js";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog.tsx";
// import { Button } from "@/components/ui/button.tsx";
// import { Input } from "@/components/ui/input.tsx";
// import { Label } from "@/components/ui/label.tsx";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
// import type { Doc, Id } from "@/convex/_generated/dataModel.d.ts";
// import { toast } from "sonner";

// interface AccountDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   editingId: Id<"accounts"> | null;
//   accounts: Doc<"accounts">[];
// }

// const ACCOUNT_TYPES = ["Bank", "MMF", "SACCO", "Cash", "Mobile Money", "Credit Card", "Other"] as const;

// const CURRENCY_OPTIONS = [
//   { value: "KES", label: "KES" },
//   { value: "USD", label: "USD" },
//   { value: "EUR", label: "EUR" },
//   { value: "GBP", label: "GBP" },
// ];

// export default function AccountDialog({ open, onOpenChange, editingId, accounts }: AccountDialogProps) {
//   const createAccount = useMutation(api.accounts.create);
//   const updateAccount = useMutation(api.accounts.update);

//   const [name, setName] = useState("");
//   const [type, setType] = useState<typeof ACCOUNT_TYPES[number]>("Bank");
//   const [institutionName, setInstitutionName] = useState("");
//   const [accountNumber, setAccountNumber] = useState("");
//   const [balance, setBalance] = useState("");
//   const [currency, setCurrency] = useState("KES");

//   const editingAccount = editingId ? accounts.find((a) => a._id === editingId) : null;

//   useEffect(() => {
//     if (editingAccount) {
//       setName(editingAccount.name);
//       setType(editingAccount.type);
//       setInstitutionName(editingAccount.institutionName || "");
//       setAccountNumber(editingAccount.accountNumber || "");
//       setBalance(editingAccount.balance.toString());
//       setCurrency(editingAccount.currency || "KES");
//     } else {
//       setName("");
//       setType("Bank");
//       setInstitutionName("");
//       setAccountNumber("");
//       setBalance("");
//       setCurrency("KES");
//     }
//   }, [editingAccount, open]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!name.trim() || !balance) {
//       toast.error("Please fill in all required fields");
//       return;
//     }

//     const balanceNum = parseFloat(balance);
//     if (isNaN(balanceNum)) {
//       toast.error("Please enter a valid balance");
//       return;
//     }

//     try {
//       if (editingId) {
//         await updateAccount({
//           id: editingId,
//           name: name.trim(),
//           type,
//           institutionName: institutionName.trim() || undefined,
//           accountNumber: accountNumber.trim() || undefined,
//           balance: balanceNum,
//           currency,
//         });
//         toast.success("Account updated successfully");
//       } else {
//         await createAccount({
//           name: name.trim(),
//           type,
//           institutionName: institutionName.trim() || undefined,
//           accountNumber: accountNumber.trim() || undefined,
//           balance: balanceNum,
//           currency,
//         });
//         toast.success("Account created successfully");
//       }
//       onOpenChange(false);
//     } catch (error) {
//       toast.error(editingId ? "Failed to update account" : "Failed to create account");
//       console.error(error);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="glass-strong max-w-md">
//         <DialogHeader>
//           <DialogTitle>{editingId ? "Edit Account" : "Create New Account"}</DialogTitle>
//           <DialogDescription>
//             {editingId ? "Update your account details" : "Add a new account to track your finances"}
//           </DialogDescription>
//         </DialogHeader>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="name">
//               Account Name <span className="text-destructive">*</span>
//             </Label>
//             <Input
//               id="name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               placeholder="My Savings Account"
//               className="glass"
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="type">
//               Account Type <span className="text-destructive">*</span>
//             </Label>
//             <Select value={type} onValueChange={(value) => setType(value as typeof ACCOUNT_TYPES[number])}>
//               <SelectTrigger id="type" className="glass">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 {ACCOUNT_TYPES.map((t) => (
//                   <SelectItem key={t} value={t}>
//                     {t}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="institution">Institution Name</Label>
//             <Input
//               id="institution"
//               value={institutionName}
//               onChange={(e) => setInstitutionName(e.target.value)}
//               placeholder="Equity Bank"
//               className="glass"
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="accountNum">Account Number</Label>
//             <Input
//               id="accountNum"
//               value={accountNumber}
//               onChange={(e) => setAccountNumber(e.target.value)}
//               placeholder="1234567890"
//               className="glass"
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="balance">
//                 Current Balance <span className="text-destructive">*</span>
//               </Label>
//               <Input
//                 id="balance"
//                 type="number"
//                 step="0.01"
//                 value={balance}
//                 onChange={(e) => setBalance(e.target.value)}
//                 placeholder="0.00"
//                 className="glass"
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="currency">Currency</Label>
//               <Select value={currency} onValueChange={setCurrency}>
//                 <SelectTrigger id="currency" className="glass">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {CURRENCY_OPTIONS.map((curr) => (
//                     <SelectItem key={curr.value} value={curr.value}>
//                       {curr.label}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <DialogFooter>
//             <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
//               Cancel
//             </Button>
//             <Button type="submit">{editingId ? "Update" : "Create"} Account</Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }