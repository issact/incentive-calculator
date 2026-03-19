"use client"

import type { ReactNode } from "react"
import ReactQueryProvider from "./ReactQueryProvider"
import ToastProvider from "./ToastProvider"

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ReactQueryProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </ReactQueryProvider>
  )
}

