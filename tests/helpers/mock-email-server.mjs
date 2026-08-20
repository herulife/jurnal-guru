/* Mock email provider untuk regression test register (F-07/F-08).
 * Server HTTP lokal; app diarahkan via RESEND_API_URL=http://localhost:3199/emails.
 * Tidak pernah mengirim email sungguhan.
 * Kontrol:
 *   GET /last        -> email terakhir yang diterima (raw HTML, untuk ekstrak token)
 *   GET /set?fail=1  -> mode gagal (POST /emails return 500)
 *   GET /set?fail=0  -> mode sukses (default)
 *   GET /reset       -> kosongkan penyimpanan
 */
import http from "node:http";
import fs from "node:fs";

const PORT = process.env.MOCK_EMAIL_PORT || 3199;
const STATE_FILE = process.env.MOCK_EMAIL_STATE || "/tmp/jg-mock-email.json";

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {}
  return { fail: false, emails: [] };
}

function saveState(s) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(s));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  res.setHeader("Content-Type", "application/json");

  if (req.method === "POST" && url.pathname === "/emails") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      const state = loadState();
      let parsed = {};
      try { parsed = JSON.parse(body); } catch {}
      if (state.fail) {
        res.writeHead(500);
        res.end(JSON.stringify({ ok: false, msg: "mock provider failure" }));
        return;
      }
      state.emails.push({ to: parsed.to, subject: parsed.subject, html: parsed.html || "", receivedAt: Date.now() });
      saveState(state);
      res.writeHead(200);
      res.end(JSON.stringify({ id: "mock-" + Date.now() }));
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/last") {
    const state = loadState();
    const last = state.emails[state.emails.length - 1] || null;
    res.writeHead(200);
    res.end(JSON.stringify(last));
    return;
  }

  if (req.method === "GET" && url.pathname === "/set") {
    const state = loadState();
    state.fail = url.searchParams.get("fail") === "1";
    saveState(state);
    res.writeHead(200);
    res.end(JSON.stringify({ fail: state.fail }));
    return;
  }

  if (req.method === "GET" && url.pathname === "/reset") {
    saveState({ fail: false, emails: [] });
    res.writeHead(200);
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: "not found" }));
});

server.listen(PORT, () => {
  saveState({ fail: false, emails: [] });
  console.log(`mock-email-server listening on :${PORT} (state ${STATE_FILE})`);
});