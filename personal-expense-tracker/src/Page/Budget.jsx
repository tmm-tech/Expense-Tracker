import { useState } from "react"
import { AlertCircle, ChevronDown, DollarSign, Edit, PlusCircle, Trash2 } from "lucide-react"
import { Button } from "../Component/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../Component/card"
import { Input } from "../Component/input"
import { Label } from "../Component/label"
import { Progress } from "../Component/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Component/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../Component/dialog"
import { Alert, AlertDescription, AlertTitle } from "../Component/alert"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../Component/chart"
import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import Sidebar from '../Component/Sidebar';
// Mock data for budgets
const initialBudgets = [
  { id: 1, category: "Housing", budgeted: 1000, spent: 950 },
  { id: 2, category: "Food", budgeted: 500, spent: 480 },
  { id: 3, category: "Transportation", budgeted: 200, spent: 180 },
  { id: 4, category: "Utilities", budgeted: 300, spent: 280 },
  { id: 5, category: "Entertainment", budgeted: 200, spent: 150 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function Budget() {
  const [budgets, setBudgets] = useState(initialBudgets)
  const [isAddingBudget, setIsAddingBudget] = useState(false)
  const [editingBudget, setEditingBudget] = useState<any>(null)
const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.budgeted, 0)
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0)

  const handleAddBudget = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const newBudget = {
      id: budgets.length + 1,
      category: formData.get('category'),
      budgeted: Number(formData.get('amount')),
      spent: 0,
    }
    setBudgets([...budgets, newBudget])
    setIsAddingBudget(false)
  }

  const handleEditBudget = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const updatedBudget = {
      ...editingBudget,
      category: formData.get('category'),
      budgeted: Number(formData.get('amount')),
    }
    setBudgets(budgets.map(budget => budget.id === updatedBudget.id ? updatedBudget : budget))
    setEditingBudget(null)
  }

  const handleDeleteBudget = (id: number) => {
    setBudgets(budgets.filter(budget => budget.id !== id))
  }

  return (
      <div className="flex h-screen bg-gray-100 bg-[url('https://unsplash.com/photos/a-blurry-photo-of-a-white-background-GJKx5lhwU3M')] bg-cover bg-center bg-fixed">
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white bg-opacity-90 border-b p-4 flex justify-between items-center">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-semibold text-gray-800">Financial Dashboard</h1>
          <Button variant="ghost" size="icon">
            <Settings className="h-6 w-6 text-gray-600" />
          </Button>
        </header>
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Budget Overview</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budgeted</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudgeted.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalBudgeted - totalSpent).toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Budget Progress</CardTitle>
          <CardDescription>You've spent {((totalSpent / totalBudgeted) * 100).toFixed(2)}% of your total budget</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={(totalSpent / totalBudgeted) * 100} className="w-full" />
        </CardContent>
      </Card>

      {/* Budget Categories */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Budget Categories</h2>
          <Dialog open={isAddingBudget} onOpenChange={setIsAddingBudget}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Budget Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Budget Category</DialogTitle>
                <DialogDescription>Create a new budget category here. Click save when you're done.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddBudget}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <Input id="category" name="category" className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                      Amount
                    </Label>
                    <Input id="amount" name="amount" type="number" className="col-span-3" required />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {budgets.map((budget) => (
          <Card key={budget.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{budget.category}</CardTitle>
              <div>
                <Button variant="ghost" size="icon" onClick={() => setEditingBudget(budget)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteBudget(budget.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-2">
                <span>${budget.spent.toFixed(2)} spent</span>
                <span>${budget.budgeted.toFixed(2)} budgeted</span>
              </div>
              <Progress value={(budget.spent / budget.budgeted) * 100} className="w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Budget Allocation Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Allocation</CardTitle>
          <CardDescription>Visual representation of your budget distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              budget: {
                label: "Budget",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgets}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="budgeted"
                >
                  {budgets.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Month Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Comparison</CardTitle>
          <CardDescription>Compare your spending with previous months</CardDescription>
        </CardHeader>
        <CardContent>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Month</SelectItem>
              <SelectItem value="previous">Previous Month</SelectItem>
              <SelectItem value="twomonths">Two Months Ago</SelectItem>
            </SelectContent>
          </Select>
          <div className="mt-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Spending Trend</AlertTitle>
              <AlertDescription>
                Your spending this month is 5% lower compared to last month. Great job on saving!
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Edit Budget Modal */}
      <Dialog open={!!editingBudget} onOpenChange={() => setEditingBudget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Budget Category</DialogTitle>
            <DialogDescription>Make changes to your budget category here. Click save when you're done.</DialogDescription>
          </DialogHeader>
          {editingBudget && (
            <form onSubmit={handleEditBudget}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-category" className="text-right">
                    Category
                  </Label>
                  <Input
                    id="edit-category"
                    name="category"
                    defaultValue={editingBudget.category}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-amount" className="text-right">
                    Amount
                  </Label>
                  <Input
                    id="edit-amount"
                    name="amount"
                    type="number"
                    defaultValue={editingBudget.budgeted}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
        </div>
        </div>
  )
}
