import { useEffect, useMemo, useState } from "react";

type Pessoa = { codigo: string; nome: string; folgas: number, motivo?: string };

export default function App() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/dados.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setPessoas(Array.isArray(data.pessoa) ? data.pessoa : []);
      } catch (e: any) {
        setErro(e?.message ?? "Falha ao carregar dados");
      }
    })();
  }, []);


  const resultado = useMemo(() => {
    const c = codigo.trim().toLowerCase();
    if (!c) return null;
    return pessoas.find(p => p.codigo.toLowerCase() === c) ?? null;
  }, [codigo, pessoas]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-3">
          <h1 className="text-lg font-semibold text-slate-800">Consultar folgas</h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-slate-600">Digite seu código</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ex.: RB12"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
            />
          </div>
          <p className="text-xs text-slate-500">Compartilhe apenas o seu código com cada servidor.</p>
        </div>

        {erro && (
          <div className="text-sm text-red-600">Erro: {erro}</div>
        )}


        {codigo.trim() === "" ? (
          <div className="text-center text-slate-500 bg-white border border-dashed border-slate-300 rounded-2xl p-8">
            Digite seu código para ver suas folgas.
          </div>
        ) : resultado ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500">Nome</div>
                <h2 className="text-lg font-semibold text-slate-800">{resultado.nome}</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Motivo: <span className="font-medium">{resultado.motivo}</span>
                </p>
              </div>
              <span className="inline-flex items-center gap-2 text-sky-700 bg-sky-50 px-3 py-1 rounded-full text-sm">
                {resultado.folgas} folga(s)
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-500 bg-white border border-slate-200 rounded-2xl p-6">
            Código não encontrado.
          </div>
        )}
      </main>
    </div>
  );
}
