import fs from "fs";
import path from "path";
import DocumentationView from "@/components/DocumentationView";

function readAudits(): { name: string; date: string; sha: string; content: string }[] {
  const dir = path.join(process.cwd(), ".agents", "audits");
  if (!fs.existsSync(dir)) return [];
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .reverse();
  return files.map((f) => {
    const m = f.match(/^(\d{4}-\d{2}-\d{2})-audit-([0-9a-f]+)\.md$/);
    return {
      name: f,
      date: m?.[1] ?? "Tidak diketahui",
      sha: m?.[2] ?? "",
      content: fs.readFileSync(path.join(dir, f), "utf8"),
    };
  });
}

export default function DocumentationPage() {
  const audits = readAudits();
  return <DocumentationView audits={audits} />;
}