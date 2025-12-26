import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { format } from "date-fns";
import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import type { Bill } from "@/types/bill";
import type { Account } from "@/types/account";
import type { Category } from "@/types/category";
/* ---------------- schemas ---------------- */

const billSchema = z.object({
  name: z.string().min(1, "Bill name is required"),
  category: z.string().min(1, "Category is required"),
  amount: z.string().min(1, "Amount is required"),
  dueDate: z.string().min(1, "Due date is required"),
  frequency: z.enum(["one-time", "weekly", "monthly", "quarterly", "yearly"]),
  accountId: z.string().optional(),
  reminderDays: z.string(),
  notes: z.string().optional(),
  autoPayEnabled: z.boolean(),
});

type BillFormData = z.infer<typeof billSchema>;


interface BillDialogProps {
  open: boolean;
  onClose: () => void;
  bill?: Bill | null;
  accounts: Account[];
}

/* ---------------- component ---------------- */

export default function BillDialog({
  open,
  onClose,
  bill,
  accounts,
}: BillDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  const form = useForm<BillFormData>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      name: bill?.name ?? "",
      category: bill?.category ?? "",
      amount: bill ? bill.amount.toString() : "",
      dueDate: bill
        ? format(bill.dueDate, "yyyy-MM-dd")
        : format(Date.now(), "yyyy-MM-dd"),
      frequency: bill?.frequency ?? "monthly",
      accountId: bill?.accountId ?? "none",
      reminderDays: bill ? bill.reminderDays.toString() : "7",
      notes: bill?.notes ?? "",
      autoPayEnabled: bill?.autoPayEnabled ?? false,
    },
  });

  /* -------- fetch categories -------- */

  useEffect(() => {
    apiFetch<Category[]>("https://expense-tracker-u6ge.onrender.com/api/categories?type=expense")
      .then(setCategories)
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  /* -------- submit -------- */

  const onSubmit = async (data: BillFormData) => {
    try {
      const payload = {
        name: data.name,
        category: data.category,
        amount: parseFloat(data.amount),
        dueDate: new Date(data.dueDate).getTime(),
        frequency: data.frequency,
        accountId:
          data.accountId && data.accountId !== "none"
            ? data.accountId
            : undefined,
        reminderDays: parseInt(data.reminderDays, 10),
        notes: data.notes || undefined,
        autoPayEnabled: data.autoPayEnabled,
      };

      if (bill) {
        await apiFetch(`https://expense-tracker-u6ge.onrender.com/api/bills/${bill.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Bill updated successfully");
      } else {
        await apiFetch("https://expense-tracker-u6ge.onrender.com/api/bills", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Bill created successfully");
      }

      form.reset();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save bill");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{bill ? "Edit Bill" : "Create Bill"}</DialogTitle>
          <DialogDescription>
            {bill
              ? "Update bill details and payment schedule"
              : "Add a new bill to track payments"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bill Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Electricity" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="glass">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (KES)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="glass">
                      <SelectItem value="one-time">One-time</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="glass">
                      <SelectItem value="none">No account</SelectItem>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name} ({acc.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Account to deduct payment from
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="autoPayEnabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <FormLabel>Auto-pay</FormLabel>
                    <FormDescription>
                      Automatically create transaction on due date
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea className="resize-none" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {bill ? "Update Bill" : "Create Bill"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
