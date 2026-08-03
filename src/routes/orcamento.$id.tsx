import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Printer, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { ProdutoImagem } from "@/components/produto-imagem";
import { brl, formatDate, useStore } from "@/lib/store";

export const Route = createFileRoute("/orcamento/$id")({
  head: () => ({
    meta: [
      { title: "Documento do orçamento — OrçaFácil" },
      {
        name: "description",
        content:
          "Visualização do orçamento em formato de documento, com dados do cliente, itens, imagens e totalizador.",
      },
      { property: "og:title", content: "Documento do orçamento — OrçaFácil" },
      {
        property: "og:description",
        content: "Orçamento pronto para impressão ou exportação em PDF.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DocumentoOrcamento,
});

function DocumentoOrcamento() {
  const { id } = Route.useParams();
  const { orcamentos, clientes, itens, ready } = useStore();

  const orcamento = orcamentos.find((o) => o.id === id);

  if (!ready) return <div className="p-8 text-sm text-muted-foreground">Carregando...</div>;

  if (!orcamento) {
    return (
      <div className="mx-auto max-w-2xl">
        <EmptyState
          icon={FileText}
          title="Orçamento não encontrado"
          description="Ele pode ter sido excluído ou o link está incorreto."
          action={
            <Button asChild>
              <Link to="/orcamentos">Voltar para orçamentos</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const cliente = clientes.find((c) => c.id === orcamento.clienteId);
  const linhas = orcamento.itens
    .map((l) => ({ ...l, item: itens.find((i) => i.id === l.itemId) }))
    .filter((l) => l.item);
  const total = linhas.reduce((s, l) => s + l.item!.preco * l.quantidade, 0);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost">
          <Link to="/orcamentos">
            <ArrowLeft className="size-4" /> Voltar
          </Link>
        </Button>
        <Button onClick={() => window.print()}>
          <Printer className="size-4" /> Imprimir / Salvar PDF
        </Button>
      </div>

      <article className="print-area rounded-xl border border-border bg-card p-6 shadow-sm md:p-10">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              OrçaFácil
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Orçamento #{orcamento.numero}
            </h1>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>Emissão: {formatDate(orcamento.data)}</p>
            <p>Validade: {formatDate(orcamento.validade)}</p>
            <Badge
              className="mt-2"
              variant={
                orcamento.status === "Aprovado"
                  ? "default"
                  : orcamento.status === "Recusado"
                    ? "destructive"
                    : "secondary"
              }
            >
              {orcamento.status}
            </Badge>
          </div>
        </header>

        <section className="border-b border-border py-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Cliente
          </h2>
          <p className="mt-2 text-base font-semibold">{cliente?.nome ?? "Cliente removido"}</p>
          <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
            {cliente?.email && <p>{cliente.email}</p>}
            {cliente?.telefone && <p>{cliente.telefone}</p>}
            {cliente?.endereco && <p>{cliente.endereco}</p>}
          </div>
        </section>

        <section className="py-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Itens
          </h2>
          <ul className="mt-3 divide-y divide-border">
            {linhas.map((l) => (
              <li key={l.itemId} className="flex flex-wrap items-center gap-4 py-4">
                <ProdutoImagem
                  src={l.item!.imagem}
                  alt={l.item!.nome}
                  className="size-16 shrink-0 rounded-md border border-border"
                />
                <div className="min-w-[160px] flex-1">
                  <p className="font-medium">{l.item!.nome}</p>
                  <p className="text-sm text-muted-foreground">{l.item!.descricao}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-muted-foreground">
                    {l.quantidade} × {brl(l.item!.preco)}
                  </p>
                  <p className="font-semibold">{brl(l.item!.preco * l.quantidade)}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex justify-end border-t border-border pt-4">
            <div className="flex w-full max-w-xs items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total geral</span>
              <span className="text-2xl font-bold text-primary">{brl(total)}</span>
            </div>
          </div>
        </section>

        {orcamento.observacoes && (
          <section className="border-t border-border pt-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Observações e condições de pagamento
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
              {orcamento.observacoes}
            </p>
          </section>
        )}
      </article>
    </div>
  );
}