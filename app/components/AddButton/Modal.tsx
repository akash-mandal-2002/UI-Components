import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, X, Plus, Star, MessageSquare, Phone,
  ArrowLeft, Check, ChevronRight, MoreVertical,
  Mic, Image, Smile, Send, Video, CheckCheck
} from "lucide-react";

const INITIAL_CONTACTS = [
  {
    id: 1, name: "Alice Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    status: "Online", email: "alice.j@design.co", note: "Lead Designer", isFavorite: true,
    phone: "+1 555 234 5678", lastSeen: "online", unread: 3, lastMsg: "Did you check the new mockups?"
  },
  {
    id: 2, name: "Bob Smith",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    status: "Away", email: "bob.smith@core.dev", note: "System Architect", isFavorite: false,
    phone: "+1 555 876 5432", lastSeen: "15m ago", unread: 0, lastMsg: "Sure, let me push the fix."
  },
  {
    id: 3, name: "Carol White",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
    status: "Online", email: "carol@product.io", note: "Product Manager", isFavorite: true,
    phone: "+1 555 432 1098", lastSeen: "online", unread: 1, lastMsg: "Sprint planning tomorrow 9am"
  },
  {
    id: 4, name: "David Brown",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    status: "Offline", email: "david.b@write.tech", note: "Technical Writer", isFavorite: false,
    phone: "+1 555 345 6789", lastSeen: "yesterday", unread: 0, lastMsg: "Docs updated ✓"
  },
  {
    id: 5, name: "Eva Martinez",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    status: "Online", email: "eva.m@analytics.run", note: "ML Data Analyst", isFavorite: false,
    phone: "+1 555 789 0123", lastSeen: "online", unread: 7, lastMsg: "Model accuracy hit 94%!"
  },
  {
    id: 6, name: "Frank Lee",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    status: "Offline", email: "frank@devops.net", note: "Cloud SRE", isFavorite: false,
    phone: "+1 555 901 2345", lastSeen: "2h ago", unread: 0, lastMsg: "Pipeline is green"
  },
  {
    id: 7, name: "Grace Kim",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    status: "Away", email: "grace.kim@qa.io", note: "Automation QA", isFavorite: true,
    phone: "+1 555 567 8901", lastSeen: "5m ago", unread: 2, lastMsg: "All tests passing now"
  },
  {
    id: 8, name: "Henry Wilson",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    status: "Online", email: "henry@cybershield.org", note: "SecOps", isFavorite: false,
    phone: "+1 555 678 9012", lastSeen: "online", unread: 0, lastMsg: "Audit report is ready"
  }
];

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
];

// --- Status helpers ---
const statusColor = (s) =>
  s === "Online" ? "#4ade80" : s === "Away" ? "#fbbf24" : "#64748b";

const statusLabel = (c) =>
  c.status === "Online" ? "online" : c.lastSeen;

// --- Telegram-style time stamp ---
const tgTime = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// --- Spring configs ---
const SPRING = { type: "spring", stiffness: 420, damping: 36, mass: 0.8 };
const SPRING_GENTLE = { type: "spring", stiffness: 260, damping: 28 };

function Modal() {
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("All");
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [activeChatContact, setActiveChatContact] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [chatHistories, setChatHistories] = useState({
    1: [
      { id: "a1", sender: "contact", text: "Hey! Did you review the latest mockups?", time: "10:30" },
      { id: "a2", sender: "user", text: "They look incredible! Love the spacing.", time: "10:32", read: true },
      { id: "a3", sender: "contact", text: "Let me know if we need to refine the accents.", time: "10:33" }
    ],
    3: [
      { id: "b1", sender: "contact", text: "Sprint planning tomorrow 9am", time: "09:15" }
    ]
  });

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChatContact, chatHistories]);

  const handleToggleFavorite = (id, e) => {
    e.stopPropagation();
    setContacts(prev => prev.map(c => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c));
    if (activeChatContact?.id === id)
      setActiveChatContact(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const q = searchQuery.toLowerCase();
      const match = c.name.toLowerCase().includes(q) ||
        c.note.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q);
      if (!match) return false;
      if (selectedTab === "Favorites") return c.isFavorite;
      if (selectedTab === "Online") return c.status === "Online" || c.status === "Away";
      return true;
    });
  }, [contacts, searchQuery, selectedTab]);

  const handleSend = () => {
    if (!messageInput.trim() || !activeChatContact) return;
    const id = activeChatContact.id;
    const msg = { id: Math.random().toString(), sender: "user", text: messageInput.trim(), time: tgTime(), read: false };
    setChatHistories(prev => ({ ...prev, [id]: [...(prev[id] || []), msg] }));
    setMessageInput("");
    setTimeout(() => {
      const replies = [
        "Sounds perfect, let's do it!",
        "Got it, I'll look into that.",
        "Thanks for the update!",
        "Let me loop in the team.",
        "Looks great, ship it!"
      ];
      const reply = { id: Math.random().toString(), sender: "contact", text: replies[Math.floor(Math.random() * replies.length)], time: tgTime() };
      setChatHistories(prev => ({ ...prev, [id]: [...(prev[id] || []), reply] }));
    }, 1100);
  };

  const handleCreateContact = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const nc = {
      id: Date.now(), name: newName, avatar: selectedAvatar,
      status: ["Online", "Away", "Offline"][Math.floor(Math.random() * 3)],
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, "")}@team.co`,
      note: newRole || "Team Member", isFavorite: false,
      phone: "+1 555 " + Math.floor(100 + Math.random() * 900) + " " + Math.floor(1000 + Math.random() * 9000),
      lastSeen: "just now", unread: 0, lastMsg: "Added to contacts"
    };
    setContacts(prev => [nc, ...prev]);
    setIsAddingContact(false);
    setNewName(""); setNewEmail(""); setNewRole("");
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => { setActiveChatContact(null); setIsAddingContact(false); }, 300);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
      WebkitFontSmoothing: "antialiased"
    }}>
      {/* Ambient glow */}
      <div style={{
        position: "fixed", top: "20%", left: "20%", width: 340, height: 340,
        background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "fixed", bottom: "20%", right: "20%", width: 280, height: 280,
        background: "radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      {/* Phone frame */}
      <div style={{
        position: "relative", width: 390, height: 720,
        background: "#1B2430", borderRadius: 44,
        boxShadow: "0 40px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden"
      }}>

        {/* Behind-modal content */}
        <div style={{ padding: "52px 28px 24px", height: "100%" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>workspace</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: "#f1f5f9", lineHeight: 1.25, marginBottom: 8 }}>Connect &amp; Chat</div>

          </div>

          {/* Quick pinboard */}
          <div style={{ marginTop: 32 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Recent</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {contacts.slice(0, 4).map(c => (
                <div key={c.id}
                  onClick={() => { setIsOpen(true); setTimeout(() => setActiveChatContact(c), 100); }}
                  style={{
                    background: "rgba(30,40,55,0.7)", borderRadius: 18, padding: "10px 6px 8px",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    border: "1px solid rgba(255,255,255,0.04)", cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ position: "relative", width: 40, height: 40 }}>
                    <img src={c.avatar} alt={c.name} referrerPolicy="no-referrer"
                      style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.06)" }} />
                    <span style={{
                      position: "absolute", bottom: 1, right: 1, width: 10, height: 10,
                      background: statusColor(c.status), borderRadius: "50%", border: "2px solid #1B2430"
                    }} />
                  </div>
                  <span style={{ fontSize: 10, color: "#94a3b8", textAlign: "center" }}>{c.name.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FAB Button ── */}
        <motion.div
          onClick={() => {
            setIsOpen((prev) => !prev);
            if (isOpen) {
              setActiveChatContact(null);
              setIsAddingContact(false);
            }
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 500, damping: 20, mass: 0.8 }}
          className={`absolute bottom-8 right-8 z-50 rounded-full flex items-center justify-center w-14 h-14 cursor-pointer  border transition-colors ${isOpen
              ? "bg-[#232E3C] text-white shadow-[#000000]/40 border-[#2B3744] hover:bg-[#2b3744]"
              : "bg-blue-600 text-white shadow-blue-900/40 border-blue-400/20 hover:bg-blue-500"
            }`}
        >
          <AnimatePresence mode="wait" initial={false}>

            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
            >
              {/* Plus icon inside circular toggle according to Elegant Dark mockup */}
              <svg xmlns="http://www.w3.org/2000/svg" width="1.9em" height="1.9em" viewBox="0 0 16 16">
                <path
                  fill="#ffffff"
                  d="M8 2a6 6 0 1 1-3.004 11.195l-2.338.78a.5.5 0 0 1-.639-.612l.712-2.491A6 6 0 0 1 8 2m.5 3.5a.5.5 0 0 0-1 0v2h-2a.5.5 0 0 0 0 1h2v2a.5.5 0 0 0 1 0v-2h2a.5.5 0 0 0 0-1h-2z"
                />
              </svg>
            </motion.div>

          </AnimatePresence>
        </motion.div>
        {/* ── Modal Sheet ── */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="modal"
              initial={{ y: "100%", opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "105%", opacity: 0, scale: 0.97 }}
              transition={{ ...SPRING_GENTLE, duration: 0.38 }}
              style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                height: "88%", background: "#17202A",
                borderRadius: "24px 24px 0 0", zIndex: 40,
                display: "flex", flexDirection: "column", overflow: "hidden",
                boxShadow: "0 -8px 40px rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.05)"
              }}
            >
              {/* Pull indicator */}
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 10, paddingBottom: 4, flexShrink: 0 }}>
                <div style={{ width: 36, height: 4, background: "rgba(255,255,255,0.12)", borderRadius: 99 }} />
              </div>

              {/* Inner view */}
              <AnimatePresence mode="wait">
                {activeChatContact ? (
                  /* ── Chat View ── */
                  <motion.div key="chat"
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -40, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
                  >
                    {/* Chat header — Telegram style */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 16px 12px",
                      borderBottom: "1px solid rgba(255,255,255,0.05)", background: "#17202A", flexShrink: 0
                    }}>
                      <motion.button
                        whileTap={{ scale: 0.9 }} onClick={() => setActiveChatContact(null)}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#2563eb", display: "flex" }}
                      >
                        <ArrowLeft size={20} />
                      </motion.button>

                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <img src={activeChatContact.avatar} referrerPolicy="no-referrer" alt=""
                          style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover" }} />
                        {activeChatContact.status !== "Offline" && (
                          <span style={{
                            position: "absolute", bottom: 1, right: 1, width: 11, height: 11,
                            background: statusColor(activeChatContact.status), borderRadius: "50%",
                            border: "2.5px solid #17202A"
                          }} />
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9", lineHeight: 1.2 }}>
                          {activeChatContact.name}
                        </div>
                        <div style={{ fontSize: 12, color: activeChatContact.status === "Online" ? "#4ade80" : "#64748b", marginTop: 1 }}>
                          {statusLabel(activeChatContact)}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 4 }}>
                        <button style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: "#64748b" }}>
                          <Phone size={18} />
                        </button>
                        <button style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: "#64748b" }}>
                          <Video size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Messages */}
                    <div style={{
                      flex: 1, overflowY: "auto", padding: "16px 16px 8px",
                      display: "flex", flexDirection: "column", gap: 4,
                      scrollbarWidth: "none"
                    }}>
                      {(chatHistories[activeChatContact.id] || []).length === 0 ? (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                          <div style={{
                            width: 56, height: 56, borderRadius: 18,
                            background: "rgba(37,99,235,0.1)", display: "flex", alignItems: "center", justifyContent: "center"
                          }}>
                            <MessageSquare size={24} color="#2563eb" />
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 14, fontWeight: 500, color: "#cbd5e1" }}>No messages yet</div>
                            <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>Say hello!</div>
                          </div>
                        </div>
                      ) : (
                        (chatHistories[activeChatContact.id] || []).map((msg, i) => {
                          const isUser = msg.sender === "user";
                          const prev = (chatHistories[activeChatContact.id] || [])[i - 1];
                          const showDate = i === 0;
                          return (
                            <React.Fragment key={msg.id}>
                              {showDate && (
                                <div style={{ textAlign: "center", margin: "4px 0 8px" }}>
                                  <span style={{
                                    fontSize: 11, color: "#475569", background: "rgba(255,255,255,0.04)",
                                    padding: "3px 10px", borderRadius: 99
                                  }}>Today</span>
                                </div>
                              )}
                              <div style={{
                                display: "flex", justifyContent: isUser ? "flex-end" : "flex-start",
                                marginBottom: prev?.sender === msg.sender ? 2 : 8
                              }}>
                                <div style={{
                                  maxWidth: "75%", padding: "8px 12px",
                                  background: isUser ? "#2563eb" : "#1E2D3D",
                                  borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                  position: "relative"
                                }}>
                                  <div style={{ fontSize: 14, color: isUser ? "#fff" : "#e2e8f0", lineHeight: 1.45 }}>
                                    {msg.text}
                                  </div>
                                  <div style={{
                                    display: "flex", alignItems: "center", justifyContent: "flex-end",
                                    gap: 3, marginTop: 3
                                  }}>
                                    <span style={{ fontSize: 10, color: isUser ? "rgba(255,255,255,0.55)" : "#475569" }}>
                                      {msg.time}
                                    </span>
                                    {isUser && (
                                      <CheckCheck size={12} color={msg.read ? "#60a5fa" : "rgba(255,255,255,0.45)"} />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        })
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Input bar — Telegram style */}
                    <div style={{
                      padding: "10px 12px 16px", background: "#17202A",
                      borderTop: "1px solid rgba(255,255,255,0.04)", flexShrink: 0
                    }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        background: "#1E2D3D", borderRadius: 24,
                        padding: "6px 6px 6px 14px", border: "1px solid rgba(255,255,255,0.05)"
                      }}>
                        <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#475569", display: "flex", flexShrink: 0 }}>
                          <Smile size={20} />
                        </button>
                        <input
                          value={messageInput}
                          onChange={e => setMessageInput(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && handleSend()}
                          placeholder="Message"
                          style={{
                            flex: 1, background: "none", border: "none", outline: "none",
                            fontSize: 14, color: "#f1f5f9", caretColor: "#2563eb",
                          }}
                        />
                        <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#475569", display: "flex", flexShrink: 0 }}>
                          <Mic size={20} />
                        </button>
                        <motion.button
                          whileTap={{ scale: 0.88 }}
                          onClick={handleSend}
                          disabled={!messageInput.trim()}
                          style={{
                            width: 36, height: 36, borderRadius: "50%", border: "none",
                            background: messageInput.trim() ? "#2563eb" : "rgba(37,99,235,0.2)",
                            cursor: messageInput.trim() ? "pointer" : "default",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0, transition: "background 0.2s"
                          }}
                        >
                          <Send size={16} color={messageInput.trim() ? "#fff" : "#2563eb"} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>

                ) : isAddingContact ? (
                  /* ── Add Contact View ── */
                  <motion.div key="add"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    style={{ flex: 1, display: "flex", flexDirection: "column", padding: "12px 20px 24px", overflow: "auto" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                      <span style={{ fontSize: 18, fontWeight: 600, color: "#f1f5f9" }}>New Contact</span>
                      <button onClick={() => setIsAddingContact(false)}
                        style={{
                          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)",
                          borderRadius: 10, cursor: "pointer", padding: "6px 8px", color: "#64748b",
                          display: "flex", alignItems: "center"
                        }}>
                        <X size={16} />
                      </button>
                    </div>

                    {/* Avatar pick */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Avatar</div>
                      <div style={{ display: "flex", gap: 10 }}>
                        {PRESET_AVATARS.map((a, i) => (
                          <button key={i} type="button" onClick={() => setSelectedAvatar(a)}
                            style={{
                              position: "relative", width: 52, height: 52, borderRadius: "50%",
                              overflow: "hidden", border: `2.5px solid ${selectedAvatar === a ? "#2563eb" : "rgba(255,255,255,0.06)"}`,
                              cursor: "pointer", background: "none", padding: 0,
                              transform: selectedAvatar === a ? "scale(1.08)" : "scale(1)",
                              transition: "all 0.18s"
                            }}>
                            <img src={a} referrerPolicy="no-referrer" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            {selectedAvatar === a && (
                              <div style={{
                                position: "absolute", inset: 0, background: "rgba(37,99,235,0.35)",
                                display: "flex", alignItems: "center", justifyContent: "center"
                              }}>
                                <Check size={16} color="#fff" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Fields */}
                    {[
                      { label: "Full Name", val: newName, set: setNewName, placeholder: "e.g. Jordan Park", required: true },
                      { label: "Role", val: newRole, set: setNewRole, placeholder: "e.g. Frontend Dev" },
                      { label: "Email", val: newEmail, set: setNewEmail, placeholder: "jordan@team.co" }
                    ].map(f => (
                      <div key={f.label} style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{f.label}</div>
                        <input
                          value={f.val} onChange={e => f.set(e.target.value)}
                          placeholder={f.placeholder}
                          style={{
                            width: "100%", background: "#1E2D3D", border: "1px solid rgba(255,255,255,0.05)",
                            borderRadius: 12, padding: "11px 14px", fontSize: 14, color: "#f1f5f9",
                            outline: "none", boxSizing: "border-box", caretColor: "#2563eb"
                          }}
                        />
                      </div>
                    ))}

                    <div style={{ display: "flex", gap: 10, marginTop: "auto", paddingTop: 16 }}>
                      <button onClick={() => setIsAddingContact(false)}
                        style={{
                          flex: 1, padding: "12px", background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12,
                          color: "#94a3b8", fontSize: 14, fontWeight: 500, cursor: "pointer"
                        }}>Cancel</button>
                      <button onClick={handleCreateContact}
                        style={{
                          flex: 1, padding: "12px", background: "#2563eb",
                          border: "none", borderRadius: 12,
                          color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
                          boxShadow: "0 4px 14px rgba(37,99,235,0.35)"
                        }}>Add Contact</button>
                    </div>
                  </motion.div>

                ) : (
                  /* ── Contact List View ── */
                  <motion.div key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
                  >
                    {/* Header */}
                    <div style={{ padding: "8px 20px 12px", flexShrink: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                        <div>
                          <div style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.3px" }}>Messages</div>
                          <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>
                            {filteredContacts.length} contacts
                          </div>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.88 }}
                          onClick={() => setIsAddingContact(true)}
                          style={{
                            width: 36, height: 36, borderRadius: "50%", background: "rgba(37,99,235,0.15)",
                            border: "1px solid rgba(37,99,235,0.2)", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center"
                          }}>
                          <Plus size={18} color="#2563eb" />
                        </motion.button>
                      </div>

                      {/* Search */}
                      <div style={{ position: "relative", marginBottom: 14 }}>
                        <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                          <Search size={15} color="#475569" />
                        </div>
                        <input
                          value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                          placeholder="Search"
                          style={{
                            width: "100%", background: "#1E2D3D",
                            border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12,
                            padding: "9px 36px 9px 36px", fontSize: 14, color: "#f1f5f9",
                            outline: "none", boxSizing: "border-box", caretColor: "#2563eb"
                          }}
                        />
                        {searchQuery && (
                          <button onClick={() => setSearchQuery("")}
                            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#475569", display: "flex" }}>
                            <X size={15} />
                          </button>
                        )}
                      </div>

                      {/* Tabs */}
                      {/* <div style={{ display: "flex", gap: 6 }}>
                        {["All", "Favorites", "Online"].map(tab => (
                          <button key={tab} onClick={() => setSelectedTab(tab)}
                            style={{
                              padding: "5px 14px", borderRadius: 99, fontSize: 12, fontWeight: 500,
                              cursor: "pointer", border: "1px solid",
                              borderColor: selectedTab === tab ? "transparent" : "rgba(255,255,255,0.06)",
                              background: selectedTab === tab ? "#2563eb" : "rgba(255,255,255,0.03)",
                              color: selectedTab === tab ? "#fff" : "#64748b",
                              transition: "all 0.18s"
                            }}>
                            {tab}
                          </button>
                        ))}
                      </div> */}
                    </div>

                    {/* Contact rows — Telegram style */}
                    <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
                      {filteredContacts.length === 0 ? (
                        <div style={{ padding: 40, textAlign: "center", color: "#475569" }}>
                          <Search size={28} style={{ marginBottom: 10, opacity: 0.3 }} />
                          <div style={{ fontSize: 14 }}>No contacts found</div>
                        </div>
                      ) : (
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          variants={{ visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } } }}
                        >
                          {filteredContacts.map(contact => (
                            <motion.div
                              key={contact.id}
                              variants={{ hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0, transition: { duration: 0.18 } } }}
                              whileHover={{ background: "rgba(30,45,62,0.8)" }}
                              onClick={() => setActiveChatContact(contact)}
                              style={{
                                display: "flex", alignItems: "center", gap: 12,
                                padding: "10px 20px", cursor: "pointer",
                                borderBottom: "1px solid rgba(255,255,255,0.025)",
                                transition: "background 0.15s"
                              }}
                            >
                              {/* Avatar */}
                              <div style={{ position: "relative", flexShrink: 0 }}>
                                <img src={contact.avatar} referrerPolicy="no-referrer" alt={contact.name}
                                  style={{ width: 50, height: 50, borderRadius: "50%", objectFit: "cover" }} />
                                <span style={{
                                  position: "absolute", bottom: 1, right: 1, width: 12, height: 12,
                                  background: statusColor(contact.status), borderRadius: "50%",
                                  border: "2.5px solid #17202A"
                                }} />
                              </div>

                              {/* Content */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                    <span style={{ fontSize: 15, fontWeight: 500, color: "#f1f5f9" }}>{contact.name}</span>
                                    {contact.isFavorite && <Star size={13} color="#f59e0b" fill="#f59e0b" />}
                                  </div>
                                  <span style={{ fontSize: 11, color: contact.unread > 0 ? "#2563eb" : "#475569", flexShrink: 0 }}>
                                    {contact.lastSeen}
                                  </span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                  <span style={{
                                    fontSize: 13, color: "#475569",
                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                    maxWidth: "calc(100% - 32px)"
                                  }}>
                                    {contact.lastMsg}
                                  </span>
                                  {contact.unread > 0 && (
                                    <span style={{
                                      background: "#2563eb", color: "#fff",
                                      fontSize: 11, fontWeight: 600, borderRadius: 99,
                                      minWidth: 20, height: 20, display: "flex", alignItems: "center",
                                      justifyContent: "center", padding: "0 6px", flexShrink: 0
                                    }}>
                                      {contact.unread}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}


export default Modal