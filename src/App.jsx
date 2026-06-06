import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase.js";

const C = {
  bg: "#0f1724", bgCard: "#182234", bgHover: "#1e2d45", bgInput: "#131d2e",
  border: "#263654", primary: "#2e7cf6", primaryMuted: "rgba(46,124,246,0.12)",
  accent: "#22c55e", accentOrange: "#f59e0b", accentRed: "#ef4444",
  textPrimary: "#e8edf5", textSecondary: "#8899b4", textMuted: "#5a6d8a",
};
const PRI = {
  High: { color: C.accentRed, bg: "rgba(239,68,68,0.12)" },
  Medium: { color: C.accentOrange, bg: "rgba(245,158,11,0.12)" },
  Low: { color: C.accent, bg: "rgba(34,197,94,0.12)" },
};
const AVS = ["#2e7cf6","#8b5cf6","#ec4899","#f59e0b","#22c55e","#ef4444"];
const ff = "'IBM Plex Sans', 'Segoe UI', sans-serif";

const Avatar = ({ name, color, size = 32 }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: color || AVS[0],
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: size * 0.38, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
    {name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
  </div>
);
const Badge = ({ text, color, bg }) => (
  <span style={{ padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600,
    color, background: bg, whiteSpace: "nowrap" }}>{text}</span>
);
const Btn = ({ children, onClick, variant = "primary", style: s = {}, disabled }) => {
  const vs = {
    primary: { background: disabled ? C.textMuted : C.primary, color: "#fff" },
    ghost: { background: "transparent", color: C.textSecondary, border: `1px solid ${C.border}` },
    danger: { background: "transparent", color: C.accentRed, border: `1px solid ${C.accentRed}` },
  };
  return <button onClick={onClick} disabled={disabled} style={{
    padding: "9px 18px", borderRadius: 6, fontSize: 13, fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer", border: "none", transition: "all 0.15s",
    display: "inline-flex", alignItems: "center", gap: 6, fontFamily: ff, ...vs[variant], ...s
  }}>{children}</button>;
};
const Inp = ({ label, ...p }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, letterSpacing: 0.4, textTransform: "uppercase" }}>{label}</label>}
    <input {...p} style={{ padding: "10px 14px", borderRadius: 6, border: `1px solid ${C.border}`,
      background: C.bgInput, color: C.textPrimary, fontSize: 14, outline: "none", fontFamily: ff, ...(p.style || {}) }}
      onFocus={e => e.target.style.borderColor = C.primary} onBlur={e => e.target.style.borderColor = C.border} />
  </div>
);
const Sel = ({ label, children, ...p }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, letterSpacing: 0.4, textTransform: "uppercase" }}>{label}</label>}
    <select {...p} style={{ padding: "10px 14px", borderRadius: 6, border: `1px solid ${C.border}`,
      background: C.bgInput, color: C.textPrimary, fontSize: 14, outline: "none", fontFamily: ff, ...(p.style || {}) }}>{children}</select>
  </div>
);
const Modal = ({ title, onClose, children, width = 480 }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex",
    alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} style={{ width, maxWidth: "92vw", maxHeight: "88vh",
      overflow: "auto", padding: 32, borderRadius: 12, background: C.bgCard,
      border: `1px solid ${C.border}`, boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.textPrimary }}>{title}</h3>
        <span onClick={onClose} style={{ cursor: "pointer", color: C.textMuted, fontSize: 20 }}>✕</span>
      </div>
      {children}
    </div>
  </div>
);
const StatCard = ({ label, value, sub, color }) => (
  <div style={{ flex: "1 1 200px", padding: "22px 24px", borderRadius: 10, background: C.bgCard, border: `1px solid ${C.border}` }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 800, color: color || C.textPrimary, letterSpacing: -1 }}>{value}</div>
    <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 4 }}>{sub}</div>
  </div>
);

function SearchFilterBar({ search, setSearch, filterProject, setFilterProject, filterPriority, setFilterPriority, projects, showProjectFilter = true }) {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
      <div style={{ position: "relative", flex: "1 1 220px" }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: C.textMuted }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..."
          style={{ width: "100%", padding: "9px 14px 9px 36px", borderRadius: 6, border: `1px solid ${C.border}`,
            background: C.bgInput, color: C.textPrimary, fontSize: 13, outline: "none", fontFamily: ff, boxSizing: "border-box" }} />
      </div>
      {showProjectFilter && <select value={filterProject} onChange={e => setFilterProject(e.target.value)}
        style={{ padding: "9px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bgInput, color: C.textSecondary, fontSize: 12, fontFamily: ff, outline: "none" }}>
        <option value="">All Projects</option>
        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>}
      <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
        style={{ padding: "9px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bgInput, color: C.textSecondary, fontSize: 12, fontFamily: ff, outline: "none" }}>
        <option value="">All Priorities</option>
        <option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
      </select>
      {(search || filterProject || filterPriority) && (
        <Btn variant="ghost" onClick={() => { setSearch(""); setFilterProject(""); setFilterPriority(""); }}
          style={{ padding: "8px 12px", fontSize: 12 }}>Clear</Btn>
      )}
    </div>
  );
}

// ==================== TASK DETAIL ====================
function TaskDetail({ task, onClose, session, user, onUpdate, categories }) {
  const [comments, setComments] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [posting, setPosting] = useState(false);
  const [status, setStatus] = useState(task.status);
  const [desc, setDesc] = useState(task.description || "");
  const [editingDesc, setEditingDesc] = useState(false);
  const [priority, setPriority] = useState(task.priority);
  const [catId, setCatId] = useState(task.category_id || "");

  const load = useCallback(async () => {
    const { data: cm } = await supabase.from("comments").select("*").eq("task_id", task.id).order("created_at", { ascending: true });
    const { data: st } = await supabase.from("subtasks").select("*").eq("task_id", task.id).order("created_at", { ascending: true });
    if (cm) setComments(cm); if (st) setSubtasks(st);
  }, [task.id]);
  useEffect(() => { load(); }, [load]);

  const addComment = async () => { if (!newComment.trim()) return; setPosting(true);
    await supabase.from("comments").insert({ task_id: task.id, user_id: session.user.id, content: newComment });
    setNewComment(""); await load(); setPosting(false); };
  const addSub = async () => { if (!newSubtask.trim()) return;
    await supabase.from("subtasks").insert({ task_id: task.id, title: newSubtask });
    setNewSubtask(""); await load(); };
  const toggleSub = async (id, c) => { await supabase.from("subtasks").update({ completed: !c }).eq("id", id); await load(); };
  const delSub = async (id) => { await supabase.from("subtasks").delete().eq("id", id); await load(); };
  const updStatus = async (s) => { setStatus(s); await supabase.from("tasks").update({ status: s, updated_at: new Date().toISOString() }).eq("id", task.id); onUpdate(); };
  const updPri = async (p) => { setPriority(p); await supabase.from("tasks").update({ priority: p }).eq("id", task.id); onUpdate(); };
  const updCat = async (c) => { setCatId(c); await supabase.from("tasks").update({ category_id: c || null }).eq("id", task.id); onUpdate(); };
  const saveDesc = async () => { await supabase.from("tasks").update({ description: desc }).eq("id", task.id); setEditingDesc(false); onUpdate(); };
  const delTask = async () => { await supabase.from("tasks").delete().eq("id", task.id); onClose(); onUpdate(); };
  const timeAgo = (d) => { const m = Math.floor((Date.now()-new Date(d))/60000); if(m<1) return "just now"; if(m<60) return `${m}m ago`; const h=Math.floor(m/60); if(h<24) return `${h}h ago`; return `${Math.floor(h/24)}d ago`; };
  const cd = subtasks.filter(s => s.completed).length, pct = subtasks.length > 0 ? Math.round((cd/subtasks.length)*100) : 0;

  return (
    <Modal title={task.title} onClose={onClose} width={600}>
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <Badge text={task.project_name} color={C.primary} bg={C.primaryMuted} />
        {task.category_name && <Badge text={task.category_name} color={C.accentOrange} bg="rgba(245,158,11,0.12)" />}
        {task.deadline && <span style={{ fontSize: 12, color: C.textSecondary }}>📅 {task.deadline}</span>}
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 0.5, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Status</label>
          <div style={{ display: "flex", gap: 6 }}>
            {[{ key: "todo", label: "To Do", color: C.primary },{ key: "progress", label: "In Progress", color: C.accentOrange },
              { key: "done", label: "Done", color: C.accent }].map(s => (
              <div key={s.key} onClick={() => updStatus(s.key)} style={{ padding: "5px 12px", borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: status === s.key ? s.color : "transparent", color: status === s.key ? "#fff" : C.textSecondary,
                border: `1px solid ${status === s.key ? s.color : C.border}` }}>{s.label}</div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 0.5, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Priority</label>
          <div style={{ display: "flex", gap: 6 }}>
            {["High","Medium","Low"].map(p => (
              <div key={p} onClick={() => updPri(p)} style={{ padding: "5px 12px", borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: priority === p ? PRI[p].bg : "transparent", color: priority === p ? PRI[p].color : C.textSecondary,
                border: `1px solid ${priority === p ? PRI[p].color : C.border}` }}>{p}</div>
            ))}
          </div>
        </div>
      </div>

      {categories.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 0.5, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Category</label>
          <select value={catId} onChange={e => updCat(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bgInput, color: C.textPrimary, fontSize: 13, fontFamily: ff, outline: "none" }}>
            <option value="">No category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      <div style={{ marginBottom: 20, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 0.5, textTransform: "uppercase" }}>Description</label>
          {!editingDesc && <span onClick={() => setEditingDesc(true)} style={{ fontSize: 11, color: C.primary, cursor: "pointer" }}>Edit</span>}
        </div>
        {editingDesc ? (<div>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Add details..." rows={4}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bgInput,
              color: C.textPrimary, fontSize: 13, outline: "none", fontFamily: ff, resize: "vertical", boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <Btn onClick={saveDesc} style={{ padding: "6px 14px", fontSize: 12 }}>Save</Btn>
            <Btn variant="ghost" onClick={() => { setDesc(task.description||""); setEditingDesc(false); }} style={{ padding: "6px 14px", fontSize: 12 }}>Cancel</Btn>
          </div></div>
        ) : (<p style={{ margin: 0, fontSize: 13, color: desc ? C.textSecondary : C.textMuted, lineHeight: 1.6, cursor: "pointer" }}
            onClick={() => setEditingDesc(true)}>{desc || "Click to add a description..."}</p>)}
      </div>

      <div style={{ marginBottom: 20, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 0.5, textTransform: "uppercase" }}>
            Checklist {subtasks.length > 0 && `(${cd}/${subtasks.length})`}</label>
          {subtasks.length > 0 && <span style={{ fontSize: 11, color: C.textMuted }}>{pct}%</span>}
        </div>
        {subtasks.length > 0 && (<div style={{ height: 4, borderRadius: 2, background: C.bgHover, marginBottom: 12, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, borderRadius: 2, background: pct === 100 ? C.accent : C.primary, transition: "width 0.3s" }} /></div>)}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
          {subtasks.map(s => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
              <div onClick={() => toggleSub(s.id, s.completed)} style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0, cursor: "pointer",
                border: `2px solid ${s.completed ? C.accent : C.border}`, background: s.completed ? C.accent : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff" }}>{s.completed && "✓"}</div>
              <span style={{ flex: 1, fontSize: 13, color: s.completed ? C.textMuted : C.textPrimary,
                textDecoration: s.completed ? "line-through" : "none" }}>{s.title}</span>
              <span onClick={() => delSub(s.id)} style={{ fontSize: 14, color: C.textMuted, cursor: "pointer", opacity: 0.5 }}>✕</span>
            </div>))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={newSubtask} onChange={e => setNewSubtask(e.target.value)} placeholder="Add checklist item..."
            onKeyDown={e => e.key === "Enter" && addSub()}
            style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bgInput, color: C.textPrimary, fontSize: 12, outline: "none", fontFamily: ff }} />
          <Btn onClick={addSub} style={{ padding: "6px 12px", fontSize: 12 }}>Add</Btn>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
        <h4 style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 0.5, textTransform: "uppercase" }}>Comments ({comments.length})</h4>
        {comments.length === 0 && <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 12 }}>No comments yet.</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14, maxHeight: 200, overflowY: "auto" }}>
          {comments.map(c => (
            <div key={c.id} style={{ display: "flex", gap: 10 }}>
              <Avatar name={user?.full_name||"U"} color={AVS[c.content.length % AVS.length]} size={26} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary }}>{user?.full_name||"You"}</span>
                  <span style={{ fontSize: 11, color: C.textMuted }}>{timeAgo(c.created_at)}</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: C.textSecondary, lineHeight: 1.5 }}>{c.content}</p>
              </div>
            </div>))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Write a comment..."
            onKeyDown={e => e.key === "Enter" && addComment()}
            style={{ flex: 1, padding: "9px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bgInput, color: C.textPrimary, fontSize: 13, outline: "none", fontFamily: ff }} />
          <Btn onClick={addComment} disabled={posting||!newComment.trim()} style={{ padding: "9px 14px" }}>{posting ? "..." : "Post"}</Btn>
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 20, paddingTop: 14, display: "flex", justifyContent: "flex-end" }}>
        <Btn variant="danger" onClick={delTask} style={{ fontSize: 12 }}>Delete Task</Btn>
      </div>
    </Modal>
  );
}

// ==================== PROJECT DETAIL VIEW ====================
function ProjectDetail({ project, tasks, categories, onBack, onTaskClick, session, onUpdate }) {
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCat, setNewCat] = useState({ name: "", color: "#2e7cf6" });
  const [saving, setSaving] = useState(false);

  const pTasks = tasks.filter(t => t.project_id === project.id);
  const pDone = pTasks.filter(t => t.status === "done").length;
  const pct = pTasks.length > 0 ? Math.round((pDone / pTasks.length) * 100) : 0;
  const pCats = categories.filter(c => c.project_id === project.id);
  const uncategorized = pTasks.filter(t => !t.category_id);

  const addCategory = async () => {
    if (!newCat.name.trim()) return; setSaving(true);
    await supabase.from("categories").insert({ project_id: project.id, name: newCat.name, color: newCat.color });
    setNewCat({ name: "", color: "#2e7cf6" }); setShowNewCat(false); await onUpdate(); setSaving(false);
  };

  const deleteCategory = async (id) => {
    await supabase.from("categories").delete().eq("id", id); await onUpdate();
  };

  const deleteProject = async () => {
    if (!window.confirm("Delete this project and all its tasks?")) return;
    await supabase.from("projects").delete().eq("id", project.id); onBack(); await onUpdate();
  };

  return (
    <div>
      {/* Project Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <span onClick={onBack} style={{ fontSize: 14, color: C.primary, cursor: "pointer", fontWeight: 600 }}>← All Projects</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 20, height: 20, borderRadius: 6, background: project.color }} />
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.textPrimary }}>{project.name}</h2>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={() => setShowNewCat(true)} variant="ghost" style={{ fontSize: 12 }}>+ Category</Btn>
          <Btn variant="danger" onClick={deleteProject} style={{ fontSize: 12 }}>Delete Project</Btn>
        </div>
      </div>

      {/* Progress */}
      <div style={{ background: C.bgCard, borderRadius: 10, border: `1px solid ${C.border}`, padding: "20px 24px", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{pDone}/{pTasks.length} tasks completed</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: project.color }}>{pct}%</span>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: C.bgHover, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, borderRadius: 4, background: project.color, transition: "width 0.3s" }} />
        </div>
        <div style={{ display: "flex", gap: 20, marginTop: 16 }}>
          <div><span style={{ fontSize: 20, fontWeight: 800, color: C.primary }}>{pTasks.filter(t=>t.status==="todo").length}</span>
            <span style={{ fontSize: 12, color: C.textMuted, marginLeft: 6 }}>To Do</span></div>
          <div><span style={{ fontSize: 20, fontWeight: 800, color: C.accentOrange }}>{pTasks.filter(t=>t.status==="progress").length}</span>
            <span style={{ fontSize: 12, color: C.textMuted, marginLeft: 6 }}>In Progress</span></div>
          <div><span style={{ fontSize: 20, fontWeight: 800, color: C.accent }}>{pDone}</span>
            <span style={{ fontSize: 12, color: C.textMuted, marginLeft: 6 }}>Done</span></div>
        </div>
      </div>

      {/* Categories */}
      {pCats.map(cat => {
        const catTasks = pTasks.filter(t => t.category_id === cat.id);
        const catDone = catTasks.filter(t => t.status === "done").length;
        const catPct = catTasks.length > 0 ? Math.round((catDone / catTasks.length) * 100) : 0;
        return (
          <div key={cat.id} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: cat.color }} />
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.textPrimary }}>{cat.name}</h3>
                <span style={{ fontSize: 11, color: C.textMuted, marginLeft: 4 }}>{catDone}/{catTasks.length} · {catPct}%</span>
              </div>
              <span onClick={() => deleteCategory(cat.id)} style={{ fontSize: 12, color: C.textMuted, cursor: "pointer" }}>✕</span>
            </div>
            {catTasks.length > 0 && (
              <div style={{ height: 4, borderRadius: 2, background: C.bgHover, marginBottom: 10, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${catPct}%`, borderRadius: 2, background: cat.color, transition: "width 0.3s" }} />
              </div>
            )}
            <div style={{ background: C.bgCard, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              {catTasks.length === 0 ? (
                <div style={{ padding: "16px 20px", textAlign: "center", color: C.textMuted, fontSize: 13 }}>No tasks in this category</div>
              ) : catTasks.map((t, i) => (
                <div key={t.id} onClick={() => onTaskClick(t)} style={{
                  padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
                  cursor: "pointer", transition: "background 0.12s",
                  borderBottom: i < catTasks.length - 1 ? `1px solid ${C.border}` : "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.bgHover}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4,
                      border: `2px solid ${t.status==="done" ? C.accent : C.border}`,
                      background: t.status==="done" ? C.accent : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff" }}>
                      {t.status === "done" && "✓"}</div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary,
                      textDecoration: t.status==="done" ? "line-through" : "none" }}>{t.title}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {t.subtask_count > 0 && <span style={{ fontSize: 11, color: C.textMuted }}>☑ {t.subtask_done}/{t.subtask_count}</span>}
                    {t.comment_count > 0 && <span style={{ fontSize: 11, color: C.textMuted }}>💬 {t.comment_count}</span>}
                    <Badge text={t.priority} color={PRI[t.priority]?.color} bg={PRI[t.priority]?.bg} />
                    {t.deadline && <span style={{ fontSize: 11, color: C.textMuted }}>{t.deadline}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Uncategorized */}
      {uncategorized.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: C.textMuted }} />
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.textSecondary }}>Uncategorized</h3>
            <span style={{ fontSize: 11, color: C.textMuted, marginLeft: 4 }}>{uncategorized.length} tasks</span>
          </div>
          <div style={{ background: C.bgCard, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            {uncategorized.map((t, i) => (
              <div key={t.id} onClick={() => onTaskClick(t)} style={{
                padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
                cursor: "pointer", transition: "background 0.12s",
                borderBottom: i < uncategorized.length - 1 ? `1px solid ${C.border}` : "none" }}
                onMouseEnter={e => e.currentTarget.style.background = C.bgHover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4,
                    border: `2px solid ${t.status==="done" ? C.accent : C.border}`,
                    background: t.status==="done" ? C.accent : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff" }}>
                    {t.status === "done" && "✓"}</div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary,
                    textDecoration: t.status==="done" ? "line-through" : "none" }}>{t.title}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Badge text={t.priority} color={PRI[t.priority]?.color} bg={PRI[t.priority]?.bg} />
                  {t.deadline && <span style={{ fontSize: 11, color: C.textMuted }}>{t.deadline}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Category Modal */}
      {showNewCat && (
        <Modal title="New Category" onClose={() => setShowNewCat(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Inp label="Category Name" placeholder="e.g. Design, Backend, Marketing" value={newCat.name}
              onChange={e => setNewCat({ ...newCat, name: e.target.value })} />
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, letterSpacing: 0.4, textTransform: "uppercase" }}>Color</label>
              <div style={{ display: "flex", gap: 8 }}>
                {AVS.map(c => (<div key={c} onClick={() => setNewCat({ ...newCat, color: c })} style={{
                  width: 32, height: 32, borderRadius: 6, background: c, cursor: "pointer",
                  border: newCat.color === c ? "2px solid #fff" : "2px solid transparent" }} />))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <Btn onClick={addCategory} disabled={saving} style={{ flex: 1, justifyContent: "center" }}>{saving ? "Creating..." : "Create Category"}</Btn>
              <Btn variant="ghost" onClick={() => setShowNewCat(false)} style={{ flex: 1, justifyContent: "center" }}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ==================== CALENDAR ====================
function CalendarView({ tasks }) {
  const [cur, setCur] = useState(new Date());
  const y = cur.getFullYear(), m = cur.getMonth();
  const name = cur.toLocaleString("default", { month: "long", year: "numeric" });
  const first = new Date(y,m,1).getDay(), dim = new Date(y,m+1,0).getDate(), today = new Date();
  const days = []; for(let i=0;i<first;i++) days.push(null); for(let i=1;i<=dim;i++) days.push(i);
  const tf = d => { if(!d) return []; const ds=`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`; return tasks.filter(t=>t.deadline===ds); };
  const it = d => d && today.getFullYear()===y && today.getMonth()===m && today.getDate()===d;
  return (<div>
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
      <Btn variant="ghost" onClick={()=>setCur(new Date(y,m-1,1))}>← Prev</Btn>
      <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:C.textPrimary }}>{name}</h2>
      <Btn variant="ghost" onClick={()=>setCur(new Date(y,m+1,1))}>Next →</Btn>
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:1, background:C.border, borderRadius:10, overflow:"hidden" }}>
      {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>(<div key={d} style={{ padding:"10px 8px", textAlign:"center", fontSize:11, fontWeight:700, color:C.textMuted, background:C.bgCard, textTransform:"uppercase", letterSpacing:0.5 }}>{d}</div>))}
      {days.map((day,i)=>{const dt=tf(day); return(<div key={i} style={{ minHeight:90, padding:8, background:day?C.bgCard:C.bg }}>{day&&(<>
        <div style={{ fontSize:13, fontWeight:it(day)?800:500, color:it(day)?C.primary:C.textSecondary, marginBottom:6,
          width:it(day)?24:"auto", height:it(day)?24:"auto", borderRadius:"50%", display:it(day)?"flex":"block",
          alignItems:"center", justifyContent:"center", background:it(day)?C.primaryMuted:"transparent" }}>{day}</div>
        {dt.slice(0,2).map(t=>(<div key={t.id} style={{ padding:"2px 6px", borderRadius:3, fontSize:10, fontWeight:600, marginBottom:2,
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", background:PRI[t.priority]?.bg, color:PRI[t.priority]?.color }}>{t.title}</div>))}
        {dt.length>2&&<div style={{ fontSize:10, color:C.textMuted }}>+{dt.length-2} more</div>}
      </>)}</div>);})}
    </div>
  </div>);
}

// ==================== KANBAN ====================
const KanbanCol = ({ title, count, color, tasks, onDragOver, onDrop, onDragStart, onTaskClick }) => (
  <div onDragOver={onDragOver} onDrop={onDrop} style={{ flex:1, minWidth:260, background:C.bgInput, borderRadius:10, border:`1px solid ${C.border}`, display:"flex", flexDirection:"column" }}>
    <div style={{ padding:"14px 18px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ width:10, height:10, borderRadius:3, background:color }} />
        <span style={{ fontSize:13, fontWeight:700, color:C.textPrimary, letterSpacing:0.4, textTransform:"uppercase" }}>{title}</span>
      </div>
      <span style={{ background:C.bgHover, color:C.textSecondary, fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:10 }}>{count}</span>
    </div>
    <div style={{ padding:12, display:"flex", flexDirection:"column", gap:10, flex:1, overflowY:"auto" }}>
      {tasks.map(t=>(<div key={t.id} draggable onDragStart={()=>onDragStart(t.id)} onClick={()=>onTaskClick(t)}
        style={{ padding:"14px 16px", borderRadius:8, background:C.bgCard, border:`1px solid ${C.border}`, cursor:"grab", transition:"border-color 0.15s" }}
        onMouseEnter={e=>e.currentTarget.style.borderColor=C.primary} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
        <div style={{ fontSize:13, fontWeight:600, color:C.textPrimary, marginBottom:10, lineHeight:1.4 }}>{t.title}</div>
        {t.category_name && <div style={{ fontSize:10, color:C.accentOrange, marginBottom:6, fontWeight:600 }}>{t.category_name}</div>}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <Badge text={t.priority} color={PRI[t.priority]?.color} bg={PRI[t.priority]?.bg} />
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {t.deadline&&<span style={{ fontSize:11, color:C.textMuted }}>{t.deadline}</span>}
            <Avatar name={t.assignee_name||"?"} color={AVS[t.title.length%AVS.length]} size={24} />
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8 }}>
          <span style={{ fontSize:11, color:C.textMuted }}>{t.project_name}</span>
          <div style={{ display:"flex", gap:8 }}>
            {t.subtask_count>0&&<span style={{ fontSize:11, color:C.textMuted }}>☑ {t.subtask_done}/{t.subtask_count}</span>}
            {t.comment_count>0&&<span style={{ fontSize:11, color:C.textMuted }}>💬 {t.comment_count}</span>}
          </div>
        </div>
      </div>))}
      {tasks.length===0&&<div style={{ padding:20, textAlign:"center", color:C.textMuted, fontSize:13 }}>No tasks here</div>}
    </div>
  </div>
);

// ==================== LOGIN ====================
function LoginScreen({ onLogin, loading, error }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email,setEmail]=useState(""); const [pass,setPass]=useState(""); const [name,setName]=useState("");
  const go = () => { if(isSignup) onLogin("signup",email,pass,name); else onLogin("signin",email,pass); };
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:`linear-gradient(135deg, ${C.bg} 0%, #0c1220 50%, #111827 100%)`, fontFamily:ff }}>
      <div style={{ width:420, maxWidth:"90vw", padding:"48px 40px", borderRadius:12, background:C.bgCard, border:`1px solid ${C.border}`, boxShadow:"0 24px 64px rgba(0,0,0,0.4)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
          <div style={{ width:36, height:36, borderRadius:8, background:C.primary, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:800, color:"#fff" }}>T</div>
          <span style={{ fontSize:22, fontWeight:700, color:C.textPrimary, letterSpacing:-0.5 }}>TaskFlow</span>
        </div>
        <p style={{ color:C.textSecondary, fontSize:14, marginBottom:32, marginTop:4 }}>{isSignup?"Create your account":"Sign in to your workspace"}</p>
        {error&&<div style={{ padding:"10px 14px", borderRadius:6, background:"rgba(239,68,68,0.12)", color:C.accentRed, fontSize:13, marginBottom:16 }}>{error}</div>}
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          {isSignup&&<Inp label="Full Name" placeholder="John Doe" value={name} onChange={e=>setName(e.target.value)} />}
          <Inp label="Email" placeholder="you@company.com" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
          <Inp label="Password" placeholder="6+ characters" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
          <Btn onClick={go} disabled={loading} style={{ width:"100%", justifyContent:"center", padding:12, fontSize:14, marginTop:4 }}>
            {loading?"Please wait...":isSignup?"Create Account →":"Sign In →"}</Btn>
        </div>
        <p style={{ textAlign:"center", marginTop:24, fontSize:13, color:C.textMuted }}>
          {isSignup?"Have an account?":"No account?"}{" "}
          <span onClick={()=>setIsSignup(!isSignup)} style={{ color:C.primary, cursor:"pointer", fontWeight:600 }}>{isSignup?"Sign in":"Sign up"}</span></p>
      </div>
    </div>);
}

// ==================== SIDEBAR ====================
function Sidebar({ active, setActive, projects, user, onLogout, activeProject, setActiveProject }) {
  const nav = [
    { id:"dashboard", icon:"◫", label:"Dashboard" },
    { id:"board", icon:"☰", label:"Board" },
    { id:"calendar", icon:"▦", label:"Calendar" },
    { id:"projects", icon:"◉", label:"Projects" },
  ];
  return (
    <div style={{ width:240, background:C.bgCard, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", flexShrink:0, height:"100vh" }}>
      <div style={{ padding:"20px 20px 16px", display:"flex", alignItems:"center", gap:10, borderBottom:`1px solid ${C.border}` }}>
        <div style={{ width:32, height:32, borderRadius:8, background:C.primary, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:800, color:"#fff" }}>T</div>
        <span style={{ fontSize:17, fontWeight:700, color:C.textPrimary, letterSpacing:-0.3 }}>TaskFlow</span>
      </div>
      <div style={{ padding:"16px 12px 8px" }}>
        <p style={{ fontSize:10, fontWeight:700, color:C.textMuted, letterSpacing:1, textTransform:"uppercase", padding:"0 8px", marginBottom:6 }}>Main Menu</p>
        {nav.map(n=>(<div key={n.id} onClick={()=>{ setActive(n.id); setActiveProject(null); }} style={{
          padding:"10px 12px", borderRadius:6, display:"flex", alignItems:"center", gap:10, cursor:"pointer", marginBottom:2,
          background:active===n.id&&!activeProject?C.primaryMuted:"transparent",
          color:active===n.id&&!activeProject?C.primary:C.textSecondary }}>
          <span style={{ fontSize:16, width:20, textAlign:"center" }}>{n.icon}</span>
          <span style={{ fontSize:13, fontWeight:active===n.id&&!activeProject?600:500 }}>{n.label}</span>
        </div>))}
      </div>
      <div style={{ padding:"8px 12px", flex:1, overflowY:"auto" }}>
        <p style={{ fontSize:10, fontWeight:700, color:C.textMuted, letterSpacing:1, textTransform:"uppercase", padding:"0 8px", marginBottom:6 }}>Projects</p>
        {projects.map(p=>(<div key={p.id} onClick={()=>{ setActiveProject(p); setActive("project-detail"); }}
          style={{ padding:"8px 12px", borderRadius:6, display:"flex", alignItems:"center", gap:10, cursor:"pointer", marginBottom:2,
            background:activeProject?.id===p.id?C.primaryMuted:"transparent", transition:"all 0.12s" }}>
          <div style={{ width:8, height:8, borderRadius:2, background:p.color }} />
          <span style={{ fontSize:13, color:activeProject?.id===p.id?C.primary:C.textSecondary, fontWeight:activeProject?.id===p.id?600:400 }}>{p.name}</span>
        </div>))}
      </div>
      <div style={{ padding:"16px 20px", borderTop:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Avatar name={user?.full_name||"U"} color={AVS[0]} size={28} />
          <div><div style={{ fontSize:12, fontWeight:600, color:C.textPrimary }}>{user?.full_name||"User"}</div>
            <div style={{ fontSize:11, color:C.textMuted }}>Free Plan</div></div>
        </div>
        <span onClick={onLogout} style={{ fontSize:11, color:C.textMuted, cursor:"pointer", padding:"4px 8px", borderRadius:4, border:`1px solid ${C.border}` }}>Logout</span>
      </div>
    </div>);
}

// ==================== MAIN ====================
export default function App() {
  const [session,setSession]=useState(null); const [user,setUser]=useState(null);
  const [loading,setLoading]=useState(true); const [authError,setAuthError]=useState("");
  const [active,setActive]=useState("dashboard"); const [activeProject,setActiveProject]=useState(null);
  const [projects,setProjects]=useState([]); const [tasks,setTasks]=useState([]); const [categories,setCategories]=useState([]);
  const [showNewTask,setShowNewTask]=useState(false); const [showNewProject,setShowNewProject]=useState(false);
  const [selectedTask,setSelectedTask]=useState(null); const [dragId,setDragId]=useState(null);
  const [newTask,setNewTask]=useState({ title:"", project_id:"", priority:"Medium", deadline:"", description:"", category_id:"" });
  const [newProject,setNewProject]=useState({ name:"", color:"#2e7cf6" });
  const [saving,setSaving]=useState(false); const [search,setSearch]=useState(""); const [filterProject,setFilterProject]=useState(""); const [filterPriority,setFilterPriority]=useState("");

  useEffect(()=>{ supabase.auth.getSession().then(({data:{session}})=>{ setSession(session); if(session?.user) loadProfile(session.user.id); setLoading(false); });
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,session)=>{ setSession(session); if(session?.user) loadProfile(session.user.id); });
    return ()=>subscription.unsubscribe(); },[]);

  const loadProfile = async uid => { const {data}=await supabase.from("profiles").select("*").eq("id",uid).single(); if(data) setUser(data); };

  const loadData = useCallback(async()=>{
    if(!session) return;
    const {data:p}=await supabase.from("projects").select("*").order("created_at",{ascending:false});
    const {data:t}=await supabase.from("tasks").select("*").order("created_at",{ascending:false});
    const {data:cm}=await supabase.from("comments").select("task_id");
    const {data:st}=await supabase.from("subtasks").select("task_id, completed");
    const {data:cats}=await supabase.from("categories").select("*").order("created_at",{ascending:true});

    const pl=p||[]; setProjects(pl); setCategories(cats||[]);
    const cc={}; (cm||[]).forEach(c=>{cc[c.task_id]=(cc[c.task_id]||0)+1;});
    const sc={},sd={}; (st||[]).forEach(s=>{sc[s.task_id]=(sc[s.task_id]||0)+1; if(s.completed) sd[s.task_id]=(sd[s.task_id]||0)+1;});
    setTasks((t||[]).map(task=>({...task, project_name:pl.find(pr=>pr.id===task.project_id)?.name||"Unknown",
      assignee_name:user?.full_name||"You", comment_count:cc[task.id]||0, subtask_count:sc[task.id]||0, subtask_done:sd[task.id]||0,
      category_name:(cats||[]).find(c=>c.id===task.category_id)?.name||"" })));
  },[session,user]);

  useEffect(()=>{if(session&&user) loadData();},[session,user,loadData]);

  const handleAuth = async(type,email,password,name)=>{ setSaving(true); setAuthError("");
    try{ if(type==="signup"){ const{data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name}}});
      if(error){setAuthError(error.message);setSaving(false);return;} if(data.user&&!data.session) setAuthError("Check email to confirm.");
    }else{ const{error}=await supabase.auth.signInWithPassword({email,password}); if(error){setAuthError(error.message);setSaving(false);return;} }
    }catch(e){setAuthError("Network error.");} setSaving(false); };

  const handleLogout = async()=>{ await supabase.auth.signOut(); setSession(null);setUser(null);setProjects([]);setTasks([]);setCategories([]); };

  const addProject = async()=>{ if(!newProject.name.trim()||!session) return; setSaving(true);
    const{data}=await supabase.from("projects").insert({name:newProject.name,color:newProject.color,owner_id:session.user.id}).select();
    if(data?.[0]) await supabase.from("project_members").insert({project_id:data[0].id,user_id:session.user.id,role:"owner"});
    setNewProject({name:"",color:"#2e7cf6"}); setShowNewProject(false); await loadData(); setSaving(false); };

  const addTask = async()=>{ if(!newTask.title.trim()||!newTask.project_id||!session) return; setSaving(true);
    await supabase.from("tasks").insert({ title:newTask.title, project_id:newTask.project_id, priority:newTask.priority, status:"todo",
      deadline:newTask.deadline||null, description:newTask.description||"", category_id:newTask.category_id||null,
      assignee_id:session.user.id, created_by:session.user.id });
    setNewTask({title:"",project_id:projects[0]?.id||"",priority:"Medium",deadline:"",description:"",category_id:""});
    setShowNewTask(false); await loadData(); setSaving(false); };

  const handleDrop = status => async e => { e.preventDefault(); if(!dragId) return;
    await supabase.from("tasks").update({status,updated_at:new Date().toISOString()}).eq("id",dragId); setDragId(null); await loadData(); };

  const filtered = tasks.filter(t=>{
    if(search&&!t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if(filterProject&&t.project_id!==filterProject) return false;
    if(filterPriority&&t.priority!==filterPriority) return false; return true; });

  if(loading) return(<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.bg,fontFamily:ff}}>
    <div style={{textAlign:"center"}}><div style={{width:48,height:48,borderRadius:12,background:C.primary,margin:"0 auto 16px",
      display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:800,color:"#fff"}}>T</div>
      <p style={{color:C.textSecondary}}>Loading TaskFlow...</p></div></div>);

  if(!session) return <LoginScreen onLogin={handleAuth} loading={saving} error={authError} />;

  const todo=filtered.filter(t=>t.status==="todo"), prog=filtered.filter(t=>t.status==="progress"), done=filtered.filter(t=>t.status==="done");
  const taskCats = activeProject ? categories.filter(c => c.project_id === activeProject.id) : [];

  return (
    <div style={{display:"flex",minHeight:"100vh",background:C.bg,fontFamily:ff,color:C.textPrimary}}>
      <Sidebar active={active} setActive={setActive} projects={projects} user={user} onLogout={handleLogout}
        activeProject={activeProject} setActiveProject={setActiveProject} />
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"16px 32px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <h1 style={{margin:0,fontSize:20,fontWeight:700}}>
              {active==="dashboard"?"Dashboard":active==="board"?"Kanban Board":active==="calendar"?"Calendar":
               active==="project-detail"&&activeProject?activeProject.name:"Projects"}</h1>
            <p style={{margin:"2px 0 0",fontSize:13,color:C.textSecondary}}>
              {active==="dashboard"?`${tasks.length} tasks across ${projects.length} projects`:
               active==="board"?"Drag tasks · Click for details":active==="calendar"?"View tasks by deadline":
               active==="project-detail"?"Click tasks for details · Add categories":"Manage your projects"}</p>
          </div>
          <div style={{display:"flex",gap:10}}>
            {["board","dashboard","calendar","project-detail"].includes(active)&&projects.length>0&&(
              <Btn onClick={()=>{setNewTask({...newTask,project_id:activeProject?.id||projects[0]?.id,category_id:""});setShowNewTask(true);}}>+ New Task</Btn>)}
            {active==="projects"&&<Btn onClick={()=>setShowNewProject(true)}>+ New Project</Btn>}
            {projects.length===0&&active!=="projects"&&<Btn onClick={()=>setActive("projects")}>Create First Project →</Btn>}
          </div>
        </div>

        <div style={{flex:1,overflow:"auto",padding:"24px 32px"}}>
          {projects.length===0&&active!=="projects"&&(
            <div style={{textAlign:"center",padding:"80px 0"}}><div style={{fontSize:48,marginBottom:16}}>🚀</div>
              <h2 style={{color:C.textPrimary,marginBottom:8}}>Welcome to TaskFlow!</h2>
              <p style={{color:C.textSecondary,marginBottom:24}}>Create your first project.</p>
              <Btn onClick={()=>setActive("projects")}>Go to Projects →</Btn></div>)}

          {active==="dashboard"&&projects.length>0&&(<div>
            <div style={{display:"flex",gap:16,marginBottom:24,flexWrap:"wrap"}}>
              <StatCard label="Total Tasks" value={tasks.length} sub={`${done.length} completed`} color={C.primary} />
              <StatCard label="In Progress" value={prog.length} sub="Active" color={C.accentOrange} />
              <StatCard label="Completed" value={done.length} sub={tasks.length?`${Math.round((done.length/tasks.length)*100)}%`:"0%"} color={C.accent} />
              <StatCard label="Projects" value={projects.length} sub="Active" />
            </div>
            <SearchFilterBar search={search} setSearch={setSearch} filterProject={filterProject} setFilterProject={setFilterProject}
              filterPriority={filterPriority} setFilterPriority={setFilterPriority} projects={projects} />
            <div style={{background:C.bgCard,borderRadius:10,border:`1px solid ${C.border}`,overflow:"hidden"}}>
              {filtered.length===0?<div style={{padding:40,textAlign:"center",color:C.textSecondary}}>No tasks match.</div>:
              filtered.slice(0,12).map((t,i)=>(<div key={t.id} onClick={()=>setSelectedTask(t)} style={{
                padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",
                borderBottom:i<Math.min(filtered.length,12)-1?`1px solid ${C.border}`:"none"}}
                onMouseEnter={e=>e.currentTarget.style.background=C.bgHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${t.status==="done"?C.accent:C.border}`,
                    background:t.status==="done"?C.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff"}}>
                    {t.status==="done"&&"✓"}</div>
                  <div><div style={{fontSize:13,fontWeight:600,color:C.textPrimary,textDecoration:t.status==="done"?"line-through":"none"}}>{t.title}</div>
                    <div style={{fontSize:11,color:C.textMuted,marginTop:2}}>{t.project_name}{t.category_name?` · ${t.category_name}`:""}</div></div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  {t.subtask_count>0&&<span style={{fontSize:11,color:C.textMuted}}>☑ {t.subtask_done}/{t.subtask_count}</span>}
                  {t.comment_count>0&&<span style={{fontSize:11,color:C.textMuted}}>💬 {t.comment_count}</span>}
                  <Badge text={t.priority} color={PRI[t.priority]?.color} bg={PRI[t.priority]?.bg} />
                </div></div>))}
            </div></div>)}

          {active==="board"&&projects.length>0&&(<div>
            <SearchFilterBar search={search} setSearch={setSearch} filterProject={filterProject} setFilterProject={setFilterProject}
              filterPriority={filterPriority} setFilterPriority={setFilterPriority} projects={projects} />
            <div style={{display:"flex",gap:16,height:"calc(100vh - 220px)"}}>
              <KanbanCol title="To Do" count={todo.length} color={C.primary} tasks={todo} onDragStart={setDragId} onDragOver={e=>e.preventDefault()} onDrop={handleDrop("todo")} onTaskClick={setSelectedTask} />
              <KanbanCol title="In Progress" count={prog.length} color={C.accentOrange} tasks={prog} onDragStart={setDragId} onDragOver={e=>e.preventDefault()} onDrop={handleDrop("progress")} onTaskClick={setSelectedTask} />
              <KanbanCol title="Done" count={done.length} color={C.accent} tasks={done} onDragStart={setDragId} onDragOver={e=>e.preventDefault()} onDrop={handleDrop("done")} onTaskClick={setSelectedTask} />
            </div></div>)}

          {active==="calendar"&&projects.length>0&&<CalendarView tasks={filtered} />}

          {active==="project-detail"&&activeProject&&(
            <ProjectDetail project={activeProject} tasks={tasks} categories={categories}
              onBack={()=>{setActiveProject(null);setActive("projects");}}
              onTaskClick={setSelectedTask} session={session} onUpdate={loadData} />)}

          {active==="projects"&&!activeProject&&(<div>
            {projects.length===0&&(<div style={{textAlign:"center",padding:"60px 0"}}><div style={{fontSize:48,marginBottom:16}}>📂</div>
              <h2 style={{color:C.textPrimary,marginBottom:8}}>No projects yet</h2>
              <p style={{color:C.textSecondary,marginBottom:24}}>Click "+ New Project" to start.</p></div>)}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))",gap:16}}>
              {projects.map(p=>{const pt=tasks.filter(t=>t.project_id===p.id),pd=pt.filter(t=>t.status==="done").length;
                const pct=pt.length>0?Math.round((pd/pt.length)*100):0;
                const pCats=categories.filter(c=>c.project_id===p.id);
                return(<div key={p.id} onClick={()=>{setActiveProject(p);setActive("project-detail");}}
                  style={{padding:24,borderRadius:10,background:C.bgCard,border:`1px solid ${C.border}`,cursor:"pointer",transition:"border-color 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=p.color} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                    <div style={{width:14,height:14,borderRadius:4,background:p.color}} />
                    <h3 style={{margin:0,fontSize:16,fontWeight:700}}>{p.name}</h3></div>
                  <div style={{height:6,borderRadius:3,background:C.bgHover,overflow:"hidden",marginBottom:14}}>
                    <div style={{height:"100%",width:`${pct}%`,borderRadius:3,background:p.color,transition:"width 0.3s"}} /></div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.textSecondary,marginBottom:pCats.length>0?12:0}}>
                    <span>{pd}/{pt.length} tasks</span><span>{pct}%</span></div>
                  {pCats.length>0&&(<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {pCats.map(c=>(<span key={c.id} style={{fontSize:10,padding:"2px 8px",borderRadius:4,background:`${c.color}20`,color:c.color,fontWeight:600}}>{c.name}</span>))}
                  </div>)}
                </div>);})}
            </div></div>)}
        </div>
      </div>

      {selectedTask&&<TaskDetail task={selectedTask} onClose={()=>setSelectedTask(null)} session={session} user={user} onUpdate={loadData}
        categories={activeProject?taskCats:categories.filter(c=>c.project_id===selectedTask.project_id)} />}

      {showNewTask&&(<Modal title="Create New Task" onClose={()=>setShowNewTask(false)}>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <Inp label="Task Title" placeholder="e.g. Design login page" value={newTask.title} onChange={e=>setNewTask({...newTask,title:e.target.value})} />
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            <label style={{fontSize:12,fontWeight:600,color:C.textSecondary,letterSpacing:0.4,textTransform:"uppercase"}}>Description</label>
            <textarea value={newTask.description} onChange={e=>setNewTask({...newTask,description:e.target.value})} placeholder="Add details..." rows={3}
              style={{padding:"10px 14px",borderRadius:6,border:`1px solid ${C.border}`,background:C.bgInput,color:C.textPrimary,fontSize:13,outline:"none",fontFamily:ff,resize:"vertical"}} /></div>
          <Sel label="Project" value={newTask.project_id} onChange={e=>setNewTask({...newTask,project_id:e.target.value,category_id:""})}>
            {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</Sel>
          {categories.filter(c=>c.project_id===newTask.project_id).length>0&&(
            <Sel label="Category" value={newTask.category_id} onChange={e=>setNewTask({...newTask,category_id:e.target.value})}>
              <option value="">No category</option>
              {categories.filter(c=>c.project_id===newTask.project_id).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </Sel>)}
          <Sel label="Priority" value={newTask.priority} onChange={e=>setNewTask({...newTask,priority:e.target.value})}>
            <option>High</option><option>Medium</option><option>Low</option></Sel>
          <Inp label="Deadline" type="date" value={newTask.deadline} onChange={e=>setNewTask({...newTask,deadline:e.target.value})} />
          <div style={{display:"flex",gap:10,marginTop:8}}>
            <Btn onClick={addTask} disabled={saving} style={{flex:1,justifyContent:"center"}}>{saving?"Creating...":"Create Task"}</Btn>
            <Btn variant="ghost" onClick={()=>setShowNewTask(false)} style={{flex:1,justifyContent:"center"}}>Cancel</Btn></div>
        </div></Modal>)}

      {showNewProject&&(<Modal title="Create New Project" onClose={()=>setShowNewProject(false)}>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <Inp label="Project Name" placeholder="e.g. Client Portal" value={newProject.name} onChange={e=>setNewProject({...newProject,name:e.target.value})} />
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            <label style={{fontSize:12,fontWeight:600,color:C.textSecondary,letterSpacing:0.4,textTransform:"uppercase"}}>Color</label>
            <div style={{display:"flex",gap:8}}>
              {AVS.map(c=>(<div key={c} onClick={()=>setNewProject({...newProject,color:c})} style={{
                width:32,height:32,borderRadius:6,background:c,cursor:"pointer",
                border:newProject.color===c?"2px solid #fff":"2px solid transparent"}} />))}</div></div>
          <div style={{display:"flex",gap:10,marginTop:8}}>
            <Btn onClick={addProject} disabled={saving} style={{flex:1,justifyContent:"center"}}>{saving?"Creating...":"Create Project"}</Btn>
            <Btn variant="ghost" onClick={()=>setShowNewProject(false)} style={{flex:1,justifyContent:"center"}}>Cancel</Btn></div>
        </div></Modal>)}
    </div>);
}
