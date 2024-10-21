import { useState } from "react"
import { CalendarIcon, DollarSign } from "lucide-react"
import { Button } from "../Component/button"
import { Input } from "../Component/input"
import { Label } from "../Component/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Component/select"
import { Popover, PopoverContent, PopoverTrigger } from "../Component/popover"
import { Calendar } from "../Component/calendar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../Component/dialog"
import { format } from "date-fns"

export default function AddTransaction({ onAddTransaction }) {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [account, setAccount] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const newTransaction = {
      id: Date.now(),
      date: date ? format(date, "yyyy-MM-dd") : "",
      description,
      category,
      amount: parseFloat(amount),
      account,
    }
    onAddTransaction(newTransaction)
    setIsOpen(false)
    // Reset form fields
    setDate(undefined)
    setDescription("")
    setCategory("")
    setAmount("")
    setAccount("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="black">
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>
            Enter the details of your new transaction here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={`w-[280px] justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Income">Income</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Shopping">Shopping</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <div className="col-span-3 relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account" className="text-right">
                Account
              </Label>
              <Select value={account} onValueChange={setAccount}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Equity Debit Card">Equity Debit Card</SelectItem>
                  <SelectItem value="I&M Debit Card">I&M Debit Card</SelectItem>
                  <SelectItem value="CIC MMF">CIC MMF</SelectItem>
                  <SelectItem value="LoftyCorban MMF">LoftyCorban MMF</SelectItem>
                  <SelectItem value="ICEA LIONS INSURANCE">ICEA LIONS INSURANCE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" variant="black">Add Transaction</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
