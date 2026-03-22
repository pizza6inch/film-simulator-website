"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
  SelectLabel,
} from "@/components/ui/select";

type ProductPreset = {
  id: string;
  name: string;
  erpName?: string;
  length: number;
  thickness: number;
  density: number;
};

const PRODUCT_PRESETS: ProductPreset[] = [
  { id: "custom", name: "自訂", length: 0, thickness: 0, density: 1.2 },
  { id: "va107", name: "VA107", erpName: "VA107", length: 4000, thickness: 12, density: 1.4 },
  { id: "sp-r", name: "SP-R", erpName: "SP-R", length: 4000, thickness: 15, density: 1.17 },
  { id: "ony-15um", name: "15um東鴻尼龍ONY", erpName: "ONY", length: 6100, thickness: 15, density: 1.14 },
];

interface CreditNoteCalculatorProps {
  title?: string;
  precision?: number;
  isSpecial?: boolean;
}

export function CreditNoteCalculator({
  title = "折讓單計算器",
  precision = 2,
  isSpecial = false,
}: CreditNoteCalculatorProps) {
  const [unit, setUnit] = useState<"KG" | "M2">("KG");
  const [selectedPreset, setSelectedPreset] = useState<string>("custom");

  // Inputs
  const [price, setPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [length, setLength] = useState<number>(0); // m
  const [thickness, setThickness] = useState<number>(0); // μm
  const [density, setDensity] = useState<number>(1.2); // g/cm³ default 1.2
  const [widthA, setWidthA] = useState<number>(0); // mm
  const [widthB, setWidthB] = useState<number>(0); // mm
  const [salesOrder, setSalesOrder] = useState<number>(0);

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = PRODUCT_PRESETS.find((p) => p.id === presetId);
    if (preset && preset.id !== "custom") {
      setLength(preset.length);
      setThickness(preset.thickness);
      setDensity(preset.density);
    }
  };

  // helper: parse inputs to safe numbers
  const p = isNaN(price) ? 0 : price;
  const q = isNaN(quantity) ? 0 : quantity;
  const L = isNaN(length) ? 0 : length;
  const T = isNaN(thickness) ? 0 : thickness;
  const rho = isNaN(density) ? 1.2 : density;
  const WA = isNaN(widthA) ? 0 : widthA;
  const WB = isNaN(widthB) ? 0 : widthB;
  const so = isNaN(salesOrder) ? 0 : salesOrder;

  // Special logic for Dong Hong Nylon if enabled
  let effectiveLength = L;
  if (isSpecial) {
    if (L === 4000) effectiveLength = 4060;
    else if (L === 6000) effectiveLength = 6100;
  }

  // 1. 先計算原始數值 (高精度)
  const rawWeightA = (T * WA * effectiveLength * rho) / 1000 / 1000;
  const rawWeightB = (T * WB * effectiveLength * rho) / 1000 / 1000;
  const rawAreaA = effectiveLength * (WA / 1000);
  const rawAreaB = effectiveLength * (WB / 1000);

  // 2. 根據 precision 進行四捨五入 (轉回數字)，這是解決 199.5 vs 198.2 的關鍵
  // 這樣 weightA 就會是 73.0 而不是 72.98xxxx
  const weightA = Number(rawWeightA.toFixed(precision));
  const weightB = Number(rawWeightB.toFixed(precision));
  const areaA = Number(rawAreaA.toFixed(precision));
  const areaB = Number(rawAreaB.toFixed(precision));

  // 3. 折讓金額計算
  let discount = 0;
  if (unit === "KG") {
    // 使用已經 rounded 的數值相減： (73.0 - 70.9) * 95 * 單價
    discount = Math.round((weightA - weightB) * q * p);
  } else {
    // M2 同理
    discount = Math.round((areaA - areaB) * q * p);
  }

  // 4. 稅金計算 (保持 round 邏輯)
  const tax = Math.round(so * 0.05) - Math.round((so - discount) * 0.05);

  const selectedPresetData = PRODUCT_PRESETS.find((p) => p.id === selectedPreset);
  const erpPrefix = selectedPresetData?.erpName || "";

  return (
    <div className="border-2 border-secondary p-6 bg-card">
      <h2 className="text-xl font-bold uppercase tracking-wide text-secondary mb-6">
        {title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
            輸入參數
          </h3>

          <div className="space-y-2 mb-2 p-3 bg-primary/5 border-2 border-primary/20 rounded-md">
            <Label className="text-xs uppercase tracking-wider text-primary font-bold">
              ⚡ 常用產品快速帶入
            </Label>
            <Select value={selectedPreset} onValueChange={handlePresetChange}>
              <SelectTrigger className="border-2 border-primary/40 bg-background">
                <SelectValue placeholder="選擇產品" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>預設配置</SelectLabel>
                  {PRODUCT_PRESETS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} {p.id !== "custom" && `(${p.length}m / ${p.thickness}μm / ${p.density})`}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit" className="text-xs uppercase tracking-wider">
              計價單位
            </Label>
            <Select value={unit} onValueChange={(v) => setUnit(v as any)}>
              <SelectTrigger
                className="border-2 border-secondary bg-background"
                size="default"
              >
                <SelectValue placeholder="選擇單位" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>單位</SelectLabel>
                  <SelectItem value="KG">KG</SelectItem>
                  <SelectItem value="M2">M²</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price" className="text-xs uppercase tracking-wider">
              膠捲單價（到小數第 2 位）
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={p || ""}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              placeholder="例：100.00"
              className="border-2 border-secondary bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="quantity"
              className="text-xs uppercase tracking-wider"
            >
              膠捲數目
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              step="1"
              value={q || ""}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              placeholder="例：10"
              className="border-2 border-secondary bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="widthA"
              className="text-xs uppercase tracking-wider"
            >
              幅寬 A（mm）
            </Label>
            <Input
              id="widthA"
              type="number"
              value={WA || ""}
              onChange={(e) => setWidthA(parseFloat(e.target.value) || 0)}
              placeholder="例：500"
              className="border-2 border-secondary bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="widthB"
              className="text-xs uppercase tracking-wider"
            >
              幅寬 B（mm）
            </Label>
            <Input
              id="widthB"
              type="number"
              value={WB || ""}
              onChange={(e) => setWidthB(parseFloat(e.target.value) || 0)}
              placeholder="例：480"
              className="border-2 border-secondary bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="salesOrder"
              className="text-xs uppercase tracking-wider"
            >
              銷貨單金額（元）
            </Label>
            <Input
              id="salesOrder"
              type="number"
              value={salesOrder || ""}
              onChange={(e) => setSalesOrder(parseFloat(e.target.value) || 0)}
              placeholder="例：10000"
              className="border-2 border-secondary bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="length"
              className="text-xs uppercase tracking-wider"
            >
              米數 L（m）
            </Label>
            <Input
              id="length"
              type="number"
              value={L || ""}
              onChange={(e) => {
                setLength(parseFloat(e.target.value) || 0);
                setSelectedPreset("custom");
              }}
              placeholder="例：1000"
              className="border-2 border-secondary bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="thickness"
              className="text-xs uppercase tracking-wider"
            >
              厚度 T（μm）
            </Label>
            <Input
              id="thickness"
              type="number"
              value={T || ""}
              onChange={(e) => {
                setThickness(parseFloat(e.target.value) || 0);
                setSelectedPreset("custom");
              }}
              placeholder="例：25"
              className="border-2 border-secondary bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="density"
              className="text-xs uppercase tracking-wider"
            >
              比重（g/cm³）預設 1.2
            </Label>
            <Input
              id="density"
              type="number"
              step="0.01"
              value={rho || ""}
              onChange={(e) => {
                setDensity(parseFloat(e.target.value) || 1.2);
                setSelectedPreset("custom");
              }}
              placeholder="1.2"
              className="border-2 border-secondary bg-background"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
            計算結果
          </h3>

          <div className="border-2 border-primary bg-primary/10 p-4">
            <p className="text-xs uppercase tracking-wider text-primary mb-1">
              A 膠捲
            </p>
            <p className="text-2xl font-bold text-primary">
              {weightA.toFixed(precision)} <span className="text-sm">kg</span>{" "}
              {areaA.toFixed(precision)} <span className="text-sm">m²</span>{" "}
            </p>
          </div>

          <div className="border-2 border-secondary bg-secondary/5 p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              B 膠捲
            </p>
            <p className="text-2xl font-bold text-secondary">
              {weightB.toFixed(precision)} <span className="text-sm">kg</span>{" "}
              {areaB.toFixed(precision)} <span className="text-sm">m²</span>
            </p>
            <p className="text-sm text-muted-foreground"></p>
          </div>

          <div className="border-2 border-primary bg-primary/10 p-4">
            <p className="text-xs uppercase tracking-wider text-primary mb-1">
              折讓單金額
            </p>
            <p className="text-2xl font-bold text-primary">
              {discount.toLocaleString()} <span className="text-sm">元</span>
            </p>
          </div>

          <div className="border-2 border-secondary bg-secondary/5 p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              折讓單稅金
            </p>
            <p className="text-2xl font-bold text-secondary">
              {tax.toLocaleString()} <span className="text-sm">元</span>
            </p>
          </div>

          <div className="border-2 border-primary bg-primary/10 p-4">
            <p className="text-xs uppercase tracking-wider text-primary mb-1">
              ERP複製文字
            </p>
            <p className="text-2xl font-bold text-primary break-all">
              {erpPrefix}以{WA}代{WB}*{q}R(
              {unit === "KG"
                ? `${weightA.toFixed(precision)} - ${weightB.toFixed(
                  precision,
                )}kg`
                : `${areaA.toFixed(precision)} - ${areaB.toFixed(
                  precision,
                )}m²`}
              ) * {p} *{q}R= {discount.toLocaleString()}元
            </p>
          </div>
        </div>

        {/* Notes / Formula */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
            計算公式
          </h3>

          <div className="border-2 border-secondary bg-muted/50 p-4 text-sm space-y-4">
            <div>
              <p className="font-semibold text-secondary mb-1">重量計算</p>
              <p className="text-muted-foreground font-mono text-xs">
                W = T × W × L × ρ ÷ 1000 ÷ 1000
              </p>
            </div>

            <div>
              <p className="font-semibold text-secondary mb-1">面積計算</p>
              <p className="text-muted-foreground font-mono text-xs">
                M² = L × (W ÷ 1000)
              </p>
            </div>

            <div>
              <p className="font-semibold text-secondary mb-1">折讓單 (KG)</p>
              <p className="text-muted-foreground font-mono text-xs">
                折讓單 = round((A重量 - B重量) × N × 單價)
              </p>
              <p className="text-muted-foreground font-mono text-xs">
                稅金 = round(銷貨單金額 * 0.05) - round((銷貨單金額 -
                折讓單金額) × 0.05)
              </p>
            </div>

            <div>
              <p className="font-semibold text-secondary mb-1">折讓單 (M²)</p>
              <p className="text-muted-foreground font-mono text-xs">
                折讓單 = round((A平方公尺 - B平方公尺) × N × 單價)
              </p>
              <p className="text-muted-foreground font-mono text-xs">
                稅金 = round(銷貨單金額 * 0.05) - round((銷貨單金額 -
                折讓單金額) × 0.05)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
