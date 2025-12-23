// import { Button } from "@/components/ui/button.tsx";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
// import { Sparkles, RefreshCw } from "lucide-react";
// import { useAction } from "convex/react";
// import { api } from "@/convex/_generated/api.js";
// import { useState } from "react";
// import { toast } from "sonner";
// import { Skeleton } from "@/components/ui/skeleton.tsx";

// export function AIInsights() {
//   const [insights, setInsights] = useState<string | null>(null);
//   const [summary, setSummary] = useState<{
//     totalIncome: number;
//     totalExpense: number;
//     balance: number;
//     totalInvested: number;
//     currentValue: number;
//     investmentReturn: number;
//     returnPercentage: string;
//     transactionCount: number;
//     budgetCount: number;
//     investmentCount: number;
//   } | null>(null);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const generateInsights = useAction(api.aiInsights.generateFinancialInsights);

//   const handleGenerate = async () => {
//     setIsGenerating(true);
//     try {
//       const result = await generateInsights({});
//       setInsights(result.insights);
//       setSummary(result.summary);
//       toast.success("AI insights generated successfully");
//     } catch (error) {
//       toast.error(`Failed to generate insights: ${error instanceof Error ? error.message : "Unknown error"}`);
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header Card */}
//       <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <div className="space-y-1">
//               <CardTitle className="flex items-center gap-2">
//                 <Sparkles className="w-5 h-5 text-primary" />
//                 AI Financial Insights
//               </CardTitle>
//               <CardDescription>
//                 Get personalized financial advice powered by AI
//               </CardDescription>
//             </div>
//             <Button 
//               onClick={handleGenerate} 
//               disabled={isGenerating}
//               className="gap-2"
//             >
//               {isGenerating ? (
//                 <>
//                   <RefreshCw className="w-4 h-4 animate-spin" />
//                   Analyzing...
//                 </>
//               ) : (
//                 <>
//                   <Sparkles className="w-4 h-4" />
//                   Generate Insights
//                 </>
//               )}
//             </Button>
//           </div>
//         </CardHeader>
//       </Card>

//       {/* Loading State */}
//       {isGenerating && !insights && (
//         <Card>
//           <CardHeader>
//             <Skeleton className="h-6 w-48" />
//             <Skeleton className="h-4 w-full mt-2" />
//           </CardHeader>
//           <CardContent className="space-y-3">
//             <Skeleton className="h-4 w-full" />
//             <Skeleton className="h-4 w-full" />
//             <Skeleton className="h-4 w-3/4" />
//             <Skeleton className="h-4 w-full mt-6" />
//             <Skeleton className="h-4 w-full" />
//             <Skeleton className="h-4 w-5/6" />
//           </CardContent>
//         </Card>
//       )}

//       {/* Insights Display */}
//       {insights && summary && (
//         <>
//           {/* Data Summary Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <Card>
//               <CardHeader className="pb-3">
//                 <CardDescription>Data Analyzed</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-1 text-sm">
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Transactions:</span>
//                     <span className="font-medium">{summary.transactionCount}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Budgets:</span>
//                     <span className="font-medium">{summary.budgetCount}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Investments:</span>
//                     <span className="font-medium">{summary.investmentCount}</span>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader className="pb-3">
//                 <CardDescription>Cash Flow</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-1 text-sm">
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Income:</span>
//                     <span className="font-medium text-accent">KES {summary.totalIncome.toFixed(2)}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Expenses:</span>
//                     <span className="font-medium text-destructive">KES {summary.totalExpense.toFixed(2)}</span>
//                   </div>
//                   <div className="flex justify-between pt-1 border-t">
//                     <span className="text-muted-foreground">Net:</span>
//                     <span className={`font-bold ${summary.balance >= 0 ? 'text-accent' : 'text-destructive'}`}>
//                       KES {summary.balance.toFixed(2)}
//                     </span>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader className="pb-3">
//                 <CardDescription>Investment Performance</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-1 text-sm">
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Invested:</span>
//                     <span className="font-medium">KES {summary.totalInvested.toFixed(2)}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Current:</span>
//                     <span className="font-medium">KES {summary.currentValue.toFixed(2)}</span>
//                   </div>
//                   <div className="flex justify-between pt-1 border-t">
//                     <span className="text-muted-foreground">Return:</span>
//                     <span className={`font-bold ${summary.investmentReturn >= 0 ? 'text-accent' : 'text-destructive'}`}>
//                       {summary.investmentReturn >= 0 ? '+' : ''}KES {summary.investmentReturn.toFixed(2)} ({summary.returnPercentage}%)
//                     </span>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* AI Generated Insights */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Your Personalized Financial Insights</CardTitle>
//               <CardDescription>
//                 AI-powered analysis and recommendations based on your financial data
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="prose prose-sm dark:prose-invert max-w-none">
//                 <div className="whitespace-pre-wrap text-sm leading-relaxed">
//                   {insights}
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Disclaimer */}
//           <Card className="border-muted bg-muted/20">
//             <CardContent className="pt-6">
//               <p className="text-xs text-muted-foreground text-center">
//                 <strong>Disclaimer:</strong> AI-generated insights are for informational purposes only and should not be considered professional financial advice. 
//                 Always consult with a qualified financial advisor before making significant financial decisions.
//               </p>
//             </CardContent>
//           </Card>
//         </>
//       )}

//       {/* Empty State */}
//       {!insights && !isGenerating && (
//         <Card className="border-dashed">
//           <CardContent className="flex flex-col items-center justify-center py-16 text-center">
//             <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
//             <h3 className="text-lg font-semibold mb-2">No Insights Yet</h3>
//             <p className="text-sm text-muted-foreground mb-6 max-w-md">
//               Click "Generate Insights" to get AI-powered analysis of your financial data, 
//               including spending patterns, budget recommendations, and investment advice.
//             </p>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }