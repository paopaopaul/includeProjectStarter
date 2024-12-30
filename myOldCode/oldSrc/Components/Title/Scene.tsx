import { OrthographicCamera } from "@react-three/drei";
import { Color } from "three";
import { GroupProps } from "@react-three/fiber";
import ParticleSystem from "./ParticleSystem";

// Define props for the Scene component (if you expect props, you can define them here)
interface SceneProps extends GroupProps {}

export default function Scene({ ...props }: SceneProps) {
  return (
    <>
      <color attach="background" args={[new Color("#000000")]} />
      <group {...props} dispose={null}>
        <scene name="Scene 1">
          <pointLight
            name="Point Light"
            castShadow
            intensity={2.73}
            distance={50000}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-near={100}
            shadow-camera-far={100000}
          />
          <ParticleSystem />
          <OrthographicCamera
            name="1"
            makeDefault={true}
            far={10000}
            near={-50000}
          />
          <hemisphereLight
            name="Default Ambient Light"
            intensity={0.75}
            color="#eaeaea"
          />
        </scene>
      </group>
    </>
  );
}
