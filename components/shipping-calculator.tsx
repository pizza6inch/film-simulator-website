"use client";

import { useState, useMemo, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  vendors,
  regions,
  calculateShipping,
  type ShippingResult,
} from "@/lib/shipping-config";

interface ShippingCalculatorProps {
  totalWeight?: number; // 從上層傳入的總重量（可選）
}

export function ShippingCalculator({
  totalWeight: externalWeight,
}: ShippingCalculatorProps) {
  const [selectedVendor, setSelectedVendor] = useState<string>(
    vendors[0]?.id || "",
  );
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedSubRegion, setSelectedSubRegion] = useState<string>("");
  const [weightInput, setWeightInput] = useState<string>(
    externalWeight?.toString() || "",
  );

  // 當外部重量變化時更新輸入
  useEffect(() => {
    if (externalWeight !== undefined) {
      setWeightInput(externalWeight.toFixed(2));
    }
  }, [externalWeight]);

  // 取得當前選擇的地區資訊
  const currentRegion = useMemo(() => {
    return regions.find((r) => r.id === selectedRegion);
  }, [selectedRegion]);

  // 是否需要選擇子地區
  const needsSubRegion =
    currentRegion?.subRegions && currentRegion.subRegions.length > 0;

  // 當地區變化時重置子地區
  useEffect(() => {
    setSelectedSubRegion("");
  }, [selectedRegion]);

  // 計算運費
  const result: ShippingResult | null = useMemo(() => {
    const weight = parseFloat(weightInput);
    if (!selectedVendor || !selectedRegion || isNaN(weight) || weight <= 0) {
      return null;
    }

    // 如果需要子地區但尚未選擇
    if (needsSubRegion && !selectedSubRegion) {
      return null;
    }

    return calculateShipping(
      selectedVendor,
      selectedRegion,
      needsSubRegion ? selectedSubRegion : null,
      weight,
    );
  }, [
    selectedVendor,
    selectedRegion,
    selectedSubRegion,
    weightInput,
    needsSubRegion,
  ]);

  return (
    <div className="border-2 border-secondary p-6 bg-card">
      <h2 className="text-xl font-bold uppercase tracking-wide text-secondary mb-6">
        Section 3：運費試算
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 輸入區 */}
        <div className="space-y-5">
          {/* 廠商選擇 */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider">廠商</Label>
            <Select value={selectedVendor} onValueChange={setSelectedVendor}>
              <SelectTrigger className="border-2 border-secondary bg-background">
                <SelectValue placeholder="請選擇廠商" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 運送地區選擇 */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider">運送路線</Label>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="border-2 border-secondary bg-background">
                <SelectValue placeholder="請選擇運送路線" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 子地區選擇（北→北時顯示） */}
          {needsSubRegion && (
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider">
                送貨地區
              </Label>
              <Select
                value={selectedSubRegion}
                onValueChange={setSelectedSubRegion}
              >
                <SelectTrigger className="border-2 border-secondary bg-background">
                  <SelectValue placeholder="請選擇送貨地區" />
                </SelectTrigger>
                <SelectContent>
                  {currentRegion?.subRegions?.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* 總重量輸入 */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider">
              總重量（kg）
            </Label>
            <Input
              type="number"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder="請輸入總重量"
              min="0"
              step="0.01"
              className="border-2 border-secondary bg-background"
            />
          </div>

          {/* 出發地資訊 */}
          {/* <div className="border-2 border-secondary bg-muted/50 p-4 mt-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              出發地
            </p>
            <p className="text-lg font-bold text-secondary">台北市松山區</p>
          </div> */}
        </div>

        {/* 結果區 */}
        <div className="space-y-5">
          {/* 未完成輸入提示 */}
          {!result && (
            <div className="border-2 border-secondary/50 bg-muted/30 p-6 h-full flex items-center justify-center">
              <p className="text-muted-foreground text-center">
                請完成所有欄位以計算運費
              </p>
            </div>
          )}

          {/* 計算成功結果 */}
          {result && result.success && (
            <div className="space-y-4">
              {/* 套用的重量級距 */}
              <div className="border-2 border-secondary bg-secondary/5 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  套用的重量級距
                </p>
                <p className="text-lg font-bold text-secondary">
                  {result.tierDescription}
                </p>
              </div>

              {/* 計算方式 */}
              <div className="border-2 border-secondary bg-secondary/5 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  計算方式
                </p>
                <p className="text-lg font-semibold text-secondary">
                  {result.calculationMethod}
                </p>
              </div>

              {/* 最終運費 */}
              <div className="border-2 border-primary bg-primary/10 p-6">
                <p className="text-xs uppercase tracking-wider text-primary mb-1">
                  預估運費
                </p>
                <p className="text-4xl font-bold text-primary">
                  NT$ {result.price.toLocaleString()}
                </p>
              </div>

              {/* 運送資訊摘要 */}
              <div className="border-2 border-secondary bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">路線：</span>
                  台北市松山區 → {currentRegion?.name}
                  {selectedSubRegion && currentRegion?.subRegions && (
                    <span>
                      （
                      {
                        currentRegion.subRegions.find(
                          (s) => s.id === selectedSubRegion,
                        )?.name
                      }
                      ）
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-semibold">重量：</span>
                  {parseFloat(weightInput).toLocaleString()} kg （約{" "}
                  {(parseFloat(weightInput) / 1000).toFixed(2)} 噸）
                </p>
              </div>
            </div>
          )}

          {/* 計算失敗結果（不可承運等） */}
          {result && !result.success && (
            <div className="border-2 border-destructive bg-destructive/10 p-6">
              <p className="text-xl font-bold text-destructive mb-2">
                不可承運
              </p>
              <p className="text-destructive/80">{result.errorMessage}</p>
            </div>
          )}
        </div>
      </div>

      {/* 說明文字 */}
      <div className="border-t-2 border-secondary mt-6 pt-4">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold">計價規則說明：</span>
          總重量 ≤ 300kg 適用通用級距；超過 300kg
          依運送路線採用總價制或每噸單價制計算。
          所有計算結果僅供參考，實際運費以物流公司報價為準。
        </p>
      </div>
    </div>
  );
}
