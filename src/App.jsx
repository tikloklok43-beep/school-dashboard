import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const INITIAL_STUDENTS = [
  { id: "S001", name: "M Yusuf Azzam ", class: "4-SDQ" },
  { id: "S002", name: "Nabillah", class: "4-SDQ" },
  { id: "S003", name: "Maryam Ailyn Tatjazilya", class: "4-SDQ" },
  { id: "S004", name: "Ammar", class: "4-SDQ" },
  { id: "S005", name: "Maryam", class: "4-SDQ" },
  { id: "S006", name: "Khansa Arifin Manggus", class: "4-SDQ" },
  { id: "S007", name: "Salmah Syaugi Bahasuan", class: "4-SDQ" },
  { id: "S008", name: "Sulaiman Adhitya Adran", class: "4-SDQ" },
  { id: "S009", name: "Shinji Mawla Subekti", class: "4-SDQ" },
];

const SUBJECTS = ["Matematika", "Bahasa Indonesia", "Bahasa Inggris", "Bahasa arab", "Hadits", "Fiqih", "Sirah"];
const CLASSES = ["1-SDQ", "2-SDQ", "3-SDQ", "4-SDQ", "5-SDQ", "6-SDQ"];

const INITIAL_GRADES = [
  { studentId: "S001", subject: "Matematika", tugasHarian: 85, ulanganHarian: 78, ujianAkhir: 82 },
  { studentId: "S001", subject: "Fisika", tugasHarian: 90, ulanganHarian: 88, ujianAkhir: 92 },
  { studentId: "S002", subject: "Matematika", tugasHarian: 70, ulanganHarian: 65, ujianAkhir: 68 },
  { studentId: "S003", subject: "Bahasa Indonesia", tugasHarian: 95, ulanganHarian: 92, ujianAkhir: 94 },
  { studentId: "S004", subject: "Kimia", tugasHarian: 55, ulanganHarian: 60, ujianAkhir: 58 },
  { studentId: "S005", subject: "Matematika", tugasHarian: 88, ulanganHarian: 85, ujianAkhir: 87 },
  { studentId: "S006", subject: "Bahasa Arab", tugasHarian: 76, ulanganHarian: 80, ujianAkhir: 78 },
  { studentId: "S007", subject: "Hadits", tugasHarian: 92, ulanganHarian: 88, ujianAkhir: 90 },
  { studentId: "S008", subject: "Fiqih", tugasHarian: 62, ulanganHarian: 70, ujianAkhir: 66 },
  { studentId: "S009", subject: "Bahasa Inggris", tugasHarian: 98, ulanganHarian: 95, ujianAkhir: 97 },
  { studentId: "S001", subject: "fiqih", tugasHarian: 80, ulanganHarian: 75, ujianAkhir: 78 },
];

const INITIAL_ATTENDANCE = [
  { studentId: "S001", date: "2025-01-15", status: "present" },
  { studentId: "S002", date: "2025-01-15", status: "absent" },
  { studentId: "S003", date: "2025-01-15", status: "late" },
  { studentId: "S004", date: "2025-01-15", status: "present" },
  { studentId: "S005", date: "2025-01-15", status: "present" },
];

const attendanceTrend = [
  { day: "Sen", present: 42, absent: 5, late: 3 },
  { day: "Sel", present: 45, absent: 3, late: 2 },
  { day: "Rab", present: 38, absent: 8, late: 4 },
  { day: "Kam", present: 47, absent: 2, late: 1 },
  { day: "Jum", present: 44, absent: 4, late: 2 },
];

const gradeAnalytics = [
  { subject: "Mat", avg: 79 },
  { subject: "B.Ind", avg: 88 },
  { subject: "B.Ing", avg: 82 },
  { subject: "Bahasa Arab", avg: 74 },
  { subject: "Hadits", avg: 71 },
  { subject: "Fiqih", avg: 85 },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const calcFinal = (t, u, e) => Math.round((Number(t) + Number(u) + Number(e)) / 3);
const gradeColor = (v) => v >= 80 ? "#22C55E" : v >= 65 ? "#F59E0B" : "#EF4444";
const gradeLabel = (v) => v >= 80 ? "Tinggi" : v >= 65 ? "Sedang" : "Rendah";
const today = new Date().toISOString().split("T")[0];

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type === "success" ? "#22C55E" : t.type === "error" ? "#EF4444" : "#6366F1",
          color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 14,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", gap: 10,
          minWidth: 260, animation: "slideIn 0.3s ease",
        }}>
          <span>{t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}</span>
          {t.msg}
          <button onClick={() => remove(t.id)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 16 }}>×</button>
        </div>
      ))}
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#1E293B", borderRadius: 16, padding: 28, width: "100%", maxWidth: 480,
        border: "1px solid rgba(99,102,241,0.2)", boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: "#F1F5F9", fontFamily: "Poppins, sans-serif", fontSize: 18 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: 22 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── INPUT ────────────────────────────────────────────────────────────────────
const inputStyle = {
  background: "#0F172A", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 10,
  color: "#F1F5F9", padding: "10px 14px", width: "100%", fontSize: 14, boxSizing: "border-box",
  fontFamily: "inherit", outline: "none",
};
const selectStyle = { ...inputStyle, cursor: "pointer" };
const labelStyle = { display: "block", color: "#94A3B8", fontSize: 12, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 };

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, dark }) {
  return (
    <div style={{
      background: dark ? "#0F172A" : "#1E293B", borderRadius: 16, padding: "20px 24px",
      border: `1px solid ${color}30`, position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: -20, right: -20, width: 80, height: 80,
        borderRadius: "50%", background: `${color}15`,
      }} />
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ color: "#94A3B8", fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      <div style={{ color: "#F1F5F9", fontSize: 32, fontWeight: 700, fontFamily: "Poppins, sans-serif" }}>{value}</div>
      {sub && <div style={{ color, fontSize: 12, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [theme, setTheme] = useState("dark");
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [grades, setGrades] = useState(INITIAL_GRADES);
  const [attendance, setAttendance] = useState(INITIAL_ATTENDANCE);
  const [toasts, setToasts] = useState([]);
  const [user] = useState({ name: "iski", role: "Administrator" });

  // Login state
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "", role: "iski" });
  const [loginError, setLoginError] = useState("");

  const isDark = theme === "dark";
  const bg = isDark ? "#0F172A" : "#F1F5F9";
  const card = isDark ? "#1E293B" : "#FFFFFF";
  const text = isDark ? "#F1F5F9" : "#0F172A";
  const subtext = isDark ? "#94A3B8" : "#64748B";
  const border = isDark ? "rgba(148,163,184,0.1)" : "rgba(0,0,0,0.1)";

  const toast = (msg, type = "success") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  };
  const removeToast = (id) => setToasts(p => p.filter(t => t.id !== id));

  // Login
  if (!loggedIn) {
    return (
      <div style={{
        minHeight: "100vh", background: isDark ? "#0F172A" : "#F1F5F9",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "Inter, sans-serif",
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
          * { box-sizing: border-box; }
          ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0F172A; } ::-webkit-scrollbar-thumb { background: #6366F1; border-radius: 3px; }
          @keyframes slideIn { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
          @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
          @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.5} }
        `}</style>
        <div style={{
          width: "100%", maxWidth: 420, padding: 40,
          background: isDark ? "#1E293B" : "#fff",
          borderRadius: 24, border: `1px solid rgba(99,102,241,0.2)`,
          boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
          animation: "fadeUp 0.5s ease",
        }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20, margin: "0 auto 16px",
              background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
            }}>🎓</div>
            <h1 style={{ fontFamily: "Poppins", fontSize: 24, fontWeight: 700, color: isDark ? "#F1F5F9" : "#0F172A", margin: 0 }}>EduDash</h1>
            <p style={{ color: isDark ? "#94A3B8" : "#64748B", margin: "8px 0 0", fontSize: 14 }}>School Management System By-Isky</p>
          </div>
          {loginError && <div style={{ background: "#EF444420", border: "1px solid #EF4444", borderRadius: 10, padding: "10px 14px", color: "#EF4444", fontSize: 13, marginBottom: 16 }}>{loginError}</div>}
          <div style={{ marginBottom: 16 }}>
            <label style={{ ...labelStyle, color: isDark ? "#94A3B8" : "#64748B" }}>Role</label>
            <select value={loginForm.role} onChange={e => setLoginForm(p => ({ ...p, role: e.target.value }))} style={{ ...selectStyle, background: isDark ? "#0F172A" : "#F8FAFC", color: isDark ? "#F1F5F9" : "#0F172A" }}>
              <option value="iski">Administrator</option>
              <option value="Guru">Guru</option>
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ ...labelStyle, color: isDark ? "#94A3B8" : "#64748B" }}>Username</label>
            <input value={loginForm.username} onChange={e => setLoginForm(p => ({ ...p, username: e.target.value }))} placeholder="iski / guru" style={{ ...inputStyle, background: isDark ? "#0F172A" : "#F8FAFC", color: isDark ? "#F1F5F9" : "#0F172A" }} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ ...labelStyle, color: isDark ? "#94A3B8" : "#64748B" }}>Password</label>
            <input type="password" value={loginForm.password} onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="••••••••" style={{ ...inputStyle, background: isDark ? "#0F172A" : "#F8FAFC", color: isDark ? "#F1F5F9" : "#0F172A" }} />
          </div>
          <button onClick={handleLogin} style={{
            width: "100%", padding: "13px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff",
            fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "Poppins",
          }}>Sign In →</button>
          <p style={{ textAlign: "center", color: isDark ? "#64748B" : "#94A3B8", fontSize: 12, marginTop: 20 }}>
            Demo: username <b style={{ color: "#6366F1" }}>iski</b> / password <b style={{ color: "#6366F1" }}>iski123</b>
          </p>
        </div>
        <button onClick={() => setTheme(p => p === "dark" ? "light" : "dark")} style={{
          position: "fixed", top: 16, right: 16, background: isDark ? "#1E293B" : "#fff",
          border: `1px solid ${isDark ? "rgba(148,163,184,0.2)" : "rgba(0,0,0,0.1)"}`,
          borderRadius: 10, padding: "8px 14px", color: isDark ? "#F1F5F9" : "#0F172A", cursor: "pointer", fontSize: 16,
        }}>{isDark ? "☀️" : "🌙"}</button>
      </div>
    );
  }

  function handleLogin() {
    if ((loginForm.username === "iski" && loginForm.password === "iski123") ||
      (loginForm.username === "guru" && loginForm.password === "guru123")) {
      setLoggedIn(true);
    } else {
      setLoginError("Username atau password salah!");
    }
  }

  const navItems = [
    { id: "dashboard", icon: "⊞", label: "Dashboard" },
    { id: "students", icon: "👥", label: "Siswa" },
    { id: "attendance", icon: "📋", label: "Kehadiran" },
    { id: "grades", icon: "📝", label: "Nilai" },
    { id: "reports", icon: "📊", label: "Laporan" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: bg, fontFamily: "Inter, sans-serif", color: text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #6366F1; border-radius: 3px; }
        @keyframes slideIn { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .nav-item:hover { background: rgba(99,102,241,0.15) !important; }
        .btn-primary { transition: all 0.2s; }
        .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
        input:focus, select:focus { border-color: #6366F1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 12px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748B; font-weight: 600; }
        td { padding: 12px 16px; font-size: 14px; border-top: 1px solid rgba(148,163,184,0.08); }
        tr:hover td { background: rgba(99,102,241,0.04); }
        @media (max-width: 768px) { .sidebar-overlay { display: block !important; } }
      `}</style>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40, display: "block",
        }} />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 240, background: card, borderRight: `1px solid ${border}`,
        display: "flex", flexDirection: "column", position: "fixed", top: 0, bottom: 0, left: 0,
        zIndex: 50, transform: sidebarOpen ? "translateX(0)" : undefined,
        transition: "transform 0.3s",
      }}>
        <div style={{ padding: "24px 20px 16px", borderBottom: `1px solid ${border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
            }}>🎓</div>
            <div>
              <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 16, color: text }}>EduDash</div>
              <div style={{ fontSize: 11, color: subtext }}>v2.0 Premium</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map(item => (
            <button key={item.id} className="nav-item" onClick={() => { setPage(item.id); setSidebarOpen(false); }} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
              borderRadius: 12, border: "none", cursor: "pointer", textAlign: "left", width: "100%",
              background: page === item.id ? "rgba(99,102,241,0.2)" : "transparent",
              color: page === item.id ? "#6366F1" : subtext,
              fontWeight: page === item.id ? 600 : 400, fontSize: 14,
              borderLeft: page === item.id ? "3px solid #6366F1" : "3px solid transparent",
              transition: "all 0.2s",
            }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "16px 20px", borderTop: `1px solid ${border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>A</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: text }}>Iski</div>
              <div style={{ fontSize: 11, color: subtext }}>Administrator</div>
            </div>
          </div>
          <button onClick={() => setLoggedIn(false)} style={{
            width: "100%", padding: "8px", borderRadius: 10, border: `1px solid ${border}`,
            background: "transparent", color: subtext, cursor: "pointer", fontSize: 13,
          }}>← Logout</button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, marginLeft: 240, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Topbar */}
        <header style={{
          background: card, borderBottom: `1px solid ${border}`,
          padding: "0 24px", height: 64, display: "flex", alignItems: "center",
          justifyContent: "space-between", position: "sticky", top: 0, zIndex: 30,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => setSidebarOpen(p => !p)} style={{ display: "none", background: "none", border: "none", color: text, cursor: "pointer", fontSize: 22 }}>☰</button>
            <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 18, color: text }}>
              {navItems.find(n => n.id === page)?.label}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input placeholder="🔍  Cari..." style={{
              ...inputStyle, width: 200, padding: "8px 14px",
              background: isDark ? "#0F172A" : "#F8FAFC",
              color: isDark ? "#F1F5F9" : "#0F172A",
            }} />
            <button style={{ background: "none", border: "none", color: subtext, cursor: "pointer", fontSize: 20 }}>🔔</button>
            <button onClick={() => setTheme(p => p === "dark" ? "light" : "dark")} style={{
              background: isDark ? "#0F172A" : "#F8FAFC",
              border: `1px solid ${border}`, borderRadius: 10,
              padding: "7px 12px", color: text, cursor: "pointer", fontSize: 16,
            }}>{isDark ? "☀️" : "🌙"}</button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: 24, animation: "fadeUp 0.3s ease" }}>
          {page === "dashboard" && <DashboardPage students={students} grades={grades} attendance={attendance} isDark={isDark} card={card} text={text} subtext={subtext} border={border} />}
          {page === "students" && <StudentsPage students={students} setStudents={setStudents} toast={toast} isDark={isDark} card={card} text={text} subtext={subtext} border={border} />}
          {page === "attendance" && <AttendancePage students={students} attendance={attendance} setAttendance={setAttendance} toast={toast} isDark={isDark} card={card} text={text} subtext={subtext} border={border} />}
          {page === "grades" && <GradesPage students={students} grades={grades} setGrades={setGrades} toast={toast} isDark={isDark} card={card} text={text} subtext={subtext} border={border} />}
          {page === "reports" && <ReportsPage students={students} grades={grades} attendance={attendance} toast={toast} isDark={isDark} card={card} text={text} subtext={subtext} border={border} />}
        </main>
      </div>

      <Toast toasts={toasts} remove={removeToast} />
    </div>
  );
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────
function DashboardPage({ students, grades, attendance, isDark, card, text, subtext, border }) {
  const todayAtt = attendance.filter(a => a.date === today);
  const present = todayAtt.filter(a => a.status === "present").length;
  const absent = todayAtt.filter(a => a.status === "absent").length;
  const late = todayAtt.filter(a => a.status === "late").length;

  const avgGrade = grades.length ? Math.round(grades.reduce((s, g) => s + calcFinal(g.tugasHarian, g.ulanganHarian, g.ujianAkhir), 0) / grades.length) : 0;

  const pieData = [
    { name: "Hadir", value: present || 42, color: "#22C55E" },
    { name: "Absen", value: absent || 5, color: "#EF4444" },
    { name: "Terlambat", value: late || 3, color: "#F59E0B" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 16 }}>
        <StatCard icon="👥" label="Total Siswa" value={students.length} sub="Terdaftar aktif" color="#6366F1" />
        <StatCard icon="✅" label="Hadir Hari Ini" value={present || 42} sub="+3 dari kemarin" color="#22C55E" />
        <StatCard icon="❌" label="Absen" value={absent || 5} sub="5 siswa absen" color="#EF4444" />
        <StatCard icon="⏰" label="Terlambat" value={late || 3} sub="3 siswa terlambat" color="#F59E0B" />
        <StatCard icon="🏆" label="Rata-rata Nilai" value={avgGrade || 82} sub="Semua mata pelajaran" color="#6366F1" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        <div style={{ background: card, borderRadius: 20, padding: 24, border: `1px solid ${border}` }}>
          <h3 style={{ fontFamily: "Poppins", fontSize: 16, color: text, marginBottom: 20 }}>📈 Tren Kehadiran Mingguan</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={attendanceTrend} barSize={16} barCategoryGap={20}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(148,163,184,0.1)" : "rgba(0,0,0,0.06)"} />
              <XAxis dataKey="day" tick={{ fill: subtext, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: subtext, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: isDark ? "#1E293B" : "#fff", border: "none", borderRadius: 10, color: text }} />
              <Bar dataKey="present" fill="#22C55E" radius={[6, 6, 0, 0]} name="Hadir" />
              <Bar dataKey="absent" fill="#EF4444" radius={[6, 6, 0, 0]} name="Absen" />
              <Bar dataKey="late" fill="#F59E0B" radius={[6, 6, 0, 0]} name="Terlambat" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: card, borderRadius: 20, padding: 24, border: `1px solid ${border}` }}>
          <h3 style={{ fontFamily: "Poppins", fontSize: 16, color: text, marginBottom: 20 }}>🔵 Kehadiran Hari Ini</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={4}>
                {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: isDark ? "#1E293B" : "#fff", border: "none", borderRadius: 10 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {pieData.map(d => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color }} />
                <span style={{ fontSize: 13, color: subtext }}>{d.name}</span>
                <span style={{ marginLeft: "auto", fontSize: 13, fontWeight: 600, color: text }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: card, borderRadius: 20, padding: 24, border: `1px solid ${border}` }}>
        <h3 style={{ fontFamily: "Poppins", fontSize: 16, color: text, marginBottom: 20 }}>📊 Rata-rata Nilai per Mata Pelajaran</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={gradeAnalytics}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(148,163,184,0.1)" : "rgba(0,0,0,0.06)"} />
            <XAxis dataKey="subject" tick={{ fill: subtext, fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis domain={[60, 100]} tick={{ fill: subtext, fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: isDark ? "#1E293B" : "#fff", border: "none", borderRadius: 10, color: text }} />
            <Line type="monotone" dataKey="avg" stroke="#6366F1" strokeWidth={2.5} dot={{ fill: "#6366F1", r: 5 }} name="Rata-rata" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── STUDENTS PAGE ────────────────────────────────────────────────────────────
function StudentsPage({ students, setStudents, toast, isDark, card, text, subtext, border }) {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", class: "X-A", id: "" });

  const filtered = students.filter(s =>
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search)) &&
    (!classFilter || s.class === classFilter)
  );

  const openAdd = () => { setEditing(null); setForm({ name: "", class: "X-A", id: `S${String(students.length + 1).padStart(3, "0")}` }); setModal(true); };
  const openEdit = (s) => { setEditing(s.id); setForm({ name: s.name, class: s.class, id: s.id }); setModal(true); };
  const save = () => {
    if (!form.name.trim()) return;
    if (editing) {
      setStudents(p => p.map(s => s.id === editing ? { ...s, ...form } : s));
      toast("Data siswa diperbarui!", "success");
    } else {
      setStudents(p => [...p, { ...form }]);
      toast("Siswa baru ditambahkan!", "success");
    }
    setModal(false);
  };
  const del = (id) => { setStudents(p => p.filter(s => s.id !== id)); toast("Siswa dihapus.", "info"); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Cari nama / ID..." style={{ ...inputStyle, background: isDark ? "#1E293B" : "#fff", color: text, width: 220 }} />
        <select value={classFilter} onChange={e => setClassFilter(e.target.value)} style={{ ...selectStyle, background: isDark ? "#1E293B" : "#fff", color: text, width: 140 }}>
          <option value="">Semua Kelas</option>
          {CLASSES.map(c => <option key={c}>{c}</option>)}
        </select>
        <button className="btn-primary" onClick={openAdd} style={{
          marginLeft: "auto", padding: "10px 20px", borderRadius: 12, border: "none",
          background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff",
          fontWeight: 600, cursor: "pointer", fontSize: 14,
        }}>+ Tambah Siswa</button>
      </div>

      <div style={{ background: card, borderRadius: 20, border: `1px solid ${border}`, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead style={{ background: isDark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.04)" }}>
              <tr><th>ID</th><th>Nama</th><th>Kelas</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td><span style={{ background: "rgba(99,102,241,0.15)", color: "#6366F1", borderRadius: 8, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{s.id}</span></td>
                  <td style={{ color: text, fontWeight: 500 }}>{s.name}</td>
                  <td><span style={{ background: "rgba(34,197,94,0.12)", color: "#22C55E", borderRadius: 8, padding: "3px 10px", fontSize: 12 }}>{s.class}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => openEdit(s)} style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid rgba(99,102,241,0.3)", background: "transparent", color: "#6366F1", cursor: "pointer", fontSize: 12 }}>✏️ Edit</button>
                      <button onClick={() => del(s.id)} style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "transparent", color: "#EF4444", cursor: "pointer", fontSize: 12 }}>🗑 Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", color: subtext, padding: 32 }}>Tidak ada data</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Siswa" : "Tambah Siswa"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div><label style={labelStyle}>ID Siswa</label><input value={form.id} disabled style={{ ...inputStyle, opacity: 0.5 }} /></div>
          <div><label style={labelStyle}>Nama Lengkap</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inputStyle} placeholder="Nama siswa..." /></div>
          <div><label style={labelStyle}>Kelas</label>
            <select value={form.class} onChange={e => setForm(p => ({ ...p, class: e.target.value }))} style={selectStyle}>
              {CLASSES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button onClick={() => setModal(false)} style={{ padding: "10px 20px", borderRadius: 10, border: `1px solid rgba(148,163,184,0.2)`, background: "transparent", color: subtext, cursor: "pointer" }}>Batal</button>
            <button className="btn-primary" onClick={save} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Simpan</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── ATTENDANCE PAGE ──────────────────────────────────────────────────────────
function AttendancePage({ students, attendance, setAttendance, toast, isDark, card, text, subtext, border }) {
  const [date, setDate] = useState(today);
  const [classFilter, setClassFilter] = useState("X-A");
  const [loading, setLoading] = useState(false);
  const [localAtt, setLocalAtt] = useState({});

  const filtered = students.filter(s => s.class === classFilter);

  useEffect(() => {
    const map = {};
    filtered.forEach(s => {
      const rec = attendance.find(a => a.studentId === s.id && a.date === date);
      map[s.id] = rec?.status || "present";
    });
    setLocalAtt(map);
  }, [date, classFilter, students, attendance]);

  const setStatus = (id, status) => setLocalAtt(p => ({ ...p, [id]: status }));

  const bulkSet = (status) => {
    const map = {};
    filtered.forEach(s => map[s.id] = status);
    setLocalAtt(map);
  };

  const saveAtt = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const updated = [...attendance.filter(a => !(a.date === date && filtered.some(s => s.id === a.studentId)))];
    filtered.forEach(s => updated.push({ studentId: s.id, date, status: localAtt[s.id] || "present" }));
    setAttendance(updated);
    setLoading(false);
    toast("Kehadiran berhasil disimpan!", "success");
  };

  const statusBtn = (id, status, label, color) => (
    <button onClick={() => setStatus(id, status)} style={{
      padding: "5px 14px", borderRadius: 8, border: `1px solid ${localAtt[id] === status ? color : "rgba(148,163,184,0.2)"}`,
      background: localAtt[id] === status ? `${color}20` : "transparent",
      color: localAtt[id] === status ? color : subtext, cursor: "pointer", fontSize: 12, fontWeight: 600,
      transition: "all 0.15s",
    }}>{label}</button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div><label style={{ ...labelStyle, marginBottom: 4 }}>Tanggal</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inputStyle, background: isDark ? "#1E293B" : "#fff", color: text, width: 170 }} /></div>
        <div><label style={{ ...labelStyle, marginBottom: 4 }}>Kelas</label>
          <select value={classFilter} onChange={e => setClassFilter(e.target.value)} style={{ ...selectStyle, background: isDark ? "#1E293B" : "#fff", color: text, width: 130 }}>
            {CLASSES.map(c => <option key={c}>{c}</option>)}
          </select></div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignSelf: "flex-end" }}>
          <button onClick={() => bulkSet("present")} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid rgba(34,197,94,0.3)", background: "transparent", color: "#22C55E", cursor: "pointer", fontSize: 13 }}>✅ Semua Hadir</button>
          <button onClick={() => bulkSet("absent")} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", background: "transparent", color: "#EF4444", cursor: "pointer", fontSize: 13 }}>❌ Semua Absen</button>
          <button className="btn-primary" onClick={saveAtt} disabled={loading} style={{
            padding: "9px 20px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff",
            fontWeight: 600, cursor: "pointer", fontSize: 14, opacity: loading ? 0.7 : 1,
          }}>{loading ? "Menyimpan..." : "💾 Simpan"}</button>
        </div>
      </div>

      <div style={{ background: card, borderRadius: 20, border: `1px solid ${border}`, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead style={{ background: isDark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.04)" }}>
              <tr><th>ID</th><th>Nama</th><th>Kelas</th><th>Status Kehadiran</th></tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td><span style={{ background: "rgba(99,102,241,0.15)", color: "#6366F1", borderRadius: 8, padding: "3px 10px", fontSize: 12 }}>{s.id}</span></td>
                  <td style={{ color: text, fontWeight: 500 }}>{s.name}</td>
                  <td style={{ color: subtext, fontSize: 13 }}>{s.class}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      {statusBtn(s.id, "present", "✅ Hadir", "#22C55E")}
                      {statusBtn(s.id, "absent", "❌ Absen", "#EF4444")}
                      {statusBtn(s.id, "late", "⏰ Terlambat", "#F59E0B")}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", color: subtext, padding: 32 }}>Tidak ada siswa di kelas ini</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── GRADES PAGE ──────────────────────────────────────────────────────────────
function GradesPage({ students, grades, setGrades, toast, isDark, card, text, subtext, border }) {
  const [filterStudent, setFilterStudent] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ studentId: students[0]?.id || "", subject: SUBJECTS[0], tugasHarian: "", ulanganHarian: "", ujianAkhir: "" });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const filtered = grades.filter(g =>
    (!filterStudent || g.studentId === filterStudent) &&
    (!filterSubject || g.subject === filterSubject)
  );

  const openAdd = () => { setEditing(null); setForm({ studentId: students[0]?.id || "", subject: SUBJECTS[0], tugasHarian: "", ulanganHarian: "", ujianAkhir: "" }); setModal(true); };
  const openEdit = (g) => { setEditing(`${g.studentId}-${g.subject}`); setForm({ ...g }); setModal(true); };

  const save = async () => {
    if (!form.tugasHarian || !form.ulanganHarian || !form.ujianAkhir) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    if (editing) {
      setGrades(p => p.map(g => `${g.studentId}-${g.subject}` === editing ? { ...form } : g));
      toast("Nilai diperbarui!", "success");
    } else {
      const exists = grades.find(g => g.studentId === form.studentId && g.subject === form.subject);
      if (exists) { toast("Nilai sudah ada, gunakan edit!", "error"); setLoading(false); return; }
      setGrades(p => [...p, { ...form }]);
      toast("Nilai berhasil ditambahkan!", "success");
    }
    setLoading(false);
    setModal(false);
  };

  const del = (g) => { setGrades(p => p.filter(x => !(x.studentId === g.studentId && x.subject === g.subject))); toast("Data nilai dihapus.", "info"); };

  const getStudentName = (id) => students.find(s => s.id === id)?.name || id;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <select value={filterStudent} onChange={e => setFilterStudent(e.target.value)} style={{ ...selectStyle, background: isDark ? "#1E293B" : "#fff", color: text, width: 200 }}>
          <option value="">Semua Siswa</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} style={{ ...selectStyle, background: isDark ? "#1E293B" : "#fff", color: text, width: 180 }}>
          <option value="">Semua Mata Pelajaran</option>
          {SUBJECTS.map(s => <option key={s}>{s}</option>)}
        </select>
        <button className="btn-primary" onClick={openAdd} style={{
          marginLeft: "auto", padding: "10px 20px", borderRadius: 12, border: "none",
          background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14,
        }}>+ Input Nilai</button>
      </div>

      <div style={{ background: card, borderRadius: 20, border: `1px solid ${border}`, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead style={{ background: isDark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.04)" }}>
              <tr>
                <th>Siswa</th><th>Mata Pelajaran</th>
                <th>Tugas Harian</th><th>Ulangan Harian</th><th>Ujian Akhir</th>
                <th>Nilai Akhir</th><th>Predikat</th><th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g, i) => {
                const final = calcFinal(g.tugasHarian, g.ulanganHarian, g.ujianAkhir);
                const col = gradeColor(final);
                return (
                  <tr key={i}>
                    <td style={{ color: text, fontWeight: 500 }}>{getStudentName(g.studentId)}</td>
                    <td style={{ color: subtext }}>{g.subject}</td>
                    {[g.tugasHarian, g.ulanganHarian, g.ujianAkhir].map((v, j) => (
                      <td key={j}><span style={{ color: gradeColor(v), fontWeight: 600 }}>{v}</span></td>
                    ))}
                    <td><span style={{
                      background: `${col}20`, color: col, borderRadius: 8, padding: "4px 12px",
                      fontWeight: 700, fontSize: 14,
                    }}>{final}</span></td>
                    <td><span style={{
                      background: `${col}15`, color: col, borderRadius: 8, padding: "3px 10px", fontSize: 12,
                    }}>{gradeLabel(final)}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => openEdit(g)} style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid rgba(99,102,241,0.3)", background: "transparent", color: "#6366F1", cursor: "pointer", fontSize: 12 }}>✏️ Edit</button>
                        <button onClick={() => del(g)} style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "transparent", color: "#EF4444", cursor: "pointer", fontSize: 12 }}>🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", color: subtext, padding: 32 }}>Tidak ada data nilai</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Nilai" : "Input Nilai Baru"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div><label style={labelStyle}>Siswa</label>
            <select value={form.studentId} onChange={e => setForm(p => ({ ...p, studentId: e.target.value }))} style={selectStyle}>
              {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.class})</option>)}
            </select></div>
          <div><label style={labelStyle}>Mata Pelajaran</label>
            <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} style={selectStyle}>
              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select></div>
          {[["tugasHarian", "Tugas Harian"], ["ulanganHarian", "Ulangan Harian"], ["ujianAkhir", "Ujian Akhir"]].map(([key, label]) => (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
              <input type="number" min={0} max={100} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} style={inputStyle} placeholder="0 - 100" />
            </div>
          ))}
          {form.tugasHarian && form.ulanganHarian && form.ujianAkhir && (
            <div style={{
              background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
              borderRadius: 12, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ color: "#94A3B8", fontSize: 13 }}>Nilai Akhir (otomatis)</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: gradeColor(calcFinal(form.tugasHarian, form.ulanganHarian, form.ujianAkhir)) }}>
                {calcFinal(form.tugasHarian, form.ulanganHarian, form.ujianAkhir)}
              </span>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button onClick={() => setModal(false)} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid rgba(148,163,184,0.2)", background: "transparent", color: subtext, cursor: "pointer" }}>Batal</button>
            <button className="btn-primary" onClick={save} disabled={loading} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", fontWeight: 600, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── REPORTS PAGE ─────────────────────────────────────────────────────────────
function ReportsPage({ students, grades, attendance, toast, isDark, card, text, subtext, border }) {
  const [tab, setTab] = useState("ranking");

  const ranking = students.map(s => {
    const sGrades = grades.filter(g => g.studentId === s.id);
    const avg = sGrades.length
      ? Math.round(sGrades.reduce((acc, g) => acc + calcFinal(g.tugasHarian, g.ulanganHarian, g.ujianAkhir), 0) / sGrades.length)
      : null;
    const attCount = attendance.filter(a => a.studentId === s.id && a.status === "present").length;
    return { ...s, avg, attCount };
  }).filter(s => s.avg !== null).sort((a, b) => b.avg - a.avg);

  const exportCSV = () => {
    const rows = [["ID", "Nama", "Kelas", "Mata Pelajaran", "Tugas Harian", "Ulangan Harian", "Ujian Akhir", "Nilai Akhir"]];
    grades.forEach(g => {
      const student = students.find(s => s.id === g.studentId);
      rows.push([g.studentId, student?.name || "", student?.class || "", g.subject, g.tugasHarian, g.ulanganHarian, g.ujianAkhir, calcFinal(g.tugasHarian, g.ulanganHarian, g.ujianAkhir)]);
    });
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "laporan_nilai.csv"; a.click();
    toast("CSV berhasil diexport!", "success");
  };

  const SHEET_URL = "https://script.google.com/macros/s/AKfycbzgmBi45-U2UKrYh7Xsn_NB-ooxBrPRrUa6yAmnev5LZ1-DuDEsJVY1sldMU9XGI59S/exec"; // ← paste URL kamu

const googleSheetsSample = async () => {
  toast("Menyinkronkan data ke Google Sheets...", "info");
  try {
    for (const g of grades) {
      const student = students.find(s => s.id === g.studentId);
      await fetch(SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: student?.name,
          kelas: student?.class,
          tanggal: today,
          mataPelajaran: g.subject,
          kehadiran: "Hadir",
          tugasHarian: g.tugasHarian,
          ulanganHarian: g.ulanganHarian,
          ujianAkhir: g.ujianAkhir,
          nilaiAkhir: calcFinal(g.tugasHarian, g.ulanganHarian, g.ujianAkhir),
        }),
      });
    }
    toast("✅ Semua data berhasil disinkronkan!", "success");
  } catch (err) {
    toast("❌ Gagal sync: " + err.message, "error");
  }
};
  const tabs = [{ id: "ranking", label: "🏆 Ranking" }, { id: "attendance", label: "📋 Kehadiran" }, { id: "sheets", label: "🔗 Google Sheets" }];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 4, background: isDark ? "#1E293B" : "#F8FAFC", borderRadius: 14, padding: 4, width: "fit-content" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "9px 18px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
            background: tab === t.id ? "linear-gradient(135deg,#6366F1,#8B5CF6)" : "transparent",
            color: tab === t.id ? "#fff" : subtext, transition: "all 0.2s",
          }}>{t.label}</button>
        ))}
      </div>

      {tab === "ranking" && (
        <div style={{ background: card, borderRadius: 20, border: `1px solid ${border}`, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontFamily: "Poppins", fontSize: 16, color: text, margin: 0 }}>Ranking Performa Siswa</h3>
            <button onClick={exportCSV} style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid rgba(99,102,241,0.3)", background: "transparent", color: "#6366F1", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>⬇ Export CSV</button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead style={{ background: isDark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.04)" }}>
                <tr><th>#</th><th>Nama</th><th>Kelas</th><th>Rata-rata Nilai</th><th>Hari Hadir</th><th>Predikat</th></tr>
              </thead>
              <tbody>
                {ranking.map((s, i) => (
                  <tr key={s.id}>
                    <td>
                      <span style={{
                        width: 28, height: 28, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center",
                        background: i === 0 ? "#F59E0B" : i === 1 ? "#94A3B8" : i === 2 ? "#CD7C1E" : "rgba(148,163,184,0.1)",
                        color: i < 3 ? "#fff" : subtext, fontWeight: 700, fontSize: 13,
                      }}>{i + 1}</span>
                    </td>
                    <td style={{ color: text, fontWeight: 500 }}>{s.name}</td>
                    <td style={{ color: subtext }}>{s.class}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ flex: 1, background: "rgba(148,163,184,0.1)", borderRadius: 4, height: 6, maxWidth: 80 }}>
                          <div style={{ width: `${s.avg}%`, height: "100%", borderRadius: 4, background: gradeColor(s.avg) }} />
                        </div>
                        <span style={{ color: gradeColor(s.avg), fontWeight: 700 }}>{s.avg}</span>
                      </div>
                    </td>
                    <td style={{ color: text }}>{s.attCount}</td>
                    <td><span style={{ background: `${gradeColor(s.avg)}15`, color: gradeColor(s.avg), borderRadius: 8, padding: "3px 10px", fontSize: 12 }}>{gradeLabel(s.avg)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "attendance" && (
        <div style={{ background: card, borderRadius: 20, border: `1px solid ${border}`, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${border}` }}>
            <h3 style={{ fontFamily: "Poppins", fontSize: 16, color: text, margin: 0 }}>Rekap Kehadiran</h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead style={{ background: isDark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.04)" }}>
                <tr><th>ID</th><th>Nama</th><th>Hadir</th><th>Absen</th><th>Terlambat</th><th>% Kehadiran</th></tr>
              </thead>
              <tbody>
                {students.map(s => {
                  const sa = attendance.filter(a => a.studentId === s.id);
                  const p = sa.filter(a => a.status === "present").length;
                  const ab = sa.filter(a => a.status === "absent").length;
                  const lt = sa.filter(a => a.status === "late").length;
                  const pct = sa.length ? Math.round((p / sa.length) * 100) : 0;
                  return (
                    <tr key={s.id}>
                      <td><span style={{ background: "rgba(99,102,241,0.15)", color: "#6366F1", borderRadius: 8, padding: "3px 10px", fontSize: 12 }}>{s.id}</span></td>
                      <td style={{ color: text, fontWeight: 500 }}>{s.name}</td>
                      <td style={{ color: "#22C55E", fontWeight: 600 }}>{p}</td>
                      <td style={{ color: "#EF4444", fontWeight: 600 }}>{ab}</td>
                      <td style={{ color: "#F59E0B", fontWeight: 600 }}>{lt}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ flex: 1, background: "rgba(148,163,184,0.1)", borderRadius: 4, height: 6, maxWidth: 80 }}>
                            <div style={{ width: `${pct}%`, height: "100%", borderRadius: 4, background: gradeColor(pct) }} />
                          </div>
                          <span style={{ color: gradeColor(pct), fontWeight: 700, minWidth: 36 }}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "sheets" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: card, borderRadius: 20, border: `1px solid ${border}`, padding: 28 }}>
            <h3 style={{ fontFamily: "Poppins", fontSize: 18, color: text, marginBottom: 8 }}>🔗 Google Sheets Integration</h3>
            <p style={{ color: subtext, fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>
              Integrasi dengan Google Sheets via Google Apps Script. Setiap data nilai dan kehadiran akan disinkronkan secara real-time ke spreadsheet Anda.
            </p>

            <div style={{ background: isDark ? "#0F172A" : "#F8FAFC", borderRadius: 14, padding: 20, marginBottom: 20, fontFamily: "monospace", fontSize: 13, color: "#22C55E", lineHeight: 1.8 }}>
              <div style={{ color: "#6366F1", marginBottom: 8 }}>// Google Apps Script (doPost)</div>
              <div><span style={{ color: "#F59E0B" }}>function</span> <span style={{ color: "#60A5FA" }}>doPost</span>(e) {"{"}</div>
              <div>&nbsp;&nbsp;<span style={{ color: "#F59E0B" }}>const</span> data = JSON.parse(e.postData.contents);</div>
              <div>&nbsp;&nbsp;<span style={{ color: "#F59E0B" }}>const</span> sheet = SpreadsheetApp</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;.getActiveSpreadsheet().getActiveSheet();</div>
              <div>&nbsp;&nbsp;sheet.appendRow([</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;data.nama, data.kelas, data.tanggal,</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;data.mataPelajaran, data.kehadiran,</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;data.tugasHarian, data.ulanganHarian,</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;data.ujianAkhir, data.nilaiAkhir</div>
              <div>&nbsp;&nbsp;]);</div>
              <div>&nbsp;&nbsp;<span style={{ color: "#F59E0B" }}>return</span> ContentService</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;.createTextOutput(JSON.stringify({"{"}<span style={{ color: "#94A3B8" }}>status: "ok"</span>{"}"}))</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;.setMimeType(ContentService.MimeType.JSON);</div>
              <div>{"}"}</div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Google Apps Script URL</label>
              <input defaultValue="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec" style={{ ...inputStyle, background: isDark ? "#0F172A" : "#F8FAFC", color: isDark ? "#94A3B8" : "#64748B", width: "100%" }} />
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="btn-primary" onClick={googleSheetsSample} style={{
                padding: "12px 24px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg,#22C55E,#16A34A)", color: "#fff",
                fontWeight: 600, cursor: "pointer", fontSize: 14,
              }}>🔄 Sync ke Google Sheets</button>
              <button onClick={exportCSV} style={{
                padding: "12px 24px", borderRadius: 12, border: "1px solid rgba(99,102,241,0.3)",
                background: "transparent", color: "#6366F1", fontWeight: 600, cursor: "pointer", fontSize: 14,
              }}>⬇ Export CSV</button>
            </div>
          </div>

          <div style={{ background: card, borderRadius: 20, border: `1px solid ${border}`, padding: 28 }}>
            <h3 style={{ fontFamily: "Poppins", fontSize: 16, color: text, marginBottom: 16 }}>📄 Preview Data untuk Dikirim</h3>
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead style={{ background: isDark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.04)" }}>
                  <tr><th>Nama</th><th>Kelas</th><th>Mata Pelajaran</th><th>Tugas</th><th>Ulangan</th><th>Ujian</th><th>Nilai Akhir</th></tr>
                </thead>
                <tbody>
                  {grades.slice(0, 6).map((g, i) => {
                    const s = students.find(x => x.id === g.studentId);
                    const final = calcFinal(g.tugasHarian, g.ulanganHarian, g.ujianAkhir);
                    return (
                      <tr key={i}>
                        <td style={{ color: text, fontWeight: 500 }}>{s?.name}</td>
                        <td style={{ color: subtext }}>{s?.class}</td>
                        <td style={{ color: subtext }}>{g.subject}</td>
                        <td style={{ color: gradeColor(g.tugasHarian) }}>{g.tugasHarian}</td>
                        <td style={{ color: gradeColor(g.ulanganHarian) }}>{g.ulanganHarian}</td>
                        <td style={{ color: gradeColor(g.ujianAkhir) }}>{g.ujianAkhir}</td>
                        <td><span style={{ background: `${gradeColor(final)}20`, color: gradeColor(final), borderRadius: 8, padding: "4px 12px", fontWeight: 700 }}>{final}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}