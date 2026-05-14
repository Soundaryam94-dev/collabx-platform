"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Search, MessageSquare, Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getConversations, getMessages, sendMessage } from "@/lib/supabase/queries";
import UserAvatar from "@/components/ui/UserAvatar";

type Message = { id: string; content: string; sender_id: string; created_at: string };
type Profile = { full_name: string | null; email: string };
type Conversation = {
  id: string;
  brand_id: string;
  creator_id: string;
  updated_at: string;
  brand: Profile[];
  creator: Profile[];
};

export default function MessagesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [showNew, setShowNew] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      const convs = await getConversations(user.id);
      setConversations(convs as unknown as Conversation[]);
      setLoading(false);
    });
  }, []);

  const loadMessages = useCallback(async (convId: string) => {
    const msgs = await getMessages(convId);
    setMessages(msgs as Message[]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  useEffect(() => {
    if (!activeConvId) return;
    loadMessages(activeConvId);

    const channel = supabase
      .channel(`messages:${activeConvId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${activeConvId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConvId, loadMessages]);

  const handleSend = async () => {
    if (!input.trim() || !activeConvId || !userId || sending) return;
    setSending(true);
    const content = input.trim();
    setInput("");
    try {
      await sendMessage(activeConvId, userId, content);
    } catch {
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  const handleNewConversation = async () => {
    if (!newEmail.trim() || !userId) return;
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("email", newEmail.trim())
      .single();

    if (!profile) { alert("User not found with that email."); return; }

    const { data: myProfile } = await supabase.from("profiles").select("role").eq("id", userId).single();
    const myRole = myProfile?.role;

    const brandId = myRole === "brand" ? userId : profile.id;
    const creatorId = myRole === "creator" ? userId : profile.id;

    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("brand_id", brandId)
      .eq("creator_id", creatorId)
      .single();

    let convId = existing?.id;
    if (!convId) {
      const { data: newConv } = await supabase
        .from("conversations")
        .insert({ brand_id: brandId, creator_id: creatorId })
        .select("id")
        .single();
      convId = newConv?.id;
    }

    const convs = await getConversations(userId);
    setConversations(convs as unknown as Conversation[]);
    setActiveConvId(convId ?? null);
    setShowNew(false);
    setNewEmail("");
  };

  const getOtherName = (conv: Conversation) => {
    if (!userId) return "Unknown";
    const isBrand = conv.brand_id === userId;
    const other = isBrand ? conv.creator?.[0] : conv.brand?.[0];
    return other?.full_name || other?.email || "Unknown";
  };

  const getOtherId = (conv: Conversation) =>
    conv.brand_id === userId ? conv.creator_id : conv.brand_id;

  const getOtherRole = (conv: Conversation) =>
    conv.brand_id === userId ? "creator" : "brand";

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const filtered = conversations.filter((c) => getOtherName(c).toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-[#7C5CFF] border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-80px)] gap-0 rounded-2xl overflow-hidden border border-white/10">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 glass border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white">Messages</h2>
            <button onClick={() => setShowNew(true)}
              className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
              <Plus size={16} />
            </button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full glass rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#A1A1AA] border border-white/10 focus:border-[#7C5CFF] focus:outline-none" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-[#A1A1AA] text-xs mt-8">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
              No conversations yet.<br />Click + to start one.
            </div>
          ) : (
            filtered.map((conv) => {
              const name = getOtherName(conv);
              return (
                <button key={conv.id} onClick={() => setActiveConvId(conv.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left cursor-pointer ${activeConvId === conv.id ? "bg-[#7C5CFF]/10 border-r-2 border-[#7C5CFF]" : ""}`}>
                  <UserAvatar
                    id={getOtherId(conv)}
                    name={getOtherName(conv)}
                    role={getOtherRole(conv)}
                    size={36}
                    shape="circle"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{name}</p>
                    <p className="text-xs text-[#A1A1AA]">{new Date(conv.updated_at).toLocaleDateString()}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      {activeConvId && activeConv ? (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/10 glass flex items-center gap-3">
            <UserAvatar
              id={getOtherId(activeConv)}
              name={getOtherName(activeConv)}
              role={getOtherRole(activeConv)}
              size={32}
              shape="circle"
            />
            <p className="font-semibold text-white">{getOtherName(activeConv)}</p>
            <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            <AnimatePresence initial={false}>
              {messages.length === 0 && (
                <div className="text-center text-[#A1A1AA] text-sm mt-20">No messages yet. Say hello!</div>
              )}
              {messages.map((msg) => {
                const isMe = msg.sender_id === userId;
                return (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                      isMe
                        ? "bg-gradient-to-br from-[#7C5CFF] to-[#A855F7] text-white rounded-br-sm"
                        : "glass border border-white/10 text-white rounded-bl-sm"
                    }`}>
                      <p>{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? "text-white/60" : "text-[#A1A1AA]"}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10 glass">
            <div className="flex gap-3 items-end">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="Type a message…"
                className="flex-1 glass rounded-xl px-4 py-3 text-sm text-white placeholder-[#A1A1AA] border border-white/10 focus:border-[#7C5CFF] focus:outline-none"
              />
              <button onClick={handleSend} disabled={!input.trim() || sending}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#A855F7] flex items-center justify-center text-white disabled:opacity-40 hover:opacity-90 transition-opacity cursor-pointer flex-shrink-0">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-[#A1A1AA]">
          <MessageSquare size={48} className="mb-4 opacity-20" />
          <p className="text-sm">Select a conversation or start a new one</p>
        </div>
      )}

      {/* New conversation modal */}
      <AnimatePresence>
        {showNew && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowNew(false)} className="fixed inset-0 bg-black/50 z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="glass rounded-2xl border border-white/10 p-6 w-full max-w-sm pointer-events-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">New Conversation</h3>
                  <button onClick={() => setShowNew(false)} className="text-[#A1A1AA] hover:text-white cursor-pointer"><X size={18} /></button>
                </div>
                <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter user email…"
                  onKeyDown={(e) => e.key === "Enter" && handleNewConversation()}
                  className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-[#A1A1AA] border border-white/10 focus:border-[#7C5CFF] focus:outline-none mb-4" />
                <button onClick={handleNewConversation}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#A855F7] text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer">
                  Start Conversation
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
