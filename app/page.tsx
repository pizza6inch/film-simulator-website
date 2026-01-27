"use client";

import { useState, useMemo } from "react";
import { FilmRollCalculator } from "@/components/film-roll-calculator";
import { PalletSimulator } from "@/components/pallet-simulator";
import { ShippingCalculator } from "@/components/shipping-calculator";
import { CreditNoteCalculator } from "@/components/credit-note-calculator";

interface FilmRollInputs {
  thickness: number; // μm
  width: number; // mm
  length: number; // m
  density: number; // g/cm³
  quantity: number;
  innerDiameter: number; // cm (default 3 inch = 7.62 cm)
}

export default function FilmRollSimulator() {
  const [inputs, setInputs] = useState<FilmRollInputs>({
    thickness: 25,
    width: 500,
    length: 1000,
    density: 0.92,
    quantity: 10,
    innerDiameter: 7.62, // 3 inch
  });

  const results = useMemo(() => {
    const { thickness, width, length, density, quantity, innerDiameter } =
      inputs;

    // Weight calculation (kg)
    // Weight = thickness(μm) × width(mm) × length(m) × density(g/cm³) ÷ 10000
    const singleWeight = (thickness * width * length * density) / 1000 / 1000;

    // Outer diameter calculation (cm)
    // Convert thickness from μm to cm: thickness / 10000
    // Convert length from m to cm: length * 100
    const thicknessCm = thickness / 10000;
    const lengthCm = length * 100;
    const di = innerDiameter;

    // Dₒ = √( Dᵢ² + ( 4 × T × L ) / π )
    const outerDiameter = Math.sqrt(
      di * di + (4 * thicknessCm * lengthCm) / Math.PI,
    );

    // Dimensions after rolling (cm)
    const dimensions = {
      length: outerDiameter, // Length = outer diameter
      width: outerDiameter, // Width = outer diameter
      height: width / 10, // Height = width (mm → cm)
    };

    const totalWeight = singleWeight * quantity;

    return {
      singleWeight: isNaN(singleWeight) ? 0 : singleWeight,
      outerDiameter: isNaN(outerDiameter) ? 0 : outerDiameter,
      dimensions: {
        length: isNaN(dimensions.length) ? 0 : dimensions.length,
        width: isNaN(dimensions.width) ? 0 : dimensions.width,
        height: isNaN(dimensions.height) ? 0 : dimensions.height,
      },
      totalWeight: isNaN(totalWeight) ? 0 : totalWeight,
    };
  }, [inputs]);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-secondary bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide text-secondary">
            膠捲資訊模擬器
          </h1>
          <p className="text-muted-foreground mt-1">
            Film Roll Information Simulator
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Section 0: Credit Note Calculator */}
        <CreditNoteCalculator />

        {/* Section 1: Weight & Dimension Calculator */}
        <FilmRollCalculator
          inputs={inputs}
          onInputChange={setInputs}
          results={results}
        />

        {/* Section 2: Pallet Placement Simulator */}
        <PalletSimulator
          rollDiameter={results.outerDiameter}
          rollHeight={results.dimensions.height}
          totalQuantity={inputs.quantity}
        />

        {/* Section 3: Shipping Calculator */}
        <ShippingCalculator totalWeight={results.totalWeight} />
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-secondary bg-card mt-8">
        <div className="container mx-auto px-4 py-4">
          <p className="text-sm text-muted-foreground text-center">
            所有計算結果僅供參考，實際運費以物流公司報價為準
          </p>
        </div>
      </footer>
    </main>
  );
}
