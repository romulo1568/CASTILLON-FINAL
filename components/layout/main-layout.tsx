"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { usePathname } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Header } from "@/components/layout/header"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const pathname = usePathname()

  const isLoginPage = pathname === "/login"

  if (isLoginPage || !user) {
    return <>{children}</>
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6 bg-gray-50">{children}</main>
      </div>
    </SidebarProvider>
  )
}
