"use client";

import { useState, useEffect, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

// Singleton QueryClient — created once, never re-created on re-render
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
        gcTime: 10 * 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
      {process.env.NODE_ENV === "development" && (
        <DynamicDevtools client={queryClient} />
      )}
    </QueryClientProvider>
  );
}

// Lazy-load devtools so they never ship to production bundle
function DynamicDevtools({ client }: { client: QueryClient }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  if (!show) return null;

  try {
    const { ReactQueryDevtools } = require("@tanstack/react-query-devtools");
    return <ReactQueryDevtools client={client} initialIsOpen={false} />;
  } catch {
    return null;
  }
}