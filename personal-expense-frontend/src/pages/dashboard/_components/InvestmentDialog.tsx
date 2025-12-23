// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog.tsx";
// import { Button } from "@/components/ui/button.tsx";
// import { Input } from "@/components/ui/input.tsx";
// import { Label } from "@/components/ui/label.tsx";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
// import { useMutation } from "convex/react";
// import { api } from "@/convex/_generated/api.js";
// import { toast } from "sonner";
// import { useState, useEffect } from "react";
// import { format } from "date-fns";
// import type { Doc, Id } from "@/convex/_generated/dataModel.d.ts";

// interface InvestmentDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   editingId: Id<"investments"> | null;
//   investments: Doc<"investments">[];
// }

// const INVESTMENT_TYPES = [
//   "Stocks",
//   "Bonds",
//   "Crypto",
//   "Real Estate",
//   "Mutual Funds",
//   "ETFs",
//   "Other",
// ] as const;

// type InvestmentType = typeof INVESTMENT_TYPES[number];

// export function InvestmentDialog({
//   open,
//   onOpenChange,
//   editingId,
//   investments,
// }: InvestmentDialogProps) {
//   const createInvestment = useMutation(api.investments.create);
//   const updateInvestment = useMutation(api.investments.update);

//   const editingInvestment = editingId
//     ? investments.find((i) => i._id === editingId)
//     : null;

//   const [type, setType] = useState<InvestmentType>("Stocks");
//   const [name, setName] = useState("");
//   const [symbol, setSymbol] = useState("");
//   const [quantity, setQuantity] = useState("");
//   const [purchasePrice, setPurchasePrice] = useState("");
//   const [currentPrice, setCurrentPrice] = useState("");
//   const [purchaseDate, setPurchaseDate] = useState(format(new Date(), "yyyy-MM-dd"));

//   useEffect(() => {
//     if (editingInvestment) {
//       setType(editingInvestment.type);
//       setName(editingInvestment.name);
//       setSymbol(editingInvestment.symbol || "");
//       setQuantity(editingInvestment.quantity.toString());
//       setPurchasePrice(editingInvestment.purchasePrice.toString());
//       setCurrentPrice(editingInvestment.currentPrice.toString());
//       setPurchaseDate(format(editingInvestment.purchaseDate, "yyyy-MM-dd"));
//     } else {
//       setType("Stocks");
//       setName("");
//       setSymbol("");
//       setQuantity("");
//       setPurchasePrice("");
//       setCurrentPrice("");
//       setPurchaseDate(format(new Date(), "yyyy-MM-dd"));
//     }
//   }, [editingInvestment, open]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!name || !quantity || !purchasePrice || !currentPrice) {
//       toast.error("Please fill in all required fields");
//       return;
//     }

//     const quantityNum = parseFloat(quantity);
//     const purchasePriceNum = parseFloat(purchasePrice);
//     const currentPriceNum = parseFloat(currentPrice);

//     if (
//       isNaN(quantityNum) ||
//       quantityNum <= 0 ||
//       isNaN(purchasePriceNum) ||
//       purchasePriceNum <= 0 ||
//       isNaN(currentPriceNum) ||
//       currentPriceNum <= 0
//     ) {
//       toast.error("Please enter valid positive numbers");
//       return;
//     }

//     try {
//       const dateTimestamp = new Date(purchaseDate).getTime();

//       if (editingId) {
//         await updateInvestment({
//           id: editingId,
//           type,
//           name,
//           symbol: symbol || undefined,
//           quantity: quantityNum,
//           purchasePrice: purchasePriceNum,
//           currentPrice: currentPriceNum,
//           purchaseDate: dateTimestamp,
//         });
//         toast.success("Investment updated");
//       } else {
//         await createInvestment({
//           type,
//           name,
//           symbol: symbol || undefined,
//           quantity: quantityNum,
//           purchasePrice: purchasePriceNum,
//           currentPrice: currentPriceNum,
//           purchaseDate: dateTimestamp,
//         });
//         toast.success("Investment added");
//       }

//       onOpenChange(false);
//     } catch (error) {
//       toast.error("Failed to save investment");
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[550px]">
//         <DialogHeader>
//           <DialogTitle>
//             {editingId ? "Edit Investment" : "Add Investment"}
//           </DialogTitle>
//           <DialogDescription>
//             {editingId
//               ? "Update your investment details"
//               : "Add a new investment to your portfolio"}
//           </DialogDescription>
//         </DialogHeader>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="type">Type *</Label>
//               <Select value={type} onValueChange={(value: InvestmentType) => setType(value)}>
//                 <SelectTrigger id="type">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {INVESTMENT_TYPES.map((t) => (
//                     <SelectItem key={t} value={t}>
//                       {t}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="symbol">Symbol</Label>
//               <Input
//                 id="symbol"
//                 placeholder="AAPL, BTC, etc."
//                 value={symbol}
//                 onChange={(e) => setSymbol(e.target.value.toUpperCase())}
//               />
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="name">Name *</Label>
//             <Input
//               id="name"
//               placeholder="Apple Inc., Bitcoin, etc."
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="quantity">Quantity *</Label>
//               <Input
//                 id="quantity"
//                 type="number"
//                 step="0.00000001"
//                 placeholder="0"
//                 value={quantity}
//                 onChange={(e) => setQuantity(e.target.value)}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="purchaseDate">Purchase Date *</Label>
//               <Input
//                 id="purchaseDate"
//                 type="date"
//                 value={purchaseDate}
//                 onChange={(e) => setPurchaseDate(e.target.value)}
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="purchasePrice">Purchase Price *</Label>
//               <Input
//                 id="purchasePrice"
//                 type="number"
//                 step="0.01"
//                 placeholder="0.00"
//                 value={purchasePrice}
//                 onChange={(e) => setPurchasePrice(e.target.value)}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="currentPrice">Current Price *</Label>
//               <Input
//                 id="currentPrice"
//                 type="number"
//                 step="0.01"
//                 placeholder="0.00"
//                 value={currentPrice}
//                 onChange={(e) => setCurrentPrice(e.target.value)}
//               />
//             </div>
//           </div>

//           <div className="flex gap-3 pt-4">
//             <Button type="submit" className="flex-1">
//               {editingId ? "Update" : "Add"}
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