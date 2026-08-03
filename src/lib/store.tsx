import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Cliente = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  observacoes: string;
};

export type Item = {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
};

export type OrcamentoItem = {
  itemId: string;
  quantidade: number;
};

export type StatusOrcamento = "Pendente" | "Aprovado" | "Recusado";

export type Empresa = {
  nome: string;
  documento: string;
  telefone: string;
  email: string;
  endereco: string;
  logo: string;
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

type Data = {
  clientes: Cliente[];
  itens: Item[];
  orcamentos: Orcamento[];
  empresa: Empresa;
};

export const EMPRESA_VAZIA: Empresa = {
  nome: "",
  documento: "",
  telefone: "",
  email: "",
  endereco: "",
  logo: "",
};

const EMPTY: Data = { clientes: [], itens: [], orcamentos: [], empresa: EMPRESA_VAZIA };
const KEY = "orcafacil.data.v1";

export const uid = () => Math.random().toString(36).slice(2, 10);

type Ctx = {
  ready: boolean;
  clientes: Cliente[];
  itens: Item[];
  orcamentos: Orcamento[];
  empresa: Empresa;
  saveEmpresa: (e: Empresa) => void;
  saveCliente: (c: Omit<Cliente, "id"> & { id?: string | undefined }) => void;
  removeCliente: (id: string) => void;
  saveItem: (i: Omit<Item, "id"> & { id?: string | undefined }) => void;
  removeItem: (id: string) => void;
  saveOrcamento: (o: Omit<Orcamento, "id" | "numero"> & { id?: string | undefined; numero?: number | undefined }) => string;
  removeOrcamento: (id: string) => void;
  setStatus: (id: string, status: StatusOrcamento) => void;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setData({ ...EMPTY, ...(JSON.parse(raw) as Data) });
    } catch {
      /* ignore corrupted storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(KEY, JSON.stringify(data));
  }, [data, ready]);

  const saveCliente: Ctx["saveCliente"] = useCallback((c) => {
    setData((d) =>
      c.id && d.clientes.some((x) => x.id === c.id)
        ? { ...d, clientes: d.clientes.map((x) => (x.id === c.id ? ({ ...x, ...c } as Cliente) : x)) }
        : { ...d, clientes: [...d.clientes, { ...c, id: c.id ?? uid() } as Cliente] },
    );
  }, []);

  const removeCliente = useCallback((id: string) => {
    setData((d) => ({ ...d, clientes: d.clientes.filter((c) => c.id !== id) }));
  }, []);

  const saveItem: Ctx["saveItem"] = useCallback((i) => {
    setData((d) =>
      i.id && d.itens.some((x) => x.id === i.id)
        ? { ...d, itens: d.itens.map((x) => (x.id === i.id ? ({ ...x, ...i } as Item) : x)) }
        : { ...d, itens: [...d.itens, { ...i, id: i.id ?? uid() } as Item] },
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setData((d) => ({ ...d, itens: d.itens.filter((i) => i.id !== id) }));
  }, []);

  const saveOrcamento: Ctx["saveOrcamento"] = useCallback((o) => {
    const id = o.id ?? uid();
    setData((d) => {
      if (o.id && d.orcamentos.some((x) => x.id === o.id)) {
        return {
          ...d,
          orcamentos: d.orcamentos.map((x) =>
            x.id === o.id ? ({ ...x, ...o } as Orcamento) : x,
          ),
        };
      }
      const numero = d.orcamentos.reduce((m, x) => Math.max(m, x.numero), 1000) + 1;
      return { ...d, orcamentos: [...d.orcamentos, { ...o, id, numero } as Orcamento] };
    });
    return id;
  }, []);

  const removeOrcamento = useCallback((id: string) => {
    setData((d) => ({ ...d, orcamentos: d.orcamentos.filter((o) => o.id !== id) }));
  }, []);

  const setStatus = useCallback((id: string, status: StatusOrcamento) => {
    setData((d) => ({
      ...d,
      orcamentos: d.orcamentos.map((o) => (o.id === id ? { ...o, status } : o)),
    }));
  }, []);

  const saveEmpresa = useCallback((e: Empresa) => {
    setData((d) => ({ ...d, empresa: e }));
  }, []);

  const value = useMemo(
    () => ({
      ready,
      ...data,
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
      data,
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