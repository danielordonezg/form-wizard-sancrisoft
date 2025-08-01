import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const COUNTRIES = [
  { name: "United States", phone_code: "+1", flag_url: "https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg" },
  { name: "Canada", phone_code: "+1", flag_url: "https://upload.wikimedia.org/wikipedia/commons/c/cf/Flag_of_Canada.svg" },
  { name: "United Kingdom", phone_code: "+44", flag_url: "https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg" },
  { name: "Australia", phone_code: "+61", flag_url: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Flag_of_Australia.svg" },
  { name: "Germany", phone_code: "+49", flag_url: "https://upload.wikimedia.org/wikipedia/en/b/ba/Flag_of_Germany.svg" },
  { name: "France", phone_code: "+33", flag_url: "https://upload.wikimedia.org/wikipedia/en/c/c3/Flag_of_France.svg" },
  { name: "Japan", phone_code: "+81", flag_url: "https://upload.wikimedia.org/wikipedia/en/9/9e/Flag_of_Japan.svg" },
  { name: "China", phone_code: "+86", flag_url: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Flag_of_China.svg" },
  { name: "India", phone_code: "+91", flag_url: "https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg" },
  { name: "Brazil", phone_code: "+55", flag_url: "https://upload.wikimedia.org/wikipedia/en/0/05/Flag_of_Brazil.svg" }
];

const BusinessSchema = z.object({
  businessName: z.string().trim().min(1),
  businessType: z.string().trim().min(1),
  address1: z.string().trim().min(1),
  address2: z.string().trim().optional().nullable().transform(v => v ?? ""),
  city: z.string().trim().min(1),
  state: z.string().trim().min(2),
  zip: z.string().regex(/^\d{5}$/, "ZIP must be 5 digits")
});

const ContactSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().trim().email(),
  countryCode: z.string().trim().min(1),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, "Phone must be (000) 000-0000")
});

const BodySchema = z.object({
  business: BusinessSchema,
  contact: ContactSchema
});

const BEECEPTOR_URL = "https://ss-company.free.beeceptor.com/company";
const FETCH_TIMEOUT_MS = 5000;
const MAX_RETRIES = 2;

const rateStore = new Map<string, { count: number; resetAt: number }>();
const idemStore = new Map<string, { status: number; body: any; expiresAt: number }>();

function getClientIp(req: NextApiRequest) {
  const xf = (req.headers["x-forwarded-for"] || "") as string;
  return (xf.split(",")[0] || req.socket.remoteAddress || "unknown").trim();
}

function enforceRateLimit(ip: string) {
  const DAY = 86400000;
  const now = Date.now();
  const slot = rateStore.get(ip);
  if (!slot || now > slot.resetAt) {
    rateStore.set(ip, { count: 1, resetAt: now + DAY });
    return { ok: true };
  }
  if (slot.count >= 50) return { ok: false, resetAt: slot.resetAt };
  slot.count += 1;
  return { ok: true };
}

function resolveCountry(selector: string) {
  if (/^\d+$/.test(selector)) {
    const idx = Number(selector);
    return COUNTRIES[idx] || COUNTRIES[0];
  }
  return COUNTRIES.find(c => c.phone_code === selector) || COUNTRIES[0];
}

async function postWithRetry(url: string, payload: any, idempotencyKey?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
  if (idempotencyKey) {
    const cached = idemStore.get(idempotencyKey);
    if (cached && Date.now() < cached.expiresAt) {
      return new Response(JSON.stringify(cached.body), { status: cached.status });
    }
  }
  let attempt = 0;
  while (true) {
    attempt += 1;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const r = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload), signal: controller.signal });
      clearTimeout(timeout);
      const text = await r.text();
      const json = (() => { try { return JSON.parse(text); } catch { return { status: r.ok ? "ok" : "error", message: text || "Unknown response" }; } })();
      if (idempotencyKey) idemStore.set(idempotencyKey, { status: r.status, body: json, expiresAt: Date.now() + 86400000 });
      return new Response(JSON.stringify(json), { status: r.status });
    } catch (e) {
      clearTimeout(timeout);
      if (attempt > MAX_RETRIES) throw e;
      await new Promise(r => setTimeout(r, 300 * attempt));
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Idempotency-Key");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ status: "error", message: "Method Not Allowed" });

  const ip = getClientIp(req);
  const rl = enforceRateLimit(ip);
  if (!rl.ok) return res.status(429).json({ status: "error", message: "Too many requests. Try again later." });

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ status: "error", message: "Validation error", details: parsed.error.flatten() });
  }

  const { business, contact } = parsed.data;
  const country = resolveCountry(contact.countryCode);
  const phoneDisplay = `${country.phone_code} ${contact.phone}`;

  if (business.businessName.toLowerCase().includes("sancrisoft")) {
    return res.status(200).json({
      status: "error",
      message: "A company with the same name has been detected. Please change the information entered."
    });
  }

  const payload = {
    name: business.businessName,
    type: business.businessType,
    address: { line1: business.address1, line2: business.address2 || "", city: business.city, state: business.state, zip: business.zip },
    contact: { firstName: contact.firstName, lastName: contact.lastName, email: contact.email, phone: phoneDisplay }
  };

  try {
    const upstream = await postWithRetry(BEECEPTOR_URL, payload, (req.headers["idempotency-key"] as string) || undefined);
    const status = upstream.status;
    const body = await upstream.json();
    if (status >= 500) return res.status(502).json({ status: "error", message: "Upstream error. Try again." });
    if (status === 200 && body?.status === "ok") return res.status(200).json({ status: "ok", message: body.message || "Thanks for submitting your company! We’ll be in touch shortly." });
    if (status === 200 && body?.status === "error") return res.status(200).json({ status: "error", message: body.message || "There was an error." });
    return res.status(200).json({ status: "ok", message: body?.message || "Submitted." });
  } catch {
    return res.status(504).json({ status: "error", message: "Network timeout. Try again." });
  }
}
