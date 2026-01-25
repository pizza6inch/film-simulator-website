// 運費計價配置檔
// 可擴充廠商、地區、重量級距

export interface Vendor {
  id: string;
  name: string;
}

export interface Region {
  id: string;
  name: string;
  parentRegion?: string; // 用於子地區（如北→北需細選）
  subRegions?: SubRegion[];
}

export interface SubRegion {
  id: string;
  name: string;
}

export interface WeightTier {
  maxWeight: number; // kg, use Infinity for "以上"
  price: number;
}

// 通用重量級距（≤300kg，不分地區）
export interface UniversalPricing {
  maxWeight: number; // 適用的最大重量
  tiers: WeightTier[];
}

// 北→北 總價制
export interface NorthToNorthPricing {
  type: "fixed";
  subRegions: {
    [subRegionId: string]: {
      tiers: WeightTier[];
    };
  };
}

// 北→中、北→南 每噸單價制
export interface PerTonPricing {
  type: "perTon";
  tiers: {
    weight: number; // kg
    pricePerTon: number;
  }[];
}

export type RegionalPricing = NorthToNorthPricing | PerTonPricing;

export interface VendorPricing {
  vendorId: string;
  universal: UniversalPricing;
  regional: {
    [regionId: string]: RegionalPricing;
  };
}

// ========== 配置資料 ==========

export const vendors: Vendor[] = [{ id: "vendor_a", name: "富湘" }];

export const regions: Region[] = [
  {
    id: "north_to_north",
    name: "北 → 北",
    subRegions: [
      { id: "keelung", name: "基隆" },
      { id: "taipei", name: "台北市" },
      { id: "new_taipei_hsinchu", name: "新北 / 新竹" },
      { id: "taoyuan", name: "桃園" },
    ],
  },
  { id: "north_to_central", name: "北 → 中" },
  { id: "north_to_south", name: "北 → 南" },
];

export const vendorPricing: VendorPricing[] = [
  {
    vendorId: "vendor_a",
    // 通用重量級距（≤300kg）
    universal: {
      maxWeight: 300,
      tiers: [
        { maxWeight: 100, price: 700 },
        { maxWeight: 200, price: 800 },
        { maxWeight: 300, price: 1200 },
      ],
    },
    regional: {
      // 北→北 總價制
      north_to_north: {
        type: "fixed",
        subRegions: {
          keelung: {
            tiers: [
              { maxWeight: 2000, price: 2000 },
              { maxWeight: 5500, price: 2600 },
              { maxWeight: 7500, price: 3200 },
              { maxWeight: 9000, price: 3700 },
              { maxWeight: 12000, price: 4400 },
              { maxWeight: Infinity, price: -1 }, // -1 表示不可承運
            ],
          },
          taipei: {
            tiers: [
              { maxWeight: 2000, price: 1600 },
              { maxWeight: 5500, price: 2000 },
              { maxWeight: 7500, price: 2900 },
              { maxWeight: 9000, price: 3500 },
              { maxWeight: 12000, price: 4000 },
              { maxWeight: Infinity, price: -1 },
            ],
          },
          new_taipei_hsinchu: {
            tiers: [
              { maxWeight: 2000, price: 1500 },
              { maxWeight: 5500, price: 1900 },
              { maxWeight: 7500, price: 2700 },
              { maxWeight: 9000, price: 3300 },
              { maxWeight: 12000, price: 3800 },
              { maxWeight: Infinity, price: -1 },
            ],
          },
          taoyuan: {
            tiers: [
              { maxWeight: 2000, price: 1400 },
              { maxWeight: 5500, price: 1600 },
              { maxWeight: 7500, price: 2000 },
              { maxWeight: 9000, price: 2600 },
              { maxWeight: 12000, price: 3100 },
              { maxWeight: Infinity, price: -1 },
            ],
          },
        },
      },
      // 北→中 每噸單價
      north_to_central: {
        type: "perTon",
        tiers: [
          { weight: 1000, pricePerTon: 1400 },
          { weight: 2000, pricePerTon: 1355 },
          { weight: 3000, pricePerTon: 1310 },
          { weight: 4000, pricePerTon: 1270 },
          { weight: 5000, pricePerTon: 1225 },
          { weight: 6000, pricePerTon: 1180 },
          { weight: 7000, pricePerTon: 1135 },
          { weight: 8000, pricePerTon: 1090 },
          { weight: 9000, pricePerTon: 1045 },
          { weight: 10000, pricePerTon: 1015 }, // ≥10000 kg
        ],
      },
      // 北→南 每噸單價
      north_to_south: {
        type: "perTon",
        tiers: [
          { weight: 1000, pricePerTon: 1600 },
          { weight: 2000, pricePerTon: 1550 },
          { weight: 3000, pricePerTon: 1500 },
          { weight: 4000, pricePerTon: 1450 },
          { weight: 5000, pricePerTon: 1400 },
          { weight: 6000, pricePerTon: 1340 },
          { weight: 7000, pricePerTon: 1290 },
          { weight: 8000, pricePerTon: 1240 },
          { weight: 9000, pricePerTon: 1180 },
          { weight: 10000, pricePerTon: 1150 }, // ≥10000 kg
        ],
      },
    },
  },
];

// ========== 計算函式 ==========

export interface ShippingResult {
  success: boolean;
  price: number;
  tierDescription: string;
  calculationMethod: string;
  errorMessage?: string;
}

export function calculateShipping(
  vendorId: string,
  regionId: string,
  subRegionId: string | null,
  weightKg: number,
): ShippingResult {
  const pricing = vendorPricing.find((p) => p.vendorId === vendorId);
  if (!pricing) {
    return {
      success: false,
      price: 0,
      tierDescription: "",
      calculationMethod: "",
      errorMessage: "找不到該廠商的計價資料",
    };
  }

  // Step 1: 檢查是否適用通用重量級距（≤300kg）
  if (weightKg <= pricing.universal.maxWeight) {
    const tier = pricing.universal.tiers.find((t) => weightKg <= t.maxWeight);
    if (tier) {
      const prevTier = pricing.universal.tiers.find(
        (t, idx) =>
          idx === 0 ||
          (pricing.universal.tiers[idx - 1] &&
            weightKg > pricing.universal.tiers[idx - 1].maxWeight),
      );
      const minWeight =
        pricing.universal.tiers.indexOf(tier) === 0
          ? 0
          : pricing.universal.tiers[pricing.universal.tiers.indexOf(tier) - 1]
              .maxWeight + 1;

      return {
        success: true,
        price: tier.price,
        tierDescription: `${minWeight === 0 ? "≤" : minWeight + "–"}${tier.maxWeight} kg`,
        calculationMethod: "通用重量級距（總價）",
      };
    }
  }

  // Step 2: 超過 300kg，依地區計價
  const regionalPricing = pricing.regional[regionId];
  if (!regionalPricing) {
    return {
      success: false,
      price: 0,
      tierDescription: "",
      calculationMethod: "",
      errorMessage: "該地區尚未設定計價規則",
    };
  }

  // 北→北 總價制
  if (regionalPricing.type === "fixed") {
    if (!subRegionId) {
      return {
        success: false,
        price: 0,
        tierDescription: "",
        calculationMethod: "",
        errorMessage: "請選擇送貨地區",
      };
    }

    const subRegionPricing = regionalPricing.subRegions[subRegionId];
    if (!subRegionPricing) {
      return {
        success: false,
        price: 0,
        tierDescription: "",
        calculationMethod: "",
        errorMessage: "該送貨地區尚未設定計價規則",
      };
    }

    // 找到適用的重量級距
    let prevMax = 300; // 從 300kg 開始（因為 ≤300kg 已經用通用級距處理）
    for (const tier of subRegionPricing.tiers) {
      if (weightKg <= tier.maxWeight) {
        if (tier.price === -1) {
          return {
            success: false,
            price: 0,
            tierDescription: "",
            calculationMethod: "",
            errorMessage: "超過可承載重量，不可承運",
          };
        }

        const tierLabel =
          tier.maxWeight === Infinity
            ? `≥${(prevMax / 1000).toFixed(1)} 噸`
            : `${(prevMax / 1000).toFixed(1)}–${(tier.maxWeight / 1000).toFixed(1)} 噸`;

        return {
          success: true,
          price: tier.price,
          tierDescription: tierLabel,
          calculationMethod: "北→北 總價制",
        };
      }
      prevMax = tier.maxWeight;
    }

    return {
      success: false,
      price: 0,
      tierDescription: "",
      calculationMethod: "",
      errorMessage: "超過可承載重量，不可承運",
    };
  }

  // 北→中、北→南 每噸單價制
  if (regionalPricing.type === "perTon") {
    const tiers = regionalPricing.tiers;
    let pricePerTon = tiers[tiers.length - 1].pricePerTon; // 預設使用最高級距
    let tierDescription = `≥${tiers[tiers.length - 1].weight / 1000} 噸`;

    // 找到適用的級距
    for (let i = 0; i < tiers.length; i++) {
      if (weightKg <= tiers[i].weight) {
        pricePerTon = tiers[i].pricePerTon;
        const prevWeight = i === 0 ? 300 : tiers[i - 1].weight;
        tierDescription = `${(prevWeight / 1000).toFixed(1)}–${(tiers[i].weight / 1000).toFixed(1)} 噸`;
        break;
      }
    }

    // 計算噸數（取上限）
    const tons = Math.ceil(weightKg / 1000);
    const totalPrice = pricePerTon * tons;

    return {
      success: true,
      price: totalPrice,
      tierDescription: tierDescription,
      calculationMethod: `每噸單價 $${pricePerTon.toLocaleString()} × ${tons} 噸`,
    };
  }

  return {
    success: false,
    price: 0,
    tierDescription: "",
    calculationMethod: "",
    errorMessage: "計價方式錯誤",
  };
}
