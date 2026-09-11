"use client";
import { useEffect, useState } from "react";

const EMPTY = {
  title: "", subject: "", level: "", description: "",
  thumbnail_url: "", stream_uid: "", preview_seconds: 0, price_usd: "",
  published: true,
};

export default function LessonsManager({ onAuthError, flash }) {
  const [lessons, setLessons] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);

  async function load() {
    const r = await fetch("/api/lessons");
    const d = await r.json();
    setLessons(d.lessons || []);
  }
  useEffect(() => { load(); }, []);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  function resetForm() { setForm(EMPTY); setEditingId(null); setUploadPct(0); }

  // Upload a video straight to Cloudflare Stream via a one-time direct-upload URL.
  async function handleVideo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadPct(0);
    try {
      const initRes = await fetch("/api/stream/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.title || file.name }),
      });
      if (initRes.status === 401) { onAuthError?.(); return; }
      const init = await initRes.json();
      if (!initRes.ok) { flash?.(init.error || "Upload init failed", "err"); return; }

      // Upload directly to Cloudflare with progress.
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", init.uploadURL, true);
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) setUploadPct(Math.round((ev.loaded / ev.total) * 100));
        };
        xhr.onload = () => (xhr.status < 300 ? resolve() : reject());
        xhr.onerror = reject;
        const fd = new FormData();
        fd.append("file", file);
        xhr.send(fd);
      });

      set("stream_uid", init.uid);
      flash?.("Video uploaded to Cloudflare ✓");
    } catch {
      flash?.("Video upload failed", "err");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function save() {
    if (!form.title) { flash?.("Title is required", "err"); return; }
    setSaving(true);
    try {
      const url = editingId ? `/api/lessons/${editingId}` : "/api/lessons";
      const method = editingId ? "PATCH" : "POST";
      const payload = {
        ...form,
        price_usd: Number(form.price_usd) || 0,
        preview_seconds: Number(form.preview_seconds) || 0,
      };
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (r.status === 401) { onAuthError?.(); return; }
      const d = await r.json();
      if (r.ok) {
        flash?.(editingId ? "Lesson updated ✓" : "Lesson added ✓");
        resetForm();
        load();
      } else {
        flash?.(d.error || "Save failed", "err");
      }
    } catch { flash?.("Save failed", "err"); }
    finally { setSaving(false); }
  }

  function startEdit(l) {
    setEditingId(l.id);
    setForm({
      title: l.title || "", subject: l.subject || "", level: l.level || "",
      description: l.description || "", thumbnail_url: l.thumbnail_url || "",
      stream_uid: l.stream_uid || "", preview_seconds: l.preview_seconds || 0,
      price_usd: l.price_usd ?? "", published: l.published !== 0,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function del(id) {
    if (!confirm("Delete this lesson?")) return;
    const r = await fetch(`/api/lessons/${id}`, { method: "DELETE" });
    if (r.status === 401) { onAuthError?.(); return; }
    if (r.ok) { flash?.("Lesson deleted"); load(); if (editingId === id) resetForm(); }
    else flash?.("Delete failed", "err");
  }

  const input = "w-full rounded-lg bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-cyanglow/50";
  const label = "text-xs font-medium text-white/60 mb-1.5 block";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      {/* Form */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold">
            {editingId ? "Edit lesson" : "Add lesson"}
          </h2>
          {editingId && (
            <button onClick={resetForm} className="text-xs text-white/50 hover:text-cyanglow">
              + New lesson
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className={label}>Title *</label>
              <input className={input} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Algebra: Quadratics" /></div>
            <div><label className={label}>Price (USD) *</label>
              <input className={input} type="number" min="0" step="0.01" value={form.price_usd} onChange={(e) => set("price_usd", e.target.value)} placeholder="5.00" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={label}>Subject</label>
              <input className={input} value={form.subject} onChange={(e) => set("subject", e.target.value)} placeholder="Mathematics" /></div>
            <div><label className={label}>Level</label>
              <input className={input} value={form.level} onChange={(e) => set("level", e.target.value)} placeholder="Form 4 / O-Level" /></div>
          </div>
          <div><label className={label}>Description</label>
            <textarea className={input} rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
          <div><label className={label}>Thumbnail URL</label>
            <input className={input} value={form.thumbnail_url} onChange={(e) => set("thumbnail_url", e.target.value)} placeholder="https://" /></div>

          {/* Video upload */}
          <div className="rounded-xl border border-white/10 p-4">
            <label className={label}>Lesson video</label>
            <p className="text-xs text-white/40 mb-2">
              Uploaded securely to Cloudflare Stream. Students stream it — no downloadable file.
            </p>
            <input type="file" accept="video/*" onChange={handleVideo}
              className="block w-full text-xs text-white/60 file:mr-3 file:rounded-full file:border-0 file:bg-cyanglow file:px-4 file:py-2 file:text-xs file:font-semibold file:text-space" />
            {uploading && (
              <div className="mt-3">
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-cyanglow transition-all" style={{ width: `${uploadPct}%` }} />
                </div>
                <p className="mt-1 text-xs text-cyanglow">Uploading… {uploadPct}%</p>
              </div>
            )}
            {form.stream_uid && (
              <p className="mt-2 text-xs text-white/40 truncate">Video ID: {form.stream_uid}</p>
            )}
            <div className="mt-3">
              <label className={label}>…or paste a Cloudflare Stream video UID</label>
              <input className={input} value={form.stream_uid} onChange={(e) => set("stream_uid", e.target.value)} placeholder="e.g. 31c9291a…" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <div><label className={label}>Free preview (seconds)</label>
              <input className={input} type="number" min="0" value={form.preview_seconds} onChange={(e) => set("preview_seconds", e.target.value)} placeholder="0" /></div>
            <label className="flex items-center gap-2 text-sm text-white/70 pb-2.5">
              <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="accent-cyanglow" />
              Published (visible to students)
            </label>
          </div>

          <button onClick={save} disabled={saving || uploading}
            className="btn-glow w-full rounded-lg bg-cyanglow py-3 text-sm font-semibold text-space disabled:opacity-50">
            {saving ? "Saving…" : editingId ? "Update lesson" : "Add lesson"}
          </button>
        </div>
      </div>

      {/* List */}
      <div>
        <h2 className="font-display text-xl font-bold mb-5">Lessons ({lessons.length})</h2>
        <div className="space-y-3">
          {lessons.length === 0 && <p className="text-white/40 text-sm">No lessons yet.</p>}
          {lessons.map((l) => (
            <div key={l.id} className={`glass rounded-xl p-4 flex gap-4 ${editingId === l.id ? "ring-1 ring-cyanglow/50" : ""}`}>
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-space">
                {l.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.thumbnail_url} alt="" className="h-full w-full object-cover" />
                ) : <div className="flex h-full items-center justify-center text-[10px] text-white/30">no thumb</div>}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{l.title}</p>
                <p className="text-xs text-cyanglow">${Number(l.price_usd).toFixed(2)} · {l.subject || "—"}</p>
                <p className="text-xs text-white/40 mt-0.5">
                  {l.stream_uid ? "🎬 video set" : "⚠ no video"}
                </p>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <button onClick={() => startEdit(l)}
                  className="rounded-full bg-white/10 hover:bg-cyanglow hover:text-space px-3 py-1 text-xs transition">Edit</button>
                <button onClick={() => del(l.id)}
                  className="rounded-full border border-red-500/30 text-red-300 hover:bg-red-500/20 px-3 py-1 text-xs transition">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
