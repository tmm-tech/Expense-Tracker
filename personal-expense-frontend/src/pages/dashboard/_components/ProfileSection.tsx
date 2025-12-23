// import { useState } from "react";
// import { useMutation, useQuery } from "convex/react";
// import { api } from "@/convex/_generated/api.js";
// import { Button } from "@/components/ui/button.tsx";
// import { Input } from "@/components/ui/input.tsx";
// import { Label } from "@/components/ui/label.tsx";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
// import { User } from "lucide-react";
// import { toast } from "sonner";

// export default function ProfileSection() {
//   const user = useQuery(api.users.getCurrentUser);
//   const updateProfile = useMutation(api.users.updateProfile);
//   const [name, setName] = useState("");
//   const [isEditing, setIsEditing] = useState(false);

//   const handleSave = async () => {
//     try {
//       await updateProfile({ name: name || undefined });
//       toast.success("Profile updated successfully");
//       setIsEditing(false);
//     } catch (error) {
//       toast.error("Failed to update profile");
//       console.error(error);
//     }
//   };

//   if (!user) {
//     return null;
//   }

//   return (
//     <Card className="glass-card">
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <User className="h-5 w-5" />
//           Profile Information
//         </CardTitle>
//         <CardDescription>Manage your personal information</CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <div className="flex items-center gap-4">
//           <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
//             <User className="h-10 w-10 text-primary" />
//           </div>
//           <div className="flex-1 space-y-1">
//             <p className="text-sm text-muted-foreground">Display Name</p>
//             {isEditing ? (
//               <Input
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 placeholder={user.name || "Enter your name"}
//                 className="glass"
//               />
//             ) : (
//               <p className="font-medium">{user.name || "No name set"}</p>
//             )}
//           </div>
//         </div>

//         <div className="space-y-2">
//           <Label>Email</Label>
//           <Input value={user.email || "Not provided"} disabled className="glass" />
//         </div>

//         <div className="flex gap-2">
//           {isEditing ? (
//             <>
//               <Button onClick={handleSave} size="sm">
//                 Save Changes
//               </Button>
//               <Button
//                 onClick={() => {
//                   setIsEditing(false);
//                   setName("");
//                 }}
//                 variant="outline"
//                 size="sm"
//               >
//                 Cancel
//               </Button>
//             </>
//           ) : (
//             <Button
//               onClick={() => {
//                 setName(user.name || "");
//                 setIsEditing(true);
//               }}
//               size="sm"
//             >
//               Edit Profile
//             </Button>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }