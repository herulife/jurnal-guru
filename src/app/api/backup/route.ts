import { requireAdmin, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { apiError, apiOk, apiServerError } from "@/lib/utils";

const VALID_COL_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

type DbLike = typeof db;

async function selectAll(client: DbLike, table: string) {
  return client.all(sql.raw(`SELECT * FROM "${table}"`));
}

async function deleteAll(client: DbLike, table: string) {
  await client.run(sql.raw(`DELETE FROM "${table}"`));
}

async function insertRow(client: DbLike, table: string, row: Record<string, unknown>) {
  const keys = Object.keys(row).filter((k) => VALID_COL_RE.test(k));
  if (!keys.length) return;
  const cols = keys.map((k) => `"${k}"`).join(", ");
  const values = keys.map((k) => row[k]);
  const query = sql`INSERT INTO ${sql.raw(`"${table}"`)} (${sql.raw(cols)}) VALUES (${sql.join(
    values.map((v) => sql`${v}`),
    sql`, `
  )})`;
  await client.run(query);
}

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json();
    const mode = body.mode;

    if (mode === "export") {
      const tables = ["data_kelas","data_siswa","jadwal_mengajar","absensi","nilai","jurnal_mengajar","profil_sekolah","settings","data_surat"];
      const backup: Record<string, unknown> = {};
      for (const t of tables) {
        backup[t] = await selectAll(db, t);
      }
      await addLog(session.id, "BACKUP_EXPORT", "Ekspor backup database");
      return apiOk(backup);
    }

    if (mode === "import") {
      const imported = body.data;
      if (!imported) return apiError("Tidak ada data");
      let restored = 0;
      const tables = ["data_kelas","data_siswa","jadwal_mengajar","absensi","nilai","jurnal_mengajar","data_surat"];

      await db.transaction(async (tx) => {
        for (const t of tables) {
          const rows: unknown[] = imported[t];
          if (!Array.isArray(rows) || !rows.length) continue;
          await deleteAll(tx as unknown as DbLike, t);

          for (const row of rows) {
            const r = row as Record<string, unknown>;
            if (Object.keys(r).some((k) => !VALID_COL_RE.test(k))) continue;
            await insertRow(tx as unknown as DbLike, t, r);
            restored++;
          }
        }
      });

      await addLog(session.id, "BACKUP_IMPORT", `Import ${restored} baris data`);
      return apiOk({ msg: `${restored} baris data berhasil direstore` });
    }

    return apiError("Mode tidak valid");
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}
