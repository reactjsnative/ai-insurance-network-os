import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Award, 
  Lightbulb, 
  RotateCcw,
  CheckCircle2,
  Brain
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AICoach: React.FC = () => {
  const { activeUser, members, activePlan, positions, getDownlineStats } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `สวัสดีครับคุณ ${activeUser.name}! ผมคือ **AI Organization Intelligence & Network Coach** พร้อมช่วยคุณวิเคราะห์โครงสร้างสายงาน ตรวจสอบเกณฑ์ผลตอบแทน แนะนำกลยุทธ์การขยายทีม และระบุตัวแทนที่มีศักยภาพเลื่อนตำแหน่งครับ\n\nมีคำถามหรือหัวข้อใดที่ต้องการให้ผมช่วยวิเคราะห์ไหมครับ?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setLoading(true);

    try {
      // Send context to backend /api/ai/chat
      const stats = getDownlineStats(activeUser.id);
      const payloadContext = {
        currentUser: {
          name: activeUser.name,
          code: activeUser.memberCode,
          position: activeUser.positionId,
          personalFYC: activeUser.personalFYC,
          personalCOM: activeUser.personalCOM,
        },
        organizationSummary: {
          totalMembers: members.length,
          downlineCount: stats.totalDownlineCount,
          activeCount: stats.activeDownlineCount,
          totalUnits: stats.totalUnits,
          totalCenters: stats.totalCenters,
          totalFYC: stats.teamFYC + activeUser.personalFYC,
        },
        activePlanVersion: activePlan.code,
      };

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, context: payloadContext }),
      });

      const data = await response.json();
      const aiReplyText = data.reply || 'ขออภัย ระบบไม่สามารถประมวลผลคำตอบได้ในขณะนี้';

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Failed to chat with AI coach:', error);
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'ai',
        text: 'ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'วิเคราะห์โอกาสเลื่อนตำแหน่งของทีมงานในเดือนนี้',
    'ทีมไหนมีความเสี่ยง Retention หลุดเกณฑ์บ้าง?',
    'หากต้องการรายได้ 500,000 บาท/เดือน ต้องวางโครงสร้างอย่างไร?',
    'อธิบายสูตรค่าจัดงานภาค Type 1 และ Type 2 ให้เข้าใจง่าย',
  ];

  // Live insights computed from real member + hierarchy data (no longer hardcoded).
  const insights = useMemo(() => {
    const nextPositionOf = (member: typeof members[number]) => {
      const cur = positions.find((p) => p.id === member.positionId);
      if (!cur) return null;
      const higher = positions.filter((p) => p.level > cur.level);
      higher.sort((a, b) => a.level - b.level);
      return higher[0] || null;
    };

    // 1. Promotion candidates: active members whose team FYC already meets next rank.
    const promotionCandidates = members
      .filter((m) => m.status === 'active')
      .map((m) => {
        const stats = getDownlineStats(m.id);
        const teamFYC = (m.personalFYC || 0) + (stats.teamFYC || 0);
        return { member: m, teamFYC, next: nextPositionOf(m) };
      })
      .filter((c) => c.next && c.teamFYC >= (c.next.qualification.minFyc || 0))
      .sort((a, b) => b.teamFYC - a.teamFYC)
      .slice(0, 3);

    // 2. Retention risk: members who are inactive or on probation.
    const atRisk = members.filter((m) => m.status === 'inactive' || m.status === 'probation');

    // 3. Top performing cluster: members ranked by personal + team FYC.
    const topPerformers = members
      .map((m) => {
        const stats = getDownlineStats(m.id);
        return { member: m, total: (m.personalFYC || 0) + (stats.teamFYC || 0) };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);

    return { promotionCandidates, atRisk, topPerformers };
  }, [members, positions, getDownlineStats]);

  return (
    <div id="ai_coach_view" className="space-y-6 max-w-7xl mx-auto pb-16 text-left">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl bg-[#fcfdff]/90 border border-sky-50/40 shadow-[0_4px_12px_rgba(148,163,184,0.10)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-slate-900 shadow-[0_1px_3px_rgba(148,163,184,0.08)] shadow-indigo-500/30">
              <Brain className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              AI ที่ปรึกษาองค์กรและระบบอัจฉริยะสำหรับผู้นำ
            </h1>
          </div>
          <p className="text-xs text-slate-800 mt-1">
            ที่ปรึกษาปัญญาประดิษฐ์วิเคราะห์สายงานตามหลักคณิตศาสตร์ประกันชีวิตและ Compensation Rule Engine
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-semibold self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>AI โค้ช ออนไลน์</span>
        </div>
      </div>

      {/* 2. Automated Smart Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#fcfdff]/80 border border-sky-50/40 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
            <Award className="w-4 h-4" />
            <span>ผู้มีศักยภาพเลื่อนตำแหน่ง</span>
          </div>
          {insights.promotionCandidates.length === 0 ? (
            <p className="text-xs text-slate-800 leading-relaxed">
              ยังไม่มีสมาชิกที่เข้าเกณฑ์เลื่อนตำแหน่งในขณะนี้ (เกณฑ์อ้างอิงจาก FYC และโครงสร้างสายงาน)
            </p>
          ) : (
            <ul className="space-y-2">
              {insights.promotionCandidates.map((c) => (
                <li key={c.member.id} className="text-xs text-slate-800 leading-relaxed">
                  <strong className="text-blue-600">{c.member.name}</strong> (FYC ทีม ฿{c.teamFYC.toLocaleString()})
                  <span className="text-slate-800 block">
                    ใกล้เลื่อนเป็น {c.next?.name || 'ตำแหน่งถัดไป'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-[#fcfdff]/80 border border-sky-50/40 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
            <AlertTriangle className="w-4 h-4" />
            <span>ความเสี่ยง Retention</span>
          </div>
          {insights.atRisk.length === 0 ? (
            <p className="text-xs text-slate-800 leading-relaxed">
              ไม่พบสมาชิกที่มีความเสี่ยง (ทุกคนอยู่ในสถานะ Active)
            </p>
          ) : (
            <ul className="space-y-2">
              {insights.atRisk.slice(0, 3).map((m) => (
                <li key={m.id} className="text-xs text-slate-800 leading-relaxed">
                  <strong className="text-rose-300">{m.name}</strong>
                  <span className="text-slate-800 block">
                    สถานะ {m.status === 'inactive' ? 'ไม่ Active' : 'ทดลองงาน'} — แนะนำติดตามอย่างใกล้ชิด
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-[#fcfdff]/80 border border-sky-50/40 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <span>สายงานผลงานโดดเด่น</span>
          </div>
          {insights.topPerformers.length === 0 || insights.topPerformers.every((p) => p.total === 0) ? (
            <p className="text-xs text-slate-800 leading-relaxed">
              ยังไม่มีข้อมูลผลงาน — จะแสดงสายงานที่โดดเด่นเมื่อสมาชิกเริ่มมียอด FYC
            </p>
          ) : (
            <ul className="space-y-2">
              {insights.topPerformers.map((p) => (
                <li key={p.member.id} className="text-xs text-slate-800 leading-relaxed">
                  <strong className="text-emerald-300">{p.member.name}</strong> (FYC รวม ฿{p.total.toLocaleString()})
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 3. Interactive AI Chat Console */}
      <div className="rounded-3xl bg-[#fcfdff]/90 border border-sky-50/40 shadow-[0_8px_24px_rgba(148,163,184,0.08)] flex flex-col h-[520px] overflow-hidden">
        {/* Chat Messages Log */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-slate-900 flex items-center justify-center shrink-0 shadow-[0_1px_3px_rgba(148,163,184,0.08)]">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-1 ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-[#fcfdff]/80 border border-sky-50/40 text-slate-800 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                <div className={`text-[9px] mt-1 ${msg.sender === 'user' ? 'text-slate-900/70 text-right' : 'text-slate-800'}`}>
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <img
                  src={activeUser.avatarUrl}
                  alt={activeUser.name}
                  className="w-8 h-8 rounded-xl object-cover shrink-0 border border-blue-600/50"
                />
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-slate-900 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-[#fcfdff]/80 border border-sky-50/40 rounded-2xl rounded-tl-none p-4 text-xs text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
                <span>AI กำลังประมวลผลข้อมูลองค์กร...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="p-3 bg-[#fcfdff]/60 border-t border-sky-50/40/80 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] uppercase font-bold text-slate-800 whitespace-nowrap pl-2">หัวข้อยอดนิยม:</span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              disabled={loading}
              className="px-3 py-1.5 rounded-full bg-[#fcfdff] hover:bg-[#f0f9ff] text-slate-800 border border-sky-50/40/80 text-xs whitespace-nowrap transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-[#fcfdff] border-t border-sky-50/40 flex items-center gap-2">
          <input
            type="text"
            placeholder="พิมพ์คำถามเกี่ยวกับการบริหารทีม, รายได้, หรือกลยุทธ์..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-[#fcfdff] border border-sky-50/40 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-500 focus:outline-none focus:border-blue-600/50"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || loading}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-[0_1px_3px_rgba(148,163,184,0.08)] shadow-amber-500/20"
          >
            <Send className="w-4 h-4" />
            <span>ส่ง</span>
          </button>
        </div>
      </div>
    </div>
  );
};
