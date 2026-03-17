/**
 * 風格 1：原版參考 - 漸層橫幅、圓照、雙按鈕；有填寫才顯示各區塊
 */
import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Phone, Lightbulb, Crown, MapPin, Quote, Award, GraduationCap, Heart, Plane, ExternalLink } from "lucide-react";
import { DEMO_AGENT, buildVCardData, getDemoPhoto, getDemoIntro, type DemoAgentCard } from "./aboutTeamDemoData";

function downloadVCard(agent: DemoAgentCard) {
  const vcard = buildVCardData(agent);
  const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${agent.name}_名片.vcf`;
  a.click();
  URL.revokeObjectURL(url);
}

interface AboutTeamStyle1Props {
  /** 未提供時使用 Demo 資料 */
  agent?: DemoAgentCard;
}

export default function AboutTeamStyle1({ agent: agentProp }: AboutTeamStyle1Props) {
  const a = agentProp ?? DEMO_AGENT;
  const photo = getDemoPhoto(a);
  const intro = getDemoIntro(a);
  const [photoIndex, setPhotoIndex] = useState(0);
  const photos = (a.photos && a.photos.length > 0) ? a.photos : (photo ? [photo] : []);
  const currentPhoto = photos[photoIndex] || photo;

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative overflow-hidden">
        <Link href={agentProp ? "/about" : "/demo/about-team"}>
          <a className="absolute top-4 left-4 z-20 flex items-center gap-1 text-white/90 text-sm hover:text-white">
            <ArrowLeft className="w-4 h-4" /> {agentProp ? "返回關於我們" : "返回 Demo 列表"}
          </a>
        </Link>

        <div className="h-24 sm:h-28 bg-gradient-to-br from-blue-600 via-blue-500 to-teal-400 rounded-b-[2rem] relative shadow-inner">
          <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
          <div className="absolute bottom-4 left-4 w-32 h-32 bg-teal-200/20 rounded-full blur-2xl" />
        </div>

        {/* 左：放大照片＋姓名職稱；右：五大服務優勢 */}
        <div className="px-6 -mt-2 flex flex-col sm:flex-row gap-6 sm:gap-8">
          <div className="flex flex-col items-center sm:items-start shrink-0">
            {currentPhoto ? (
              <div className="relative">
                <img
                  src={currentPhoto}
                  alt={a.name}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow-xl object-cover bg-white"
                />
                {photos.length > 1 && (
                  <div className="flex justify-center gap-1 mt-2">
                    {photos.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`w-2 h-2 rounded-full ${i === photoIndex ? "bg-primary" : "bg-gray-300"}`}
                        onClick={() => setPhotoIndex(i)}
                        aria-label={`第 ${i + 1} 張`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow-xl bg-slate-200 flex items-center justify-center">
                <span className="text-4xl font-bold text-slate-400">{a.name?.slice(0, 1) || "?"}</span>
              </div>
            )}
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 mt-3 text-center sm:text-left">
              {a.name}
            </h1>
            {a.title && <p className="text-sm text-gray-500 font-medium mt-0.5 text-center sm:text-left">{a.title}</p>}
            {(a.storeName || a.storeSub) && (
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 text-center sm:text-left">
                <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                {[a.storeName, a.storeSub].filter(Boolean).join(" | ")}
              </p>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-gray-700 mb-2">五大服務優勢</h2>
            {(a.serviceAdvantages && a.serviceAdvantages.filter(Boolean).length > 0) ? (
              <ul className="space-y-2">
                {a.serviceAdvantages.filter(Boolean).map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">尚未填寫服務優勢</p>
            )}
          </div>
        </div>

        <div className="px-6 mt-6 flex justify-center gap-3 flex-wrap">
            {a.phone && (
              <a
                href={`tel:${a.phone}`}
                className="flex-1 min-w-[120px] bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-teal-500/30 hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" /> 一鍵撥打
              </a>
            )}
            {(a.lineUrl || a.lineId) && (
              <a
                href={a.lineUrl || `https://line.me/ti/p/~${a.lineId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[120px] bg-[#06C755] text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-green-500/30 hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                <span className="text-xl">LINE</span> 加 LINE 聊聊
              </a>
            )}
          </div>

        {intro && (
          <div className="px-6 mt-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-blue-100 text-blue-600 p-2 rounded-lg"><Lightbulb className="w-4 h-4" /></span>
              <h2 className="text-lg font-bold text-gray-800">為什麼找我？</h2>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <p className="text-gray-700 text-sm font-medium leading-relaxed whitespace-pre-line">{intro}</p>
            </div>
            {a.tags && a.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {a.tags.map((tag) => (
                  <span key={tag} className="bg-white border border-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-full font-bold shadow-sm">{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {a.motto && (
          <div className="px-6 mt-6">
            <div className="flex items-center gap-2 mb-2">
              <Quote className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-gray-800">座右銘</h2>
            </div>
            <p className="text-gray-600 text-sm italic">「{a.motto}」</p>
          </div>
        )}

        {(a.licenses?.length || a.license) && (
          <div className="px-6 mt-6">
            <h2 className="text-sm font-bold text-gray-800 mb-2">執照</h2>
            <div className="space-y-2">
              {(a.licenses && a.licenses.length > 0 ? a.licenses : [{ text: a.license! }]).map((lic, i) => (
                <div key={i} className="flex gap-2 items-center text-sm text-gray-700">
                  {lic.imageUrl && <img src={lic.imageUrl} alt="" className="w-12 h-12 rounded object-cover" />}
                  <span>{lic.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {a.storeLinks && a.storeLinks.length > 0 && (
          <div className="px-6 mt-6">
            <h2 className="text-sm font-bold text-gray-800 mb-2">店鋪／平台</h2>
            <div className="flex flex-wrap gap-2">
              {a.storeLinks.filter((s) => s.url?.trim()).map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 text-slate-800 text-sm font-medium hover:bg-slate-200">
                  {s.name || "店鋪"} <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>
        )}

        {a.transactionHistory && (
          <div className="px-6 mt-6">
            <h2 className="text-sm font-bold text-gray-800 mb-1">歷史成交紀錄</h2>
            <p className="text-gray-600 text-sm">{a.transactionHistory}</p>
          </div>
        )}

        {a.awards && (
          <div className="px-6 mt-6">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-gray-800">得獎紀錄</h2>
            </div>
            <p className="text-gray-600 text-sm">{a.awards}</p>
          </div>
        )}

        {a.education && Object.values(a.education).some(Boolean) && (
          <div className="px-6 mt-6">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-bold text-gray-800">學歷</h2>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              {a.education.elementary && <li>國小：{a.education.elementary}</li>}
              {a.education.juniorHigh && <li>國中：{a.education.juniorHigh}</li>}
              {a.education.highSchool && <li>高中：{a.education.highSchool}</li>}
              {a.education.university && <li>大學：{a.education.university}{a.education.department ? ` · ${a.education.department}` : ""}</li>}
              {a.education.graduateSchool && <li>研究所：{a.education.graduateSchool}</li>}
            </ul>
          </div>
        )}

        {a.interests && (
          <div className="px-6 mt-6">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-bold text-gray-800">興趣與休閒</h2>
            </div>
            <p className="text-gray-600 text-sm">{a.interests}</p>
          </div>
        )}

        {a.religion && (
          <div className="px-6 mt-6">
            <h2 className="text-sm font-bold text-gray-800 mb-1">宗教</h2>
            <p className="text-gray-600 text-sm">{a.religion}</p>
          </div>
        )}

        {a.travelNotes && (
          <div className="px-6 mt-6">
            <div className="flex items-center gap-2 mb-1">
              <Plane className="w-4 h-4 text-teal-500" />
              <h2 className="text-sm font-bold text-gray-800">旅遊心得</h2>
            </div>
            <p className="text-gray-600 text-sm whitespace-pre-line">{a.travelNotes}</p>
          </div>
        )}

        {a.workExperience && a.workExperience.length > 0 && (
          <div className="px-6 mt-6">
            <h2 className="text-sm font-bold text-gray-800 mb-2">工作經歷</h2>
            <ul className="text-sm text-gray-600 space-y-2">
              {a.workExperience.map((we, i) => (
                <li key={i} className="flex flex-wrap gap-x-2 gap-y-0">
                  {we.company && <span className="font-medium">{we.company}</span>}
                  {we.title && <span>{we.title}</span>}
                  {we.period && <span className="text-gray-500">{we.period}</span>}
                  {we.desc && <span className="text-gray-500">· {we.desc}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {a.serviceAdvantages && a.serviceAdvantages.filter(Boolean).length > 0 && (
          <div className="px-6 mt-6">
            <h2 className="text-sm font-bold text-gray-800 mb-2">五大服務優勢</h2>
            <div className="flex flex-wrap gap-2">
              {a.serviceAdvantages.filter(Boolean).map((s, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}

        {a.other && (
          <div className="px-6 mt-6">
            <h2 className="text-sm font-bold text-gray-800 mb-1">其他</h2>
            <p className="text-gray-600 text-sm whitespace-pre-line">{a.other}</p>
          </div>
        )}

        {a.ytChannelUrl && (
          <div className="px-6 mt-6">
            <a href={a.ytChannelUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600">
              <span className="text-lg">YT</span> YouTube 頻道
            </a>
          </div>
        )}

        {a.featuredListings && a.featuredListings.length > 0 && (
          <div className="px-6 mt-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-amber-100 text-amber-600 p-2 rounded-lg"><Crown className="w-4 h-4" /></span>
              <h2 className="text-lg font-bold text-gray-800">精選 A 級好案</h2>
            </div>
            <div className="space-y-4">
              {a.featuredListings.map((item) => (
                <div key={item.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex">
                  <div className="w-2/5 relative overflow-hidden">
                    <img src={item.image} alt="" className="w-full h-full object-cover min-h-[90px]" />
                    {item.tag && (
                      <span className={`absolute top-2 left-2 ${item.tagColor || "bg-red-500"} text-white text-[10px] font-bold px-2 py-1 rounded`}>{item.tag}</span>
                    )}
                  </div>
                  <div className="p-3 w-3/5 flex flex-col justify-center">
                    <h3 className="font-bold text-gray-800 text-sm line-clamp-2">{item.title}</h3>
                    <p className="text-red-500 font-black text-lg mt-2">{item.price} <span className="text-xs text-gray-500 font-normal">{item.priceUnit}</span></p>
                    <p className="text-[11px] text-gray-500 mt-1 bg-gray-50 inline-block px-1 rounded w-fit">{item.specs}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 p-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] z-40">
          <button type="button" onClick={() => downloadVCard(a)} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 text-lg hover:bg-gray-800 transition-colors">
            📇 存入手機聯絡人
          </button>
        </div>
      </div>
    </div>
  );
}
