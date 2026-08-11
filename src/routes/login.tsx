import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Receipt, Mail, Lock, Loader as Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — OrçaFácil" },
      { name: "description", content: "Acesse o painel administrativo do OrçaFácil." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Preencha e-mail e senha.");
      return;
    }
    setLoading(true);
    const { error } =
      mode === "login" ? await signIn(email, password) : await signUp(email, password);
    setLoading(false);

    if (error) {
      toast.error(error);
      return;
    }

    if (mode === "signup") {
      toast.success("Conta criada! Faça login para continuar.");
      setMode("login");
      setPassword("");
      return;
    }

    toast.success("Login realizado com sucesso!");
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 px-4 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Receipt className="size-7" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">OrçaFácil</h1>
            <p className="text-sm text-muted-foreground">Gestão comercial</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
          <h2 className="text-xl font-semibold tracking-tight">
            {mode === "login" ? "Entrar" : "Criar conta"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login"
              ? "Acesse o painel administrativo."
              : "Crie sua conta para começar a usar."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-10"
                  autoComplete="email"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              {mode === "login" ? "Entrar" : "Criar conta"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                Não tem conta?{" "}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                  onClick={() => setMode("signup")}
                >
                  Criar conta
                </button>
              </>
            ) : (
              <>
                Já tem conta?{" "}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                  onClick={() => setMode("login")}
                >
                  Entrar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
