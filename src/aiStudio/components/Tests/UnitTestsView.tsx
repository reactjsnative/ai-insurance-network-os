import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Play,
  ShieldCheck,
  Award,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { runAllUnitTests, TestCaseResult } from '../../rules/unitTests';

export const UnitTestsView: React.FC = () => {
  const { rules } = useApp();
  const [suiteResult, setSuiteResult] = useState(() => runAllUnitTests(rules));
  const [filter, setFilter] = useState<'ALL' | 'PASSED' | 'FAILED'>('ALL');

  const handleRunTests = () => {
    const res = runAllUnitTests(rules);
    setSuiteResult(res);
  };

  const { totalTests, passedCount, failedCount, results } = suiteResult;
  const passRate = totalTests > 0 ? Math.round((passedCount / totalTests) * 100) : 100;

  const filteredTests = results.filter(t => {
    if (filter === 'PASSED') return t.passed;
    if (filter === 'FAILED') return !t.passed;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="bg-sky-50/90 border border-sky-100/60 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            ระบบทดสอบความถูกต้องของสูตร (Automated Boundary Unit Tests)
          </h1>
          <p className="text-xs text-slate-700 mt-1">
            ทดสอบเงื่อนไขขอบเขต 14,999 vs 15,000, 29,999 vs 30,000, 59,999 vs 60,000 และกรณีตัวอย่างตามประกาศ 15 ม.ค. 2564
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunTests}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-900 shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>รันการทดสอบทั้งหมด</span>
          </button>
        </div>
      </div>

      {/* Summary Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <div className="bg-sky-50/90 border border-sky-100/60 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-700">ชุดทดสอบทั้งหมด</span>
            <div className="text-xl font-black text-slate-900">{totalTests} เคส</div>
          </div>
        </div>

        <div className="bg-sky-50/90 border border-sky-100/60 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-700">ผ่านเกณฑ์ (Passed)</span>
            <div className="text-xl font-black text-emerald-400">{passedCount} เคส</div>
          </div>
        </div>

        <div className="bg-sky-50/90 border border-sky-100/60 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-700">ไม่ผ่าน (Failed)</span>
            <div className="text-xl font-black text-rose-400">{failedCount} เคส</div>
          </div>
        </div>

        <div className="bg-sky-50/90 border border-sky-100/60 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-600/10 text-blue-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-700">อัตราความถูกต้อง</span>
            <div className="text-xl font-black text-blue-600">{passRate}%</div>
          </div>
        </div>

      </div>

      {/* Filter Tabs & Test Cases Table */}
      <div className="bg-sky-50/90 border border-sky-100/60 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">รายการทดสอบขอบเขต (Boundary Test Matrix)</h2>

          <div className="flex bg-sky-100 rounded-xl p-1 border border-sky-100/60 text-xs">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filter === 'ALL' ? 'bg-blue-600 text-slate-900' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              ทั้งหมด ({totalTests})
            </button>
            <button
              onClick={() => setFilter('PASSED')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filter === 'PASSED' ? 'bg-emerald-600 text-slate-900' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              ผ่าน ({passedCount})
            </button>
            <button
              onClick={() => setFilter('FAILED')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filter === 'FAILED' ? 'bg-rose-600 text-slate-900' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              ไม่ผ่าน ({failedCount})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-sky-100 text-slate-700 border-b border-sky-100/60">
                <th className="py-2.5 px-3">สถานะ</th>
                <th className="py-2.5 px-3">รหัสและชื่อชุดทดสอบ</th>
                <th className="py-2.5 px-3">หมวดหมู่</th>
                <th className="py-2.5 px-3">อินพุต</th>
                <th className="py-2.5 px-3 text-right">ค่าที่คาดหวัง</th>
                <th className="py-2.5 px-3 text-right">ค่าที่คำนวณได้</th>
                <th className="py-2.5 px-3">คำอธิบาย</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTests.map(test => (
                <tr key={test.id} className="hover:bg-sky-100/40">
                  <td className="py-3 px-3">
                    {test.passed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> PASSED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-700">
                        <XCircle className="w-3 h-3 text-rose-400" /> FAILED
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900">{test.testName}</p>
                    <span className="font-mono text-[10px] text-slate-700">{test.id}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[11px] text-slate-700 bg-sky-100 px-2 py-0.5 rounded border border-sky-100/60">
                      {test.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                    {test.input}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                    {test.expected}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-blue-600">
                    {test.actual}
                  </td>
                  <td className="py-3 px-3 text-slate-700 text-[11px]">
                    {test.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
