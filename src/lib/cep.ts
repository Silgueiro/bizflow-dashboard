import { somenteDigitos } from "@/lib/documento";

/** Máscara de CEP no formato 00000-000. */
export function maskCep(valor: string): string {
  const d = somenteDigitos(valor).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export type ViaCepResult = {
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
};

/** Busca endereço na API gratuita ViaCEP. Retorna null se não encontrar. */
export async function buscarCep(cep: string): Promise<ViaCepResult | null> {
  const d = somenteDigitos(cep);
  if (d.length !== 8) return null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${d}/json/`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.erro) return null;
    return {
      logradouro: data.logradouro ?? "",
      bairro: data.bairro ?? "",
      cidade: data.localidade ?? "",
      uf: data.uf ?? "",
    };
  } catch {
    return null;
  }
}
