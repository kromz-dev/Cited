"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export function Vortex() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 1.1, 8.2);
    camera.lookAt(0, 0.2, 0);

    const count = 2200;
    const color = 0xec3013;
    const opacity = 0.8;
    const size = 0.045;
    const offsetX = 2.9;

    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const h = Math.pow(Math.random(), 0.75) * 2 - 1;
      const radius = (0.35 + (h + 1) * 1.35) * (0.55 + Math.random() * 0.45);
      const angle = Math.random() * Math.PI * 2;
      seeds[i * 3] = angle;
      seeds[i * 3 + 1] = h;
      seeds[i * 3 + 2] = radius;
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color, size, transparent: true, opacity, depthWrite: false });
    const points = new THREE.Points(geom, mat);
    points.position.x = offsetX;
    points.scale.set(1.35, 1.35, 1.35);
    scene.add(points);

    const rings: { line: THREE.Line; h: number }[] = [];
    for (let k = 0; k < 8; k++) {
      const h = -1 + (k / 7) * 2;
      const r = (0.35 + (h + 1) * 1.35) * 1.02;
      const curve = new THREE.EllipseCurve(0, 0, r, r, 0, Math.PI * 2, false, 0);
      const pts = curve.getPoints(96).map((p: THREE.Vector2) => new THREE.Vector3(p.x, 0, p.y));
      const rg = new THREE.BufferGeometry().setFromPoints(pts);
      const rm = new THREE.LineBasicMaterial({ color, transparent: true, opacity: opacity * 0.42 });
      const line = new THREE.Line(rg, rm);
      line.position.y = h * 1.7;
      points.add(line);
      rings.push({ line, h });
    }

    const resize = () => {
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", resize);
    resize();

    let rafId: number;
    const tick = (t: number) => {
      const time = t * 0.001;
      for (let i = 0; i < count; i++) {
        const angle = seeds[i * 3];
        const h = seeds[i * 3 + 1];
        const radius = seeds[i * 3 + 2];
        const speed = 0.55 + (1 - (h + 1) / 2) * 1.5;
        const a = angle + time * speed * (reduced ? 0 : 1);
        positions[i * 3] = Math.cos(a) * radius;
        positions[i * 3 + 1] = h * 1.7 + Math.sin(time * 0.6 + h * 3) * 0.05;
        positions[i * 3 + 2] = Math.sin(a) * radius;
      }
      geom.attributes.position.needsUpdate = true;
      rings.forEach(r => {
        r.line.rotation.y = time * (0.25 + (1 - (r.h + 1) / 2) * 0.7) * (reduced ? 0 : 1);
        r.line.position.y = r.h * 1.7 + Math.sin(time * 0.6 + r.h * 3) * 0.05;
      });
      points.rotation.z = Math.sin(time * 0.12) * 0.08;
      
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafId);
      renderer.dispose();
      geom.dispose();
      mat.dispose();
      rings.forEach(r => {
        r.line.geometry.dispose();
        (r.line.material as THREE.Material).dispose();
      });
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full block pointer-events-none" 
      aria-hidden="true" 
    />
  );
}
