// import { useState } from "react";
// import { useQuery, useMutation } from "convex/react";
// import { api } from "@/convex/_generated/api.js";
// import type { Id } from "@/convex/_generated/dataModel.d.ts";
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
// import { Progress } from "@/components/ui/progress";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { toast } from "sonner";
// import { format } from "date-fns";
// import { Plus, Trophy, Flame, Calendar, TrendingUp, Target, CheckCircle2, Award } from "lucide-react";

// interface ChallengeDetailDialogProps {
//   challengeId: Id<"savingsChallenges">;
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
// }

// export function ChallengeDetailDialog({ challengeId, open, onOpenChange }: ChallengeDetailDialogProps) {
//   const challenge = useQuery(api.savingsChallenges.getById, { id: challengeId });
//   const contributions = useQuery(api.savingsChallenges.getContributions, { challengeId });
//   const addContribution = useMutation(api.savingsChallenges.addContribution);
//   const updateChallenge = useMutation(api.savingsChallenges.update);
//   const removeChallenge = useMutation(api.savingsChallenges.remove);

//   const [showAddContribution, setShowAddContribution] = useState(false);
//   const [amount, setAmount] = useState("");
//   const [notes, setNotes] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   if (!challenge || !contributions) {
//     return null;
//   }

//   const progressPercentage = (challenge.currentAmount / challenge.targetAmount) * 100;
//   const remainingAmount = challenge.targetAmount - challenge.currentAmount;
//   const isCompleted = challenge.status === "completed";

//   const handleAddContribution = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     try {
//       await addContribution({
//         challengeId,
//         amount: parseFloat(amount),
//         date: Date.now(),
//         notes: notes || undefined,
//       });

//       toast.success("Contribution added successfully!");
//       setAmount("");
//       setNotes("");
//       setShowAddContribution(false);
//     } catch (error) {
//       toast.error("Failed to add contribution");
//       console.error(error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handlePauseResume = async () => {
//     try {
//       await updateChallenge({
//         id: challengeId,
//         status: challenge.status === "active" ? "paused" : "active",
//       });
//       toast.success(challenge.status === "active" ? "Challenge paused" : "Challenge resumed");
//     } catch (error) {
//       toast.error("Failed to update challenge");
//     }
//   };

//   const handleDelete = async () => {
//     if (!confirm("Are you sure you want to delete this challenge? This action cannot be undone.")) {
//       return;
//     }

//     try {
//       await removeChallenge({ id: challengeId });
//       toast.success("Challenge deleted");
//       onOpenChange(false);
//     } catch (error) {
//       toast.error("Failed to delete challenge");
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <div className="flex items-start justify-between gap-4">
//             <div className="flex-1 min-w-0">
//               <DialogTitle className="text-xl md:text-2xl">{challenge.name}</DialogTitle>
//               <DialogDescription className="mt-2">{challenge.description}</DialogDescription>
//             </div>
//             <Badge
//               variant={isCompleted ? "default" : "outline"}
//               className={isCompleted ? "bg-green-500 border-green-500" : ""}
//             >
//               {challenge.status}
//             </Badge>
//           </div>
//         </DialogHeader>

//         <div className="space-y-6">
//           {/* Progress Section */}
//           <div className="space-y-4">
//             <div className="flex items-center justify-between">
//               <span className="text-sm text-muted-foreground">Total Progress</span>
//               <span className="text-lg font-bold">{progressPercentage.toFixed(1)}%</span>
//             </div>
//             <Progress value={progressPercentage} className="h-3" />
//             <div className="flex items-center justify-between text-sm">
//               <div>
//                 <p className="text-muted-foreground">Current Amount</p>
//                 <p className="text-xl font-bold text-primary">KES {challenge.currentAmount.toLocaleString()}</p>
//               </div>
//               <div className="text-right">
//                 <p className="text-muted-foreground">Target Amount</p>
//                 <p className="text-xl font-bold">KES {challenge.targetAmount.toLocaleString()}</p>
//               </div>
//             </div>
//             {!isCompleted && (
//               <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
//                 <p className="text-sm">
//                   <span className="text-muted-foreground">Remaining: </span>
//                   <span className="font-semibold">KES {remainingAmount.toLocaleString()}</span>
//                 </p>
//               </div>
//             )}
//           </div>

//           {/* Stats Grid */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//             <div className="p-3 rounded-lg bg-muted/50">
//               <div className="flex items-center gap-2 text-muted-foreground mb-1">
//                 <TrendingUp className="w-4 h-4" />
//                 <span className="text-xs">Contributions</span>
//               </div>
//               <p className="text-lg font-bold">{challenge.totalContributions}</p>
//             </div>

//             <div className="p-3 rounded-lg bg-muted/50">
//               <div className="flex items-center gap-2 text-muted-foreground mb-1">
//                 <Flame className="w-4 h-4" />
//                 <span className="text-xs">Streak</span>
//               </div>
//               <p className="text-lg font-bold">{challenge.streakDays} days</p>
//             </div>

//             <div className="p-3 rounded-lg bg-muted/50">
//               <div className="flex items-center gap-2 text-muted-foreground mb-1">
//                 <Calendar className="w-4 h-4" />
//                 <span className="text-xs">Started</span>
//               </div>
//               <p className="text-xs font-semibold">{format(challenge.startDate, "MMM dd, yyyy")}</p>
//             </div>

//             <div className="p-3 rounded-lg bg-muted/50">
//               <div className="flex items-center gap-2 text-muted-foreground mb-1">
//                 <Target className="w-4 h-4" />
//                 <span className="text-xs">End Date</span>
//               </div>
//               <p className="text-xs font-semibold">{format(challenge.endDate, "MMM dd, yyyy")}</p>
//             </div>
//           </div>

//           {/* Milestones */}
//           <div className="space-y-3">
//             <h3 className="text-sm font-semibold flex items-center gap-2">
//               <Award className="w-4 h-4" />
//               Milestones & Rewards
//             </h3>
//             <div className="space-y-2">
//               {challenge.milestones.map((milestone, idx) => (
//                 <div
//                   key={idx}
//                   className={`p-3 rounded-lg border ${
//                     milestone.achieved
//                       ? "bg-green-500/10 border-green-500/20"
//                       : "bg-muted/30 border-muted"
//                   }`}
//                 >
//                   <div className="flex items-center justify-between gap-3">
//                     <div className="flex items-center gap-3 flex-1 min-w-0">
//                       {milestone.achieved ? (
//                         <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
//                       ) : (
//                         <div className="w-5 h-5 rounded-full border-2 border-muted-foreground shrink-0" />
//                       )}
//                       <div className="flex-1 min-w-0">
//                         <p className="text-sm font-semibold truncate">KES {milestone.amount.toLocaleString()}</p>
//                         {milestone.achieved && milestone.achievedDate && (
//                           <p className="text-xs text-muted-foreground">
//                             Achieved on {format(milestone.achievedDate, "MMM dd, yyyy")}
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                     <span className="text-xl shrink-0">{milestone.reward?.split(" ")[0] || "🎯"}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <Separator />

//           {/* Add Contribution Section */}
//           {!isCompleted && challenge.status === "active" && (
//             <div className="space-y-3">
//               {!showAddContribution ? (
//                 <Button onClick={() => setShowAddContribution(true)} className="w-full gap-2">
//                   <Plus className="w-4 h-4" />
//                   Add Contribution
//                 </Button>
//               ) : (
//                 <form onSubmit={handleAddContribution} className="space-y-3 p-4 rounded-lg border bg-muted/30">
//                   <div className="space-y-2">
//                     <Label htmlFor="amount">Amount (KES)</Label>
//                     <Input
//                       id="amount"
//                       type="number"
//                       step="0.01"
//                       value={amount}
//                       onChange={(e) => setAmount(e.target.value)}
//                       placeholder="Enter amount"
//                       required
//                       autoFocus
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="notes">Notes (Optional)</Label>
//                     <Textarea
//                       id="notes"
//                       value={notes}
//                       onChange={(e) => setNotes(e.target.value)}
//                       placeholder="Add a note..."
//                       rows={2}
//                     />
//                   </div>

//                   <div className="flex gap-2">
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={() => {
//                         setShowAddContribution(false);
//                         setAmount("");
//                         setNotes("");
//                       }}
//                       className="flex-1"
//                     >
//                       Cancel
//                     </Button>
//                     <Button type="submit" disabled={isSubmitting} className="flex-1">
//                       {isSubmitting ? "Adding..." : "Add"}
//                     </Button>
//                   </div>
//                 </form>
//               )}
//             </div>
//           )}

//           {/* Contributions History */}
//           {contributions.length > 0 && (
//             <div className="space-y-3">
//               <h3 className="text-sm font-semibold">Recent Contributions</h3>
//               <div className="space-y-2 max-h-48 overflow-y-auto">
//                 {contributions.slice(0, 10).map((contribution) => (
//                   <div
//                     key={contribution._id}
//                     className="p-3 rounded-lg bg-muted/30 flex items-center justify-between gap-3"
//                   >
//                     <div className="flex-1 min-w-0">
//                       <p className="font-semibold">KES {contribution.amount.toLocaleString()}</p>
//                       <p className="text-xs text-muted-foreground">
//                         {format(contribution.date, "MMM dd, yyyy 'at' h:mm a")}
//                       </p>
//                       {contribution.notes && (
//                         <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
//                           {contribution.notes}
//                         </p>
//                       )}
//                     </div>
//                     {contribution.weekNumber && (
//                       <Badge variant="outline" className="shrink-0">Week {contribution.weekNumber}</Badge>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Action Buttons */}
//           <div className="flex gap-2 pt-4">
//             {!isCompleted && (
//               <Button
//                 variant="outline"
//                 onClick={handlePauseResume}
//                 className="flex-1"
//               >
//                 {challenge.status === "active" ? "Pause" : "Resume"}
//               </Button>
//             )}
//             <Button
//               variant="destructive"
//               onClick={handleDelete}
//               className="flex-1"
//             >
//               Delete
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }