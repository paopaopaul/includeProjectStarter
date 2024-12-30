import { Points, PointMaterial } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

export default function ParticleSystem() {
  const particles = useMemo(() => {
    const positions = new Float32Array(1000 * 3); // 1000 particles (x, y, z)
    for (let i = 0; i < 1000; i++) {
      const x = THREE.MathUtils.randFloatSpread(100);
      const y = THREE.MathUtils.randFloatSpread(100);
      const z = THREE.MathUtils.randFloatSpread(100);
      positions.set([x, y, z], i * 3);
    }
    return positions;
  }, []);

  return (
    <Points positions={particles}>
      <PointMaterial size={1.5} color="white" />
    </Points>
  );
}
