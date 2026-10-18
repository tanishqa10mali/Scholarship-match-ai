import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { scholarships, LEVELS, CATEGORIES, STATES } from "./scholarships.js";
dotenv.config();

const app = express();
const origins = (process.env.FRONTEND_ORIGIN || "http://localhost:5173").split(",").map((s) => s.trim());
app.use(cors({ origin: (o, cb) => cb(null, !o || origins.includes(o)) }));
app.use(express.json({ limit: "20kb" }));

const ok = (res, data, code = 200) => res.status(code).json({ success: true, data });
const fail = (res, code, message, details) => res.status(code).json({ success: false, error: { message, details } });

app.get("/api/health", (req, res) => ok(res, { status: "ok", aiConfigured: Boolean(process.env.GEMINI_API_KEY) }));
app.get("/api/options", (req, res) => ok(res, { levels: LEVELS, states: STATES, categories: CATEGORIES }));
app.get("/api/scholarships", (req, res) => ok(res, { notice: "DEMO DATA - fictional records", scholarships }));

function validateProfile(b) {
  const errors = {};
  if (!b || typeof b !== "object") return { errors: { body: "Request body must be JSON." } };
  const level = String(b.educationLevel || "");
  if (!LEVELS.includes(level)) errors.educationLevel = "Choose a valid education level.";
  const state = String(b.state || "");
  if (!STATES.includes(state)) errors.state = "Choose a valid state or Union Territory.";
  const income = Number(b.income);
  if (b.income === "" || b.income == null || !Number.isFinite(income) || income < 0 || income > 1e9) errors.income = "Enter annual family income as a number (0 or more).";
  const marks = Number(b.marks);
  if (b.marks === "" || b.marks == null || !Number.isFinite(marks) || marks < 0 || marks > 100) errors.marks = "Enter marks as a percentage from 0 to 100.";
  const field = String(b.field || "").trim();
  if (field.length < 2 || field.length > 60) errors.field = "Enter your course or field (2-60 characters).";
  const category = b.category ? String(b.category) : "";
  if (category && !CATEGORIES.includes(category)) errors.category = "Choose a valid category or leave it empty.";
  return { errors, value: { educationLevel: level, state, income, marks, field, category } };
}

app.post("/api/match", (req, res) => {
  const { errors, value } = validateProfile(req.body);
  if (Object.keys(errors).length) return fail(res, 400, "Please fix the highlighted fields.", errors);
  const f = value.field.toLowerCase();
  const matches = scholarships.filter((s) =>
    s.educationLevel === value.educationLevel &&
    (s.location === "All India" || s.location === value.state) &&
    value.income <= s.incomeLimit &&
    value.marks >= s.minMarks &&
    (s.field === "Any" || f.includes(s.field.toLowerCase()) || s.field.toLowerCase().includes(f)) &&
    (s.category === "Any" || s.category === value.category));
  ok(res, { notice: "DEMO DATA. Always verify eligibility with the official provider.", count: matches.length, matches });
});

const SYSTEM = `You are the ScholarshipMatch assistant helping Indian college students understand scholarships.
Use simple, friendly language. Help with eligibility questions, commonly requested documents (for example income certificate, marksheets, ID proof, bank passbook, category certificate), application steps, and how to verify official information.
Never guarantee eligibility or approval. Never invent specific schemes, deadlines, amounts, or URLs; if unsure, say so and tell the student to check the official provider's website or the National Scholarship Portal. The scholarship records in this app are fictional DEMO DATA.
Never ask for passwords, API keys, OTPs, Aadhaar or bank numbers, or other sensitive personal data, and tell users not to share them. Keep answers concise.`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function askGemini(msgs) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-2.5-flash"}:generateContent`;
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: SYSTEM }] },
    contents: msgs.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
    generationConfig: { maxOutputTokens: 800 },
  });
  let last;
  for (let attempt = 0; attempt < 3; attempt++) {   // limited retries for temporary errors
    try {
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY }, body, signal: AbortSignal.timeout(30000) });
      if (r.ok) {
        const j = await r.json();
        const text = j.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
        if (!text) throw Object.assign(new Error("empty reply"), { status: 502 });
        return text;
      }
      last = Object.assign(new Error(await r.text()), { status: r.status });
    } catch (e) { last = e.name === "TimeoutError" ? Object.assign(e, { status: 504 }) : e; }
    if (![429, 500, 503, 504, undefined].includes(last.status) || attempt === 2) break;
    await sleep(1000 * (attempt + 1));
  }
  throw last;
}

app.post("/api/chat", async (req, res) => {
  const msgs = req.body?.messages;
  if (!Array.isArray(msgs) || msgs.length === 0 || msgs.length > 20) return fail(res, 400, "Send 1 to 20 messages.");
  for (const m of msgs) {
    if (!m || !["user", "assistant"].includes(m.role) || typeof m.content !== "string" || !m.content.trim() || m.content.length > 1000)
      return fail(res, 400, "Each message needs a role and text up to 1000 characters.");
  }
  if (msgs[msgs.length - 1].role !== "user") return fail(res, 400, "The last message must be from the user.");
  if (!process.env.GEMINI_API_KEY) return fail(res, 503, "The AI assistant is not set up yet. The site owner needs to add GEMINI_API_KEY on the server.");
  try {
    ok(res, { reply: await askGemini(msgs) });
  } catch (e) {
    console.error("Gemini error:", e?.status, String(e?.message).slice(0, 200));
    const s = e?.status;
    if (s === 429) return fail(res, 429, "The assistant is busy or the free limit was reached. Please wait a minute and try again.");
    if (s === 400 || s === 401 || s === 403) return fail(res, 502, "The AI service rejected the server's API key or settings. The site owner should check them.");
    if (s === 404) return fail(res, 502, "The configured AI model was not found. The site owner should check GEMINI_MODEL.");
    if (s === 504) return fail(res, 504, "The assistant took too long. Please try again.");
    fail(res, 502, "The assistant is temporarily unavailable. Please try again later.");
  }
});

app.use("/api", (req, res) => fail(res, 404, "Endpoint not found."));
app.use((err, req, res, next) => fail(res, err.type === "entity.parse.failed" ? 400 : 500, err.type === "entity.parse.failed" ? "Invalid JSON." : "Something went wrong."));
export default app;
