import React,{useState, useEffect} from "react";
import { Link, useLocation } from "react-router-dom";
import { Sheet, SheetTrigger, SheetContent } from '../Component/sheet';
import { Button } from '../Component/button';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '../Component/breadcrumb';
import { Input } from '../Component/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '../Component/dropdown-menu';
import logo from "../Asset/Logo/favicon.ico";
import { Avatar, AvatarFallback, AvatarImage, } from "../Component/avatar";
const HeaderNav = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
const storedUser = localStorage.getItem('user');
  const users = JSON.parse(storedUser);
  let fullname = "";
  let userEmail = "";
  let initials = "";

  // Ensure the stored user exists before parsing
  if (storedUser) {
    const user = JSON.parse(storedUser);
    fullname = user.fullname || "";
    userEmail = user.email || "";

    if (fullname) {
      const nameParts = fullname.toLowerCase().split(" ").filter(part => part);
      initials = nameParts.map(part => part[0].toUpperCase()).join("");
    }
  }
  useEffect(() => {
    const getNotifications = async () => {
        if (!users) return; // Check if user exists

        try {
            const response = await fetch(`https://ketrb-backend.onrender.com/notifications?id=${users.id}&role=${users.roles}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const fetchedNotifications = await response.json();
                setNotifications(fetchedNotifications.notifications);
                const unreadNotifications = fetchedNotifications.notifications.filter(notification => !notification.is_read);
                setUnreadCount(unreadNotifications.length); // Update unread count
            } else {
                console.error('Failed to fetch notifications');
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    getNotifications();
}, [users]); // Add users as a dependency
  
  const location = useLocation();
  const getPathname = (path) => path.split('/').filter(Boolean);

  const handleNotificationClick = async (notificationId) => {
  try {
    // Call the API to update the notification status
    const response = await fetch(`https://ketrb-backend.onrender.com/notifications/${notificationId}/status`, {
      method: 'PUT', // or 'PATCH' depending on your API design
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_read: true }), // Adjust this payload as needed
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    // Update local state after successful API call
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId ? { ...notification, is_read: true } : notification
      )
    );
    setUnreadCount((prev) => prev - 1);
  } catch (error) {
    console.error("Failed to update notification status:", error);
    // Optionally, you can show a user-friendly error message here
  }
};
  
  const handleLogout = async () => {
    console.log("Logging out...");

    try {
      const response = await fetch(`https://ketrb-backend.onrender.com/users/logout/${userEmail}`, {
        method: 'POST',
        credentials: 'include', // Ensure cookies are included
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Logout successful:', data.message);
        // Optionally redirect to login or another page after logout
        window.location.href = '/login';
      } else {
        console.error('Logout failed:', data.message);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  const breadcrumbItems = () => {
    const paths = getPathname(location.pathname);

    if (paths.length === 0) {
      return (
        <BreadcrumbItem key="dashboard" className="text-sm font-medium">
          <BreadcrumbLink asChild>
            <Link to="/" prefetch={false} className="hover:text-blue-500 transition-colors duration-200">
              Dashboard
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
      );
    }

    return (
      <>
        <BreadcrumbItem key="dashboard" className="text-sm font-medium">
          <BreadcrumbLink asChild>
            <Link to="/" prefetch={false} className="hover:text-blue-500 transition-colors duration-200">
              Dashboard
            </Link>
          </BreadcrumbLink>
          <BreadcrumbSeparator className="mx-1" />
        </BreadcrumbItem>
        {paths.map((path, index) => {
          const url = `/${paths.slice(0, index + 1).join('/')}`;
          const formattedPath = path
            .split('%20')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          return (
            <BreadcrumbItem key={index} className="text-sm font-medium">
              {index < paths.length - 1 ? (
                <>
                  <BreadcrumbLink asChild>
                    <Link to={url} prefetch={false} className="hover:text-blue-500 transition-colors duration-200">
                      {formattedPath}
                    </Link>
                  </BreadcrumbLink>
                  <BreadcrumbSeparator className="mx-1" />
                </>
              ) : (
                <BreadcrumbPage className="text-gray-600 font-medium">
                  {formattedPath}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          );
        })}
      </>
    );
  };
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet className="bg-white">
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <MenuIcon className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              to="/"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              prefetch={false}
            >
              <img
                src={logo}
                alt="KETRB CMS"
                className="h-10 w-10 transition-all group-hover:scale-110"
              />
              <span className="sr-only">KETRB CMS</span>
            </Link>
            <Link
              to="/"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              prefetch={false}
            >
              <LayoutGridIcon className="h-5 w-5" />
              Dashboard
            </Link>
            <Link to="/news" className="flex items-center gap-4 px-2.5 text-foreground" prefetch={false}>
              <NewspaperIcon className="h-5 w-5" />
              News
            </Link>
            <Link to="/images" className="flex items-center gap-4 px-2.5 text-foreground" prefetch={false}>
              <ImageIcon className="h-5 w-5" />
              Images
            </Link>
            <Link to="/programs" className="flex items-center gap-4 px-2.5 text-foreground" prefetch={false}>
              <CalendarIcon vmarIcon className="h-5 w-5" />
              Programs
            </Link>
            <Link
              to="/users"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              prefetch={false}
            >
              <UsersIcon className="h-5 w-5" />
              Users
            </Link>
            {/* 
<Link
  to="/profile"
  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
  prefetch={false}
>
  <SettingsIcon className="h-5 w-5" />
  Settings
</Link>
*/}

          </nav>
        </SheetContent>
      </Sheet>
      <Breadcrumb className="hidden md:flex items-center space-x-2 text-gray-600">
        <BreadcrumbList>
          {breadcrumbItems()}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="relative ml-auto flex-1 md:grow-0">
        <div className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
        />
      </div>
      <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="icon" className="relative rounded-full">
      <BellIcon className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 -mt-2 -mr-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
          {unreadCount}
        </span>
      )}
    </Button>
  </DropdownMenuTrigger>
  
  <DropdownMenuContent align="end" className="w-80">
    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
    <DropdownMenuSeparator />
    
    {notifications.length === 0 ? (
      <div className="p-2 text-sm text-gray-500">No notifications</div>
    ) : (
      notifications.filter(notification => !notification.is_read).map((notification) => (
        <DropdownMenuItem
          key={notification.id}
          className="grid grid-cols-[25px_1fr] items-start gap-2 p-2 hover:bg-muted"
          onClick={() => handleNotificationClick(notification.id)}
        >
          <div className="flex h-2 w-2 translate-y-1.5 rounded-full bg-blue-500" />
          <div className="space-y-1">
            <p className="text-sm font-medium">
          {notification.message.length > 40 
            ? `${notification.message.slice(0, 40)}...` 
            : notification.message}
        </p>
            <p className="text-xs text-gray-500">{new Date(notification.created_at).toLocaleTimeString()}</p>
          </div>
        </DropdownMenuItem>
      ))
    )}
    
    <DropdownMenuSeparator />
    
    <DropdownMenuItem className="flex items-center justify-between gap-2 p-2 hover:bg-muted">
      <Link to="/notifications" className="flex items-center gap-2" prefetch={false}>
        <BellIcon className="h-4 w-4" />
        <span className="text-sm font-medium">View all notifications</span>
      </Link>
      <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
            <Avatar>
              <AvatarFallback initials={initials} bgColor="black" textColor="white" />
            </Avatar>

          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* <DropdownMenuLabel><Link to="/profile">My Account</Link></DropdownMenuLabel>*/}
          {/* <DropdownMenuItem><Link to="/profile">Settings</Link></DropdownMenuItem>*/}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}><LogOutIcon className="mr-2 h-4 w-4" />Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default HeaderNav;

function CalendarIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />   vm
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  )
}


function ImageIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  )
}


function LayoutGridIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  )
}


function MenuIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}


function NewspaperIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8" />
      <path d="M15 18h-5" />
      <path d="M10 6h8v4h-8V6Z" />
    </svg>
  )
}


function Package2Icon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
      <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
      <path d="M12 3v6" />
    </svg>
  )
}


function SettingsIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}


function UsersIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
function LogOutIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  )
}
function ChevronRightIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
function BellIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}
