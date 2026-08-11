import { useState, useRef, useCallback } from "react";
import { Loader as Loader2, CircleAlert as AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { maskCep, buscarCep, type ViaCepResult } from "@/lib/cep";

type EnderecoCompleto = {
  cep: string;
  logradouro: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
};

type CepInputProps = {
  value: string;
  onChange: (cep: string) => void;
  onResult: (endereco: Partial<EnderecoCompleto>) => void;
  numeroRef?: React.RefObject<HTMLInputElement | null>;
  id?: string;
};

export function CepInput({ value, onChange, onResult, numeroRef, id = "cep" }: CepInputProps) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const consultar = useCallback(
    async (cepRaw: string) => {
      const cep = cepRaw;
      const digitos = cep.replace(/\D/g, "");
      if (digitos.length !== 8) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setErro(null);

      const resultado = await buscarCep(cep);

      if (controller.signal.aborted) return;
      setLoading(false);

      if (!resultado) {
        setErro("CEP não encontrado.");
        return;
      }

      onResult({
        logradouro: resultado.logradouro,
        neighborhood: resultado.bairro,
        city: resultado.cidade,
        state: resultado.uf,
      });

      setTimeout(() => numeroRef?.current?.focus(), 50);
    },
    [onResult, numeroRef],
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>CEP</Label>
      <div className="relative">
        <Input
          id={id}
          value={value}
          onChange={(e) => {
            const v = maskCep(e.target.value);
            onChange(v);
            setErro(null);
            if (v.replace(/\D/g, "").length === 8) {
              consultar(v);
            }
          }}
          onBlur={(e) => {
            const d = e.target.value.replace(/\D/g, "");
            if (d.length === 8) consultar(e.target.value);
          }}
          inputMode="numeric"
          maxLength={9}
          placeholder="00000-000"
          aria-invalid={erro ? true : undefined}
          className={loading ? "pr-10" : undefined}
        />
        {loading && (
          <Loader2 className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>
      {erro && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="size-3.5 shrink-0" />
          {erro}
        </p>
      )}
    </div>
  );
}
