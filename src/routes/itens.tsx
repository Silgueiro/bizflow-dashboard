import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Package, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { brl, useStore, type Item } from "@/lib/store";

export const Route = createFileRoute("/itens")({
  head: () => ({
    meta: [
      { title: "Itens e Produtos — OrçaFácil" },
      {
        name: "description",
        content:
          "Catálogo de produtos com imagem, descrição detalhada e valor unitário para usar em orçamentos.",
      },
      { property: "og:title", content: "Itens e Produtos — OrçaFácil" },
      {
        property: "og:description",
        content: "Catálogo com imagem, descrição e preço unitário dos seus produtos.",
      },
    ],
  }),
  component: ItensPage,
});

const vazio = { nome: "", descricao: "", preco: "", imagem: "" };

function ItensPage() {
  const { itens, saveItem, removeItem } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState(vazio);
  const [toDelete, setToDelete] = useState<Item | null>(null);

  const abrirNovo = () => {
    setEditing(null);
    setForm(vazio);
    setOpen(true);
  };

  const abrirEdicao = (i: Item) => {
    setEditing(i);
    setForm({ nome: i.nome, descricao: i.descricao, preco: String(i.preco), imagem: i.imagem });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const preco = Number(form.preco.replace(",", "."));
    if (!form.nome.trim()) {
      toast.error("Informe o nome do item.");
      return;
    }
    if (!Number.isFinite(preco) || preco < 0) {
      toast.error("Informe um valor unitário válido.");
      return;
    }
    saveItem({
      nome: form.nome,
      descricao: form.descricao,
      imagem: form.imagem,
      preco,
      id: editing?.id,
    });
    toast.success(editing ? "Item atualizado com sucesso." : "Item cadastrado com sucesso.");
    setOpen(false);
  };

  const confirmarExclusao = () => {
    if (!toDelete) return;
    removeItem(toDelete.id);
    toast.success("Item excluído.");
    setToDelete(null);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight">Itens / Produtos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {itens.length} item(ns) no catálogo.
          </p>
        </div>
        <Button onClick={abrirNovo} className="shrink-0">
          <Plus className="size-4" /> Novo Item
        </Button>
      </header>

      {itens.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Catálogo vazio"
          description="Cadastre produtos com imagem, descrição e preço para incluí-los nos orçamentos."
          action={
            <Button onClick={abrirNovo}>
              <Plus className="size-4" /> Novo Item
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {itens.map((i) => (
            <Card key={i.id} className="overflow-hidden pt-0">
              <ProdutoImagem src={i.imagem} alt={i.nome} className="h-40 w-full" />
              <CardContent className="space-y-2 p-5">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="min-w-0 flex-1 truncate font-semibold">{i.nome}</h2>
                  <span className="shrink-0 text-sm font-semibold text-primary">
                    {brl(i.preco)}
                  </span>
                </div>
                <p className="line-clamp-3 text-sm text-muted-foreground">{i.descricao}</p>
                <div className="flex justify-end gap-1 pt-1">
                  <Button variant="ghost" size="icon" onClick={() => abrirEdicao(i)}>
                    <Pencil className="size-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setToDelete(i)}>
                    <Trash2 className="size-4 text-destructive" />
                    <span className="sr-only">Excluir</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar item" : "Novo item"}</DialogTitle>
            <DialogDescription>Informe imagem, descrição e valor unitário.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="imagem">URL da imagem</Label>
              <Input
                id="imagem"
                value={form.imagem}
                maxLength={500}
                onChange={(e) => setForm({ ...form, imagem: e.target.value })}
                placeholder="https://..."
              />
              <ProdutoImagem
                src={form.imagem}
                alt="Pré-visualização"
                className="h-36 w-full rounded-lg border border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-nome">Nome do item</Label>
              <Input
                id="item-nome"
                maxLength={120}
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Cadeira executiva"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-desc">Descrição detalhada</Label>
              <Textarea
                id="item-desc"
                rows={3}
                maxLength={600}
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Materiais, medidas, garantia..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-preco">Valor unitário (R$)</Label>
              <Input
                id="item-preco"
                inputMode="decimal"
                value={form.preco}
                onChange={(e) => setForm({ ...form, preco: e.target.value })}
                placeholder="1250.00"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar item</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir item?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete?.nome} será removido do catálogo.
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