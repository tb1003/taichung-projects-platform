/**
 * 風格 8：時間軸 - 垂直動線、從上到下
 */
import { Link } from "wouter";
import { ArrowLeft, Phone, MessageCircle, ChevronDown, Lightbulb } from "lucide-react";
import { DEMO_AGENT, buildVCardData, getDemoPhoto, getDemoIntro, type DemoAgentCard } from "./aboutTeamDemoData";
import AgentCardFullFields from "./AgentCardFullFields";

function downloadVCard(agent: DemoAgentCard) {
  const blob = new Blob([buildVCardData(agent)], { type: "text/vcard;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${agent.name}_名片.vcf`;
  a.click();
  URL.revokeObjectURL(a.href);
}

interface AboutTeamStyle8Props { agent?: DemoAgentCard }
export default function AboutTeamStyle8({ agent: agentProp }: AboutTeamStyle8Props) {
  const a = agentProp ?? DEMO_AGENT;
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-md mx-auto px-4 py-8">
        <Link href={agentProp ? "/about" : "/demo/about-team"}>
          <a className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> {agentProp ? "返回關於我們" : "返回 Demo 列表"}
          </a>
        </Link>

        <div className="relative pl-6 border-l-2 border-slate-200 space-y-8">
          {/* 節點：頭像＋姓名職稱；右：五大服務優勢 */}
          <div className="relative">
            <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-primary border-4 border-white shadow" />
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col items-center sm:items-start shrink-0">
                {getDemoPhoto(a) && <img src={getDemoPhoto(a)} alt={a.name} className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover" />}
                {!getDemoPhoto(a) && (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-100 flex items-center justify-center">
                    <span className="text-2xl font-bold text-slate-400">{a.name?.slice(0, 1) || "?"}</span>
                  </div>
                )}
                <h1 className="text-xl font-bold text-slate-900 mt-2 text-center sm:text-left">{a.name}</h1>
                <p className="text-slate-500 text-sm mt-0.5 text-center sm:text-left">{a.title} · {a.storeName}</p>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-slate-800 mb-2">五大服務優勢</h2>
                {(a.serviceAdvantages && a.serviceAdvantages.filter(Boolean).length > 0) ? (
                  <ul className="space-y-2">
                    {a.serviceAdvantages.filter(Boolean).map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">尚未填寫服務優勢</p>
                )}
              </div>
            </div>
          </div>

          <div className="absolute -left-6 top-1/2 w-4 h-4 rounded-full bg-slate-300 border-4 border-white" style={{ top: "calc(50% + 1rem)" }} />
          {/* 節點：聯絡 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex gap-3">
              <a href={`tel:${a.phone}`} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 text-white text-sm font-medium">
                <Phone className="w-4 h-4" /> 撥打
              </a>
              <a href={a.lineUrl || `https://line.me/ti/p/~${a.lineId}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#06C755] text-white text-sm font-medium">
                <MessageCircle className="w-4 h-4" /> LINE
              </a>
            </div>
          </div>

          <div className="absolute -left-6 w-4 h-4 rounded-full bg-amber-400 border-4 border-white" style={{ top: "calc(100% - 2rem)" }} />
          {/* 節點：為什麼找我 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-800">為什麼找我</h2>
            </div>
            {getDemoIntro(a) && <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{getDemoIntro(a)}</p>}
            <div className="flex flex-wrap gap-2 mt-3">
              {(a.tags || a.serviceAdvantages || []).filter(Boolean).map((t, i) => (
                <span key={i} className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">{String(t)}</span>
              ))}
            </div>
          </div>
          <AgentCardFullFields agent={a} variant="light" />

          {/* CTA */}
          <div className="flex justify-center pt-2">
            <ChevronDown className="w-5 h-5 text-slate-300" />
          </div>
          <button type="button" onClick={() => downloadVCard(a)} className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold shadow-lg hover:bg-slate-800 flex items-center justify-center gap-2">
            📇 存入手機聯絡人
          </button>
        </div>
      </div>
    </div>
  );
}
