import fs from "fs";
import path from "path";
import MarketingPlanView from "./MarketingPlanView";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

export default function MarketingPlanPage() {
  const md = fs.readFileSync(path.join(process.cwd(), ".agents", "marketing-plan-jurnal-guru.md"), "utf8");
  const toc = md
    .split("\n")
    .filter((l) => /^#{1,2} Seksi \d+ — /.test(l))
    .map((l) => {
      const title = l.replace(/^#+ Seksi \d+ — /, "").trim();
      return { id: slugify(title), title };
    });

  return <MarketingPlanView content={md} toc={toc} />;
}