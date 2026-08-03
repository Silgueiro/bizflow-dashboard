/** Utilidades de máscara e validação para CPF (11 dígitos) e CNPJ (14 dígitos). */

export const somenteDigitos = (v: string) => v.replace(/\D/g, "");

/** Máscara dinâmica de telefone: (99) 9999-9999 (fixo) ou (99) 99999-9999 (celular). */
export function maskTelefone(valor: string) {
  const d = somenteDigitos(valor).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function maskDocumento(valor: string) {
  const d = somenteDigitos(valor).slice(0, 14);
  if (d.length <= 11) {
    return d
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
  }
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
}

export function isCPF(valor: string) {
  const d = somenteDigitos(valor);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const calc = (fim: number) => {
    let soma = 0;
    for (let i = 0; i < fim; i++) soma += Number(d[i]) * (fim + 1 - i);
    const r = (soma * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(d[9]) && calc(10) === Number(d[10]);
}

export function isCNPJ(valor: string) {
  const d = somenteDigitos(valor);
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const calc = (fim: number) => {
    let pos = fim - 7;
    let soma = 0;
    for (let i = 0; i < fim; i++) {
      soma += Number(d[i]) * pos--;
      if (pos < 2) pos = 9;
    }
    const r = soma % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return calc(12) === Number(d[12]) && calc(13) === Number(d[13]);
}

/** Retorna mensagem de erro ou null quando válido. Campo vazio é permitido. */
export function validarDocumento(valor: string): string | null {
  const d = somenteDigitos(valor);
  if (!d) return null;
  if (d.length <= 11) {
    if (d.length < 11) return "CPF incompleto (11 dígitos).";
    return isCPF(d) ? null : "CPF inválido.";
  }
  if (d.length < 14) return "CNPJ incompleto (14 dígitos).";
  return isCNPJ(d) ? null : "CNPJ inválido.";
}