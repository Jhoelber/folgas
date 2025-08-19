import type { IncomingMessage, ServerResponse } from "http";
import fs from "node:fs";
import path from "node:path";

type Pessoa = { codigo: string; nome: string; folgas: number; motivo?: string };
type DB = { pessoa: Pessoa[] };

function loadDB(): DB {
  const file = path.join(process.cwd(), "data", "dados.json");
  const raw = fs.readFileSync(file, "utf-8");
  return JSON.parse(raw);
}

export default function handler(req: IncomingMessage & { query?: any; headers: any; method?: string }, res: ServerResponse & { setHeader: any; status: (code: number) => any; json: (data: any) => void }) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-admin-token");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  const db = loadDB();

  const url = new URL(req.url ?? "", `http://${req.headers.host}`);
  const codigo = url.searchParams.get("codigo");
  const all = url.searchParams.get("all");

  if (all === "true") {
    const adminToken = process.env.FOLGAS_ADMIN_TOKEN || "";
    const got = req.headers["x-admin-token"] as string;
    if (!adminToken || got !== adminToken) {
      res.statusCode = 401;
      return res.end(JSON.stringify({ error: "unauthorized" }));
    }
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ pessoa: db.pessoa }));
  }

  if (codigo) {
    const item = db.pessoa.find((p) => String(p.codigo).toLowerCase() === codigo.toLowerCase());
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ pessoa: item ?? null }));
  }

  res.statusCode = 400;
  res.end(JSON.stringify({ error: "Parâmetros inválidos" }));
}
