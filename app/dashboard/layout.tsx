"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Users,
  FileText,
  Truck,
  Building2,
  Home,
  LogOut,
  Menu,
  X,
  Plus,
  Package,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Toaster } from "@/components/ui/toaster"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  submenu?: {
    title: string
    href: string
  }[]
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Funcionários",
    href: "/dashboard/funcionarios",
    icon: Users,
    submenu: [
      {
        title: "Novo Funcionário",
        href: "/dashboard/funcionarios/novo",
      },
      {
        title: "Histórico",
        href: "/dashboard/funcionarios/historico",
      },
    ],
  },
  {
    title: "Orçamentos",
    href: "/dashboard/orcamentos",
    icon: FileText,
    submenu: [
      {
        title: "Novo Orçamento",
        href: "/dashboard/orcamentos/novo",
      },
    ],
  },
  {
    title: "Fornecedores",
    href: "/dashboard/fornecedores",
    icon: Truck,
    submenu: [
      {
        title: "Novo Fornecedor",
        href: "/dashboard/fornecedores/novo",
      },
    ],
  },
  {
    title: "Materiais",
    href: "/dashboard/materiais",
    icon: Package,
    submenu: [
      {
        title: "Novo Material",
        href: "/dashboard/materiais/novo",
      },
    ],
  },
  {
    title: "Obras",
    href: "/dashboard/obras",
    icon: Building2,
    submenu: [
      {
        title: "Nova Obra",
        href: "/dashboard/obras/nova",
      },
    ],
  },
  {
    title: "Financeiro",
    href: "/dashboard/financeiro",
    icon: DollarSign,
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const [isNavExpanded, setIsNavExpanded] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const toggleSubmenu = (title: string) => {
    if (openSubmenu === title) {
      setOpenSubmenu(null)
    } else {
      setOpenSubmenu(title)
    }
  }

  const handleNavItemClick = () => {
    setIsSheetOpen(false)
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:hidden">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0">
            <div className="flex items-center border-b px-4 py-3">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/microphone-crowd.png"
                  alt="Master Construtora Logo"
                  width={32}
                  height={32}
                  className="rounded"
                />
                <span className="text-lg font-bold">Master Construtora</span>
              </Link>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-auto">
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close menu</span>
                </Button>
              </SheetTrigger>
            </div>
            <nav className="grid gap-2 p-4">
              {navItems.map((item) => (
                <div key={item.title}>
                  <Link
               
                    href={item.href}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-orange-500 ${
                      pathname === item.href ? "bg-accent text-orange-500 font-semibold" : ""
                    }`}
                    onClick={(e) => {
                      handleNavItemClick()
                    }}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.title}
                  </Link>
                  {item.submenu && openSubmenu === item.title && (
                    <div className="ml-6 mt-2 grid gap-1">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.title}
                          href={subitem.href}
                          className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-orange-500 ${
                            pathname === subitem.href ? "bg-accent text-orange-500 font-semibold" : ""
                          }`}
                          onClick={handleNavItemClick}
                        >
                          <Plus className="h-4 w-4" />
                          {subitem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link
                href="/"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-orange-500"
                onClick={handleNavItemClick}
              >
                <Home className="h-5 w-5" />
                Voltar para o site
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-orange-500"
                onClick={handleNavItemClick}
              >
                <LogOut className="h-5 w-5" />
                Sair
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2 flex-1">
          <Image src="/microphone-crowd.png" alt="Master Construtora Logo" width={32} height={32} className="rounded" />
          <span className="text-lg font-bold">Master Construtora</span>
        </div>
        {/* <ThemeToggle /> */}
      </header>

      <div className="flex flex-1">
        {/* Sidebar (desktop) */}
        <aside
          className={`hidden flex-col border-r bg-muted/40 transition-all duration-300 md:flex ${
            isNavExpanded ? "w-64" : "w-20"
          }`}
        >
          <div className="flex h-16 items-center border-b px-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/microphone-crowd.png"
                alt="Master Construtora Logo"
                width={32}
                height={32}
                className="rounded"
              />
              {isNavExpanded && <span className="text-lg font-bold">Master Construtora</span>}
            </Link>
            <div className="ml-auto flex flex-col items-center ">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsNavExpanded(!isNavExpanded)}
                className="text-muted-foreground hover:text-foreground"
              >
                {isNavExpanded ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </Button>
              <ThemeToggle />
            </div>
          </div>
          <nav className="flex-1 overflow-auto p-4">
            <ul className="grid gap-2">
              {navItems.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-orange-500 ${
                      pathname === item.href ? "bg-accent text-orange-500 font-semibold" : ""
                    }`}
                    onClick={() => item.submenu && toggleSubmenu(item.title)}
                  >
                    <item.icon className={`${isNavExpanded ? "h-5 w-5" : "h-6 w-6"} transition-all duration-200`} />
                    {isNavExpanded && <span>{item.title}</span>}
                  </Link>
                  {item.submenu && openSubmenu === item.title && (
                    <ul className="ml-6 mt-2 grid gap-1">
                      {item.submenu.map((subitem) => (
                        <li key={subitem.title}>
                          <Link
                            href={subitem.href}
                            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-orange-500 ${
                              pathname === subitem.href ? "bg-accent text-orange-500 font-semibold" : ""
                            }`}
                          >
                            <Plus className="h-4 w-4" />
                            {isNavExpanded && <span>{subitem.title}</span>}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-2">
              <Link
                href="/"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-orange-500"
              >
                <Home className={`${isNavExpanded ? "h-5 w-5" : "h-6 w-6"} transition-all duration-200`} />
                {isNavExpanded && <span>Voltar para o site</span>}
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-orange-500"
              >
                <LogOut className={`${isNavExpanded ? "h-5 w-5" : "h-6 w-6"} transition-all duration-200`} />
                {isNavExpanded && <span>Sair</span>}
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
          <Toaster />
        </main>
      </div>
    </div>
  )
}
