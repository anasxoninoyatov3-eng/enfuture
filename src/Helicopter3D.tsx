import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Helicopter3DProps {
  stage: number;
  onPressButton: () => void;
  onFinish?: () => void;
}

export const Helicopter3D: React.FC<Helicopter3DProps> = ({ stage, onPressButton, onFinish }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const helicopterGroupRef = useRef<THREE.Group | null>(null);
  const buttonGroupRef = useRef<THREE.Group | null>(null);
  const buttonCapMeshRef = useRef<THREE.Mesh | null>(null);
  const glowRingMeshRef = useRef<THREE.Mesh | null>(null);
  const mainRotorGroupRef = useRef<THREE.Group | null>(null);
  const tailRotorRef = useRef<THREE.Mesh | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  // Position state tracking for interpolation
  const targetPos = useRef({
    x: -16,
    y: 12,
    z: -4,
    rotZ: -0.2,
    rotX: 0,
    buttonY: -1.2,
    glowScale: 1,
    lightIntensity: 1
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 500;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2, 13);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x6366f1, 2.8);
    mainLight.position.set(10, 20, 15);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const buttonSpotLight = new THREE.PointLight(0x38bdf8, 4, 15);
    buttonSpotLight.position.set(0, 0, 3);
    scene.add(buttonSpotLight);

    // 5. Build 3D Helicopter Group
    const helicopterGroup = new THREE.Group();
    helicopterGroupRef.current = helicopterGroup;

    // Body (Fuselage)
    const bodyGeo = new THREE.SphereGeometry(1.2, 32, 16);
    bodyGeo.scale(1.65, 1, 1);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x4f46e5, // Metallic Indigo
      metalness: 0.7,
      roughness: 0.25,
      emissive: 0x1e1b4b,
      emissiveIntensity: 0.3
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.castShadow = true;
    helicopterGroup.add(bodyMesh);

    // Cockpit Glass
    const cockpitGeo = new THREE.SphereGeometry(0.85, 32, 16);
    cockpitGeo.scale(1.1, 0.85, 0.85);
    const cockpitMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
      roughness: 0.1,
      transmission: 0.85,
      ior: 1.5
    });
    const cockpitMesh = new THREE.Mesh(cockpitGeo, cockpitMat);
    cockpitMesh.position.set(0.65, 0.1, 0);
    helicopterGroup.add(cockpitMesh);

    // Tail Boom
    const tailMat = new THREE.MeshStandardMaterial({ color: 0x312e81, metalness: 0.8, roughness: 0.2 });
    const tailGeo = new THREE.CylinderGeometry(0.2, 0.08, 2.6, 16);
    tailGeo.rotateZ(Math.PI / 2);
    const tailMesh = new THREE.Mesh(tailGeo, tailMat);
    tailMesh.position.set(-1.8, 0.2, 0);
    helicopterGroup.add(tailMesh);

    // Tail Fin
    const finGeo = new THREE.BoxGeometry(0.3, 0.8, 0.08);
    const finMesh = new THREE.Mesh(finGeo, tailMat);
    finMesh.position.set(-3.0, 0.4, 0);
    helicopterGroup.add(finMesh);

    // Tail Rotor
    const rotorMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.9, roughness: 0.1 });
    const tailRotorGeo = new THREE.BoxGeometry(0.04, 0.7, 0.04);
    const tailRotorMesh = new THREE.Mesh(tailRotorGeo, rotorMat);
    tailRotorMesh.position.set(-3.0, 0.4, 0.08);
    tailRotorRef.current = tailRotorMesh;
    helicopterGroup.add(tailRotorMesh);

    // Main Rotor Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 16);
    const shaftMesh = new THREE.Mesh(shaftGeo, tailMat);
    shaftMesh.position.set(0, 1.2, 0);
    helicopterGroup.add(shaftMesh);

    // Main Rotor Blades
    const mainRotorGroup = new THREE.Group();
    mainRotorGroupRef.current = mainRotorGroup;
    const blade1 = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.03, 0.22), rotorMat);
    const blade2 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 4.4), rotorMat);
    mainRotorGroup.add(blade1);
    mainRotorGroup.add(blade2);
    mainRotorGroup.position.set(0, 1.45, 0);
    helicopterGroup.add(mainRotorGroup);

    // Landing Skids & Pressing Foot Attachment
    const skidMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
    const skid1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.5, 16), skidMat);
    skid1.rotateZ(Math.PI / 2);
    skid1.position.set(0, -1.2, 0.65);
    const skid2 = skid1.clone();
    skid2.position.set(0, -1.2, -0.65);
    helicopterGroup.add(skid1);
    helicopterGroup.add(skid2);

    // Vertical legs connecting skids
    const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 16), skidMat);
    leg1.position.set(0.4, -0.95, 0.65);
    const leg2 = leg1.clone(); leg2.position.set(-0.4, -0.95, 0.65);
    const leg3 = leg1.clone(); leg3.position.set(0.4, -0.95, -0.65);
    const leg4 = leg1.clone(); leg4.position.set(-0.4, -0.95, -0.65);
    helicopterGroup.add(leg1); helicopterGroup.add(leg2); helicopterGroup.add(leg3); helicopterGroup.add(leg4);

    // Front Push Rod / Pressing Peg at bottom of Helicopter
    const pushRodGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.6, 16);
    const pushRodMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, emissive: 0x0284c7, emissiveIntensity: 0.5 });
    const pushRodMesh = new THREE.Mesh(pushRodGeo, pushRodMat);
    pushRodMesh.position.set(0.2, -1.4, 0);
    helicopterGroup.add(pushRodMesh);

    scene.add(helicopterGroup);

    // 6. Build 3D Interactive Button & Pedestal
    const buttonGroup = new THREE.Group();
    buttonGroupRef.current = buttonGroup;
    buttonGroup.position.set(0, -1.5, 0);

    // Outer Pedestal Base
    const baseGeo = new THREE.CylinderGeometry(1.6, 1.9, 0.5, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set(0, -0.25, 0);
    baseMesh.receiveShadow = true;
    buttonGroup.add(baseMesh);

    // Metallic Inner Ring
    const ringGeo = new THREE.CylinderGeometry(1.25, 1.25, 0.1, 32);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x6366f1, metalness: 0.9, roughness: 0.2 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(0, 0.05, 0);
    buttonGroup.add(ringMesh);

    // Glowing Pressable Button Cap
    const capGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.4, 32);
    const capMat = new THREE.MeshStandardMaterial({
      color: 0x4f46e5,
      emissive: 0x6366f1,
      emissiveIntensity: 0.6,
      metalness: 0.4,
      roughness: 0.2
    });
    const buttonCapMesh = new THREE.Mesh(capGeo, capMat);
    buttonCapMesh.position.set(0, 0.2, 0);
    buttonCapMesh.castShadow = true;
    buttonCapMeshRef.current = buttonCapMesh;
    buttonGroup.add(buttonCapMesh);

    // Animated Shockwave Light Ring around button
    const glowRingGeo = new THREE.RingGeometry(1.2, 1.6, 32);
    glowRingGeo.rotateX(-Math.PI / 2);
    const glowRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6
    });
    const glowRingMesh = new THREE.Mesh(glowRingGeo, glowRingMat);
    glowRingMesh.position.set(0, 0.02, 0);
    glowRingMeshRef.current = glowRingMesh;
    buttonGroup.add(glowRingMesh);

    scene.add(buttonGroup);

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth || window.innerWidth;
      const h = containerRef.current.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 7. Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Spin Helicopter Rotors
      if (mainRotorGroupRef.current) {
        mainRotorGroupRef.current.rotation.y += 0.45;
      }
      if (tailRotorRef.current) {
        tailRotorRef.current.rotation.x += 0.55;
      }

      // Smooth Helicopter Motion Interpolation
      const t = targetPos.current;

      helicopterGroup.position.x += (t.x - helicopterGroup.position.x) * 0.07;
      helicopterGroup.position.y += (t.y - helicopterGroup.position.y) * 0.07;
      helicopterGroup.position.z += (t.z - helicopterGroup.position.z) * 0.07;

      helicopterGroup.rotation.z += (t.rotZ - helicopterGroup.rotation.z) * 0.07;
      helicopterGroup.rotation.x += (t.rotX - helicopterGroup.rotation.x) * 0.07;

      // Gentle floating hover oscillation when hovering high
      if (t.y > 1) {
        helicopterGroup.position.y += Math.sin(elapsedTime * 4) * 0.012;
      }

      // Button Cap depression animation
      if (buttonCapMeshRef.current) {
        const curY = buttonCapMeshRef.current.position.y;
        buttonCapMeshRef.current.position.y += (t.buttonY - curY) * 0.15;
      }

      // Shockwave Light Ring pulse animation
      if (glowRingMeshRef.current) {
        glowRingMeshRef.current.scale.set(t.glowScale, t.glowScale, 1);
        (glowRingMeshRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.8 - (t.glowScale - 1) * 0.3);
      }

      buttonSpotLight.intensity = t.lightIntensity;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
    };
  }, []);

  // Control Helicopter animation stages
  useEffect(() => {
    switch (stage) {
      case 0:
        // Offscreen top left
        targetPos.current = { x: -16, y: 12, z: -4, rotZ: -0.2, rotX: 0, buttonY: 0.2, glowScale: 1, lightIntensity: 2 };
        break;
      case 1:
        // Helicopter flies in, hovers right over the 3D button pedestal
        targetPos.current = { x: 0, y: 3.2, z: 0, rotZ: 0.05, rotX: 0.15, buttonY: 0.2, glowScale: 1.1, lightIntensity: 4 };
        break;
      case 2:
        // Helicopter lowers down, preparing to press
        targetPos.current = { x: 0.1, y: 0.6, z: 0, rotZ: 0.02, rotX: 0.22, buttonY: 0.2, glowScale: 1.2, lightIntensity: 6 };
        break;
      case 3:
      case 4:
        // THE PRESS! Helicopter pushes down hard on the 3D button!
        targetPos.current = { x: 0.1, y: -0.15, z: 0, rotZ: 0, rotX: 0.25, buttonY: -0.1, glowScale: 2.4, lightIntensity: 12 };
        if (!isPressed) {
          setIsPressed(true);
          onPressButton();
        }
        break;
      case 5:
        // Helicopter releases button, ascends gracefully upwards
        targetPos.current = { x: 0, y: 4.5, z: 0, rotZ: -0.1, rotX: -0.1, buttonY: 0.2, glowScale: 1.0, lightIntensity: 3 };
        break;
      case 6:
      case 7:
        // Helicopter flies away to top right into sky
        targetPos.current = { x: 20, y: 14, z: 8, rotZ: 0.35, rotX: 0.2, buttonY: 0.2, glowScale: 1.0, lightIntensity: 1 };
        if (onFinish) onFinish();
        break;
      default:
        break;
    }
  }, [stage, isPressed, onPressButton, onFinish]);

  return (
    <div className="relative w-full flex flex-col items-center">
      <div ref={containerRef} className="w-full h-[400px] md:h-[480px] pointer-events-none relative z-20 flex items-center justify-center" />
    </div>
  );
};
