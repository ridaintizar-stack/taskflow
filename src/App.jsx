import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase.js";

// ==================== STYLES ====================
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

// ==================== COMPONENTS ====================
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
    {label && <label style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary,
      letterSpacing: 0.4, textTransform: "uppercase" }}>{label}</label>}
    <input {...p} style={{ padding: "10px 14px", borderRadius: 6, border: `1px solid ${C.border}`,
      background: C.bgInput, color: C.textPrimary, fontSize: 14, outline: "none",
      fontFamily: ff, ...(p.style || {}) }}
      onFocus={e => e.target.style.borderColor = C.primary}
      onBlur={e => e.target.style.borderColor = C.border} />
  </div>
);

const Sel = ({ label, children, ...p }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary,
      letterSpacing: 0.4, textTransform: "uppercase" }}>{label}</label>}
    <select {...p} style={{ padding: "10px 14px", borderRadius: 6, border: `1px solid ${C.border}`,
      background: C.bgInput, color: C.textPrimary, fontSize: 14, outline: "none",
      fontFamily: ff, ...(p.style || {}) }}>{children}</select>
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
  <div style={{ flex: "1 1 200px", padding: "22px 24px", borderRadius: 10,
    background: C.bgCard, border: `1px solid ${C.border}` }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted,
      textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 800, color: color || C.textPrimary, letterSpacing: -1 }}>{value}</div>
    <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 4 }}>{sub}</div>
  </div>
);

// ==================== TASK DETAIL MODAL ====================
function TaskDetail({ task, onClose, session, user, onUpdate }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [status, setStatus] = useState(task.status);

  const loadComments = useCallback(async () => {
    const { data } = await supabase.from("comments").select("*").eq("task_id", task.id).order("created_at", { ascending: true });
    if (data) setComments(data);
  }, [task.id]);

  useEffect(() => { loadComments(); }, [loadComments]);

  const addComment = async () => {
    if (!newComment.trim()) return;
    setPosting(true);
    await supabase.from("comments").insert({ task_id: task.id, user_id: session.user.id, content: newComment });
    setNewComment("");
    await loadComments();
    setPosting(false);
  };

  const updateStatus = async (newStatus) => {
    setStatus(newStatus);
    await supabase.from("tasks").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", task.id);
    onUpdate();
  };

  const deleteTask = async () => {
    await supabase.from("tasks").delete().eq("id", task.id);
    onClose();
    onUpdate();
  };

  const timeAgo = (date) => {
    const mins = Math.floor((Date.now() - new Date(date)) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <Modal title={task.title} onClose={onClose} width={560}>
      {/* Task Info */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <Badge text={task.priority} color={PRI[task.priority]?.color} bg={PRI[task.priority]?.bg} />
        <Badge text={task.project_name} color={C.primary} bg={C.primaryMuted} />
        {task.deadline && <span style={{ fontSize: 12, color: C.textSecondary }}>Due: {task.deadline}</span>}
      </div>

      {/* Status Buttons */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, letterSpacing: 0.4,
          textTransform: "uppercase", display: "block", marginBottom: 8 }}>Status</label>
        <div style={{ display: "flex", gap: 8 }}>
          {[{ key: "todo", label: "To Do", color: C.primary }, { key: "progress", label: "In Progress", color: C.accentOrange },
            { key: "done", label: "Done", color: C.accent }].map(s => (
            <div key={s.key} onClick={() => updateStatus(s.key)} style={{
              padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: status === s.key ? s.color : "transparent",
              color: status === s.key ? "#fff" : C.textSecondary,
              border: `1px solid ${status === s.key ? s.color : C.border}`,
              transition: "all 0.15s"
            }}>{s.label}</div>
          ))}
        </div>
      </div>

      {/* Comments Section */}
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
        <h4 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: C.textSecondary, letterSpacing: 0.3 }}>
          COMMENTS ({comments.length})
        </h4>

        {comments.length === 0 && (
          <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 16 }}>No comments yet. Be the first!</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16, maxHeight: 250, overflowY: "auto" }}>
          {comments.map(c => (
            <div key={c.id} style={{ display: "flex", gap: 10 }}>
              <Avatar name={user?.full_name || "U"} color={AVS[c.content.length % AVS.length]} size={28} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary }}>{user?.full_name || "You"}</span>
                  <span style={{ fontSize: 11, color: C.textMuted }}>{timeAgo(c.created_at)}</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: C.textSecondary, lineHeight: 1.5 }}>{c.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Add Comment */}
        <div style={{ display: "flex", gap: 8 }}>
          <input value={newComment} onChange={e => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            onKeyDown={e => e.key === "Enter" && addComment()}
            style={{ flex: 1, padding: "10px 14px", borderRadius: 6, border: `1px solid ${C.border}`,
              background: C.bgInput, color: C.textPrimary, fontSize: 13, outline: "none", fontFamily: ff }} />
          <Btn onClick={addComment} disabled={posting || !newComment.trim()}
            style={{ padding: "10px 16px" }}>{posting ? "..." : "Post"}</Btn>
        </div>
      </div>

      {/* Delete */}
      <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 20, paddingTop: 16, display: "flex", justifyContent: "flex-end" }}>
        <Btn variant="danger" onClick={deleteTask} style={{ fontSize: 12 }}>Delete Task</Btn>
      </div>
    </Modal>
  );
}

// ==================== CALENDAR VIEW ====================
function CalendarView({ tasks }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getTasksForDay = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return tasks.filter(t => t.deadline === dateStr);
  };

  const isToday = (day) => day && today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <Btn variant="ghost" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>← Prev</Btn>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.textPrimary }}>{monthName}</h2>
        <Btn variant="ghost" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>Next →</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, background: C.border, borderRadius: 10, overflow: "hidden" }}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} style={{ padding: "10px 8px", textAlign: "center", fontSize: 11, fontWeight: 700,
            color: C.textMuted, background: C.bgCard, textTransform: "uppercase", letterSpacing: 0.5 }}>{d}</div>
        ))}

        {days.map((day, i) => {
          const dayTasks = getTasksForDay(day);
          return (
            <div key={i} style={{
              minHeight: 90, padding: 8, background: day ? C.bgCard : C.bg,
              position: "relative",
            }}>
              {day && (
                <>
                  <div style={{
                    fontSize: 13, fontWeight: isToday(day) ? 800 : 500,
                    color: isToday(day) ? C.primary : C.textSecondary,
                    marginBottom: 6,
                    width: isToday(day) ? 24 : "auto", height: isToday(day) ? 24 : "auto",
                    borderRadius: "50%", display: isToday(day) ? "flex" : "block",
                    alignItems: "center", justifyContent: "center",
                    background: isToday(day) ? C.primaryMuted : "transparent",
                  }}>{day}</div>
                  {dayTasks.slice(0, 2).map(t => (
                    <div key={t.id} style={{
                      padding: "2px 6px", borderRadius: 3, fontSize: 10, fontWeight: 600,
                      marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      background: PRI[t.priority]?.bg, color: PRI[t.priority]?.color,
                    }}>{t.title}</div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div style={{ fontSize: 10, color: C.textMuted }}>+{dayTasks.length - 2} more</div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== KANBAN COLUMN ====================
const KanbanCol = ({ title, count, color, tasks, onDragOver, onDrop, onDragStart, onTaskClick }) => (
  <div onDragOver={onDragOver} onDrop={onDrop} style={{
    flex: 1, minWidth: 260, background: C.bgInput, borderRadius: 10,
    border: `1px solid ${C.border}`, display: "flex", flexDirection: "column" }}>
    <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary,
          letterSpacing: 0.4, textTransform: "uppercase" }}>{title}</span>
      </div>
      <span style={{ background: C.bgHover, color: C.textSecondary, fontSize: 11,
        fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>{count}</span>
    </div>
    <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10,
      flex: 1, overflowY: "auto" }}>
      {tasks.map(t => (
        <div key={t.id} draggable onDragStart={() => onDragStart(t.id)}
          onClick={() => onTaskClick(t)}
          style={{
            padding: "14px 16px", borderRadius: 8, background: C.bgCard,
            border: `1px solid ${C.border}`, cursor: "grab",
            transition: "border-color 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = C.primary}
          onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary,
            marginBottom: 10, lineHeight: 1.4 }}>{t.title}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Badge text={t.priority} color={PRI[t.priority]?.color} bg={PRI[t.priority]?.bg} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {t.deadline && <span style={{ fontSize: 11, color: C.textMuted }}>{t.deadline}</span>}
              <Avatar name={t.assignee_name || "?"} color={AVS[t.title.length % AVS.length]} size={24} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <span style={{ fontSize: 11, color: C.textMuted }}>{t.project_name}</span>
            {t.comment_count > 0 && (
              <span style={{ fontSize: 11, color: C.textMuted }}>💬 {t.comment_count}</span>
            )}
          </div>
        </div>
      ))}
      {tasks.length === 0 && (
        <div style={{ padding: 20, textAlign: "center", color: C.textMuted, fontSize: 13 }}>
          No tasks here yet
        </div>
      )}
    </div>
  </div>
);

// ==================== LOGIN SCREEN ====================
function LoginScreen({ onLogin, loading, error }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (isSignup) onLogin("signup", email, pass, name);
    else onLogin("signin", email, pass);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: `linear-gradient(135deg, ${C.bg} 0%, #0c1220 50%, #111827 100%)`, fontFamily: ff }}>
      <div style={{ width: 420, maxWidth: "90vw", padding: "48px 40px", borderRadius: 12,
        background: C.bgCard, border: `1px solid ${C.border}`,
        boxShadow: "0 24px 64px rgba(0,0,0,0.4)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: C.primary,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 800, color: "#fff" }}>T</div>
          <span style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, letterSpacing: -0.5 }}>TaskFlow</span>
        </div>
        <p style={{ color: C.textSecondary, fontSize: 14, marginBottom: 32, marginTop: 4 }}>
          {isSignup ? "Create your account to get started" : "Sign in to your workspace"}</p>

        {error && <div style={{ padding: "10px 14px", borderRadius: 6,
          background: "rgba(239,68,68,0.12)", color: C.accentRed, fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {isSignup && <Inp label="Full Name" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />}
          <Inp label="Email" placeholder="you@company.com" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <Inp label="Password" placeholder="Must be 6+ characters" type="password" value={pass} onChange={e => setPass(e.target.value)} />
          <Btn onClick={handleSubmit} disabled={loading}
            style={{ width: "100%", justifyContent: "center", padding: 12, fontSize: 14, marginTop: 4 }}>
            {loading ? "Please wait..." : isSignup ? "Create Account →" : "Sign In →"}
          </Btn>
        </div>
        <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: C.textMuted }}>
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <span onClick={() => setIsSignup(!isSignup)}
            style={{ color: C.primary, cursor: "pointer", fontWeight: 600 }}>
            {isSignup ? "Sign in" : "Sign up"}</span>
        </p>
      </div>
    </div>
  );
}

// ==================== SIDEBAR ====================
function Sidebar({ active, setActive, projects, user, onLogout }) {
  const nav = [
    { id: "dashboard", icon: "◫", label: "Dashboard" },
    { id: "board", icon: "☰", label: "Board" },
    { id: "calendar", icon: "▦", label: "Calendar" },
    { id: "projects", icon: "◉", label: "Projects" },
  ];
  return (
    <div style={{ width: 240, background: C.bgCard, borderRight: `1px solid ${C.border}`,
      display: "flex", flexDirection: "column", flexShrink: 0, height: "100vh" }}>
      <div style={{ padding: "20px 20px 16px", display: "flex", alignItems: "center", gap: 10,
        borderBottom: `1px solid ${C.border}` }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: C.primary,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 800, color: "#fff" }}>T</div>
        <span style={{ fontSize: 17, fontWeight: 700, color: C.textPrimary, letterSpacing: -0.3 }}>TaskFlow</span>
      </div>
      <div style={{ padding: "16px 12px 8px" }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: 1,
          textTransform: "uppercase", padding: "0 8px", marginBottom: 6 }}>Main Menu</p>
        {nav.map(n => (
          <div key={n.id} onClick={() => setActive(n.id)} style={{
            padding: "10px 12px", borderRadius: 6, display: "flex", alignItems: "center", gap: 10,
            cursor: "pointer", marginBottom: 2, transition: "all 0.12s",
            background: active === n.id ? C.primaryMuted : "transparent",
            color: active === n.id ? C.primary : C.textSecondary }}>
            <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{n.icon}</span>
            <span style={{ fontSize: 13, fontWeight: active === n.id ? 600 : 500 }}>{n.label}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: "8px 12px", flex: 1, overflowY: "auto" }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: 1,
          textTransform: "uppercase", padding: "0 8px", marginBottom: 6 }}>Projects</p>
        {projects.map(p => (
          <div key={p.id} style={{ padding: "8px 12px", borderRadius: 6, display: "flex",
            alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 2 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
            <span style={{ fontSize: 13, color: C.textSecondary }}>{p.name}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: "16px 20px", borderTop: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={user?.full_name || "U"} color={AVS[0]} size={28} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary }}>{user?.full_name || "User"}</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>Free Plan</div>
          </div>
        </div>
        <span onClick={onLogout} style={{ fontSize: 11, color: C.textMuted, cursor: "pointer",
          padding: "4px 8px", borderRadius: 4, border: `1px solid ${C.border}` }}>Logout</span>
      </div>
    </div>
  );
}

// ==================== MAIN APP ====================
export default function App() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [active, setActive] = useState("dashboard");
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showNewTask, setShowNewTask] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [newTask, setNewTask] = useState({ title: "", project_id: "", priority: "Medium", deadline: "" });
  const [newProject, setNewProject] = useState({ name: "", color: "#2e7cf6" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) loadProfile(session.user.id);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) loadProfile(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data) setUser(data);
  };

  const loadData = useCallback(async () => {
    if (!session) return;
    const { data: p } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    const { data: t } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
    const { data: cm } = await supabase.from("comments").select("task_id");

    const projectList = p || [];
    setProjects(projectList);

    const commentCounts = {};
    (cm || []).forEach(c => { commentCounts[c.task_id] = (commentCounts[c.task_id] || 0) + 1; });

    const taskList = (t || []).map(task => ({
      ...task,
      project_name: projectList.find(pr => pr.id === task.project_id)?.name || "Unknown",
      assignee_name: user?.full_name || "You",
      comment_count: commentCounts[task.id] || 0,
    }));
    setTasks(taskList);
  }, [session, user]);

  useEffect(() => { if (session && user) loadData(); }, [session, user, loadData]);

  const handleAuth = async (type, email, password, name) => {
    setSaving(true); setAuthError("");
    try {
      if (type === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email, password, options: { data: { full_name: name } }
        });
        if (error) { setAuthError(error.message); setSaving(false); return; }
        if (data.user && !data.session) setAuthError("Check your email to confirm, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { setAuthError(error.message); setSaving(false); return; }
      }
    } catch (e) { setAuthError("Network error. Please try again."); }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null); setUser(null); setProjects([]); setTasks([]);
  };

  const addProject = async () => {
    if (!newProject.name.trim() || !session) return;
    setSaving(true);
    const { data } = await supabase.from("projects").insert({
      name: newProject.name, color: newProject.color, owner_id: session.user.id
    }).select();
    if (data?.[0]) {
      await supabase.from("project_members").insert({
        project_id: data[0].id, user_id: session.user.id, role: "owner"
      });
    }
    setNewProject({ name: "", color: "#2e7cf6" }); setShowNewProject(false);
    await loadData(); setSaving(false);
  };

  const addTask = async () => {
    if (!newTask.title.trim() || !newTask.project_id || !session) return;
    setSaving(true);
    await supabase.from("tasks").insert({
      title: newTask.title, project_id: newTask.project_id,
      priority: newTask.priority, status: "todo",
      deadline: newTask.deadline || null,
      assignee_id: session.user.id, created_by: session.user.id,
    });
    setNewTask({ title: "", project_id: projects[0]?.id || "", priority: "Medium", deadline: "" });
    setShowNewTask(false); await loadData(); setSaving(false);
  };

  const handleDrop = (status) => async (e) => {
    e.preventDefault();
    if (!dragId) return;
    await supabase.from("tasks").update({ status, updated_at: new Date().toISOString() }).eq("id", dragId);
    setDragId(null); await loadData();
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: C.bg, fontFamily: ff }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: C.primary, margin: "0 auto 16px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, fontWeight: 800, color: "#fff" }}>T</div>
        <p style={{ color: C.textSecondary }}>Loading TaskFlow...</p>
      </div>
    </div>
  );

  if (!session) return <LoginScreen onLogin={handleAuth} loading={saving} error={authError} />;

  const todoTasks = tasks.filter(t => t.status === "todo");
  const progressTasks = tasks.filter(t => t.status === "progress");
  const doneTasks = tasks.filter(t => t.status === "done");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: ff, color: C.textPrimary }}>
      <Sidebar active={active} setActive={setActive} projects={projects} user={user} onLogout={handleLogout} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "16px 32px", borderBottom: `1px solid ${C.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: -0.3 }}>
              {active === "dashboard" ? "Dashboard" : active === "board" ? "Kanban Board" :
               active === "calendar" ? "Calendar" : "Projects"}</h1>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: C.textSecondary }}>
              {active === "dashboard" ? `${tasks.length} tasks across ${projects.length} projects` :
               active === "board" ? "Drag tasks · Click for details & comments" :
               active === "calendar" ? "View tasks by deadline" : "Manage all your projects"}</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {["board","dashboard","calendar"].includes(active) && projects.length > 0 && (
              <Btn onClick={() => { setNewTask({ ...newTask, project_id: projects[0]?.id }); setShowNewTask(true); }}>+ New Task</Btn>
            )}
            {active === "projects" && <Btn onClick={() => setShowNewProject(true)}>+ New Project</Btn>}
            {projects.length === 0 && active !== "projects" && (
              <Btn onClick={() => setActive("projects")}>Create Your First Project →</Btn>
            )}
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "24px 32px" }}>
          {projects.length === 0 && active !== "projects" && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
              <h2 style={{ color: C.textPrimary, marginBottom: 8 }}>Welcome to TaskFlow!</h2>
              <p style={{ color: C.textSecondary, marginBottom: 24 }}>Create your first project to get started.</p>
              <Btn onClick={() => setActive("projects")}>Go to Projects →</Btn>
            </div>
          )}

          {/* DASHBOARD */}
          {active === "dashboard" && projects.length > 0 && (
            <div>
              <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
                <StatCard label="Total Tasks" value={tasks.length} sub={`${doneTasks.length} completed`} color={C.primary} />
                <StatCard label="In Progress" value={progressTasks.length} sub="Currently active" color={C.accentOrange} />
                <StatCard label="Completed" value={doneTasks.length}
                  sub={tasks.length > 0 ? `${Math.round((doneTasks.length / tasks.length) * 100)}% rate` : "0%"} color={C.accent} />
                <StatCard label="Projects" value={projects.length} sub="Active projects" />
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: C.textSecondary, marginBottom: 14, letterSpacing: 0.3 }}>RECENT TASKS</h3>
              {tasks.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", background: C.bgCard, borderRadius: 10, border: `1px solid ${C.border}` }}>
                  <p style={{ color: C.textSecondary }}>No tasks yet. Go to the Board to create one!</p>
                </div>
              ) : (
                <div style={{ background: C.bgCard, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                  {tasks.slice(0, 8).map((t, i) => (
                    <div key={t.id} onClick={() => setSelectedTask(t)} style={{
                      padding: "14px 20px", display: "flex", alignItems: "center",
                      justifyContent: "space-between", cursor: "pointer", transition: "background 0.12s",
                      borderBottom: i < Math.min(tasks.length, 8) - 1 ? `1px solid ${C.border}` : "none" }}
                      onMouseEnter={e => e.currentTarget.style.background = C.bgHover}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 18, height: 18, borderRadius: 4,
                          border: `2px solid ${t.status === "done" ? C.accent : C.border}`,
                          background: t.status === "done" ? C.accent : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, color: "#fff" }}>
                          {t.status === "done" && "✓"}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary,
                            textDecoration: t.status === "done" ? "line-through" : "none" }}>{t.title}</div>
                          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{t.project_name}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {t.comment_count > 0 && <span style={{ fontSize: 11, color: C.textMuted }}>💬 {t.comment_count}</span>}
                        <Badge text={t.priority} color={PRI[t.priority]?.color} bg={PRI[t.priority]?.bg} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BOARD */}
          {active === "board" && projects.length > 0 && (
            <div style={{ display: "flex", gap: 16, height: "calc(100vh - 160px)" }}>
              <KanbanCol title="To Do" count={todoTasks.length} color={C.primary} tasks={todoTasks}
                onDragStart={setDragId} onDragOver={e => e.preventDefault()} onDrop={handleDrop("todo")}
                onTaskClick={setSelectedTask} />
              <KanbanCol title="In Progress" count={progressTasks.length} color={C.accentOrange} tasks={progressTasks}
                onDragStart={setDragId} onDragOver={e => e.preventDefault()} onDrop={handleDrop("progress")}
                onTaskClick={setSelectedTask} />
              <KanbanCol title="Done" count={doneTasks.length} color={C.accent} tasks={doneTasks}
                onDragStart={setDragId} onDragOver={e => e.preventDefault()} onDrop={handleDrop("done")}
                onTaskClick={setSelectedTask} />
            </div>
          )}

          {/* CALENDAR */}
          {active === "calendar" && projects.length > 0 && <CalendarView tasks={tasks} />}

          {/* PROJECTS */}
          {active === "projects" && (
            <div>
              {projects.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
                  <h2 style={{ color: C.textPrimary, marginBottom: 8 }}>No projects yet</h2>
                  <p style={{ color: C.textSecondary, marginBottom: 24 }}>Click "+ New Project" above to create your first one.</p>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                {projects.map(p => {
                  const pTasks = tasks.filter(t => t.project_id === p.id);
                  const pDone = pTasks.filter(t => t.status === "done").length;
                  const pct = pTasks.length > 0 ? Math.round((pDone / pTasks.length) * 100) : 0;
                  return (
                    <div key={p.id} style={{ padding: 24, borderRadius: 10, background: C.bgCard, border: `1px solid ${C.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                        <div style={{ width: 14, height: 14, borderRadius: 4, background: p.color }} />
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{p.name}</h3>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: C.bgHover, overflow: "hidden", marginBottom: 14 }}>
                        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: p.color, transition: "width 0.3s" }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.textSecondary }}>
                        <span>{pDone}/{pTasks.length} tasks</span>
                        <span>{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TASK DETAIL MODAL */}
      {selectedTask && (
        <TaskDetail task={selectedTask} onClose={() => setSelectedTask(null)}
          session={session} user={user} onUpdate={loadData} />
      )}

      {/* NEW TASK MODAL */}
      {showNewTask && (
        <Modal title="Create New Task" onClose={() => setShowNewTask(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Inp label="Task Title" placeholder="e.g. Design login page" value={newTask.title}
              onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
            <Sel label="Project" value={newTask.project_id}
              onChange={e => setNewTask({ ...newTask, project_id: e.target.value })}>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Sel>
            <Sel label="Priority" value={newTask.priority}
              onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
              <option>High</option><option>Medium</option><option>Low</option>
            </Sel>
            <Inp label="Deadline" type="date" value={newTask.deadline}
              onChange={e => setNewTask({ ...newTask, deadline: e.target.value })} />
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <Btn onClick={addTask} disabled={saving} style={{ flex: 1, justifyContent: "center" }}>
                {saving ? "Creating..." : "Create Task"}</Btn>
              <Btn variant="ghost" onClick={() => setShowNewTask(false)} style={{ flex: 1, justifyContent: "center" }}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* NEW PROJECT MODAL */}
      {showNewProject && (
        <Modal title="Create New Project" onClose={() => setShowNewProject(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Inp label="Project Name" placeholder="e.g. Client Portal" value={newProject.name}
              onChange={e => setNewProject({ ...newProject, name: e.target.value })} />
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary,
                letterSpacing: 0.4, textTransform: "uppercase" }}>Color</label>
              <div style={{ display: "flex", gap: 8 }}>
                {AVS.map(c => (
                  <div key={c} onClick={() => setNewProject({ ...newProject, color: c })} style={{
                    width: 32, height: 32, borderRadius: 6, background: c, cursor: "pointer",
                    border: newProject.color === c ? "2px solid #fff" : "2px solid transparent" }} />
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <Btn onClick={addProject} disabled={saving} style={{ flex: 1, justifyContent: "center" }}>
                {saving ? "Creating..." : "Create Project"}</Btn>
              <Btn variant="ghost" onClick={() => setShowNewProject(false)} style={{ flex: 1, justifyContent: "center" }}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
