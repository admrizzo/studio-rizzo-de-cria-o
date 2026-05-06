import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei";
import { motion } from "framer-motion";
import { X, Sofa, BedDouble, CookingPot } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as THREE from "three";

type RoomType = "sala" | "quarto" | "cozinha";
type Style = "moderno" | "classico" | "minimalista";

const ROOM_COLORS: Record<Style, { wall: string; floor: string; accent: string }> = {
  moderno: { wall: "#f5f5f0", floor: "#8B7355", accent: "#2d3436" },
  classico: { wall: "#faf3e0", floor: "#654321", accent: "#8B4513" },
  minimalista: { wall: "#ffffff", floor: "#d4c5a9", accent: "#333333" },
};

const Room = ({ style }: { style: Style }) => {
  const colors = ROOM_COLORS[style];
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color={colors.floor} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, 2, -4]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color={colors.wall} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-4, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color={colors.wall} side={THREE.DoubleSide} />
      </mesh>
      {/* Right wall */}
      <mesh position={[4, 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color={colors.wall} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// Simple furniture using basic geometries
const Sofa3D = ({ style }: { style: Style }) => {
  const color = ROOM_COLORS[style].accent;
  return (
    <group position={[0, 0.4, -2.5]}>
      {/* Seat */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[3, 0.4, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.5, -0.4]} castShadow>
        <boxGeometry args={[3, 0.6, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Left arm */}
      <mesh position={[-1.4, 0.3, 0]} castShadow>
        <boxGeometry args={[0.2, 0.4, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Right arm */}
      <mesh position={[1.4, 0.3, 0]} castShadow>
        <boxGeometry args={[0.2, 0.4, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Cushions */}
      <mesh position={[-0.6, 0.35, 0]} castShadow>
        <boxGeometry args={[0.9, 0.15, 0.8]} />
        <meshStandardMaterial color="#95a5a6" />
      </mesh>
      <mesh position={[0.6, 0.35, 0]} castShadow>
        <boxGeometry args={[0.9, 0.15, 0.8]} />
        <meshStandardMaterial color="#95a5a6" />
      </mesh>
    </group>
  );
};

const CoffeeTable = () => (
  <group position={[0, 0.25, -0.8]}>
    <mesh position={[0, 0, 0]} castShadow>
      <boxGeometry args={[1.2, 0.05, 0.6]} />
      <meshStandardMaterial color="#b8860b" />
    </mesh>
    {[[-0.5, -0.12, -0.2], [0.5, -0.12, -0.2], [-0.5, -0.12, 0.2], [0.5, -0.12, 0.2]].map((pos, i) => (
      <mesh key={i} position={pos as [number, number, number]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.22]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
    ))}
  </group>
);

const Bed3D = ({ style }: { style: Style }) => {
  const color = ROOM_COLORS[style].accent;
  return (
    <group position={[0, 0, -2.5]}>
      {/* Frame */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[2.2, 0.3, 2.4]} />
        <meshStandardMaterial color="#deb887" />
      </mesh>
      {/* Mattress */}
      <mesh position={[0, 0.55, 0.1]} castShadow>
        <boxGeometry args={[2, 0.2, 2.2]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      {/* Headboard */}
      <mesh position={[0, 1, -1.1]} castShadow>
        <boxGeometry args={[2.2, 1.2, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Pillows */}
      <mesh position={[-0.5, 0.75, -0.8]} castShadow>
        <boxGeometry args={[0.6, 0.15, 0.4]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      <mesh position={[0.5, 0.75, -0.8]} castShadow>
        <boxGeometry args={[0.6, 0.15, 0.4]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
    </group>
  );
};

const Nightstand = ({ x }: { x: number }) => (
  <group position={[x, 0.3, -3]}>
    <mesh castShadow>
      <boxGeometry args={[0.5, 0.6, 0.4]} />
      <meshStandardMaterial color="#deb887" />
    </mesh>
    {/* Lamp */}
    <mesh position={[0, 0.5, 0]} castShadow>
      <cylinderGeometry args={[0.08, 0.12, 0.4]} />
      <meshStandardMaterial color="#f5deb3" />
    </mesh>
    <mesh position={[0, 0.8, 0]} castShadow>
      <coneGeometry args={[0.15, 0.2, 16]} />
      <meshStandardMaterial color="#fffff0" emissive="#ffffe0" emissiveIntensity={0.3} />
    </mesh>
  </group>
);

const KitchenCounter = ({ style }: { style: Style }) => (
  <group position={[0, 0, -3.2]}>
    {/* Counter */}
    <mesh position={[0, 0.5, 0]} castShadow>
      <boxGeometry args={[5, 1, 0.8]} />
      <meshStandardMaterial color="#dcdcdc" />
    </mesh>
    {/* Countertop */}
    <mesh position={[0, 1.02, 0]} castShadow>
      <boxGeometry args={[5.1, 0.05, 0.85]} />
      <meshStandardMaterial color="#2f4f4f" />
    </mesh>
    {/* Upper cabinets */}
    <mesh position={[0, 2.5, -0.2]} castShadow>
      <boxGeometry args={[5, 1, 0.4]} />
      <meshStandardMaterial color={ROOM_COLORS[style].accent} />
    </mesh>
  </group>
);

const DiningTable = () => (
  <group position={[0, 0, 0.5]}>
    <mesh position={[0, 0.4, 0]} castShadow>
      <boxGeometry args={[1.6, 0.05, 0.8]} />
      <meshStandardMaterial color="#deb887" />
    </mesh>
    {[[-0.6, 0.2, -0.3], [0.6, 0.2, -0.3], [-0.6, 0.2, 0.3], [0.6, 0.2, 0.3]].map((pos, i) => (
      <mesh key={i} position={pos as [number, number, number]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.4]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
    ))}
    {/* Chairs */}
    {[-0.6, 0.6].map((x, i) => (
      <group key={i} position={[x, 0, -0.7]}>
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[0.4, 0.05, 0.4]} />
          <meshStandardMaterial color="#a0522d" />
        </mesh>
        <mesh position={[0, 0.55, -0.18]} castShadow>
          <boxGeometry args={[0.4, 0.5, 0.05]} />
          <meshStandardMaterial color="#a0522d" />
        </mesh>
      </group>
    ))}
  </group>
);

const RoomFurniture = ({ room, style }: { room: RoomType; style: Style }) => {
  switch (room) {
    case "sala":
      return (
        <>
          <Sofa3D style={style} />
          <CoffeeTable />
          {/* TV Stand */}
          <group position={[0, 0.3, 2.5]}>
            <mesh castShadow>
              <boxGeometry args={[2, 0.6, 0.4]} />
              <meshStandardMaterial color={ROOM_COLORS[style].accent} />
            </mesh>
            {/* TV */}
            <mesh position={[0, 0.7, 0]} castShadow>
              <boxGeometry args={[1.8, 1, 0.05]} />
              <meshStandardMaterial color="#111111" />
            </mesh>
            <mesh position={[0, 0.7, 0.03]} castShadow>
              <boxGeometry args={[1.7, 0.9, 0.01]} />
              <meshStandardMaterial color="#1a1a2e" emissive="#334455" emissiveIntensity={0.2} />
            </mesh>
          </group>
        </>
      );
    case "quarto":
      return (
        <>
          <Bed3D style={style} />
          <Nightstand x={-1.5} />
          <Nightstand x={1.5} />
          {/* Wardrobe */}
          <group position={[3, 1, 0]}>
            <mesh castShadow>
              <boxGeometry args={[1.2, 2.4, 0.6]} />
              <meshStandardMaterial color={ROOM_COLORS[style].accent} />
            </mesh>
          </group>
        </>
      );
    case "cozinha":
      return (
        <>
          <KitchenCounter style={style} />
          <DiningTable />
        </>
      );
  }
};

interface Room3DViewerProps {
  onClose: () => void;
}

const Room3DViewer = ({ onClose }: Room3DViewerProps) => {
  const [room, setRoom] = useState<RoomType>("sala");
  const [style, setStyle] = useState<Style>("moderno");

  const rooms: { type: RoomType; label: string; icon: React.ReactNode }[] = [
    { type: "sala", label: "Sala", icon: <Sofa className="w-4 h-4" /> },
    { type: "quarto", label: "Quarto", icon: <BedDouble className="w-4 h-4" /> },
    { type: "cozinha", label: "Cozinha", icon: <CookingPot className="w-4 h-4" /> },
  ];

  const styles: { type: Style; label: string }[] = [
    { type: "moderno", label: "Moderno" },
    { type: "classico", label: "Clássico" },
    { type: "minimalista", label: "Minimalista" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background"
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 z-50 bg-card/80 backdrop-blur"
      >
        <X className="w-5 h-5" />
      </Button>

      {/* Controls */}
      <div className="absolute top-4 left-4 z-40 flex flex-col gap-3">
        <div className="glass rounded-xl p-3 space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Cômodo</p>
          <div className="flex gap-2">
            {rooms.map((r) => (
              <Button
                key={r.type}
                size="sm"
                variant={room === r.type ? "default" : "outline"}
                onClick={() => setRoom(r.type)}
                className="gap-1 text-xs"
              >
                {r.icon} {r.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="glass rounded-xl p-3 space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Estilo</p>
          <div className="flex gap-2">
            {styles.map((s) => (
              <Button
                key={s.type}
                size="sm"
                variant={style === s.type ? "default" : "outline"}
                onClick={() => setStyle(s.type)}
                className="text-xs"
              >
                {s.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas shadows className="w-full h-full">
        <PerspectiveCamera makeDefault position={[5, 4, 5]} fov={50} />
        <OrbitControls
          target={[0, 1, 0]}
          maxPolarAngle={Math.PI / 2}
          minDistance={3}
          maxDistance={12}
          enablePan={false}
        />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 5]} intensity={0.8} castShadow />
        <pointLight position={[0, 3, 0]} intensity={0.3} />
        <Suspense fallback={null}>
          <Room style={style} />
          <RoomFurniture room={room} style={style} />
          <Environment preset="apartment" />
        </Suspense>
      </Canvas>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass rounded-full px-6 py-2 text-sm text-muted-foreground">
        Arraste para girar • Scroll para zoom
      </div>
    </motion.div>
  );
};

export default Room3DViewer;
