import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, Save, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProdutoImagem } from "@/components/produto-imagem";
import { uploadImage } from "@/lib/supabase";
import { EMPRESA_VAZIA, useStore, type Empresa } from "@/lib/store";
import { maskDocumento, maskTelefone, validarDocumento } from "@/lib/documento";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Minha Empresa — OrçaFácil" },
      {
        name: "description",
        content:
          "Cadastre razão social, CNPJ, contato, endereço e logo da sua empresa para aparecerem nos orçamentos.",
      },
      { property: "og:title", content: "Minha Empresa — OrçaFácil" },
      {
        property: "og:description",
        content: "Dados da empresa usados automaticamente no cabeçalho dos orçamentos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  const { empresa, saveEmpresa, ready } = useStore();
  const [form, setForm] = useState<Empresa>(EMPRESA_VAZIA);
  const [erroDoc, setErroDoc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (ready) setForm(empresa ?? EMPRESA_VAZIA);
  }, [ready, empresa]);

  const set = (k: keyof Empresa) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const docErro = erroDoc;

  const handleLogo = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, "empresa");
      set("logo")(url);
      toast.success("Logo enviado.");
    } catch {
      toast.error("Falha ao enviar logo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
          <Building2 className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Minha Empresa</h1>
          <p className="text-sm text-muted-foreground">
            Estes dados aparecem no cabeçalho de todos os orçamentos.
          </p>
        </div>
      </div>

      <form
        className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm"
        onSubmit={async (e) => {
          e.preventDefault();
          const erro = validarDocumento(form.documento);
          setErroDoc(erro);
          if (erro) {
            toast.error(erro);
            return;
          }
          try {
            await saveEmpresa(form);
            toast.success("Dados da empresa salvos");
          } catch {
            toast.error("Erro ao salvar dados. Verifique a conexão.");
          }
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="nome">Nome fantasia / Razão social</Label>
            <Input
              id="nome"
              value={form.nome}
              onChange={(e) => set("nome")(e.target.value)}
              placeholder="Minha Empresa LTDA"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="documento">CNPJ / CPF</Label>
            <Input
              id="documento"
              value={form.documento}
              onChange={(e) => {
                const v = maskDocumento(e.target.value);
                set("documento")(v);
                if (erroDoc) setErroDoc(validarDocumento(v));
              }}
              onBlur={(e) => setErroDoc(validarDocumento(e.target.value))}
              inputMode="numeric"
              maxLength={18}
              aria-invalid={docErro ? true : undefined}
              aria-describedby={docErro ? "documento-erro" : undefined}
              placeholder="00.000.000/0001-00"
            />
            {docErro && (
              <p id="documento-erro" className="text-sm text-destructive">
                {docErro}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="ie">Inscrição Estadual (IE)</Label>
            <Input
              id="ie"
              value={form.ie}
              maxLength={20}
              onChange={(e) => set("ie")(e.target.value)}
              placeholder="123.456.789.012"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone / WhatsApp</Label>
            <Input
              id="telefone"
              maxLength={15}
              value={form.telefone}
              onChange={(e) => set("telefone")(maskTelefone(e.target.value))}
              inputMode="numeric"
              placeholder="(11) 99999-0000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set("email")(e.target.value)}
              placeholder="contato@empresa.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo">URL do logo</Label>
            <div className="flex gap-2">
              <Input
                id="logo"
                value={form.logo}
                onChange={(e) => set("logo")(e.target.value)}
                placeholder="https://..."
              />
              <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm hover:bg-accent">
                <Upload className="size-4" />
                {uploading ? "Enviando..." : "Enviar"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleLogo(e.target.files?.[0])}
                />
              </label>
            </div>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="endereco">Endereço completo</Label>
            <Textarea
              id="endereco"
              value={form.endereco}
              onChange={(e) => set("endereco")(e.target.value)}
              placeholder="Rua, número, bairro, cidade - UF, CEP"
              rows={2}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-lg border border-dashed border-border p-4">
          <ProdutoImagem
            src={form.logo}
            alt="Logo da empresa"
            className="size-20 shrink-0 rounded-md border border-border bg-background"
          />
          <p className="text-sm text-muted-foreground">
            Pré-visualização do logo. Cole a URL de uma imagem hospedada para exibi-la no
            cabeçalho dos orçamentos.
          </p>
        </div>

        <div className="flex justify-end">
          <Button type="submit">
            <Save className="size-4" /> Salvar dados
          </Button>
        </div>
      </form>
    </div>
  );
}