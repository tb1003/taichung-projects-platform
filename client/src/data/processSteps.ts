/**
 * 房產工具流程步驟：賣屋、出售土地、貸款評估
 * 供 ToolItemDetail 與各 demo 頁面共用
 */
export interface ProcessStepItem {
  title: string;
  detail: string;
}

export interface ProcessStep {
  id: string;
  title: string;
  summary?: string;
  children: ProcessStepItem[];
}

export const sellingProcessSteps: ProcessStep[] = [
  {
    id: "before",
    title: "售屋前",
    summary: "在正式委託或自售前，先釐清自身條件與市場行情，並備齊文件，可減少後續糾紛、加速成交。",
    children: [
      { title: "價格評估", detail: "透過實價登錄、同社區成交案或請房仲估價，掌握合理區間。訂價過高會拉長銷售期，過低則損及權益。" },
      { title: "委託仲介或自行銷售", detail: "委託房仲可省去帶看與議價時間，但需支付服務報酬；自售則需自行處理行銷、帶看與契約，適合有經驗的屋主。" },
      { title: "準備資料", detail: "權狀、稅單、謄本、若曾裝修可備照片或保固書。資料齊全可提升買方信任，也有利於仲介或代書作業。" },
    ],
  },
  {
    id: "during",
    title: "銷售中",
    summary: "從帶看到簽約、用印與完稅，每個環節都關係到契約效力與稅負，務必確認內容再簽名。",
    children: [
      { title: "帶看屋與議價", detail: "維持屋況整潔、採光通風良好，有助於留下好印象。議價時可參考斡旋金或要約書的約定，避免口頭承諾造成爭議。" },
      { title: "簽訂買賣契約", detail: "買賣契約書與重要事項說明書須逐項確認，審閱期內可請律師或代書協助。簽約後雙方即受拘束，違約可能有違約金責任。" },
      { title: "用印與完稅", detail: "雙方用印後契約成立。賣方需依約申報並繳納土地增值稅、契稅等；完稅證明是過戶要件之一。" },
    ],
  },
  {
    id: "handover",
    title: "交屋",
    summary: "產權移轉與點交、尾款結清是賣屋最後一哩路，確認無誤再交付鑰匙與權狀，保障雙方權益。",
    children: [
      { title: "點交房屋", detail: "依約定日會同買方清點設備、水電瓦斯與屋況，若有附贈家具或設備可列清單雙方簽認，避免交屋後爭議。" },
      { title: "產權移轉", detail: "由地政士辦理所有權移轉登記，買方取得新權狀後，賣方即完成產權交付義務。" },
      { title: "尾款支付", detail: "通常於過戶完成或點交時由買方支付尾款；若有代償貸款或代墊款項，須一併結算清楚。" },
    ],
  },
];

export const landSellingProcessSteps: ProcessStep[] = [
  {
    id: "prep",
    title: "售前準備",
    summary: "土地買賣牽涉權屬、鑑價與銷售管道，事前準備周全可提高買方信任並加速成交。",
    children: [
      { title: "土地鑑價", detail: "委託不動產估價師或參考鄰地交易、公告現值與市價，掌握合理行情。土地無建物，買方多會評估開發或持有成本，鑑價有助於訂價與議價。" },
      { title: "確認土地權狀", detail: "確認權狀記載之地號、面積、使用分區與權屬是否正確。若有共有、抵押或租賃，須一併釐清，避免交易後產生爭議。" },
      { title: "選擇銷售管道", detail: "可委託房仲、土地仲介或透過代書介紹買方。依土地類型（建地、農地、工業地等）選擇熟悉該類型的管道，較易找到合適買家。" },
    ],
  },
  {
    id: "execute",
    title: "交易執行",
    summary: "從洽談、簽約到稅務處理，每一環節都影響雙方權利義務，建議由專業代書協助把關。",
    children: [
      { title: "洽談與議價", detail: "土地交易常涉及總價、付款期數與過戶時點。賣方須確認買方資金來源與履約能力，必要時可約定履約保證或分期付款方式。" },
      { title: "簽訂買賣契約", detail: "契約應載明土地標示、價金、付款方式、過戶時點與違約責任。農地或特殊用地須注意法令限制（如農地農用、國土計畫等）。" },
      { title: "稅務處理", detail: "賣方可能涉及土地增值稅；買方則有契稅、印花稅等。雙方可約定由誰負擔，並依約申報。若適用重購退稅，須符合自用等條件。" },
    ],
  },
  {
    id: "transfer",
    title: "過戶與收款",
    summary: "過戶登記完成後產權移轉，配合款項收取與權狀交付，即完成土地出售。",
    children: [
      { title: "辦理過戶登記", detail: "由地政士備齊契約、稅單與權狀等，向地政事務所申辦所有權移轉登記。登記完成後，買方為新所有權人。" },
      { title: "收取款項", detail: "依契約約定之付款期程收取價金。實務上常見簽約款、用印款、完稅款與尾款，尾款多於過戶或點交時結清。" },
      { title: "交付土地權狀", detail: "過戶完成後，新權狀通常由地政事務所核發予買方或地政士轉交。賣方須交付舊權狀（若尚未繳回）並確認無其他保留事項。" },
    ],
  },
];

export const loanProcessSteps: ProcessStep[] = [
  {
    id: "apply",
    title: "申請階段",
    summary: "選定貸款機構、備齊資料並送出申請，是核貸的起點；準備越完整，審核越順暢。",
    children: [
      { title: "選擇貸款機構", detail: "可比較銀行、信用合作社或政策性貸款（如新青安、公教築巢優利貸）的成數、利率與寬限期。首購或特定身分可留意政府補貼方案。" },
      { title: "準備申請資料", detail: "通常需身分證明、收入證明（薪轉、扣繳憑單）、財產與負債資料、買賣契約或權狀。自營商可能需報稅資料或營業登記。" },
      { title: "提交申請", detail: "向選定的金融機構提出房貸申請，填寫申請書並檢附所需文件。可同時向 2～3 家申請比較條件，但注意聯徵查詢次數不宜過多。" },
    ],
  },
  {
    id: "review",
    title: "審核階段",
    summary: "銀行會從還款能力、擔保品價值與信用狀況三方面評估，通過後才會進入核貸與撥款。",
    children: [
      { title: "銀行內部審核", detail: "銀行依內部規範審查收支比、負債比與職業穩定性。名下有其他房貸或信用管制（如二戶限貸）會影響成數與利率。" },
      { title: "鑑價作業", detail: "銀行會委託估價師或依內部標準對擔保不動產鑑價，核貸成數多以鑑價結果為準，未必等於買賣價。若鑑價偏低，可能需補足自備款或另尋方案。" },
      { title: "徵信調查", detail: "透過聯徵中心查詢信用紀錄、既有貸款與繳款情形。信用分數與無逾期紀錄有助於取得較佳條件；若有遲繳或負面註記，可先釐清並改善後再申貸。" },
    ],
  },
  {
    id: "disburse",
    title: "核貸與撥款",
    summary: "收到核貸通知後，完成對保、簽約與抵押權設定，銀行即會依約撥款，買方即可支付賣方。",
    children: [
      { title: "通知核貸結果", detail: "銀行以書面或簡訊通知核貸金額、利率、年限與寬限期等條件。申請人確認無誤後，再進行對保與簽約。" },
      { title: "對保與簽約", detail: "與銀行約定對保時間，確認契約內容後簽署借據與撥款委託書。對保時須攜帶身分證明與印章，若為共同借款或保證人須一同到場。" },
      { title: "設定抵押權", detail: "銀行會向地政機關辦理抵押權設定登記，擔保品即成為貸款之抵押。設定完成後，銀行取得他項權利證明書。" },
      { title: "撥款", detail: "依契約約定，銀行將款項撥入賣方帳戶或履約專戶。撥款日即起息日，之後依約定方式（本息攤還或本金攤還）按月繳款。" },
    ],
  },
];

/** 依站內流程連結路徑取得步驟（用於詳情頁左圖右流程） */
export const PROCESS_STEPS_BY_HREF: Record<string, ProcessStep[]> = {
  "/demo/selling-process": sellingProcessSteps,
  "/demo/land-selling-process": landSellingProcessSteps,
  "/demo/loan-process": loanProcessSteps,
};

export function getProcessStepsForHref(href: string | undefined): ProcessStep[] | null {
  if (!href?.trim()) return null;
  let path = href.trim().replace(/^https?:\/\/[^/]+/, "").replace(/\/$/, "") || "";
  if (path && !path.startsWith("/")) path = "/" + path;
  return PROCESS_STEPS_BY_HREF[path] ?? null;
}
