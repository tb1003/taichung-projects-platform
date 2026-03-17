/**
 * 風格 9：玻璃擬態 - 半透明、毛玻璃、疊在 Hero 上
 */
import { Link } from "wouter";
import { ArrowLeft, Phone, MessageCircle } from "lucide-react";
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

interface AboutTeamStyle9Props { agent?: DemoAgentCard }
export default function AboutTeamStyle9({ agent: agentProp }: AboutTeamStyle9Props) {
  const a = agentProp ?? DEMO_AGENT;
  return (
    <div className="min-h-screen relative">
      {/* Hero 背景 */}
      <div className="fixed inset-0">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/40" />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4 py-8 min-h-screen flex flex-col">
        <Link href={agentProp ? "/about" : "/demo/about-team"}>
          <a className="inline-flex items-center gap-1 text-sm text-white/90 hover:text-white mb-6 drop-shadow">
            <ArrowLeft className="w-4 h-4" /> {agentProp ? "返回關於我們" : "返回 Demo 列表"}
          </a>
        </Link>

        <div className="flex-1 flex flex-col justify-center">
          <div className="backdrop-blur-xl bg-white/20 rounded-3xl border border-white/30 shadow-2xl overflow-hidden p-6 text-white">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
              <div className="flex flex-col items-center sm:items-start shrink-0">
                {getDemoPhoto(a) && <img src={getDemoPhoto(a)} alt={a.name} className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover ring-4 ring-white/30 shadow-lg" />}
                {!getDemoPhoto(a) && (
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white/10 flex items-center justify-center ring-4 ring-white/20">
                    <span className="text-3xl font-bold text-white/70">{a.name?.slice(0, 1) || "?"}</span>
                  </div>
                )}
                <h1 className="text-xl sm:text-2xl font-bold mt-3 text-center sm:text-left drop-shadow-sm">{a.name}</h1>
                <p className="text-white/90 text-sm mt-0.5 text-center sm:text-left">{a.title}</p>
                <p className="text-white/80 text-xs mt-1 text-center sm:text-left">{a.storeName} · {a.storeSub}</p>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-white/95 mb-2">五大服務優勢</h2>
                {(a.serviceAdvantages && a.serviceAdvantages.filter(Boolean).length > 0) ? (
                  <ul className="space-y-2">
                    {a.serviceAdvantages.filter(Boolean).map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/90">
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-white/50 mt-1.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-white/70">尚未填寫服務優勢</p>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <a href={`tel:${a.phone}`} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white/25 backdrop-blur border border-white/30 font-semibold hover:bg-white/35 transition-colors">
                <Phone className="w-4 h-4" /> 撥打
              </a>
              <a href={a.lineUrl || `https://line.me/ti/p/~${a.lineId}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#06C755] font-semibold hover:opacity-90 border border-white/20">
                <MessageCircle className="w-4 h-4" /> LINE
              </a>
            </div>
            <div className="mt-6 pt-6 border-t border-white/20">
              {getDemoIntro(a) && <p className="text-white/95 text-sm leading-relaxed whitespace-pre-line">{getDemoIntro(a)}</p>}
              <div className="flex flex-wrap gap-2 mt-4">
                {(a.tags || a.serviceAdvantages || []).filter(Boolean).map((t, i) => (
                  <span key={i} className="text-xs text-white/90 bg-white/20 px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm">
                    {String(t)}
                  </span>
                ))}
              </div>
            </div>
            <AgentCardFullFields agent={a} variant="dark" />
            <button type="button" onClick={() => downloadVCard(a)} className="mt-6 w-full py-3.5 rounded-2xl bg-white/25 backdrop-blur border border-white/30 font-semibold hover:bg-white/35 transition-colors">
              存入手機聯絡人
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
