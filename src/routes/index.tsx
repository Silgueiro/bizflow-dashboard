import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, Package, FileText, CheckCircle2, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { brl, formatDate, orcamentoTotal, useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — OrçaFácil" },
      {
        name: "description",
        content:
          "Visão geral de clientes, produtos e orçamentos: totais, valores aprovados e últimas propostas.",
      },
      { property: "og:title", content: "Dashboard — OrçaFácil" },
      {
        property: "og:description",
        content: "Acompanhe clientes, produtos e o valor total dos seus orçamentos.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { clientes, itens, orcamentos } = useStore();

  const aprovados = orcamentos.filter((o) => o.status === "Aprovado");
  const totalAprovado = aprovados.reduce((s, o) => s + orcamentoTotal(o, itens), 0);

  const stats = [
    { label: "Clientes", value: String(clientes.length), icon: Users },
    { label: "Produtos", value: String(itens.length), icon: Package },
    { label: "Orçamentos", value: String(orcamentos.length), icon: FileText },
    { label: "Total aprovado", value: brl(totalAprovado), icon: CheckCircle2 },
  ];

  const recentes = [...orcamentos].sort((a, b) => b.numero - a.numero).slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resumo da sua operação comercial.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                <s.icon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {s.label}
                </p>
                <p className="truncate text-xl font-semibold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Orçamentos recentes</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link to="/orcamentos">Ver todos</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentes.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="Nenhum orçamento ainda"
              description="Cadastre clientes e produtos para montar seu primeiro orçamento."
              action={
                <Button asChild>
                  <Link to="/orcamentos">Criar orçamento</Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {recentes.map((o) => {
                const cliente = clientes.find((c) => c.id === o.clienteId);
                return (
                  <li key={o.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        #{o.numero} · {cliente?.nome ?? "Cliente removido"}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(o.data)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm font-semibold">
                        {brl(orcamentoTotal(o, itens))}
                      </span>
                      <Badge
                        variant={
                          o.status === "Aprovado"
                            ? "default"
                            : o.status === "Recusado"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {o.status}
                      </Badge>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}