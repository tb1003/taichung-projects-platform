/**
 * 電子名片「有填才顯示」的完整欄位區塊，供各風格共用，確保業務填寫的資料都能顯示
 */
import { Quote, Award, GraduationCap, Heart, Plane, ExternalLink } from "lucide-react";
import type { DemoAgentCard } from "./aboutTeamDemoData";

const text = {
  light: {
    heading: "text-sm font-bold text-slate-800",
    body: "text-slate-600 text-sm",
    bodyMuted: "text-slate-500 text-sm",
    tag: "text-slate-700",
    tagBg: "bg-slate-100",
    link: "text-slate-800 hover:bg-slate-100",
  },
  dark: {
    heading: "text-sm font-bold text-white",
    body: "text-slate-300 text-sm",
    bodyMuted: "text-slate-400 text-sm",
    tag: "text-slate-200",
    tagBg: "bg-white/20",
    link: "text-white hover:bg-white/10",
  },
};

export default function AgentCardFullFields({
  agent: a,
  variant = "light",
}: {
  agent: DemoAgentCard;
  variant?: "light" | "dark";
}) {
  const t = text[variant];
  const hasAny =
    a.motto ||
    (a.licenses?.length || a.license) ||
    (a.storeLinks?.length && a.storeLinks.some((s) => s.url?.trim())) ||
    a.transactionHistory ||
    a.awards ||
    (a.education && Object.values(a.education).some(Boolean)) ||
    (a.workExperience && a.workExperience.length > 0) ||
    a.interests ||
    a.religion ||
    a.travelNotes ||
    (a.serviceAdvantages && a.serviceAdvantages.filter(Boolean).length > 0) ||
    a.other ||
    a.ytChannelUrl;
  if (!hasAny) return null;

  return (
    <div className={`space-y-5 mt-6 pt-6 border-t ${variant === "dark" ? "border-white/20" : "border-slate-200"}`}>

      {a.motto && (
        <div>
          <h2 className={`flex items-center gap-2 mb-1 ${t.heading}`}>
            <Quote className="w-4 h-4 text-amber-500" /> 座右銘
          </h2>
          <p className={`${t.body} italic`}>「{a.motto}」</p>
        </div>
      )}

      {(a.licenses?.length || a.license) && (
        <div>
          <h2 className={`mb-2 ${t.heading}`}>執照</h2>
          <div className="space-y-2">
            {(a.licenses?.length ? a.licenses : [{ text: a.license! }]).map((lic, i) => (
              <div key={i} className={`flex gap-2 items-center ${t.body}`}>
                {lic.imageUrl && <img src={lic.imageUrl} alt="" className="w-12 h-12 rounded object-cover" />}
                <span>{lic.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {a.storeLinks && a.storeLinks.filter((s) => s.url?.trim()).length > 0 && (
        <div>
          <h2 className={`mb-2 ${t.heading}`}>店鋪／平台</h2>
          <div className="flex flex-wrap gap-2">
            {a.storeLinks.filter((s) => s.url?.trim()).map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium border ${variant === "dark" ? "border-white/30 text-white hover:bg-white/10" : "bg-slate-100 text-slate-800 hover:bg-slate-200"}`}
              >
                {s.name || "店鋪"} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>
      )}

      {a.transactionHistory && (
        <div>
          <h2 className={`mb-1 ${t.heading}`}>歷史成交紀錄</h2>
          <p className={t.body}>{a.transactionHistory}</p>
        </div>
      )}

      {a.awards && (
        <div>
          <h2 className={`flex items-center gap-2 mb-1 ${t.heading}`}>
            <Award className="w-4 h-4 text-amber-500" /> 得獎紀錄
          </h2>
          <p className={t.body}>{a.awards}</p>
        </div>
      )}

      {a.education && Object.values(a.education).some(Boolean) && (
        <div>
          <h2 className={`flex items-center gap-2 mb-2 ${t.heading}`}>
            <GraduationCap className="w-4 h-4 text-blue-500" /> 學歷
          </h2>
          <ul className={`${t.body} space-y-1`}>
            {a.education.elementary && <li>國小：{a.education.elementary}</li>}
            {a.education.juniorHigh && <li>國中：{a.education.juniorHigh}</li>}
            {a.education.highSchool && <li>高中：{a.education.highSchool}</li>}
            {a.education.university && (
              <li>大學：{a.education.university}{a.education.department ? ` · ${a.education.department}` : ""}</li>
            )}
            {a.education.graduateSchool && <li>研究所：{a.education.graduateSchool}</li>}
          </ul>
        </div>
      )}

      {a.workExperience && a.workExperience.length > 0 && (
        <div>
          <h2 className={`mb-2 ${t.heading}`}>工作經歷</h2>
          <ul className={`${t.body} space-y-2`}>
            {a.workExperience.map((we, i) => (
              <li key={i} className="flex flex-wrap gap-x-2 gap-y-0">
                {we.company && <span className="font-medium">{we.company}</span>}
                {we.title && <span>{we.title}</span>}
                {we.period && <span className={t.bodyMuted}>{we.period}</span>}
                {we.desc && <span className={t.bodyMuted}>· {we.desc}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {a.interests && (
        <div>
          <h2 className={`flex items-center gap-2 mb-1 ${t.heading}`}>
            <Heart className="w-4 h-4 text-rose-500" /> 興趣與休閒
          </h2>
          <p className={t.body}>{a.interests}</p>
        </div>
      )}

      {a.religion && (
        <div>
          <h2 className={`mb-1 ${t.heading}`}>宗教</h2>
          <p className={t.body}>{a.religion}</p>
        </div>
      )}

      {a.travelNotes && (
        <div>
          <h2 className={`flex items-center gap-2 mb-1 ${t.heading}`}>
            <Plane className="w-4 h-4 text-teal-500" /> 旅遊心得
          </h2>
          <p className={`${t.body} whitespace-pre-line`}>{a.travelNotes}</p>
        </div>
      )}

      {a.serviceAdvantages && a.serviceAdvantages.filter(Boolean).length > 0 && (
        <div>
          <h2 className={`mb-2 ${t.heading}`}>五大服務優勢</h2>
          <div className="flex flex-wrap gap-2">
            {a.serviceAdvantages.filter(Boolean).map((s, i) => (
              <span
                key={i}
                className={`px-3 py-1 rounded-full text-xs font-medium ${variant === "dark" ? "bg-white/20 text-slate-200" : "bg-primary/10 text-primary"}`}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {a.other && (
        <div>
          <h2 className={`mb-1 ${t.heading}`}>其他</h2>
          <p className={`${t.body} whitespace-pre-line`}>{a.other}</p>
        </div>
      )}

      {a.ytChannelUrl && (
        <div>
          <a
            href={a.ytChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${variant === "dark" ? "bg-red-500/90 text-white hover:bg-red-500" : "bg-red-500 text-white hover:bg-red-600"}`}
          >
            <span className="text-lg">YT</span> YouTube 頻道
          </a>
        </div>
      )}
    </div>
  );
}
