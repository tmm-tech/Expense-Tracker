// import { useState } from "react";
// import { useMutation } from "convex/react";
// import { api } from "@/convex/_generated/api.js";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { toast } from "sonner";
// import { addDays, addMonths } from "date-fns";

// interface CreateChallengeDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
// }

// export function CreateChallengeDialog({ open, onOpenChange }: CreateChallengeDialogProps) {
//   const createChallenge = useMutation(api.savingsChallenges.create);
//   const [type, setType] = useState<"52-week" | "no-spend" | "custom-amount" | "percentage-save" | "round-up">("52-week");
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [targetAmount, setTargetAmount] = useState("");
//   const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("weekly");
//   const [duration, setDuration] = useState("52");
//   const [category, setCategory] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     try {
//       const startDate = Date.now();
//       let endDate: number;
//       const durationNum = parseInt(duration);

//       // Calculate end date based on frequency and duration
//       if (frequency === "daily") {
//         endDate = addDays(startDate, durationNum).getTime();
//       } else if (frequency === "weekly") {
//         endDate = addDays(startDate, durationNum * 7).getTime();
//       } else {
//         endDate = addMonths(startDate, durationNum).getTime();
//       }

//       await createChallenge({
//         name: name || getChallengePresetName(type),
//         type,
//         description: description || getChallengePresetDescription(type),
//         targetAmount: parseFloat(targetAmount) || getChallengePresetTarget(type),
//         startDate,
//         endDate,
//         frequency,
//         category: category || undefined,
//       });

//       toast.success("Challenge created successfully!");
//       onOpenChange(false);
//       resetForm();
//     } catch (error) {
//       toast.error("Failed to create challenge");
//       console.error(error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const resetForm = () => {
//     setName("");
//     setDescription("");
//     setTargetAmount("");
//     setFrequency("weekly");
//     setDuration("52");
//     setCategory("");
//     setType("52-week");
//   };

//   const handleTypeChange = (value: string) => {
//     const newType = value as typeof type;
//     setType(newType);
    
//     // Update defaults based on challenge type
//     if (newType === "52-week") {
//       setFrequency("weekly");
//       setDuration("52");
//       setTargetAmount("137800");
//     } else if (newType === "no-spend") {
//       setFrequency("daily");
//       setDuration("30");
//       setTargetAmount("0");
//     } else if (newType === "custom-amount") {
//       setFrequency("weekly");
//       setDuration("12");
//       setTargetAmount("");
//     } else if (newType === "percentage-save") {
//       setFrequency("monthly");
//       setDuration("12");
//       setTargetAmount("");
//     } else if (newType === "round-up") {
//       setFrequency("daily");
//       setDuration("90");
//       setTargetAmount("");
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="glass-card max-w-lg max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>Create Savings Challenge</DialogTitle>
//           <DialogDescription>
//             Start a new savings challenge to reach your financial goals
//           </DialogDescription>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="type">Challenge Type</Label>
//             <Select value={type} onValueChange={handleTypeChange}>
//               <SelectTrigger id="type">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="52-week">52-Week Challenge</SelectItem>
//                 <SelectItem value="no-spend">No-Spend Challenge</SelectItem>
//                 <SelectItem value="custom-amount">Custom Amount</SelectItem>
//                 <SelectItem value="percentage-save">Percentage Save</SelectItem>
//                 <SelectItem value="round-up">Round-Up Savings</SelectItem>
//               </SelectContent>
//             </Select>
//             <p className="text-xs text-muted-foreground">
//               {getChallengeTypeDescription(type)}
//             </p>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="name">Challenge Name (Optional)</Label>
//             <Input
//               id="name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               placeholder={getChallengePresetName(type)}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="description">Description (Optional)</Label>
//             <Textarea
//               id="description"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               placeholder={getChallengePresetDescription(type)}
//               rows={2}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="targetAmount">Target Amount (KES)</Label>
//             <Input
//               id="targetAmount"
//               type="number"
//               step="0.01"
//               value={targetAmount}
//               onChange={(e) => setTargetAmount(e.target.value)}
//               placeholder="Enter target amount"
//               required
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="frequency">Frequency</Label>
//               <Select value={frequency} onValueChange={(val) => setFrequency(val as typeof frequency)}>
//                 <SelectTrigger id="frequency">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="daily">Daily</SelectItem>
//                   <SelectItem value="weekly">Weekly</SelectItem>
//                   <SelectItem value="monthly">Monthly</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="duration">Duration ({frequency === "daily" ? "days" : frequency === "weekly" ? "weeks" : "months"})</Label>
//               <Input
//                 id="duration"
//                 type="number"
//                 value={duration}
//                 onChange={(e) => setDuration(e.target.value)}
//                 placeholder="Duration"
//                 required
//                 min="1"
//               />
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="category">Category (Optional)</Label>
//             <Input
//               id="category"
//               value={category}
//               onChange={(e) => setCategory(e.target.value)}
//               placeholder="e.g., Vacation, Emergency Fund"
//             />
//           </div>

//           <div className="flex gap-2 pt-4">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => onOpenChange(false)}
//               className="flex-1"
//             >
//               Cancel
//             </Button>
//             <Button type="submit" disabled={isSubmitting} className="flex-1">
//               {isSubmitting ? "Creating..." : "Create Challenge"}
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }

// function getChallengePresetName(type: string): string {
//   const names: Record<string, string> = {
//     "52-week": "52-Week Savings Challenge",
//     "no-spend": "30-Day No-Spend Challenge",
//     "custom-amount": "Custom Savings Goal",
//     "percentage-save": "Monthly Percentage Savings",
//     "round-up": "Round-Up Challenge",
//   };
//   return names[type] || "Savings Challenge";
// }

// function getChallengePresetDescription(type: string): string {
//   const descriptions: Record<string, string> = {
//     "52-week": "Save an incrementing amount each week for 52 weeks",
//     "no-spend": "Challenge yourself to spend nothing on non-essentials",
//     "custom-amount": "Set your own savings target and timeline",
//     "percentage-save": "Save a percentage of your income each month",
//     "round-up": "Round up purchases and save the difference",
//   };
//   return descriptions[type] || "Start saving towards your goal";
// }

// function getChallengeTypeDescription(type: string): string {
//   const descriptions: Record<string, string> = {
//     "52-week": "Save KES 100 week 1, KES 200 week 2, and so on. Total: KES 137,800",
//     "no-spend": "Commit to not spending money on a specific category for a set period",
//     "custom-amount": "Choose your own target amount and savings schedule",
//     "percentage-save": "Automatically save a percentage of your income",
//     "round-up": "Round up every purchase to the nearest hundred and save the difference",
//   };
//   return descriptions[type] || "";
// }

// function getChallengePresetTarget(type: string): number {
//   const targets: Record<string, number> = {
//     "52-week": 137800, // (100 + 200 + ... + 5200)
//     "no-spend": 0,
//     "custom-amount": 50000,
//     "percentage-save": 100000,
//     "round-up": 10000,
//   };
//   return targets[type] || 50000;
// }