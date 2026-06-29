"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const EMPTY = {
  title: "", industry: "", description: "", technologies: "",
  problem: "", results: "", live_url: "", case_study_url: "",
  demo_url: "", media_type: "image", media_url: "",
  testimonial: "", testimonial_author: "",
};

export default function Admin() {
  const [tab, setTab] = useState("projects");
  const [projects, setProjects] = useState([]);
  const [leads, setLeads] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function loadProjects() {
    const r = await fetch("/api/projects");
    const d = await r.json();
    setProjects(d.projects || []);
  }
  async function loadLeads() {
    const r = await fetch("/api/leads");
    const d = await r.json();
    setLeads(d.leads || []);
  }
  useEffect(() => { loadProjects(); loadLeads(); }, []);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg("");
    const kind = form.media_type === "video" ? "video" : "image";
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", kind);
    try {
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await r.json();
      if (d.url) { set("media_url", d.url); setMsg("Media uploaded ✓"); }
      else setMsg(d.error || "Upload failed");
    } catch { setMsg("Upload failed"); }
    finally { setUploading(false); }
  }

  async function saveProject() {
    if (!form.title) { setMsg("Title is required"); return; }
    setSaving(true); setMsg("");
    try {
      const r = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (r.ok) { setForm(EMPTY); setMsg("Project saved ✓"); loadProjects(); }
      else { const d = await r.json(); setMsg(d.error || "Save failed"); }
    } catch { setMsg("Save failed"); }
    finally { setSaving(false); }
  }

  const input = "w-full rounded-lg bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-cyanglow/50";
  const label = "text-xs font-medium text-white/60 mb-1.5 block";

  return (
    <main className="min-h-screen bg-space">
      <div className="border-b border-white/5 bg-space/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-white/50 hover:text-cyanglow">← Site</Link>
            <span className="font-display font-bold">Admin Dashboard</span>
          </div>
          <div className="flex gap-2">
            {["projects", "leads"].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`rounded-full px-4 py-1.5 text-sm capitalize transition ${
                  tab === t ? "bg-cyanglow text-space font-semibold" : "text-white/60 hover:text-white"
                }`}>
                {t}{t === "leads" && leads.length ? ` (${leads.length})` : ""}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
        {msg && (
          <div className="mb-6 rounded-lg border border-cyanglow/30 bg-cyanglow/10 px-4 py-2.5 text-sm text-cyanglow">
            {msg}
          </div>
        )}

        {tab === "projects" && (
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
            {/* Form */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-display text-xl font-bold mb-5">Add Project</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={label}>Title *</label>
                    <input className={input} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Project name" /></div>
                  <div><label className={label}>Industry</label>
                    <input className={input} value={form.industry} onChange={(e) => set("industry", e.target.value)} placeholder="e.g. Retail" /></div>
                </div>
                <div><label className={label}>Description</label>
                  <textarea className={input} rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={label}>Problem solved</label>
                    <input className={input} value={form.problem} onChange={(e) => set("problem", e.target.value)} /></div>
                  <div><label className={label}>Results</label>
                    <input className={input} value={form.results} onChange={(e) => set("results", e.target.value)} /></div>
                </div>
                <div><label className={label}>Technologies (comma separated)</label>
                  <input className={input} value={form.technologies} onChange={(e) => set("technologies", e.target.value)} placeholder="Next.js, FastAPI, PostgreSQL" /></div>

                <div className="grid grid-cols-3 gap-4">
                  <div><label className={label}>Live URL</label>
                    <input className={input} value={form.live_url} onChange={(e) => set("live_url", e.target.value)} placeholder="https://" /></div>
                  <div><label className={label}>Case study URL</label>
                    <input className={input} value={form.case_study_url} onChange={(e) => set("case_study_url", e.target.value)} placeholder="https://" /></div>
                  <div><label className={label}>Demo URL</label>
                    <input className={input} value={form.demo_url} onChange={(e) => set("demo_url", e.target.value)} placeholder="https://" /></div>
                </div>

                {/* Media */}
                <div className="rounded-xl border border-white/10 p-4">
                  <label className={label}>Media type</label>
                  <div className="flex gap-2 mb-3">
                    {["image", "video"].map((mt) => (
                      <button key={mt} onClick={() => set("media_type", mt)}
                        className={`rounded-full px-4 py-1.5 text-xs capitalize transition ${
                          form.media_type === mt ? "bg-cyanglow text-space font-semibold" : "border border-white/15 text-white/60"
                        }`}>{mt}</button>
                    ))}
                  </div>
                  <p className="text-xs text-white/40 mb-2">
                    {form.media_type === "video"
                      ? "MP4 / MOV / WebM — for mobile & desktop apps (max 500MB)"
                      : "PNG / JPG / WEBP — screenshots & web projects (max 20MB)"}
                  </p>
                  <input type="file"
                    accept={form.media_type === "video" ? "video/mp4,video/quicktime,video/webm" : "image/png,image/jpeg,image/webp"}
                    onChange={handleUpload}
                    className="block w-full text-xs text-white/60 file:mr-3 file:rounded-full file:border-0 file:bg-cyanglow file:px-4 file:py-2 file:text-xs file:font-semibold file:text-space" />
                  {uploading && <p className="mt-2 text-xs text-cyanglow">Uploading…</p>}
                  {form.media_url && (
                    <p className="mt-2 text-xs text-white/40 truncate">Saved: {form.media_url.slice(0, 50)}…</p>
                  )}
                  <div className="mt-3">
                    <label className={label}>…or paste a media URL</label>
                    <input className={input} value={form.media_url.startsWith("data:") ? "" : form.media_url}
                      onChange={(e) => set("media_url", e.target.value)} placeholder="https://" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div><label className={label}>Testimonial</label>
                    <input className={input} value={form.testimonial} onChange={(e) => set("testimonial", e.target.value)} /></div>
                  <div><label className={label}>Testimonial author</label>
                    <input className={input} value={form.testimonial_author} onChange={(e) => set("testimonial_author", e.target.value)} /></div>
                </div>

                <button onClick={saveProject} disabled={saving}
                  className="btn-glow w-full rounded-lg bg-cyanglow py-3 text-sm font-semibold text-space disabled:opacity-50">
                  {saving ? "Saving…" : "Save Project"}
                </button>
              </div>
            </div>

            {/* List */}
            <div>
              <h2 className="font-display text-xl font-bold mb-5">Projects ({projects.length})</h2>
              <div className="space-y-3">
                {projects.length === 0 && <p className="text-white/40 text-sm">No projects yet.</p>}
                {projects.map((p) => (
                  <div key={p.id} className="glass rounded-xl p-4 flex gap-4">
                    <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-space">
                      {p.media_type === "video" && p.media_url ? (
                        <video src={p.media_url} className="h-full w-full object-cover" muted />
                      ) : p.media_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.media_url} alt="" className="h-full w-full object-cover" />
                      ) : <div className="flex h-full items-center justify-center text-[10px] text-white/30">no media</div>}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{p.title}</p>
                      <p className="text-xs text-cyanglow">{p.industry}</p>
                      <p className="text-xs text-white/50 line-clamp-2 mt-0.5">{p.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "leads" && (
          <div>
            <h2 className="font-display text-xl font-bold mb-5">Captured Leads ({leads.length})</h2>
            <div className="glass rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-white/40">
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Industry</th>
                      <th className="px-4 py-3">Pain points</th>
                      <th className="px-4 py-3">Wants</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-white/40">No leads captured yet.</td></tr>
                    )}
                    {leads.map((l) => (
                      <tr key={l.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-4 py-3">{l.email || "—"}</td>
                        <td className="px-4 py-3">{l.phone || "—"}</td>
                        <td className="px-4 py-3 max-w-[140px] truncate">{l.industry || "—"}</td>
                        <td className="px-4 py-3 max-w-[180px] truncate text-white/60">{l.pain_points || "—"}</td>
                        <td className="px-4 py-3">{l.desired_solution || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            l.score >= 70 ? "bg-cyanglow/20 text-cyanglow" : "bg-white/10 text-white/60"
                          }`}>{l.score}</span>
                        </td>
                        <td className="px-4 py-3 text-white/40 text-xs">{l.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
