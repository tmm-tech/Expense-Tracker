// import { useState, useEffect } from "react";
// import { useMutation, useQuery } from "convex/react";
// import { api } from "@/convex/_generated/api.js";
// import { Button } from "@/components/ui/button.tsx";
// import { Label } from "@/components/ui/label.tsx";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
// import { Settings2 } from "lucide-react";
// import { toast } from "sonner";

// const CURRENCIES = [
//   { value: "KES", label: "KES - Kenyan Shilling" },
//   { value: "USD", label: "USD - US Dollar" },
//   { value: "EUR", label: "EUR - Euro" },
//   { value: "GBP", label: "GBP - British Pound" },
//   { value: "JPY", label: "JPY - Japanese Yen" },
// ];

// const DATE_FORMATS = [
//   { value: "MM/DD/YYYY", label: "MM/DD/YYYY (US)" },
//   { value: "DD/MM/YYYY", label: "DD/MM/YYYY (UK)" },
//   { value: "YYYY-MM-DD", label: "YYYY-MM-DD (ISO)" },
// ];

// const FISCAL_MONTHS = [
//   { value: 1, label: "January" },
//   { value: 2, label: "February" },
//   { value: 3, label: "March" },
//   { value: 4, label: "April" },
//   { value: 5, label: "May" },
//   { value: 6, label: "June" },
//   { value: 7, label: "July" },
//   { value: 8, label: "August" },
//   { value: 9, label: "September" },
//   { value: 10, label: "October" },
//   { value: 11, label: "November" },
//   { value: 12, label: "December" },
// ];

// export default function PreferencesSection() {
//   const user = useQuery(api.users.getCurrentUser);
//   const updateSettings = useMutation(api.users.updateSettings);

//   const [currency, setCurrency] = useState("KES");
//   const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
//   const [fiscalYearStart, setFiscalYearStart] = useState(1);

//   useEffect(() => {
//     if (user) {
//       setCurrency(user.currency || "KES");
//       setDateFormat(user.dateFormat || "DD/MM/YYYY");
//       setFiscalYearStart(user.fiscalYearStart || 1);
//     }
//   }, [user]);

//   const handleSave = async () => {
//     try {
//       await updateSettings({
//         currency,
//         dateFormat,
//         fiscalYearStart,
//       });
//       toast.success("Preferences updated successfully");
//     } catch (error) {
//       toast.error("Failed to update preferences");
//       console.error(error);
//     }
//   };

//   return (
//     <Card className="glass-card">
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <Settings2 className="h-5 w-5" />
//           Display Preferences
//         </CardTitle>
//         <CardDescription>Customize how information is displayed</CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <div className="space-y-2">
//           <Label htmlFor="currency">Currency</Label>
//           <Select value={currency} onValueChange={setCurrency}>
//             <SelectTrigger id="currency" className="glass">
//               <SelectValue placeholder="Select currency" />
//             </SelectTrigger>
//             <SelectContent>
//               {CURRENCIES.map((curr) => (
//                 <SelectItem key={curr.value} value={curr.value}>
//                   {curr.label}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="dateFormat">Date Format</Label>
//           <Select value={dateFormat} onValueChange={setDateFormat}>
//             <SelectTrigger id="dateFormat" className="glass">
//               <SelectValue placeholder="Select date format" />
//             </SelectTrigger>
//             <SelectContent>
//               {DATE_FORMATS.map((format) => (
//                 <SelectItem key={format.value} value={format.value}>
//                   {format.label}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="fiscalYear">Fiscal Year Start</Label>
//           <Select
//             value={fiscalYearStart.toString()}
//             onValueChange={(value) => setFiscalYearStart(parseInt(value))}
//           >
//             <SelectTrigger id="fiscalYear" className="glass">
//               <SelectValue placeholder="Select month" />
//             </SelectTrigger>
//             <SelectContent>
//               {FISCAL_MONTHS.map((month) => (
//                 <SelectItem key={month.value} value={month.value.toString()}>
//                   {month.label}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         <Button onClick={handleSave} className="w-full">
//           Save Preferences
//         </Button>
//       </CardContent>
//     </Card>
//   );
// }