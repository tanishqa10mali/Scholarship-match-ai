// In production the API lives at the same address (/api). For a separate backend set VITE_API_URL.
const BASE = import.meta.env.VITE_API_URL || "";
async function call(path, options) {
  let res;
  try { res = await fetch(BASE + path, options); }
  catch { throw { message: "Cannot reach the server. Check your internet connection and try again." }; }
  let body;
  try { body = await res.json(); } catch { throw { message: "The server sent an unexpected reply." }; }
  if (!body.success) throw { message: body.error?.message || "Something went wrong.", details: body.error?.details };
  return body.data;
}
const post = (path, data) => call(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
export const getOptions = () => call("/api/options");
export const getScholarships = () => call("/api/scholarships");
export const matchProfile = (p) => post("/api/match", p);
export const sendChat = (messages) => post("/api/chat", { messages });
