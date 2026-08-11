import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Users, Plus, Pencil, Trash2, Mail, Phone, MapPin } from "lucide-react";
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
import { CepInput } from "@/components/cep-input";
import { useStore, type Cliente } from "@/lib/store";
import { maskDocumento, maskTelefone, validarDocumento } from "@/lib/documento";

export const Route = createFileRoute("/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — OrçaFácil" },
      {
        name: "description",
        content: "Cadastre, edite e organize seus clientes com contato, endereço e observações.",
      },
      { property: "og:title", content: "Clientes — OrçaFácil" },
      {
        property: "og:description",
        content: "Base de clientes com contato, endereço e observações.",
      },
    ],
  }),
  component: ClientesPage,
});

const vazio = {
  nome: "",
  email: "",
  telefone: "",
  endereco: "",
  observacoes: "",
  cnpj: "",
  ie: "",
  cep: "",
  logradouro: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};

function ClientesPage() {
  const { clientes, saveCliente, removeCliente } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [form, setForm] = useState(vazio);
  const [toDelete, setToDelete] = useState<Cliente | null>(null);
  const numeroRef = useRef<HTMLInputElement | null>(null);

  const abrirNovo = () => {
    setEditing(null);
    setForm(vazio);
    setOpen(true);
  };

  const abrirEdicao = (c: Cliente) => {
    setEditing(c);
    setForm({ ...c });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) {
      toast.error("Informe o nome do cliente.");
      return;
    }
    try {
      await saveCliente({ ...form, id: editing?.id });
      toast.success(editing ? "Cliente atualizado com sucesso." : "Cliente cadastrado com sucesso.");
      setOpen(false);
    } catch {
      toast.error("Erro ao salvar cliente. Verifique a conexão.");
    }
  };

  const confirmarExclusao = async () => {
    if (!toDelete) return;
    try {
      await removeCliente(toDelete.id);
      toast.success("Cliente excluído.");
    } catch {
      toast.error("Erro ao excluir cliente.");
    }
    setToDelete(null);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {clientes.length} cliente(s) cadastrado(s).
          </p>
        </div>
        <Button onClick={abrirNovo} className="shrink-0">
          <Plus className="size-4" /> Adicionar Novo Cliente
        </Button>
      </header>

      {clientes.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum cliente cadastrado"
          description="Comece adicionando seu primeiro cliente para poder emitir orçamentos."
          action={
            <Button onClick={abrirNovo}>
              <Plus className="size-4" /> Adicionar Novo Cliente
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clientes.map((c) => (
            <Card key={c.id}>
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold">{c.nome}</h2>
                    {c.observacoes && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {c.observacoes}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" onClick={() => abrirEdicao(c)}>
                      <Pencil className="size-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setToDelete(c)}>
                      <Trash2 className="size-4 text-destructive" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </div>
                </div>
                <dl className="space-y-1.5 text-sm text-muted-foreground">
                  {c.email && (
                    <div className="flex min-w-0 items-center gap-2">
                      <Mail className="size-3.5 shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  {c.telefone && (
                    <div className="flex min-w-0 items-center gap-2">
                      <Phone className="size-3.5 shrink-0" />
                      <span className="truncate">{c.telefone}</span>
                    </div>
                  )}
                  {(c.cnpj || c.ie) && (
                    <div className="flex min-w-0 gap-3 text-xs text-muted-foreground">
                      {c.cnpj && <span>CNPJ: {c.cnpj}</span>}
                      {c.ie && <span>IE: {c.ie}</span>}
                    </div>
                  )}
                  {c.endereco && (
                    <div className="flex min-w-0 items-center gap-2">
                      <MapPin className="size-3.5 shrink-0" />
                      <span className="truncate">{c.endereco}</span>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar cliente" : "Novo cliente"}</DialogTitle>
            <DialogDescription>Preencha os dados de contato do cliente.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                value={form.nome}
                maxLength={120}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Maria Silva"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ / CPF</Label>
                <Input
                  id="cnpj"
                  value={form.cnpj}
                  onChange={(e) => setForm({ ...form, cnpj: maskDocumento(e.target.value) })}
                  inputMode="numeric"
                  maxLength={18}
                  placeholder="00.000.000/0001-00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ie">Inscrição Estadual (IE)</Label>
                <Input
                  id="ie"
                  value={form.ie}
                  maxLength={20}
                  onChange={(e) => setForm({ ...form, ie: e.target.value })}
                  placeholder="123.456.789.012"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  maxLength={160}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="maria@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  maxLength={15}
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: maskTelefone(e.target.value) })}
                  inputMode="numeric"
                  placeholder="(11) 99999-0000"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <CepInput
                value={form.cep}
                onChange={(cep) => setForm((f) => ({ ...f, cep }))}
                onResult={(addr) =>
                  setForm((f) => ({
                    ...f,
                    logradouro: addr.logradouro ?? f.logradouro,
                    neighborhood: addr.neighborhood ?? f.neighborhood,
                    city: addr.city ?? f.city,
                    state: addr.state ?? f.state,
                  }))
                }
                numeroRef={numeroRef}
              />
              <div className="space-y-2">
                <Label htmlFor="logradouro">Logradouro</Label>
                <Input
                  id="logradouro"
                  maxLength={120}
                  value={form.logradouro}
                  onChange={(e) => setForm({ ...form, logradouro: e.target.value })}
                  placeholder="Rua das Flores"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  ref={numeroRef}
                  maxLength={20}
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  placeholder="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  maxLength={60}
                  value={form.complement}
                  onChange={(e) => setForm({ ...form, complement: e.target.value })}
                  placeholder="Apto 42"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  maxLength={80}
                  value={form.neighborhood}
                  onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                  placeholder="Centro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  maxLength={80}
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="São Paulo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado (UF)</Label>
                <Input
                  id="state"
                  maxLength={2}
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase().slice(0, 2) })}
                  placeholder="SP"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="obs">Observações</Label>
              <Textarea
                id="obs"
                rows={3}
                maxLength={500}
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                placeholder="Preferências, histórico, condições especiais..."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar cliente</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete?.nome} será removido permanentemente desta lista.
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