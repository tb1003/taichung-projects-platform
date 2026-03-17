/**
 * 房產實用工具清單（消費者優先、仲介在後，單一清單三區塊）
 * 連結以政府與常用外部資源為主，可再替換為自製懶人包或站內頁。
 */
export type ToolItem = { label: string; href: string; external?: boolean };

export type ToolBlock = {
  title: string;
  description?: string;
  items: ToolItem[];
};

export const realEstateToolBlocks: ToolBlock[] = [
  {
    title: "買賣前先搞懂",
    description: "成屋與預售流程、稅費概念、委託須知",
    items: [
      { label: "【成屋】買賣流程", href: "https://pip.moi.gov.tw/", external: true },
      { label: "【預售屋】買賣流程", href: "https://pip.moi.gov.tw/", external: true },
      { label: "買房要繳什麼稅？重購退稅懶人包", href: "https://www.etax.nat.gov.tw/etaxmain/etax/etax113/113landvalue", external: true },
      { label: "屋主委託流程", href: "/about", external: false },
    ],
  },
  {
    title: "查行情與區域",
    description: "實價、學區、重劃區、生活資訊",
    items: [
      { label: "內政部實價登錄查詢", href: "https://lvr.land.moi.gov.tw/", external: true },
      { label: "台中市政府教育局學區查詢", href: "https://www.tc.edu.tw/mobile/", external: true },
      { label: "台中重劃區地圖與細部計畫", href: "https://urban.taichung.gov.tw/", external: true },
      { label: "台中公辦重劃區介紹", href: "https://www.ud.taichung.gov.tw/", external: true },
      { label: "台中自辦重劃區介紹", href: "https://www.ud.taichung.gov.tw/", external: true },
      { label: "Google 地球", href: "https://earth.google.com/web/", external: true },
      { label: "台中垃圾清運即時查詢", href: "https://campaign.epb.taichung.gov.tw/garbage/", external: true },
    ],
  },
  {
    title: "查證與進階工具",
    description: "稅費試算、圖資、建照、地質",
    items: [
      { label: "土地增值稅試算", href: "https://www.etax.nat.gov.tw/etwmain/etw158w/51", external: true },
      { label: "前次移轉現值查詢", href: "https://www.etax.nat.gov.tw/etwmain/online-service/tax-pre-calculation/house-land-transfer-tax", external: true },
      { label: "158 空間資訊網（土地使用分區、地號）", href: "https://lohas.taichung.gov.tw/lohas/", external: true },
      { label: "建築物地籍套繪查詢（建蔽、總樓高）", href: "https://mcgbm.taichung.gov.tw/", external: true },
      { label: "國土規劃地理資訊圖台", href: "https://maps.nlsc.gov.tw/", external: true },
      { label: "審議圖（新大樓平面、外觀）", href: "https://mcgbm.taichung.gov.tw/", external: true },
      { label: "建築執照存根查詢", href: "https://mcgbm.taichung.gov.tw/", external: true },
      { label: "內政部戶政司（門牌、鄰里）", href: "https://www.ris.gov.tw/app/portal/3053", external: true },
      { label: "土壤液化潛勢查詢", href: "https://www.liquid.net.tw/cgs/public/", external: true },
      { label: "中央地質調查所斷層查詢", href: "https://faultgis.gsmma.gov.tw/gis/", external: true },
      { label: "國土測繪圖資服務雲", href: "https://maps.nlsc.gov.tw/", external: true },
    ],
  },
];
