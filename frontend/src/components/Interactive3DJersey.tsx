import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function Interactive3DJersey() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Drag rotation state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const rotationY = useRef(0.5); // Initial Y angle
  const rotationX = useRef(0.15); // Initial X angle

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = 240;
    const height = 280;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.5);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLightFront = new THREE.DirectionalLight(0xffffff, 0.95);
    dirLightFront.position.set(2, 3, 4);
    scene.add(dirLightFront);

    const dirLightBack = new THREE.DirectionalLight(0xffffff, 0.55);
    dirLightBack.position.set(-2, -1, -4);
    scene.add(dirLightBack);

    // 5. Build the Jersey 3D Mesh Group
    const jerseyGroup = new THREE.Group();
    scene.add(jerseyGroup);

    // 6. Load GLTF model
    const loader = new GLTFLoader();
    const modelUrl = '/static/spa/fc_barcelona-leo.glb';

    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;

        // Center the model geometry
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.sub(center); // center at (0, 0, 0)
        
        // Scale the model to fit screen nicely
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.4 / maxDim; // Adjust scale factor
        model.scale.set(scale, scale, scale);

        // Optional: Traverse child meshes to adjust materials
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (mesh.material) {
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach(mat => mat.side = THREE.DoubleSide);
              } else {
                mesh.material.side = THREE.DoubleSide;
              }
            }
          }
        });

        jerseyGroup.add(model);
        setIsLoading(false);
      },
      (xhr) => {
        if (xhr.total) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          setLoadingProgress(percent);
        }
      },
      (error) => {
        console.error('An error happened loading the GLTF model:', error);
        setIsLoading(false);
      }
    );

    // 7. Interaction Handlers
    const handleStart = (clientX: number, clientY: number) => {
      isDragging.current = true;
      startX.current = clientX;
      startY.current = clientY;
    };

    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging.current) return;
      const deltaX = clientX - startX.current;
      const deltaY = clientY - startY.current;

      rotationY.current += deltaX * 0.012;
      rotationX.current = Math.max(-0.4, Math.min(0.4, rotationX.current + deltaY * 0.012));

      startX.current = clientX;
      startY.current = clientY;
    };

    const handleEnd = () => {
      isDragging.current = false;
    };

    const onMouseDown = (e: MouseEvent) => handleStart(e.clientX, e.clientY);
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onMouseUp = () => handleEnd();
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => handleEnd();

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousedown', onMouseDown);
      container.addEventListener('touchstart', onTouchStart);
    }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    // 8. Animation & Render Loop
    let animationId: number;
    const animate = () => {
      if (!isDragging.current) {
        rotationY.current += 0.007; // Slow automatic rotation
      }

      jerseyGroup.rotation.y = rotationY.current;
      jerseyGroup.rotation.x = rotationX.current;

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      if (container) {
        container.removeEventListener('mousedown', onMouseDown);
        container.removeEventListener('touchstart', onTouchStart);
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      
      renderer.dispose();
    };
  }, []);

  return (
    <div className="hero-3d-container" ref={containerRef}>
      <div className="jersey-3d-scene-wrap">
        {isLoading && (
          <div className="jersey-3d-loader-overlay" style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(20, 22, 29, 0.75)',
            backdropFilter: 'blur(8px)',
            borderRadius: '16px',
            zIndex: 10,
            color: 'var(--primary)',
            fontFamily: 'var(--font-sora)',
            textAlign: 'center',
            padding: '1rem'
          }}>
            <div className="jersey-loader-spinner" style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(0, 255, 102, 0.1)',
              borderTop: '3px solid var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '1rem'
            }}></div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <div style={{ fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.05em' }}>CARGANDO MODELO 3D</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.2rem', textShadow: '0 0 10px var(--primary-glow)' }}>{loadingProgress}%</div>
          </div>
        )}
        <canvas ref={canvasRef} style={{ display: isLoading ? 'none' : 'block', cursor: 'grab' }} />
        {!isLoading && <div className="jersey-3d-hint">Girar 3D 🔄</div>}
      </div>
    </div>
  );
}
