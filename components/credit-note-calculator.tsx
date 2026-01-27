"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreditNoteInputs {
  priceA: number; // A膠捲單價
  priceB: number; // B膠捲單價
  quantity: number; // 代換膠捲數量
}

interface CreditNoteResults {
  creditNotePrice: number; // 折讓單價格（未稅）
  taxA: number; // A稅金
  taxB: number; // B稅金
  creditNoteTax: number; // 折讓單稅金
  creditNoteTotal: number; // 折讓單含稅總金額
  isValid: boolean;
}

/**
 * Calculate credit note values
 * 折讓單價格 = (A單價 × n) − (B單價 × n)
 * A稅金 = 四捨五入(A × n × 0.05)
 * B稅金 = 四捨五入(B × n × 0.05)
 * 折讓單稅金 = A稅金 − B稅金
 */
function calculateCreditNote(inputs: CreditNoteInputs): CreditNoteResults {
  const { priceA, priceB, quantity } = inputs;

  // Validate inputs
  const isValid =
    !isNaN(priceA) &&
    !isNaN(priceB) &&
    !isNaN(quantity) &&
    priceA >= 0 &&
    priceB >= 0 &&
    quantity > 0 &&
    Number.isInteger(quantity);

  if (!isValid) {
    return {
      creditNotePrice: 0,
      taxA: 0,
      taxB: 0,
      creditNoteTax: 0,
      creditNoteTotal: 0,
      isValid: false,
    };
  }

  // Calculate credit note price (before tax)
  const creditNotePrice = priceA * quantity - priceB * quantity;

  // Calculate taxes separately and round each
  const taxA = Math.round(priceA * quantity * 0.05);
  const taxB = Math.round(priceB * quantity * 0.05);

  // Credit note tax = A tax - B tax
  const creditNoteTax = taxA - taxB;

  // Total with tax
  const creditNoteTotal = creditNotePrice + creditNoteTax;

  return {
    creditNotePrice,
    taxA,
    taxB,
    creditNoteTax,
    creditNoteTotal,
    isValid: true,
  };
}

export function CreditNoteCalculator() {
  const [inputs, setInputs] = useState<CreditNoteInputs>({
    priceA: 0,
    priceB: 0,
    quantity: 0,
  });

  const results = useMemo(() => calculateCreditNote(inputs), [inputs]);

  const handleChange = (field: keyof CreditNoteInputs, value: string) => {
    const numValue = value === "" ? 0 : parseFloat(value);
    setInputs((prev) => ({ ...prev, [field]: numValue }));
  };

  const formatResult = (value: number) => {
    if (!results.isValid) return "--";
    return value.toLocaleString("zh-TW");
  };

  return (
    <div className="border-2 border-secondary p-6 bg-card">
      <h2 className="text-xl font-bold uppercase tracking-wide text-secondary mb-6">
        折讓單價格試算
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Input Fields */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
            輸入參數
          </h3>

          <div className="space-y-2">
            <Label
              htmlFor="priceA"
              className="text-xs uppercase tracking-wider"
            >
              A 膠捲單價（元）
            </Label>
            <Input
              id="priceA"
              type="number"
              min="0"
              step="0.01"
              value={inputs.priceA || ""}
              onChange={(e) => handleChange("priceA", e.target.value)}
              placeholder="例：150"
              className="border-2 border-secondary bg-background"
            />
            <p className="text-xs text-muted-foreground">替代品單價</p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="priceB"
              className="text-xs uppercase tracking-wider"
            >
              B 膠捲單價（元）
            </Label>
            <Input
              id="priceB"
              type="number"
              min="0"
              step="0.01"
              value={inputs.priceB || ""}
              onChange={(e) => handleChange("priceB", e.target.value)}
              placeholder="例：120"
              className="border-2 border-secondary bg-background"
            />
            <p className="text-xs text-muted-foreground">原本使用品單價</p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="quantity"
              className="text-xs uppercase tracking-wider"
            >
              代換膠捲數量（n）
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              step="1"
              value={inputs.quantity || ""}
              onChange={(e) => handleChange("quantity", e.target.value)}
              placeholder="例：100"
              className="border-2 border-secondary bg-background"
            />
            <p className="text-xs text-muted-foreground">必須為正整數</p>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
            計算結果
          </h3>

          <div className="space-y-4">
            <div className="border-2 border-primary bg-primary/10 p-4">
              <p className="text-xs uppercase tracking-wider text-primary mb-1">
                折讓單價格（未稅）
              </p>
              <p className="text-2xl font-bold text-primary">
                {formatResult(results.creditNotePrice)}{" "}
                <span className="text-sm">元</span>
              </p>
            </div>

            <div className="border-2 border-secondary bg-secondary/5 p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                折讓單稅金
              </p>
              <p className="text-2xl font-bold text-secondary">
                {formatResult(results.creditNoteTax)}{" "}
                <span className="text-sm">元</span>
              </p>
            </div>

            <div className="border-2 border-primary bg-primary/10 p-4">
              <p className="text-xs uppercase tracking-wider text-primary mb-1">
                折讓單含稅總金額
              </p>
              <p className="text-2xl font-bold text-primary">
                {formatResult(results.creditNoteTotal)}{" "}
                <span className="text-sm">元</span>
              </p>
            </div>
          </div>
        </div>

        {/* Formula & Tax Breakdown */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
            計算公式與稅金明細
          </h3>

          <div className="border-2 border-secondary bg-muted/50 p-4 text-sm space-y-4">
            <div>
              <p className="font-semibold text-secondary mb-1">折讓單價格</p>
              <p className="text-muted-foreground font-mono text-xs">
                (A單價 × n) − (B單價 × n)
              </p>
            </div>

            <div>
              <p className="font-semibold text-secondary mb-1">稅金計算</p>
              <p className="text-muted-foreground font-mono text-xs">
                A稅金 = round(A × n × 0.05)
              </p>
              <p className="text-muted-foreground font-mono text-xs">
                B稅金 = round(B × n × 0.05)
              </p>
              <p className="text-muted-foreground font-mono text-xs">
                折讓稅金 = A稅金 − B稅金
              </p>
            </div>
          </div>

          {/* Tax Breakdown */}
          {results.isValid && (
            <div className="border-2 border-secondary bg-secondary/5 p-4 text-sm space-y-2">
              <p className="font-semibold text-secondary mb-2">稅金計算明細</p>
              <div className="flex justify-between text-muted-foreground">
                <span>
                  A 稅金（{inputs.priceA} × {inputs.quantity} × 5%）
                </span>
                <span className="font-mono">
                  {results.taxA.toLocaleString("zh-TW")}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>
                  B 稅金（{inputs.priceB} × {inputs.quantity} × 5%）
                </span>
                <span className="font-mono">
                  {results.taxB.toLocaleString("zh-TW")}
                </span>
              </div>
              <div className="border-t border-secondary pt-2 flex justify-between font-semibold text-secondary">
                <span>折讓稅金差額</span>
                <span className="font-mono">
                  {results.creditNoteTax.toLocaleString("zh-TW")}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
