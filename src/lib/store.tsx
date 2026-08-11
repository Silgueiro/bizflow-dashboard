import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

export type Cliente = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  observacoes: string;
  cnpj: string;
  ie: string;
  cep: string;
  logradouro: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
};

export type Item = {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  ncm: string;
};

export type OrcamentoItem = {
  itemId: string;
  quantidade: number;
};

export type StatusOrcamento = "Pendente" | "Aprovado" | "Recusado";

export type Empresa = {
  id?: string;
  nome: string;
  documento: string;
  ie: string;
  telefone: string;
  email: string;
  endereco: string;
  logo: string;
  cep: string;
  logradouro: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
};

export type Orcamento = {
  id: string;
  numero: number;
  clienteId: string;
  data: string;
  validade: string;
  itens: OrcamentoItem[];
  observacoes: string;
  status: StatusOrcamento;
};

type Ctx = {
  ready: boolean;
  clientes: Cliente[];
  itens: Item[];
  orcamentos: Orcamento[];
  empresa: Empresa;
  saveEmpresa: (e: Empresa) => Promise<void>;
  saveCliente: (c: Omit<Cliente, "id"> & { id?: string }) => Promise<void>;
  removeCliente: (id: string) => Promise<void>;
  saveItem: (i: Omit<Item, "id"> & { id?: string }) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  saveOrcamento: (
    o: Omit<Orcamento, "id" | "numero"> & { id?: string; numero?: number },
  ) => Promise<string>;
  removeOrcamento: (id: string) => Promise<void>;
  setStatus: (id: string, status: StatusOrcamento) => Promise<void>;
};

export const EMPRESA_VAZIA: Empresa = {
  nome: "",
  documento: "",
  ie: "",
  telefone: "",
  email: "",
  endereco: "",
  logo: "",
  cep: "",
  logradouro: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};

const StoreContext = createContext<Ctx | null>(null);

// ---- DB row types ----
type ClientRow = { id: string; name: string; email: string; phone: string; address: string; notes: string; cnpj: string; ie: string; cep: string; logradouro: string; number: string; complement: string; neighborhood: string; city: string; state: string };
type ProductRow = { id: string; name: string; description: string; price: number; image_url: string; ncm: string };
type QuoteRow = {
  id: string;
  numero: number;
  client_id: string | null;
  status: string;
  total_amount: number;
  data: string;
  valid_until: string | null;
  notes: string;
  quote_items: { product_id: string; quantity: number }[];
};
type CompanyRow = {
  id: string;
  company_name: string;
  cnpj: string;
  ie: string;
  phone: string;
  email: string;
  address: string;
  logo_url: string;
  cep: string;
  logradouro: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
};

const mapClient = (r: ClientRow): Cliente => ({
  id: r.id,
  nome: r.name,
  email: r.email ?? "",
  telefone: r.phone ?? "",
  endereco: r.address ?? "",
  observacoes: r.notes ?? "",
  cnpj: r.cnpj ?? "",
  ie: r.ie ?? "",
  cep: r.cep ?? "",
  logradouro: r.logradouro ?? "",
  number: r.number ?? "",
  complement: r.complement ?? "",
  neighborhood: r.neighborhood ?? "",
  city: r.city ?? "",
  state: r.state ?? "",
});

const mapProduct = (r: ProductRow): Item => ({
  id: r.id,
  nome: r.name,
  descricao: r.description ?? "",
  preco: Number(r.price) ?? 0,
  imagem: r.image_url ?? "",
  ncm: r.ncm ?? "",
});

const mapQuote = (r: QuoteRow): Orcamento => ({
  id: r.id,
  numero: r.numero,
  clienteId: r.client_id ?? "",
  data: r.data ?? "",
  validade: r.valid_until ?? "",
  itens: (r.quote_items ?? []).map((qi) => ({ itemId: qi.product_id, quantidade: qi.quantity })),
  observacoes: r.notes ?? "",
  status: (r.status as StatusOrcamento) ?? "Pendente",
});

const mapCompany = (r: CompanyRow): Empresa => ({
  id: r.id,
  nome: r.company_name ?? "",
  documento: r.cnpj ?? "",
  ie: r.ie ?? "",
  telefone: r.phone ?? "",
  email: r.email ?? "",
  endereco: r.address ?? "",
  logo: r.logo_url ?? "",
  cep: r.cep ?? "",
  logradouro: r.logradouro ?? "",
  number: r.number ?? "",
  complement: r.complement ?? "",
  neighborhood: r.neighborhood ?? "",
  city: r.city ?? "",
  state: r.state ?? "",
});

export function StoreProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [itens, setItens] = useState<Item[]>([]);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [empresa, setEmpresa] = useState<Empresa>(EMPRESA_VAZIA);
  const [ready, setReady] = useState(false);

  const loadAll = useCallback(async () => {
    const [c, p, q, comp] = await Promise.all([
      supabase.from("clients").select("*").order("created_at"),
      supabase.from("products").select("*").order("created_at"),
      supabase.from("quotes").select("*, quote_items(*)").order("numero", { ascending: false }),
      supabase.from("company_settings").select("*").limit(1).maybeSingle(),
    ]);

    if (c.data) setClientes((c.data as ClientRow[]).map(mapClient));
    if (p.data) setItens((p.data as ProductRow[]).map(mapProduct));
    if (q.data) setOrcamentos((q.data as QuoteRow[]).map(mapQuote));
    if (comp.data) setEmpresa(mapCompany(comp.data as CompanyRow));
  }, []);

  useEffect(() => {
    (async () => {
      await loadAll();
      setReady(true);
    })();
  }, [loadAll]);

  const saveEmpresa = useCallback(async (e: Empresa) => {
    const row = {
      company_name: e.nome,
      cnpj: e.documento,
      ie: e.ie,
      phone: e.telefone,
      email: e.email,
      address: e.endereco,
      logo_url: e.logo,
      cep: e.cep,
      logradouro: e.logradouro,
      number: e.number,
      complement: e.complement,
      neighborhood: e.neighborhood,
      city: e.city,
      state: e.state,
    };
    if (e.id) {
      const { data, error } = await supabase
        .from("company_settings")
        .update(row)
        .eq("id", e.id)
        .select("*")
        .single();
      if (error) throw error;
      setEmpresa(mapCompany(data as CompanyRow));
    } else {
      const { data, error } = await supabase
        .from("company_settings")
        .insert(row)
        .select("*")
        .single();
      if (error) throw error;
      setEmpresa(mapCompany(data as CompanyRow));
    }
  }, []);

  const saveCliente = useCallback(async (c) => {
    const row = {
      name: c.nome,
      email: c.email,
      phone: c.telefone,
      address: c.endereco,
      notes: c.observacoes,
      cnpj: c.cnpj,
      ie: c.ie,
      cep: c.cep,
      logradouro: c.logradouro,
      number: c.number,
      complement: c.complement,
      neighborhood: c.neighborhood,
      city: c.city,
      state: c.state,
    };
    if (c.id) {
      const { data, error } = await supabase
        .from("clients")
        .update(row)
        .eq("id", c.id)
        .select("*")
        .single();
      if (error) throw error;
      const mapped = mapClient(data as ClientRow);
      setClientes((prev) => prev.map((x) => (x.id === mapped.id ? mapped : x)));
    } else {
      const { data, error } = await supabase.from("clients").insert(row).select("*").single();
      if (error) throw error;
      setClientes((prev) => [...prev, mapClient(data as ClientRow)]);
    }
  }, []);

  const removeCliente = useCallback(async (id: string) => {
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) throw error;
    setClientes((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const saveItem = useCallback(async (i) => {
    const row = {
      name: i.nome,
      description: i.descricao,
      price: i.preco,
      image_url: i.imagem,
      ncm: i.ncm,
    };
    if (i.id) {
      const { data, error } = await supabase
        .from("products")
        .update(row)
        .eq("id", i.id)
        .select("*")
        .single();
      if (error) throw error;
      const mapped = mapProduct(data as ProductRow);
      setItens((prev) => prev.map((x) => (x.id === mapped.id ? mapped : x)));
    } else {
      const { data, error } = await supabase.from("products").insert(row).select("*").single();
      if (error) throw error;
      setItens((prev) => [...prev, mapProduct(data as ProductRow)]);
    }
  }, []);

  const removeItem = useCallback(async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    setItens((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const saveOrcamento = useCallback(async (o) => {
    const total = o.itens.reduce((sum: number, oi: OrcamentoItem) => {
      // unit_price snapshot uses 0 if product not found; app recomputes from current prices
      return sum;
    }, 0);

    const quoteRow = {
      client_id: o.clienteId || null,
      status: o.status ?? "Pendente",
      total_amount: total,
      data: o.data,
      valid_until: o.validade || null,
      notes: o.observacoes,
    };

    let quoteId: string;
    let numero: number;

    if (o.id) {
      const { data, error } = await supabase
        .from("quotes")
        .update(quoteRow)
        .eq("id", o.id)
        .select("*")
        .single();
      if (error) throw error;
      quoteId = (data as QuoteRow).id;
      numero = (data as QuoteRow).numero;
      // replace items
      await supabase.from("quote_items").delete().eq("quote_id", quoteId);
    } else {
      const { data: maxData } = await supabase
        .from("quotes")
        .select("numero")
        .order("numero", { ascending: false })
        .limit(1)
        .maybeSingle();
      const nextNumero = (maxData?.numero ?? 1000) + 1;
      const { data, error } = await supabase
        .from("quotes")
        .insert({ ...quoteRow, numero: nextNumero })
        .select("*")
        .single();
      if (error) throw error;
      quoteId = (data as QuoteRow).id;
      numero = (data as QuoteRow).numero;
    }

    if (o.itens.length > 0) {
      const items = o.itens.map((oi: OrcamentoItem) => ({
        quote_id: quoteId,
        product_id: oi.itemId,
        quantity: oi.quantidade,
        unit_price: 0,
      }));
      const { error: itemError } = await supabase.from("quote_items").insert(items);
      if (itemError) throw itemError;
    }

    // reload quotes to get joined items
    const { data: refreshed } = await supabase
      .from("quotes")
      .select("*, quote_items(*)")
      .order("numero", { ascending: false });
    if (refreshed) setOrcamentos((refreshed as QuoteRow[]).map(mapQuote));

    return quoteId;
  }, []);

  const removeOrcamento = useCallback(async (id: string) => {
    const { error } = await supabase.from("quotes").delete().eq("id", id);
    if (error) throw error;
    setOrcamentos((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const setStatus = useCallback(async (id: string, status: StatusOrcamento) => {
    const { error } = await supabase.from("quotes").update({ status }).eq("id", id);
    if (error) throw error;
    setOrcamentos((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }, []);

  const value = useMemo(
    () => ({
      ready,
      clientes,
      itens,
      orcamentos,
      empresa,
      saveEmpresa,
      saveCliente,
      removeCliente,
      saveItem,
      removeItem,
      saveOrcamento,
      removeOrcamento,
      setStatus,
    }),
    [
      ready,
      clientes,
      itens,
      orcamentos,
      empresa,
      saveEmpresa,
      saveCliente,
      removeCliente,
      saveItem,
      removeItem,
      saveOrcamento,
      removeOrcamento,
      setStatus,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const formatDate = (iso: string) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

export function orcamentoTotal(o: Orcamento, itens: Item[]) {
  return o.itens.reduce((sum, oi) => {
    const item = itens.find((i) => i.id === oi.itemId);
    return sum + (item ? item.preco * oi.quantidade : 0);
  }, 0);
}
