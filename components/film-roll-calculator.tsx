"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FilmRollInputs {
  thickness: number; // μm
  width: number; // mm
  length: number; // m
  density: number; // g/cm³
  quantity: number;
  innerDiameter: number; // cm (default 3 inch = 7.62 cm)
}

interface CalculationResults {
  singleWeight: number; // kg
  outerDiameter: number; // cm
  dimensions: { length: number; width: number; height: number }; // cm
  totalWeight: number; // kg
}

interface FilmRollCalculatorProps {
  inputs: FilmRollInputs;
  onInputChange: (inputs: FilmRollInputs) => void;
  results: CalculationResults;
}

export function FilmRollCalculator({
  inputs,
  onInputChange,
  results,
}: FilmRollCalculatorProps) {
  const handleChange = (field: keyof FilmRollInputs, value: string) => {
    const numValue = parseFloat(value) || 0;
    onInputChange({ ...inputs, [field]: numValue });
  };

  return (
    <div className="border-2 border-secondary p-6 bg-card">
      <h2 className="text-xl font-bold uppercase tracking-wide text-secondary mb-6">
        膠捲重量與尺寸換算
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Input Fields */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
            輸入參數
          </h3>

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
              value={inputs.thickness || ""}
              onChange={(e) => handleChange("thickness", e.target.value)}
              placeholder="例：25"
              className="border-2 border-secondary bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="width" className="text-xs uppercase tracking-wider">
              幅寬 W（mm）
            </Label>
            <Input
              id="width"
              type="number"
              value={inputs.width || ""}
              onChange={(e) => handleChange("width", e.target.value)}
              placeholder="例：500"
              className="border-2 border-secondary bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="length"
              className="text-xs uppercase tracking-wider"
            >
              長度 L（m）
            </Label>
            <Input
              id="length"
              type="number"
              value={inputs.length || ""}
              onChange={(e) => handleChange("length", e.target.value)}
              placeholder="例：1000"
              className="border-2 border-secondary bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="density"
              className="text-xs uppercase tracking-wider"
            >
              比重 ρ（g/cm³）
            </Label>
            <Input
              id="density"
              type="number"
              step="0.01"
              value={inputs.density || ""}
              onChange={(e) => handleChange("density", e.target.value)}
              placeholder="例：0.92"
              className="border-2 border-secondary bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="quantity"
              className="text-xs uppercase tracking-wider"
            >
              膠捲數量 N
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              step="1"
              value={inputs.quantity || ""}
              onChange={(e) => handleChange("quantity", e.target.value)}
              placeholder="例：10"
              className="border-2 border-secondary bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="innerDiameter"
              className="text-xs uppercase tracking-wider"
            >
              內徑（cm）預設三吋
            </Label>
            <Input
              id="innerDiameter"
              type="number"
              step="0.01"
              value={inputs.innerDiameter || ""}
              onChange={(e) => handleChange("innerDiameter", e.target.value)}
              placeholder="預設 7.62（3 吋）"
              className="border-2 border-secondary bg-background"
            />
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
                單捲重量
              </p>
              <p className="text-2xl font-bold text-primary">
                {results.singleWeight.toFixed(2)}{" "}
                <span className="text-sm">kg</span>
              </p>
            </div>

            <div className="border-2 border-secondary bg-secondary/5 p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                單捲外徑
              </p>
              <p className="text-2xl font-bold text-secondary">
                {results.outerDiameter.toFixed(2)}{" "}
                <span className="text-sm">cm</span>
              </p>
            </div>

            <div className="border-2 border-secondary bg-secondary/5 p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                單捲尺寸（長 × 寬 × 高）
              </p>
              <p className="text-xl font-bold text-secondary">
                {results.dimensions.length.toFixed(1)} ×{" "}
                {results.dimensions.width.toFixed(1)} ×{" "}
                {results.dimensions.height.toFixed(1)}{" "}
                <span className="text-sm">cm</span>
              </p>
            </div>

            <div className="border-2 border-primary bg-primary/10 p-4">
              <p className="text-xs uppercase tracking-wider text-primary mb-1">
                總重量
              </p>
              <p className="text-2xl font-bold text-primary">
                {results.totalWeight.toFixed(2)}{" "}
                <span className="text-sm">kg</span>
              </p>
            </div>
          </div>
        </div>

        {/* Formula Reference */}
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
              <p className="font-semibold text-secondary mb-1">外徑計算</p>
              <p className="text-muted-foreground font-mono text-xs">
                {"Dₒ = √( Dᵢ² + ( 4 × T × L ) / π )"}
              </p>
            </div>

            <div>
              <p className="font-semibold text-secondary mb-1">捲起尺寸</p>
              <p className="text-muted-foreground text-xs">
                長 = 外徑
                <br />
                寬 = 外徑
                <br />高 = 幅寬 (mm → cm)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
