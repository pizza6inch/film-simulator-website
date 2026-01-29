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

export function CreditNoteCalculator() {
  const [unit, setUnit] = useState<"KG" | "M2">("KG");

  // Inputs
  const [quantity, setQuantity] = useState<number>(1);
  const [length, setLength] = useState<number>(0); // m
  const [thickness, setThickness] = useState<number>(0); // μm
  const [density, setDensity] = useState<number>(1.2); // g/cm³ default 1.2
  const [widthA, setWidthA] = useState<number>(0); // mm
  const [widthB, setWidthB] = useState<number>(0); // mm

  // helper: parse inputs to safe numbers
  const q = isNaN(quantity) ? 0 : quantity;
  const L = isNaN(length) ? 0 : length;
  const T = isNaN(thickness) ? 0 : thickness;
  const rho = isNaN(density) ? 1.2 : density;
  const WA = isNaN(widthA) ? 0 : widthA;
  const WB = isNaN(widthB) ? 0 : widthB;

  // Weight formula (kg) - same as existing algorithm
  // W = T(μm) × W(mm) × L(m) × ρ(g/cm³) ÷ 1000 ÷ 1000
  const weightA = (T * WA * L * rho) / 1000 / 1000;
  const weightB = (T * WB * L * rho) / 1000 / 1000;

  // Area (m²) = length(m) × width(m) [width(mm) → m]
  const areaA = L * (WA / 1000);
  const areaB = L * (WB / 1000);

  // Discount & Tax based on unit
  let discount = 0;
  let tax = 0;

  if (unit === "KG") {
    discount = (weightA - weightB) * q;
    tax = Math.round(q * weightA * 0.05) - Math.round(q * weightB * 0.05);
  } else {
    // M2
    discount = (areaA - areaB) * q;
    tax = Math.round(q * areaA * 0.05) - Math.round(q * areaB * 0.05);
  }

  return (
    <div className="border-2 border-secondary p-6 bg-card">
      <h2 className="text-xl font-bold uppercase tracking-wide text-secondary mb-6">
        折讓單計算器
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
            輸入參數
          </h3>

          {/* <div className="space-y-2">
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
          </div> */}

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
              htmlFor="length"
              className="text-xs uppercase tracking-wider"
            >
              米數 L（m）
            </Label>
            <Input
              id="length"
              type="number"
              value={L || ""}
              onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
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
              onChange={(e) => setThickness(parseFloat(e.target.value) || 0)}
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
              onChange={(e) => setDensity(parseFloat(e.target.value) || 1.2)}
              placeholder="1.2"
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
              {weightA.toFixed(2)} <span className="text-sm">kg</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {areaA.toFixed(2)} m²
            </p>
          </div>

          <div className="border-2 border-secondary bg-secondary/5 p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              B 膠捲
            </p>
            <p className="text-2xl font-bold text-secondary">
              {weightB.toFixed(2)} <span className="text-sm">kg</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {areaB.toFixed(2)} m²
            </p>
          </div>

          <div className="border-2 border-primary bg-primary/10 p-4">
            <p className="text-xs uppercase tracking-wider text-primary mb-1">
              折讓單金額
            </p>
            <p className="text-2xl font-bold text-primary">
              {discount.toFixed(2)} <span className="text-sm">元</span>
            </p>
          </div>

          <div className="border-2 border-secondary bg-secondary/5 p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              折讓單稅金
            </p>
            <p className="text-2xl font-bold text-secondary">
              {tax.toFixed(2)} <span className="text-sm">元</span>
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
                折讓單 = (A重量 - B重量) × N × 單價
              </p>
              <p className="text-muted-foreground font-mono text-xs">
                稅金 = round(N × A重量 × 0.05) - round(N × B重量 × 0.05)
              </p>
            </div>

            <div>
              <p className="font-semibold text-secondary mb-1">折讓單 (M²)</p>
              <p className="text-muted-foreground font-mono text-xs">
                折讓單 = (A平方公尺 - B平方公尺) × N × 單價
              </p>
              <p className="text-muted-foreground font-mono text-xs">
                稅金 = round(N × A平方公尺 × 0.05) - round(N × B平方公尺 × 0.05)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
