import { useEffect, useRef, useState } from "react";
import { getOptions, getScholarships, matchProfile, sendChat } from "./api.js";

const Logo = () => (
  <span className="logo" aria-label="ScholarshipMatch">
    <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 5 2 12l14 7 14-7z" fill="#fff"/><path d="M8 16v5c0 2 4 4 8 4s8-2 8-4v-5l-8 4z" fill="#fff" opacity=".85"/></svg>
    ScholarshipMatch
  </span>
);

function Card({ s }) {
  return (
    <article className="card">
      <span className="badge">DEMO DATA</span>
      <h3>{s.name}</h3>
      <p className="muted">{s.provider}</p>
      <dl>
        <dt>Level</dt><dd>{s.educationLevel}</dd>
        <dt>Location</dt><dd>{s.location}</dd>
        <dt>Income limit</dt><dd>₹{s.incomeLimit.toLocaleString("en-IN")}</dd>
        <dt>Minimum marks</dt><dd>{s.minMarks ? s.minMarks + "%" : "None"}</dd>
        <dt>Deadline</dt><dd>{s.deadline}</dd>
      </dl>
      <p>{s.eligibility}</p>
      <p className="muted small">Source: {s.source}. Verify on the official site before applying.</p>
      <a href={s.applicationUrl} target="_blank" rel="noopener noreferrer">Official link (demo placeholder)</a>
    </article>
  );
}

function Home({ go }) {
  return (
    <section className="hero">
      <h1>Find scholarships that fit your profile</h1>
      <p>Enter your education details, see possible matches, and ask our AI assistant about documents and application steps.</p>
      <button className="btn big" onClick={() => go("find")}>Find My Scholarships</button>
      <p className="notice">The scholarships shown are fictional sample records (DEMO DATA). Always verify eligibility with the official provider.</p>
    </section>
  );
}

function Find() {
  const [opts, setOpts] = useState({ levels: [], states: [], categories: [] });
  const [f, setF] = useState({ educationLevel: "", state: "", income: "", marks: "", field: "", category: "" });
  const [errs, setErrs] = useState({});
  const [state, setState] = useState({ status: "idle" });
  useEffect(() => { getOptions().then(setOpts).catch((e) => setState({ status: "error", message: e.message })); }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  function validate() {
    const e = {}, inc = Number(f.income), m = Number(f.marks);
    if (!f.educationLevel) e.educationLevel = "Choose your education level.";
    if (!f.state) e.state = "Choose your state or Union Territory.";
    if (f.income === "" || !(inc >= 0)) e.income = "Enter income as a number, 0 or more.";
    if (f.marks === "" || !(m >= 0 && m <= 100)) e.marks = "Enter marks from 0 to 100.";
    if (f.field.trim().length < 2) e.field = "Enter your course or field.";
    return e;
  }
  async function submit(ev) {
    ev.preventDefault();
    const e = validate(); setErrs(e);
    if (Object.keys(e).length) return;
    setState({ status: "loading" });
    try { setState({ status: "done", ...(await matchProfile(f)) }); }
    catch (err) { setErrs(err.details || {}); setState({ status: "error", message: err.message }); }
  }
  const Field = ({ id, label, children, hint }) => (
    <div className="field"><label htmlFor={id}>{label}</label>{children}
      {hint && <span className="muted small">{hint}</span>}
      {errs[id] && <span className="err" role="alert">{errs[id]}</span>}</div>
  );
  return (
    <div className="two">
      <form onSubmit={submit} noValidate className="panel">
        <h2>Your profile</h2>
        <Field id="educationLevel" label="Education level"><select id="educationLevel" value={f.educationLevel} onChange={set("educationLevel")}><option value="">Select…</option>{opts.levels.map((o) => <option key={o}>{o}</option>)}</select></Field>
        <Field id="state" label="State or Union Territory"><select id="state" value={f.state} onChange={set("state")}><option value="">Select…</option>{opts.states.map((o) => <option key={o}>{o}</option>)}</select></Field>
        <Field id="income" label="Annual family income (₹)"><input id="income" type="number" min="0" inputMode="numeric" value={f.income} onChange={set("income")} /></Field>
        <Field id="marks" label="Marks or percentage (%)"><input id="marks" type="number" min="0" max="100" step="0.01" value={f.marks} onChange={set("marks")} /></Field>
        <Field id="field" label="Course or field of study" hint="For example: Engineering, Science, Commerce"><input id="field" maxLength="60" value={f.field} onChange={set("field")} /></Field>
        <Field id="category" label="Category (only if you want category-based matches)"><select id="category" value={f.category} onChange={set("category")}><option value="">Prefer not to say</option>{opts.categories.map((o) => <option key={o}>{o}</option>)}</select></Field>
        <button className="btn" disabled={state.status === "loading"}>{state.status === "loading" ? "Searching…" : "Find matches"}</button>
      </form>
      <div aria-live="polite">
        <h2>Results</h2>
        {state.status === "idle" && <p className="empty">Fill in your profile to see matching scholarships.</p>}
        {state.status === "loading" && <p className="empty"><span className="spinner" /> Looking for matches…</p>}
        {state.status === "error" && <p className="error-box" role="alert">{state.message}</p>}
        {state.status === "done" && (<>
          <p className="notice">{state.notice}</p>
          {state.count === 0 ? <p className="empty">No demo matches. Try a different course, state, or check "Browse all".</p> : state.matches.map((s) => <Card key={s.id} s={s} />)}
        </>)}
      </div>
    </div>
  );
}

function Browse() {
  const [s, setS] = useState(null), [err, setErr] = useState("");
  useEffect(() => { getScholarships().then((d) => setS(d.scholarships)).catch((e) => setErr(e.message)); }, []);
  return (<div><h2>All demo scholarships</h2><p className="notice">DEMO DATA: fictional records for testing only.</p>
    {err && <p className="error-box" role="alert">{err}</p>}{!s && !err && <p className="empty"><span className="spinner" /> Loading…</p>}
    <div className="grid">{s?.map((x) => <Card key={x.id} s={x} />)}</div></div>);
}

function Assistant() {
  const [msgs, setMsgs] = useState([{ role: "assistant", content: "Hi! Ask me about scholarship eligibility, documents, or how to apply. I can't guarantee eligibility, so always check the official provider. Please don't share passwords or ID numbers." }]);
  const [text, setText] = useState(""), [busy, setBusy] = useState(false), [err, setErr] = useState("");
  const end = useRef(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);
  async function send(ev) {
    ev.preventDefault();
    const t = text.trim(); if (!t || busy) return;
    const next = [...msgs, { role: "user", content: t }];
    setMsgs(next); setText(""); setErr(""); setBusy(true);
    try { const { reply } = await sendChat(next.slice(1).slice(-12)); setMsgs([...next, { role: "assistant", content: reply }]); }
    catch (e) { setErr(e.message); } finally { setBusy(false); }
  }
  return (
    <div className="panel chat"><h2>AI Assistant</h2>
      <div className="log" role="log" aria-live="polite">
        {msgs.map((m, i) => <div key={i} className={"msg " + m.role}>{m.content}</div>)}
        {busy && <div className="msg assistant"><span className="spinner" /> Thinking…</div>}
        <div ref={end} />
      </div>
      {err && <p className="error-box" role="alert">{err}</p>}
      <form onSubmit={send} className="row">
        <label htmlFor="q" className="sr">Your question</label>
        <input id="q" value={text} maxLength={1000} onChange={(e) => setText(e.target.value)} placeholder="e.g. What documents do I need for an income certificate?" />
        <button className="btn" disabled={busy || !text.trim()}>Send</button>
      </form>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home"), [open, setOpen] = useState(false);
  const go = (p) => { setPage(p); setOpen(false); window.scrollTo(0, 0); };
  const links = [["home", "Home"], ["find", "Find scholarships"], ["browse", "Browse all"], ["assistant", "AI Assistant"]];
  return (<>
    <header><nav className="nav">
      <button className="brand" onClick={() => go("home")}><Logo /></button>
      <button className="menu" aria-expanded={open} aria-controls="links" onClick={() => setOpen(!open)}>Menu</button>
      <ul id="links" className={open ? "open" : ""}>{links.map(([k, l]) => <li key={k}><button className={page === k ? "active" : ""} aria-current={page === k ? "page" : undefined} onClick={() => go(k)}>{l}</button></li>)}</ul>
    </nav></header>
    <main>{page === "home" && <Home go={go} />}{page === "find" && <Find />}{page === "browse" && <Browse />}{page === "assistant" && <Assistant />}</main>
    <footer>ScholarshipMatch shows DEMO DATA only. Verify all details with the official scholarship provider.</footer>
  </>);
}
