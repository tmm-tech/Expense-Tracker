import React, { useState } from "react"
import { Link } from "react-router-dom"
import { Menu, Bell, ChevronRight, LogOut } from "lucide-react"
import { Button } from "../Component/button"
import { Input } from "../Component/input"
import { Avatar, AvatarFallback, AvatarImage } from "../Component/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../Component/dropdown-menu"

const HeaderNav = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const storedUser = localStorage.getItem('user')
  const user = storedUser ? JSON.parse(storedUser) : null
  const fullname = user?.fullname || ""
  const userEmail = user?.email || ""
  const initials = fullname
    .split(" ")
    .map(name => name[0])
    .join("")
    .toUpperCase()

  return (
    <header className="bg-white bg-opacity-90 border-b p-4 flex justify-between items-center">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="lg:hidden mr-2" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      <div className="flex-1 mx-4">
        <div className="relative">
          <Input
            type="search"
            placeholder="Search..."
            className="w-full max-w-sm"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative rounded-full">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 -mt-2 -mr-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                2
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-2 text-sm text-gray-500">No notifications</div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center justify-between gap-2 p-2 hover:bg-muted">
              <Link to="/notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="text-sm font-medium">View all notifications</span>
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt={fullname} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{fullname}</DropdownMenuLabel>
            <DropdownMenuItem>{userEmail}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default HeaderNav
