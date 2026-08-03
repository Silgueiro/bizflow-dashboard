import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FileText, Plus, Trash2, Eye, Pencil, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/empty-state";
import { ProdutoImagem } from "@/components/produto-imagem";
import {
  brl,
  formatDate,
  orcamentoTotal,
  useStore,
  type Orcamento,
  type OrcamentoItem,
  type StatusOrcamento,
} from "@/lib/store";

export const Route = createFileRoute("/orcamentos")({
  head: () => ({
    meta: [
      { title: "Orçamentos — OrçaFácil" },
      {
        name: "description",
        content:
          "Monte orçamentos com clientes e produtos cadastrados, acompanhe status e gere o documento para impressão ou PDF.",
      },
      { property: "og:title", content: "Orçamentos — OrçaFácil" },
      {
        property: "og:description",
        content: "Construtor de orçamentos com cálculo automático e exportação em PDF.",
      },
    ],
  }),
  component: OrcamentosPage,
});

const hoje = () => new Date().toISOString().slice(0, 10);
const emDias = (dias: number) =>
  new Date(Date.now() + dias * 86400000).toISOString().slice(0, 10);

const statusVariant = (s: StatusOrcamento) =>
  s === "Aprovado" ? "default" : s === "Recusado" ? "destructive" : "secondary";

function OrcamentosPage() {
  const { clientes, itens, orcamentos, saveOrcamento, removeOrcamento, setStatus } = useStore();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [clienteId, setClienteId] = useState("");
  const [data, setData] = useState(hoje());
  const [validade, setValidade] = useState(emDias(15));
  const [linhas, setLinhas] = useState<OrcamentoItem[]>([]);
  const [observacoes, setObservacoes] = useState("");
  const [toDelete, setToDelete] = useState<Orcamento | null>(null);

  const total = useMemo(
    () =>
      linhas.reduce((s, l) => {
        const item = itens.find((i) => i.id === l.itemId);
        return s + (item ? item.preco * l.quantidade : 0);
      }, 0),
    [linhas, itens],
  );

  const abrirNovo = () => {
    if (clientes.length === 0) {
      toast.error("Cadastre um cliente antes de criar um orçamento.");
      return;
    }
    setEditingId(null);
    setClienteId("");
    setData(hoje());
    setValidade(emDias(15));
    setLinhas([]);
    setObservacoes("");
    setOpen(true);
  };

  const abrirEdicao = (o: Orcamento) => {
    setEditingId(o.id);
    setClienteId(o.clienteId);
    setData(o.data);
    setValidade(o.validade);
    setLinhas(o.itens);
    setObservacoes(o.observacoes);
    setOpen(true);
  };

  const addLinha = (itemId: string) => {
    if (linhas.some((l) => l.itemId === itemId)) {
      toast.info("Este item já está no orçamento.");
      return;
    }
    setLinhas([...linhas, { itemId, quantidade: 1 }]);
  };

  const setQtd = (itemId: string, qtd: number) =>
    setLinhas(
      linhas.map((l) => (l.itemId === itemId ? { ...l, quantidade: Math.max(1, qtd || 1) } : l)),
    );

  const salvar = async () => {
    if (!clienteId) {
      toast.error("Selecione o cliente.");
      return;
    }
    if (linhas.length === 0) {
      toast.error("Adicione ao menos um item ao orçamento.");
      return;
    }
    try {
      const id = await saveOrcamento({
        clienteId,
        data,
        validade,
        itens: linhas,
        observacoes,
        status: orcamentos.find((o) => o.id === editingId)?.status ?? "Pendente",
        id: editingId ?? undefined,
      });
      toast.success(editingId ? "Orçamento atualizado." : "Orçamento criado com sucesso.");
      setOpen(false);
      if (!editingId) navigate({ to: "/orcamento/$id", params: { id } });
    } catch {
      toast.error("Erro ao salvar orçamento. Verifique a conexão.");
    }
  };

  const confirmarExclusao = async () => {
    if (!toDelete) return;
    try {
      await removeOrcamento(toDelete.id);
      toast.success("Orçamento excluído.");
    } catch {
      toast.error("Erro ao excluir orçamento.");
    }
    setToDelete(null);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight">Orçamentos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {orcamentos.length} orçamento(s) registrado(s).
          </p>
        </div>
        <Button onClick={abrirNovo} className="shrink-0">
          <Plus className="size-4" /> Criar Novo Orçamento
        </Button>
      </header>

      {orcamentos.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhum orçamento criado"
          description="Monte propostas selecionando clientes e produtos já cadastrados."
          action={
            <Button onClick={abrirNovo}>
              <Plus className="size-4" /> Criar Novo Orçamento
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {[...orcamentos]
            .sort((a, b) => b.numero - a.numero)
            .map((o) => {
              const cliente = clientes.find((c) => c.id === o.clienteId);
              return (
                <Card key={o.id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate font-semibold">Orçamento #{o.numero}</h2>
                        <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
                      </div>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {cliente?.nome ?? "Cliente removido"} · {formatDate(o.data)} · válido até{" "}
                        {formatDate(o.validade)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold">
                        {brl(orcamentoTotal(o, itens))}
                      </span>
                      <Select
                        value={o.status}
                        onValueChange={async (v) => {
                          try {
                            await setStatus(o.id, v as StatusOrcamento);
                            toast.success(`Status alterado para ${v}.`);
                          } catch {
                            toast.error("Erro ao alterar status.");
                          }
                        }}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pendente">Pendente</SelectItem>
                          <SelectItem value="Aprovado">Aprovado</SelectItem>
                          <SelectItem value="Recusado">Recusado</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button asChild variant="outline" size="icon">
                        <Link to="/orcamento/$id" params={{ id: o.id }}>
                          <Eye className="size-4" />
                          <span className="sr-only">Visualizar</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => abrirEdicao(o)}>
                        <Pencil className="size-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setToDelete(o)}>
                        <Trash2 className="size-4 text-destructive" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar orçamento" : "Novo orçamento"}</DialogTitle>
            <DialogDescription>
              Selecione o cliente, adicione os itens e ajuste as quantidades.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-1">
                <Label>Cliente</Label>
                <Select value={clienteId} onValueChange={setClienteId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validade">Validade</Label>
                <Input
                  id="validade"
                  type="date"
                  value={validade}
                  onChange={(e) => setValidade(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Label>Itens do orçamento</Label>
                <Select value="" onValueChange={addLinha}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Adicionar item..." />
                  </SelectTrigger>
                  <SelectContent>
                    {itens.length === 0 ? (
                      <SelectItem value="__none" disabled>
                        Nenhum item cadastrado
                      </SelectItem>
                    ) : (
                      itens.map((i) => (
                        <SelectItem key={i.id} value={i.id}>
                          {i.nome} — {brl(i.preco)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {linhas.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Nenhum item adicionado ainda.
                </p>
              ) : (
                <ul className="space-y-2">
                  {linhas.map((l) => {
                    const item = itens.find((i) => i.id === l.itemId);
                    if (!item) return null;
                    return (
                      <li
                        key={l.itemId}
                        className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3"
                      >
                        <ProdutoImagem
                          src={item.imagem}
                          alt={item.nome}
                          className="size-14 shrink-0 rounded-md"
                        />
                        <div className="min-w-[140px] flex-1">
                          <p className="truncate text-sm font-medium">{item.nome}</p>
                          <p className="line-clamp-2 text-xs text-muted-foreground">
                            {item.descricao}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Unitário: {brl(item.preco)}
                          </p>
                        </div>
                        <Input
                          type="number"
                          min={1}
                          className="w-20"
                          value={l.quantidade}
                          onChange={(e) => setQtd(l.itemId, Number(e.target.value))}
                        />
                        <span className="w-28 text-right text-sm font-semibold">
                          {brl(item.preco * l.quantidade)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setLinhas(linhas.filter((x) => x.itemId !== l.itemId))}
                        >
                          <X className="size-4" />
                          <span className="sr-only">Remover item</span>
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="flex items-center justify-end gap-3 rounded-lg bg-accent px-4 py-3">
                <span className="text-sm font-medium text-accent-foreground">Total geral</span>
                <span className="text-lg font-bold text-accent-foreground">{brl(total)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cond">Observações / condições de pagamento</Label>
              <Textarea
                id="cond"
                rows={3}
                maxLength={800}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="50% na aprovação e 50% na entrega. Prazo de execução: 10 dias úteis."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={salvar}>Salvar orçamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir orçamento?</AlertDialogTitle>
            <AlertDialogDescription>
              O orçamento #{toDelete?.numero} será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExclusao}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}