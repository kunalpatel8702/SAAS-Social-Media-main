import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ── Helpers ──────────────────────────────────────────────────────────────────
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

// ── Status styling ────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  pending: {
    pill: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    dot: "bg-blue-400",
    label: "Pending",
  },
  scheduled: {
    pill: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    dot: "bg-violet-400",
    label: "Scheduled",
  },
  posted: {
    pill: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    dot: "bg-emerald-400",
    label: "Posted",
  },
  failed: {
    pill: "bg-red-500/20 text-red-300 border-red-500/30",
    dot: "bg-red-400",
    label: "Failed",
  },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${s.pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ── Post Pill on calendar cell ────────────────────────────────────────────────
function PostPill({ post, onClick }) {
  const s = STATUS_STYLE[post.status] || STATUS_STYLE.pending;
  const time = new Date(post.scheduledAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <button
      onClick={() => onClick(post)}
      className={`w-full text-left px-2 py-1 rounded-lg border text-[9px] font-bold truncate transition-all hover:brightness-125 active:scale-95 ${s.pill}`}
    >
      <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1 ${s.dot}`} />
      {time} · {post.caption?.slice(0, 22) || "No caption"}
    </button>
  );
}

// ── Post Detail Modal ─────────────────────────────────────────────────────────
function PostModal({ post, onClose, onDelete }) {
  if (!post) return null;
  const date = new Date(post.scheduledAt);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0F1525] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
              <svg
                className="h-4 w-4 text-[var(--foreground)]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/30">
                Instagram Post
              </p>
              <p className="text-[var(--foreground)] font-bold text-sm">
                {date.toLocaleDateString([], {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
                {" · "}
                {date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center text-[var(--foreground)]/40 hover:bg-white/10 hover:text-[var(--foreground)] transition-all"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Media */}
        {post.mediaUrl && (
          <div className="rounded-xl overflow-hidden mb-4 border border-white/10">
            {post.mediaType === "VIDEO" ? (
              <video
                src={post.mediaUrl}
                className="w-full h-48 object-cover bg-black"
                controls
                muted
              />
            ) : (
              <img
                src={post.mediaUrl}
                alt="post media"
                className="w-full h-48 object-cover"
              />
            )}
          </div>
        )}

        {/* Caption */}
        <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4 mb-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/30 mb-2">
            Caption
          </p>
          <p className="text-[var(--foreground)]/80 text-sm leading-relaxed whitespace-pre-wrap">
            {post.caption || "—"}
          </p>
        </div>

        {/* Status + Type */}
        <div className="flex items-center gap-3 mb-5">
          <StatusBadge status={post.status} />
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border bg-white/5 text-[var(--foreground)]/40 border-white/10">
            {post.mediaType || "IMAGE"}
          </span>
        </div>

        {/* Error Message if failed */}
        {post.status === "failed" && post.errorMessage && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">
              Error
            </p>
            <p className="text-red-300 text-xs">{post.errorMessage}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            to="/service-manager/instagram"
            className="flex-1 py-2.5 text-center rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-[var(--foreground)] font-black uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all"
          >
            Schedule More
          </Link>
          {post.status !== "posted" && (
            <button
              onClick={() => onDelete(post._id)}
              className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-black uppercase tracking-widest text-xs hover:bg-red-500/20 transition-all"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ContentCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [view, setView] = useState("month"); // 'month' | 'week' | 'list'
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // ── Fetch all posts ──────────────────────────────────────────────────────
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/v1/social/instagram/posts`,
        config,
      );
      setPosts(res.data.data.posts || []);
    } catch (err) {
      console.error("Error fetching posts:", err);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await axios.delete(
        `${API_URL}/v1/social/instagram/posts/${postId}`,
        config,
      );
      toast.success("Post deleted");
      setSelectedPost(null);
      fetchPosts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete post");
    }
  };

  // ── Navigation ───────────────────────────────────────────────────────────
  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  // ── Calendar grid data ───────────────────────────────────────────────────
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  // Group posts by date key "YYYY-MM-DD"
  const postsByDate = {};
  posts.forEach((p) => {
    const d = new Date(p.scheduledAt);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!postsByDate[key]) postsByDate[key] = [];
    postsByDate[key].push(p);
  });

  const getCellKey = (cellIndex) => {
    const day = cellIndex - firstDay + 1;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = {
    total: posts.length,
    pending: posts.filter(
      (p) => p.status === "pending" || p.status === "scheduled",
    ).length,
    posted: posts.filter((p) => p.status === "posted").length,
    failed: posts.filter((p) => p.status === "failed").length,
  };

  // ── Week view: get start of current week ─────────────────────────────────
  const getWeekDays = () => {
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };
  const weekDays = getWeekDays();

  return (
    <div className="min-h-screen bg-[var(--background)] pt-28 pb-20 px-6">
      <div className="mx-auto max-w-7xl">
        {/* ── Header ── */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <svg
                  className="h-5 w-5 text-[var(--foreground)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h1 className="text-4xl font-black text-[var(--foreground)]">
                Content Calendar
              </h1>
            </div>
            <p className="text-[var(--foreground)]/40 ml-13">
              Visualize and manage all your scheduled posts at a glance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchPosts}
              className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-[var(--foreground)]/60 hover:bg-white/10 hover:text-[var(--foreground)] transition-all flex items-center gap-2"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
            <Link
              to="/my-services"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 text-black font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]"
            >
              + New Post
            </Link>
          </div>
        </header>

        {/* ── Stats Strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Posts",
              value: stats.total,
              color: "from-purple-500 to-indigo-500",
              icon: "📋",
            },
            {
              label: "Pending",
              value: stats.pending,
              color: "from-blue-400 to-cyan-500",
              icon: "⏳",
            },
            {
              label: "Published",
              value: stats.posted,
              color: "from-emerald-400 to-teal-500",
              icon: "✅",
            },
            {
              label: "Failed",
              value: stats.failed,
              color: "from-red-500 to-rose-500",
              icon: "❌",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="group rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl transition-all hover:bg-white/[0.06] hover:border-white/20"
            >
              <div className="flex justify-between items-start mb-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40">
                  {stat.label}
                </p>
                <span className="text-xl grayscale group-hover:grayscale-0 transition-all">
                  {stat.icon}
                </span>
              </div>
              <p
                className={`text-4xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
              >
                {loading ? "—" : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── View Switcher + Month Nav ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Month nav (only for month view) */}
          {view === "month" && (
            <div className="flex items-center gap-4">
              <button
                onClick={prevMonth}
                className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--foreground)]/60 hover:bg-white/10 hover:text-[var(--foreground)] transition-all"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h2 className="text-xl font-black text-[var(--foreground)] min-w-[180px] text-center">
                {MONTHS[month]} {year}
              </h2>
              <button
                onClick={nextMonth}
                className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--foreground)]/60 hover:bg-white/10 hover:text-[var(--foreground)] transition-all"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}
          {view !== "month" && <div />}

          {/* View tabs */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
            {[
              { key: "month", label: "Month", icon: "📅" },
              { key: "week", label: "Week", icon: "🗓️" },
              { key: "list", label: "List", icon: "📋" },
            ].map((v) => (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${view === v.key ? "bg-gradient-to-r from-purple-500 to-cyan-400 text-black shadow" : "text-[var(--foreground)]/40 hover:text-[var(--foreground)]/70"}`}
              >
                <span>{v.icon}</span> {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Legend ── */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {Object.entries(STATUS_STYLE).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${val.dot}`} />
              <span className="text-[10px] font-bold text-[var(--foreground)]/40 uppercase tracking-wider">
                {val.label}
              </span>
            </div>
          ))}
        </div>

        {/* ──────── MONTH VIEW ──────── */}
        {view === "month" && (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-white/10">
              {DAYS.map((d) => (
                <div
                  key={d}
                  className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/30"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar cells */}
            <div className="grid grid-cols-7">
              {Array.from({ length: totalCells }, (_, i) => {
                const day = i - firstDay + 1;
                const isCurrentMonth = day >= 1 && day <= daysInMonth;
                const cellDate = new Date(year, month, day);
                const isToday = isCurrentMonth && isSameDay(cellDate, today);
                const key = getCellKey(i);
                const dayPosts = isCurrentMonth ? postsByDate[key] || [] : [];

                return (
                  <div
                    key={i}
                    className={`min-h-[110px] p-2 border-b border-r border-white/[0.05] transition-colors ${
                      isCurrentMonth ? "hover:bg-white/[0.03]" : "opacity-30"
                    } ${isToday ? "bg-purple-500/5 border-purple-500/20" : ""}`}
                  >
                    {/* Day number */}
                    <div className="flex justify-end mb-1.5">
                      <span
                        className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                          isToday
                            ? "bg-gradient-to-r from-purple-500 to-cyan-400 text-black"
                            : "text-[var(--foreground)]/40"
                        }`}
                      >
                        {isCurrentMonth ? day : ""}
                      </span>
                    </div>

                    {/* Post pills */}
                    <div className="space-y-1">
                      {dayPosts.slice(0, 3).map((p, idx) => (
                        <PostPill
                          key={idx}
                          post={p}
                          onClick={setSelectedPost}
                        />
                      ))}
                      {dayPosts.length > 3 && (
                        <button
                          onClick={() => setSelectedPost(dayPosts[3])}
                          className="w-full text-[9px] text-[var(--foreground)]/30 font-bold text-center hover:text-[var(--foreground)]/60 transition-colors"
                        >
                          +{dayPosts.length - 3} more
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ──────── WEEK VIEW ──────── */}
        {view === "week" && (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
            <div className="grid grid-cols-7 border-b border-white/10">
              {weekDays.map((d, i) => {
                const isT = isSameDay(d, today);
                return (
                  <div
                    key={i}
                    className={`py-4 px-3 text-center border-r border-white/[0.05] last:border-r-0 ${isT ? "bg-purple-500/5" : ""}`}
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/30">
                      {DAYS[i]}
                    </p>
                    <p
                      className={`text-lg font-black mt-1 ${isT ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300" : "text-[var(--foreground)]/70"}`}
                    >
                      {d.getDate()}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-7 min-h-[400px]">
              {weekDays.map((d, i) => {
                const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                const dayPosts = postsByDate[key] || [];
                return (
                  <div
                    key={i}
                    className={`p-2 border-r border-white/[0.05] last:border-r-0 space-y-1.5 ${isSameDay(d, today) ? "bg-purple-500/[0.03]" : ""}`}
                  >
                    {dayPosts.map((p, idx) => (
                      <PostPill key={idx} post={p} onClick={setSelectedPost} />
                    ))}
                    {dayPosts.length === 0 && (
                      <div className="text-[9px] text-[var(--foreground)]/10 text-center pt-4 font-semibold">
                        No posts
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ──────── LIST VIEW ──────── */}
        {view === "list" && (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">📅</div>
                <h3 className="text-[var(--foreground)]/60 font-bold mb-2">
                  No posts scheduled yet
                </h3>
                <p className="text-[var(--foreground)]/30 text-sm mb-6">
                  Schedule your first post to see it here
                </p>
                <Link
                  to="/my-services"
                  className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 text-black font-black text-sm"
                >
                  Schedule a Post
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.05]">
                {/* Table header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3">
                  <div className="col-span-1 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/20">
                    Media
                  </div>
                  <div className="col-span-5 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/20">
                    Caption
                  </div>
                  <div className="col-span-3 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/20">
                    Scheduled At
                  </div>
                  <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/20">
                    Status
                  </div>
                  <div className="col-span-1 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/20">
                    Action
                  </div>
                </div>

                {[...posts]
                  .sort(
                    (a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt),
                  )
                  .map((post, i) => {
                    const d = new Date(post.scheduledAt);
                    return (
                      <div
                        key={i}
                        className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.03] transition-colors group"
                      >
                        {/* Thumbnail */}
                        <div className="col-span-1">
                          {post.mediaUrl ? (
                            post.mediaType === "VIDEO" ? (
                              <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs">
                                🎬
                              </div>
                            ) : (
                              <img
                                src={post.mediaUrl}
                                alt="thumb"
                                className="h-10 w-10 rounded-lg object-cover border border-white/10"
                              />
                            )
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs">
                              📷
                            </div>
                          )}
                        </div>

                        {/* Caption */}
                        <div className="col-span-5">
                          <p className="text-[var(--foreground)]/80 text-sm font-semibold truncate group-hover:text-[var(--foreground)] transition-colors">
                            {post.caption || (
                              <span className="text-[var(--foreground)]/20 italic">
                                No caption
                              </span>
                            )}
                          </p>
                          <p className="text-[var(--foreground)]/20 text-[10px] mt-0.5 uppercase tracking-widest">
                            {post.mediaType}
                          </p>
                        </div>

                        {/* Date */}
                        <div className="col-span-3">
                          <p className="text-[var(--foreground)]/60 text-sm font-semibold">
                            {d.toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-[var(--foreground)]/30 text-xs mt-0.5">
                            {d.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>

                        {/* Status */}
                        <div className="col-span-2">
                          <StatusBadge status={post.status} />
                        </div>

                        {/* Actions */}
                        <div className="col-span-1 flex gap-2">
                          <button
                            onClick={() => setSelectedPost(post)}
                            className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-[var(--foreground)]/30 hover:bg-white/10 hover:text-[var(--foreground)] transition-all"
                            title="View details"
                          >
                            <svg
                              className="h-3.5 w-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                          {post.status !== "posted" && (
                            <button
                              onClick={() => handleDelete(post._id)}
                              className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400/60 hover:bg-red-500/20 hover:text-red-400 transition-all"
                              title="Delete post"
                            >
                              <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Empty state for month/week */}
        {view !== "list" && !loading && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-[var(--foreground)]/40 font-semibold mb-4">
              No posts scheduled yet
            </p>
            <Link
              to="/my-services"
              className="inline-block px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 text-black font-black text-xs"
            >
              Schedule First Post
            </Link>
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
