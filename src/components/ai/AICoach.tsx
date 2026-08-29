import React, { useState, useRef, useEffect } from 'react';
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
  const { activeUser, members, activePlan, getDownlineStats } = useApp();

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

  return (
    <div id="ai_coach_view" className="space-y-6 max-w-7xl mx-auto pb-16 text-left">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-slate-100 shadow-lg shadow-indigo-500/30">
              <Brain className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100">
              AI Organization Coach & Leadership Intelligence
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            ที่ปรึกษาปัญญาประดิษฐ์วิเคราะห์สายงานตามหลักคณิตศาสตร์ประกันชีวิตและ Compensation Rule Engine
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-semibold self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>AI Coach Online</span>
        </div>
      </div>

      {/* 2. Automated Smart Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Award className="w-4 h-4" />
            <span>Promotion Candidate Alert</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-slate-100">ยังไม่มีข้อมูล</strong> สมาชิกที่เข้าเกณฑ์เลื่อนตำแหน่งจะปรากฏที่นี่เมื่อสมัครเข้าใช้งาน
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Retention Risk Alert</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-slate-100">ยังไม่มีข้อมูล</strong> การแจ้งเตือนความเสี่ยงด้าน Retention จะปรากฏที่นี่เมื่อมีสมาชิกในระบบ
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <span>Top Performing Cluster</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-slate-100">ยังไม่มีข้อมูล</strong> หน่วยงานที่มีผลงานโดดเด่นจะปรากฏที่นี่เมื่อมีสมาชิกในระบบ
          </p>
        </div>
      </div>

      {/* 3. Interactive AI Chat Console */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-col h-[520px] overflow-hidden">
        {/* Chat Messages Log */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-slate-100 flex items-center justify-center shrink-0 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-1 ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                <div className={`text-[9px] mt-1 ${msg.sender === 'user' ? 'text-slate-900/70 text-right' : 'text-slate-500'}`}>
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <img
                  src={activeUser.avatarUrl}
                  alt={activeUser.name}
                  className="w-8 h-8 rounded-xl object-cover shrink-0 border border-amber-500/50"
                />
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-slate-100 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl rounded-tl-none p-4 text-xs text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
                <span>AI กำลังประมวลผลข้อมูลองค์กร...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] uppercase font-bold text-slate-500 whitespace-nowrap pl-2">หัวข้อยอดนิยม:</span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              disabled={loading}
              className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs whitespace-nowrap transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="พิมพ์คำถามเกี่ยวกับการบริหารทีม, รายได้, หรือกลยุทธ์..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || loading}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
          >
            <Send className="w-4 h-4" />
            <span>ส่ง</span>
          </button>
        </div>
      </div>
    </div>
  );
};
