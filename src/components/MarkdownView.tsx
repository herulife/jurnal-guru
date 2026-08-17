import React from "react";

function inline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) parts.push(<strong key={key++}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("`")) parts.push(<code key={key++} className="px-1.5 py-0.5 bg-[#0D7C66]/10 text-[#0A6352] rounded text-[0.85em] font-mono">{tok.slice(1, -1)}</code>);
    else if (tok.startsWith("[")) {
      const mm = tok.match(/\[([^\]]+)\]\(([^)]+)\)/);
      parts.push(<a key={key++} href={mm?.[2]} target="_blank" rel="noreferrer" className="text-[#0D7C66] underline underline-offset-2 hover:text-[#0A6352]">{mm?.[1]}</a>);
    } else if (tok.startsWith("*")) parts.push(<em key={key++}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

function Table({ lines }: { lines: string[] }) {
  const rows = lines.filter((l) => l.trim().startsWith("|")).map((l) =>
    l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim())
  );
  const header = rows[0] ?? [];
  const body = rows.slice(1).filter((r) => !(r.length === 1 && /^-+$/.test(r[0])) && !r.every((c) => /^-+$/.test(c)));
  return (
    <div className="overflow-x-auto my-4 rounded-xl border border-[#E8E4DC]">
      <table className="w-full text-sm border-collapse min-w-[480px]">
        <thead>
          <tr className="bg-[#0D7C66] text-white">
            {header.map((h, i) => (
              <th key={i} className="text-left px-3 py-2 font-semibold whitespace-nowrap">{inline(h)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((r, i) => (
            <tr key={i} className={i % 2 ? "bg-[#F9F7F3]" : "bg-white"}>
              {r.map((c, j) => (
                <td key={j} className="px-3 py-2 align-top text-gray-700 border-t border-[#E8E4DC]">{inline(c)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderBlock(lines: string[], i: number): { node: React.ReactNode; next: number } {
  const line = lines[i];

  const hm = line.match(/^(#{1,5})\s+(.*)$/);
  if (hm) {
    const level = hm[1].length;
    const text = hm[2];
    const id = slugify(text.replace(/^Seksi \d+ — /, ""));
    const base = "font-[Outfit] font-bold text-[#1A2332] scroll-mt-24";
    const seksi = text.startsWith("Seksi ");
    const cls = level === 1 && seksi ? `${base} text-2xl mt-10 mb-3 pb-2 border-b border-[#E8E4DC] flex items-center gap-2`
      : level === 1 ? `${base} text-xl mt-2 mb-4`
      : level === 2 ? `${base} text-2xl mt-10 mb-3 pb-2 border-b border-[#E8E4DC] flex items-center gap-2`
      : level === 3 ? `${base} text-lg mt-8 mb-2`
      : level === 4 ? `${base} text-base mt-6 mb-2`
      : `${base} text-sm mt-5 mb-1 text-[#0D7C66] uppercase tracking-wide`;
    const badge = seksi && level <= 2 ? (
      <span className="shrink-0 text-[10px] font-bold bg-[#0D7C66]/10 text-[#0D7C66] px-2 py-0.5 rounded-full">{text.split("—")[0].trim()}</span>
    ) : null;
    return { node: <h2 id={id} key={i} className={cls}>{badge}<span>{text.replace(/^Seksi \d+ — /, "")}</span></h2>, next: i + 1 };
  }

  if (/^---+$/.test(line.trim())) {
    return { node: <hr key={i} className="my-8 border-[#E8E4DC]" />, next: i + 1 };
  }

  const im = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/);
  if (im) {
    return {
      node: (
        <a key={i} href={im[2]} target="_blank" rel="noreferrer" className="inline-block my-3">
          <img
            src={im[2]}
            alt={im[1] || "gambar"}
            loading="lazy"
            className="rounded-xl border border-[#E8E4DC] shadow-sm max-w-sm w-full"
          />
        </a>
      ),
      next: i + 1,
    };
  }

  if (line.trim().startsWith("|")) {
    let j = i;
    while (j < lines.length && lines[j].trim().startsWith("|")) j++;
    return { node: <Table key={i} lines={lines.slice(i, j)} />, next: j };
  }

  if (line.trim().startsWith("> ")) {
    let j = i;
    while (j < lines.length && lines[j].trim().startsWith(">")) j++;
    return {
      node: (
        <blockquote key={i} className="my-4 pl-4 py-2 border-l-4 border-[#E8A317] bg-[#E8A317]/5 rounded-r-lg text-gray-600 italic">
          {lines.slice(i, j).map((l, k) => <p key={k} className="mb-1">{inline(l.trim().replace(/^>\s?/, ""))}</p>)}
        </blockquote>
      ),
      next: j,
    };
  }

  if (/^[-*] /.test(line.trim())) {
    let j = i;
    const items: string[] = [];
    while (j < lines.length && /^[-*] /.test(lines[j].trim())) { items.push(lines[j].trim().slice(2)); j++; }
    return {
      node: (
        <ul key={i} className="my-3 space-y-1.5">
          {items.map((it, k) => (
            <li key={k} className="flex gap-2 text-gray-700">
              <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-[#0D7C66]"></span>
              <span>{inline(it)}</span>
            </li>
          ))}
        </ul>
      ),
      next: j,
    };
  }

  if (/^\d+\. /.test(line.trim())) {
    let j = i;
    const items: string[] = [];
    while (j < lines.length && /^\d+\. /.test(lines[j].trim())) { items.push(lines[j].trim().replace(/^\d+\. /, "")); j++; }
    return {
      node: (
        <ol key={i} className="my-3 space-y-1.5 list-decimal list-inside text-gray-700">
          {items.map((it, k) => <li key={k}>{inline(it)}</li>)}
        </ol>
      ),
      next: j,
    };
  }

  if (line.trim() === "") {
    let j = i;
    while (j < lines.length && lines[j].trim() === "") j++;
    return { node: null, next: j };
  }

  let j = i;
  while (j < lines.length && lines[j].trim() !== "" && !lines[j].trim().startsWith("|") && !/^(#{1,5}\s|---+$|[-*] |\d+\. |> )/.test(lines[j].trim())) j++;
  const text = lines.slice(i, j).join(" ");
  return { node: <p key={i} className="my-2.5 text-gray-700 leading-relaxed">{inline(text)}</p>, next: j };
}

export default function MarkdownView({ content }: { content: string }) {
  const lines = content.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const { node, next } = renderBlock(lines, i);
    if (node !== null) nodes.push(node);
    i = next;
  }
  return <article className="text-[15px]">{nodes}</article>;
}