"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { useMemo } from "react";

interface PalletSimulatorProps {
  rollDiameter: number; // cm
  rollHeight: number; // cm
  totalQuantity: number;
}

interface PalletArrangement {
  rows: number;
  cols: number;
  maxPerPallet: number;
  palletsNeeded: number;
  arrangement: string;
}

function calculatePalletArrangement(
  diameter: number,
  quantity: number,
): PalletArrangement {
  const palletSize = 110; // cm

  if (diameter <= 0) {
    return {
      rows: 0,
      cols: 0,
      maxPerPallet: 0,
      palletsNeeded: 0,
      arrangement: "-",
    };
  }

  // Calculate how many rolls fit in each dimension
  const maxCols = Math.floor(palletSize / diameter);
  const maxRows = Math.floor(palletSize / diameter);
  const maxPerPallet = maxCols * maxRows;

  if (maxPerPallet === 0) {
    return {
      rows: 0,
      cols: 0,
      maxPerPallet: 0,
      palletsNeeded: 0,
      arrangement: "膠捲過大",
    };
  }

  const palletsNeeded = Math.ceil(quantity / maxPerPallet);

  return {
    rows: maxRows,
    cols: maxCols,
    maxPerPallet,
    palletsNeeded,
    arrangement: `${maxCols} × ${maxRows}`,
  };
}

function Pallet() {
  const palletSize = 1.1; // 110 cm
  const topHeight = 0.05; // 5 cm
  const beamHeight = 0.1; // 10 cm
  const beamWidth = 0.15; // 15 cm

  const beamY = beamHeight / 2;
  const topY = beamHeight + topHeight / 2;

  const beamXOffset = palletSize / 2 - beamWidth / 2;

  return (
    <group>
      {/* 上板 */}
      <mesh position={[0, topY, 0]} receiveShadow>
        <boxGeometry args={[palletSize, topHeight, palletSize]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>

      {/* 左底桿 */}
      <mesh position={[-beamXOffset, beamY, 0]} receiveShadow>
        <boxGeometry args={[beamWidth, beamHeight, palletSize]} />
        <meshStandardMaterial color="#6f5b3e" />
      </mesh>

      {/* 中底桿 */}
      <mesh position={[0, beamY, 0]} receiveShadow>
        <boxGeometry args={[beamWidth, beamHeight, palletSize]} />
        <meshStandardMaterial color="#6f5b3e" />
      </mesh>

      {/* 右底桿 */}
      <mesh position={[beamXOffset, beamY, 0]} receiveShadow>
        <boxGeometry args={[beamWidth, beamHeight, palletSize]} />
        <meshStandardMaterial color="#6f5b3e" />
      </mesh>
    </group>
  );
}

interface FilmRollProps {
  position: [number, number, number];
  diameter: number;
  height: number;
}

function FilmRoll({ position, diameter, height }: FilmRollProps) {
  const radius = diameter / 200; // Convert cm to meters and get radius
  const rollHeight = height / 100; // Convert cm to meters
  const innerRadius = 0.0381; // 3 inch inner diameter / 2 = 3.81cm = 0.0381m

  return (
    <group position={position}>
      {/* Outer cylinder */}
      <mesh position={[0, rollHeight / 2 + 0.15, 0]}>
        <cylinderGeometry args={[radius, radius, rollHeight, 32]} />
        <meshStandardMaterial color="#4A90D9" transparent opacity={0.85} />
      </mesh>
      {/* Inner hole */}
      <mesh position={[0, rollHeight / 2 + 0.15, 0]}>
        <cylinderGeometry
          args={[innerRadius, innerRadius, rollHeight + 0.01, 32]}
        />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
}

interface PalletSceneProps {
  diameter: number;
  height: number;
  arrangement: PalletArrangement;
}

function PalletScene({ diameter, height, arrangement }: PalletSceneProps) {
  const rolls = useMemo(() => {
    const positions: [number, number, number][] = [];
    const palletSize = 1.1; // meters
    const rollDiameterM = diameter / 100; // cm to meters

    if (arrangement.maxPerPallet === 0 || diameter <= 0) return positions;

    // Calculate starting position (centered on pallet)
    const totalWidthX = arrangement.cols * rollDiameterM;
    const totalWidthZ = arrangement.rows * rollDiameterM;
    const startX = -totalWidthX / 2 + rollDiameterM / 2;
    const startZ = -totalWidthZ / 2 + rollDiameterM / 2;

    for (let row = 0; row < arrangement.rows; row++) {
      for (let col = 0; col < arrangement.cols; col++) {
        const x = startX + col * rollDiameterM;
        const z = startZ + row * rollDiameterM;
        positions.push([x, 0, z]);
      }
    }

    return positions;
  }, [diameter, arrangement]);

  return (
    <>
      <Environment preset="warehouse" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />

      <Pallet />

      {rolls.map((pos, idx) => (
        <FilmRoll
          key={idx}
          position={pos}
          diameter={diameter}
          height={height}
        />
      ))}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={1}
        maxDistance={5}
      />

      {/* Grid helper */}
      <gridHelper args={[3, 30, "#666", "#444"]} position={[0, 0, 0]} />
    </>
  );
}

export function PalletSimulator({
  rollDiameter,
  rollHeight,
  totalQuantity,
}: PalletSimulatorProps) {
  const arrangement = useMemo(
    () => calculatePalletArrangement(rollDiameter, totalQuantity),
    [rollDiameter, totalQuantity],
  );

  return (
    <div className="border-2 border-secondary p-6 bg-card">
      <h2 className="text-xl font-bold uppercase tracking-wide text-secondary mb-6">
        棧板擺放模擬
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Info Panel */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
            擺放資訊
          </h3>

          <div className="border-2 border-secondary bg-muted/50 p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              棧板尺寸
            </p>
            <p className="text-lg font-bold text-secondary">110 × 110 cm</p>
          </div>

          <div className="border-2 border-secondary bg-secondary/5 p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              膠捲外徑
            </p>
            <p className="text-lg font-bold text-secondary">
              {rollDiameter.toFixed(2)} cm
            </p>
          </div>

          <div className="border-2 border-secondary bg-secondary/5 p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              膠捲高度
            </p>
            <p className="text-lg font-bold text-secondary">
              {rollHeight.toFixed(2)} cm
            </p>
          </div>

          <div className="border-2 border-primary bg-primary/10 p-4">
            <p className="text-xs uppercase tracking-wider text-primary mb-1">
              最佳排列方式
            </p>
            <p className="text-2xl font-bold text-primary">
              {arrangement.arrangement}
            </p>
          </div>

          <div className="border-2 border-primary bg-primary/10 p-4">
            <p className="text-xs uppercase tracking-wider text-primary mb-1">
              單一棧板最大容量
            </p>
            <p className="text-2xl font-bold text-primary">
              {arrangement.maxPerPallet} 捲
            </p>
          </div>

          <div className="border-2 border-primary bg-primary/10 p-4">
            <p className="text-xs uppercase tracking-wider text-primary mb-1">
              所需棧板數量
            </p>
            <p className="text-2xl font-bold text-primary">
              {arrangement.palletsNeeded} 個
              <span className="text-sm font-normal ml-2">
                （共 {totalQuantity} 捲）
              </span>
            </p>
          </div>

          <div className="border-2 border-secondary bg-muted/30 p-4 text-sm">
            <p className="text-muted-foreground">
              <span className="font-semibold">規則：</span>
              膠捲僅允許直立擺放，不允許疊放
            </p>
          </div>
        </div>

        {/* 3D Viewer */}
        <div className="border-2 border-secondary bg-secondary/5 min-h-[400px] lg:min-h-[500px]">
          <div
            className="h-full w-full min-h-100 lg:min-h-125"
            style={{ height: "400px" }}
          >
            <Canvas camera={{ position: [2, 2, 2], fov: 50 }}>
              <PalletScene
                diameter={rollDiameter}
                height={rollHeight}
                arrangement={arrangement}
              />
            </Canvas>
          </div>
          <p className="text-xs text-center text-muted-foreground py-2 border-t-2 border-secondary">
            拖曳旋轉 | 滾輪縮放 | 右鍵平移
          </p>
        </div>
      </div>
    </div>
  );
}
