"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

export default function ReactQueryProvider({ children }: { children: ReactNode }) {
    const [client] = useState(
        () => new QueryClient({
            defaultOptions: {
                queries: {
                    staleTime: 1000 * 60 * 5,
                    refetchOnWindowFocus: false
                }
            }
        })
    );

    return (
        <QueryClientProvider client={client}>
            {children}
        </QueryClientProvider>
    )
}