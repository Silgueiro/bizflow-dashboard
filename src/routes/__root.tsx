import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { StoreProvider } from "@/lib/store";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "OrçaFácil — Gestão de clientes, produtos e orçamentos" },
      {
        name: "description",
        content:
          "Painel administrativo para cadastrar clientes, produtos e montar orçamentos profissionais prontos para impressão.",
      },
      { property: "og:title", content: "OrçaFácil — Gestão comercial" },
      {
        property: "og:description",
        content: "Cadastre clientes e produtos e gere orçamentos em PDF em minutos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isLoginPage = pathname === "/login";

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGate>
          <StoreProvider>
            {isLoginPage ? (
              // Se for a rota /login, renderiza direto o formulário sem o menu lateral
              <main className="min-h-screen w-full bg-background">
                <Outlet />
                <Toaster richColors position="top-right" />
              </main>
            ) : (
              // Se for qualquer outra rota protegida, renderiza o layout com o menu lateral
              <SidebarProvider>
                <div className="flex min-h-screen w-full bg-background">
                  <AppSidebar />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <header className="no-print sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-border bg-card/80 px-3 backdrop-blur">
                      <SidebarTrigger />
                      <span className="truncate text-sm font-medium text-muted-foreground">
                        Painel administrativo
                      </span>
                    </header>
                    <main className="flex-1 p-4 md:p-8">
                      <Outlet />
                    </main>
                  </div>
                </div>
                <Toaster richColors position="top-right" />
              </SidebarProvider>
            )}
          </StoreProvider>
        </AuthGate>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Se não estiver logado e não for a página de login, redireciona para o /login
    if (!session && pathname !== "/login") {
      router.navigate({ to: "/login" });
    }

    // Se já estiver logado e tentar entrar no /login, redireciona para a home /
    if (session && pathname === "/login") {
      router.navigate({ to: "/" });
    }
  }, [session, loading, pathname, router]);

  // Se estiver verificando a sessão inicialmente, exibe o indicador de carregamento
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Libera a renderização da aplicação/página
  return <>{children}</>;
}
