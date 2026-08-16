import { test, expect, type APIRequestContext } from "@playwright/test";

const ADMIN = { username: "admin", password: "admin123" };
const TEST_WA = "6282114752228";
const TEST_PLAN = "pro_6m";

let createdPaymentId: string | null = null;

async function login(request: APIRequestContext) {
  const res = await request.post("/api/auth/login", {
    data: { username: ADMIN.username, password: ADMIN.password },
  });
  expect(res.ok(), "login admin harus berhasil").toBeTruthy();
}

test.describe("/api/payments", () => {
  test("401 tanpa login", async ({ request }) => {
    const res = await request.post("/api/payments", {
      data: { planId: TEST_PLAN, whatsapp: TEST_WA },
    });
    expect(res.status()).toBe(401);
  });

  test("POST tolak whatsapp kosong", async ({ request }) => {
    await login(request);
    const res = await request.post("/api/payments", { data: { planId: TEST_PLAN, whatsapp: "" } });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(String(body.msg)).toContain("WhatsApp");
  });

  test("POST tolak whatsapp format salah", async ({ request }) => {
    await login(request);
    const res = await request.post("/api/payments", {
      data: { planId: TEST_PLAN, whatsapp: "abc123" },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(String(body.msg)).toContain("WhatsApp");
  });

  test("POST buat order + simpan whatsapp + notif WA", async ({ request }) => {
    await login(request);
    const res = await request.post("/api/payments", {
      data: { planId: TEST_PLAN, whatsapp: TEST_WA },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    if (body.ok && body.data?.paymentId) {
      createdPaymentId = body.data.paymentId;
    }
    expect(body.ok, `gagal: ${body.msg}`).toBeTruthy();
    expect(body.data?.paymentId).toBeTruthy();
    expect(body.data?.amount).toBe(29000);
    expect(body.data?.bank?.bank_name).toBe("BRI");
  });

  test("GET detail payment mengembalikan whatsapp", async ({ request }) => {
    await login(request);
    expect(createdPaymentId, "butuh payment dari test sebelumnya").toBeTruthy();
    const res = await request.get(`/api/payments/${createdPaymentId}`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.data?.payment?.whatsapp).toBe(TEST_WA);
    expect(body.data?.payment?.amount).toBe(29000);
  });

  test("PATCH simpan whatsapp baru", async ({ request }) => {
    await login(request);
    expect(createdPaymentId).toBeTruthy();
    const res = await request.patch(`/api/payments/${createdPaymentId}`, {
      data: { whatsapp: "081234567890" },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBeTruthy();
    const check = await request.get(`/api/payments/${createdPaymentId}`);
    const checkBody = await check.json();
    expect(checkBody.data?.payment?.whatsapp).toBe("6281234567890");
  });

  test("PATCH tolak whatsapp invalid", async ({ request }) => {
    await login(request);
    expect(createdPaymentId).toBeTruthy();
    const res = await request.patch(`/api/payments/${createdPaymentId}`, {
      data: { whatsapp: "not-a-number" },
    });
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(String(body.msg)).toContain("WhatsApp");
  });

  test("GET detail 404 untuk id tak dikenal", async ({ request }) => {
    await login(request);
    const res = await request.get("/api/payments/tidak-ada-id");
    const body = await res.json();
    expect(body.ok).toBe(false);
  });
});

test.afterAll(async () => {
  if (createdPaymentId) {
    console.log("[CLEANUP] hapus manual paymentId=" + createdPaymentId);
  }
});