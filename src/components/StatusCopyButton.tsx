"use client";

import { useState } from "react";

export default function StatusCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button className="btn btn-primary" onClick={copy}>
      {copied ? (
        <>
          <i className="fa-solid fa-check mr-2" />
          Tersalin!
        </>
      ) : (
        <>
          <i className="fa-solid fa-copy mr-2" />
          Copy Status
        </>
      )}
    </button>
  );
}