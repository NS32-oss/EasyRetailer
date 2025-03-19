import React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useUser } from "@clerk/clerk-react"
import { LayoutDashboard, Package, ShoppingCart, RotateCcw, BarChart3, Users, LogOut, Sun, Moon } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const { user } = useUser()
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, setTheme } = useTheme()

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      title: "Inventory",
      icon: Package,
      path: "/inventory",
    },
    {
      title: "Sales",
      icon: ShoppingCart,
      path: "/sales",
    },
    {
      title: "Returns",
      icon: RotateCcw,
      path: "/returns",
    },
    {
      title: "Reports",
      icon: BarChart3,
      path: "/reports",
    },
    {
      title: "Employees",
      icon: Users,
      path: "/employees",
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold">EasyRetailer</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton isActive={location.pathname === item.path} onClick={() => navigate(item.path)}>
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <div className="flex items-center space-x-2">
            {user && <span className="text-sm font-medium">{user.firstName || user.username}</span>}
            <Button variant="ghost" size="icon" onClick={() => navigate("/sign-out")} aria-label="Sign out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

