"use client"

import { useEffect, useMemo, useRef, type RefObject } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

import { stepOf, type ScreenLabels } from "./hero-shared"

const AMOUNT = 5_400
const PROFIT = 142_800
const COIN_KINDS = {
  som: { sym: "som", color: 0xc6cad4, metalness: 1, roughness: 0.3 },
  b: { sym: "B", color: 0x7774ff, metalness: 0.75, roughness: 0.32 },
  usd: { sym: "$", color: 0xd9b45e, metalness: 1, roughness: 0.3 },
  eur: { sym: "€", color: 0xb9c3d6, metalness: 1, roughness: 0.3 },
  rub: { sym: "₽", color: 0xc08457, metalness: 1, roughness: 0.3 },
  btc: { sym: "₿", color: 0xe3a24a, metalness: 1, roughness: 0.3 },
} as const
type CoinKind = keyof typeof COIN_KINDS
const HERO_COINS: CoinKind[] = ["som", "usd", "b", "eur", "som", "btc", "rub"]

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/* ---------- shapes ---------- */

function roundRect(w: number, h: number, r: number) {
  const s = new THREE.Shape()
  const x = -w / 2
  const y = -h / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + h - r)
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  s.lineTo(x + r, y + h)
  s.quadraticCurveTo(x, y + h, x, y + h - r)
  s.lineTo(x, y + r)
  s.quadraticCurveTo(x, y, x + r, y)
  return s
}

/** A rounded plane whose UVs span 0..1, so a canvas texture fills it exactly. */
function shapePlane(w: number, h: number, r: number) {
  const g = new THREE.ShapeGeometry(roundRect(w, h, r), 12)
  const uv = g.attributes.uv
  const pos = g.attributes.position
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h)
  return g
}

/* ---------- textures drawn in code ---------- */

/** Soft studio from three softboxes, baked once into an environment map: metal gets real highlights, no HDR file. */
function makeEnvironment(gl: THREE.WebGLRenderer) {
  const studio = new THREE.Scene()
  const c = document.createElement("canvas")
  c.width = 16
  c.height = 256
  const x = c.getContext("2d")!
  const gradient = x.createLinearGradient(0, 0, 0, 256)
  gradient.addColorStop(0, "#3a3d4d")
  gradient.addColorStop(0.5, "#101118")
  gradient.addColorStop(1, "#07070a")
  x.fillStyle = gradient
  x.fillRect(0, 0, 16, 256)
  const sky = new THREE.CanvasTexture(c)
  sky.colorSpace = THREE.SRGBColorSpace
  studio.add(new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), new THREE.MeshBasicMaterial({ map: sky, side: THREE.BackSide })))
  const boxes: [number, number, number, number, number, number, number][] = [
    [0, 8, 6, 10, 3, 0xffffff, 1.6],
    [-9, 2, 2, 3, 8, 0xb9b8ff, 0.9],
    [9, -1, 3, 3, 6, 0xffffff, 0.7],
  ]
  for (const [px, py, pz, w, h, color, intensity] of boxes) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide })
    )
    m.position.set(px, py, pz)
    m.lookAt(0, 0, 0)
    studio.add(m)
  }
  const pmrem = new THREE.PMREMGenerator(gl)
  const texture = pmrem.fromScene(studio, 0.03).texture
  pmrem.dispose()
  studio.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose()
      o.material.map?.dispose()
      o.material.dispose()
    }
  })
  return texture
}

/** «С» with a bar under it: the som sign, drawn with an arc and a rectangle (fonts rarely have it). */
function drawSymbol(x: CanvasRenderingContext2D, sym: string, cx: number, cy: number, S: number, font: string) {
  if (sym === "som") {
    const r = S * 0.17
    x.lineWidth = S * 0.055
    x.lineCap = "butt"
    x.beginPath()
    x.arc(cx, cy - S * 0.03, r, Math.PI * 0.28, Math.PI * 1.72, false)
    x.stroke()
    x.fillRect(cx - r * 1.05, cy + r * 0.95, r * 2.1, S * 0.045)
    return
  }
  x.font = `700 ${S * 0.44}px ${font}`
  x.fillText(sym, cx, cy + S * 0.02)
}

function coinFace(sym: string, bump: boolean, font: string) {
  const S = 512
  const h = S / 2
  const c = document.createElement("canvas")
  c.width = c.height = S
  const x = c.getContext("2d")!
  if (bump) {
    x.fillStyle = "#808080"
  } else {
    const g = x.createRadialGradient(h * 0.7, h * 0.6, 10, h, h, h)
    g.addColorStop(0, "#f2f3f6")
    g.addColorStop(1, "#a9adb8")
    x.fillStyle = g
  }
  x.fillRect(0, 0, S, S)
  x.lineWidth = 10
  x.strokeStyle = bump ? "#c8c8c8" : "#d3d6dd"
  x.beginPath()
  x.arc(h, h, h * 0.84, 0, Math.PI * 2)
  x.stroke()
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2
    x.fillStyle = bump ? "#b0b0b0" : "#c3c6ce"
    x.beginPath()
    x.arc(h + Math.cos(a) * h * 0.75, h + Math.sin(a) * h * 0.75, 4, 0, Math.PI * 2)
    x.fill()
  }
  x.textAlign = "center"
  x.textBaseline = "middle"
  const put = (color: string, dx: number, dy: number) => {
    x.fillStyle = color
    x.strokeStyle = color
    drawSymbol(x, sym, h + dx, h + dy, S, font)
  }
  if (bump) put("#ffffff", 0, 0)
  else {
    put("#8e93a0", 2, 2)
    put("#ffffff", -1, -1)
    put("#dcdfe5", 0, 0)
  }
  const t = new THREE.CanvasTexture(c)
  t.anisotropy = 4
  // The cylinder cap maps UVs a quarter turn off: turn the face so the symbol stands upright.
  t.center.set(0.5, 0.5)
  t.rotation = Math.PI / 2
  if (!bump) t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** Puts the studio environment on the scene; returns the cleanup. */
function applyStudio(gl: THREE.WebGLRenderer, scene: THREE.Scene) {
  const env = makeEnvironment(gl)
  scene.environment = env
  return () => {
    scene.environment = null
    env.dispose()
  }
}

/** Normalised pointer position, written by a window listener; returns the cleanup. */
function trackPointer(target: { current: { x: number; y: number } }) {
  const onMove = (e: PointerEvent) => {
    target.current = { x: (e.clientX / innerWidth) * 2 - 1, y: (e.clientY / innerHeight) * 2 - 1 }
  }
  addEventListener("pointermove", onMove, { passive: true })
  return () => removeEventListener("pointermove", onMove)
}

/* ---------- objects ---------- */

/** One geometry for every coin, materials cached per kind (threejs-performance). */
function useCoinFactory(font: string) {
  return useMemo(() => {
    const R = 0.55
    const H = 0.12
    const rc = document.createElement("canvas")
    rc.width = 512
    rc.height = 8
    const rx = rc.getContext("2d")!
    for (let i = 0; i < 512; i += 4) {
      rx.fillStyle = (i / 4) % 2 ? "#ffffff" : "#000000"
      rx.fillRect(i, 0, 4, 8)
    }
    const reed = new THREE.CanvasTexture(rc)
    reed.wrapS = THREE.RepeatWrapping
    reed.repeat.set(2, 1)
    const body = new THREE.CylinderGeometry(R, R, H, 96)
    const lip = new THREE.TorusGeometry(R - 0.03, 0.03, 12, 96)
    const materials = new Map<CoinKind, THREE.Material[]>()
    const materialsFor = (kind: CoinKind) => {
      if (!materials.has(kind)) {
        const k = COIN_KINDS[kind]
        const metal = { color: k.color, metalness: k.metalness, roughness: k.roughness, envMapIntensity: 1.2 }
        const side = new THREE.MeshStandardMaterial({ ...metal, bumpMap: reed, bumpScale: 0.6 })
        const face = new THREE.MeshStandardMaterial({
          ...metal,
          map: coinFace(k.sym, false, font),
          bumpMap: coinFace(k.sym, true, font),
          bumpScale: 1.2,
          roughness: k.roughness + 0.04,
        })
        const rim = new THREE.MeshStandardMaterial({ ...metal, roughness: 0.22 })
        materials.set(kind, [side, face, rim])
      }
      return materials.get(kind)!
    }
    const make = (kind: CoinKind) => {
      const [side, face, rim] = materialsFor(kind)
      const g = new THREE.Group()
      g.add(new THREE.Mesh(body, [side, face, face]))
      for (const sign of [1, -1]) {
        const l = new THREE.Mesh(lip, rim)
        l.rotation.x = Math.PI / 2
        l.position.y = (sign * H) / 2
        g.add(l)
      }
      return g
    }
    const dispose = () => {
      body.dispose()
      lip.dispose()
      reed.dispose()
      for (const list of materials.values())
        for (const m of list) {
          const s = m as THREE.MeshStandardMaterial
          s.map?.dispose()
          if (s.bumpMap !== reed) s.bumpMap?.dispose()
          m.dispose()
        }
    }
    return { make, dispose }
  }, [font])
}

/** Paints the interface on the screen card. Repaints only when the step or the shown number changes. */
function createScreen(labels: ScreenLabels, font: string) {
  {
    const W = 420
    const H = 860
    const c = document.createElement("canvas")
    c.width = W
    c.height = H
    const x = c.getContext("2d")!
    const texture = new THREE.CanvasTexture(c)
    texture.anisotropy = 4
    texture.colorSpace = THREE.SRGBColorSpace
    let last = ""
    const box = (bx: number, by: number, w: number, h: number, r: number, color: string) => {
      x.fillStyle = color
      x.beginPath()
      x.roundRect(bx, by, w, h, r)
      x.fill()
    }
    const text = (s: string, tx: number, ty: number, size: number, color: string, weight = 400, align: CanvasTextAlign = "left") => {
      x.font = `${weight} ${size}px ${font}`
      x.fillStyle = color
      x.textAlign = align
      x.fillText(s, tx, ty)
    }
    const draw = (step: number, value: number) => {
      const key = `${step}|${Math.round(value / 100)}`
      if (key === last) return
      last = key
      x.fillStyle = "#0b0c11"
      x.fillRect(0, 0, W, H)
      box(30, 40, 44, 44, 12, "#6e6cff")
      text("B", 52, 71, 26, "#ffffff", 700, "center")
      text(labels.brand, 88, 71, 24, "#ededf2", 600)
      if (step === 0) {
        text(labels.today, 30, 140, 22, "#8e92a3")
        for (let i = 0; i < 5; i++) {
          box(30, 170 + i * 86, 360, 70, 14, "#16181f")
          box(50, 195 + i * 86, 150, 18, 6, "#262935")
          box(300, 195 + i * 86, 70, 18, 6, i % 3 === 2 ? "#4a2423" : "#1f3a2e")
        }
      } else if (step === 1) {
        text(labels.newEntry, 30, 140, 22, "#8e92a3")
        box(30, 165, 175, 60, 12, "#173326")
        box(215, 165, 175, 60, 12, "#16181f")
        text(labels.income, 117, 203, 22, "#3ecf8e", 500, "center")
        text(labels.expense, 302, 203, 22, "#8e92a3", 500, "center")
        box(30, 250, 360, 96, 14, "#16181f")
        text(labels.amount(value), 52, 315, 44, "#ededf2", 600)
        labels.chips.forEach((chip, i) => {
          const cx = 30 + (i % 2) * 185
          const cy = 372 + Math.floor(i / 2) * 62
          box(cx, cy, 172, 48, 24, i === 1 ? "#2c2b66" : "#16181f")
          // Shrink the font until the chip label fits (long category names, English).
          let size = 19
          x.font = `400 ${size}px ${font}`
          while (size > 12 && x.measureText(chip).width > 140) x.font = `400 ${--size}px ${font}`
          text(chip, cx + 18, cy + 31, size, i === 1 ? "#ededf2" : "#8e92a3")
        })
        box(30, 540, 360, 70, 14, "#6e6cff")
        text(labels.save, 210, 583, 24, "#ffffff", 500, "center")
      } else {
        text(labels.profitTitle, 30, 140, 22, "#8e92a3")
        text(labels.amount(value), 30, 205, 50, "#3ecf8e", 600)
        text(labels.profitChange, 30, 245, 20, "#8e92a3")
        ;[0.6, 0.7, 0.66, 0.74, 0.8, 0.9].forEach((h, i) => {
          box(40 + i * 58, 640 - h * 300, 22, h * 300, 6, "#2fa874")
          box(64 + i * 58, 640 - h * 160, 22, h * 160, 6, "#b84a48")
        })
      }
      texture.needsUpdate = true
    }
    return { texture, draw }
  }
}

/* ---------- scene ---------- */

function Rig({
  progress,
  labels,
  font,
  active,
  capture,
  minFps,
  onReady,
  onSlow,
}: {
  progress: RefObject<number>
  labels: ScreenLabels
  font: string
  active: boolean
  /** Capture mode: no quality steps, the slow software renderer must not swap the scene for pictures. */
  capture: boolean
  /** Below this, after DPR 1, the scene gives way to the pictures. */
  minFps: number
  onReady: () => void
  onSlow: () => void
}) {
  const { gl, scene, setFrameloop, setDpr } = useThree()
  const coins = useCoinFactory(font)
  const screen = useMemo(() => createScreen(labels, font), [labels, font])
  const card = useRef<THREE.Group>(null)
  const coinGroup = useRef<THREE.Group>(null)
  const bars = useRef<THREE.Group>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const tilt = useRef({ x: 0, y: 0 })
  const frames = useRef({ shown: 0, count: 0, time: 0, ready: false, degraded: false })

  const body = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundRect(2.5, 5, 0.34), {
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.06,
      bevelSegments: 3,
      curveSegments: 16,
    })
    g.translate(0, 0, -0.05)
    return g
  }, [])
  const face = useMemo(() => shapePlane(2.34, 4.84, 0.26), [])

  const coinMeshes = useMemo(
    () =>
      HERO_COINS.map((kind, i) => {
        const m = coins.make(kind)
        const a = (i / HERO_COINS.length) * Math.PI * 2
        // Fixed per coin (no Math.random), so the poster and the live scene match.
        m.userData = { sx: Math.cos(a) * 2.3 + 0.3, sy: Math.sin(a) * 2.7, sz: -1 + ((i * 37) % 20) / 10, ph: i * 0.9 }
        return m
      }),
    [coins]
  )

  useEffect(() => applyStudio(gl, scene), [gl, scene])
  useEffect(() => trackPointer(mouse), [])

  useEffect(() => () => coins.dispose(), [coins])
  useEffect(
    () => () => {
      body.dispose()
      face.dispose()
      screen.texture.dispose()
    },
    [body, face, screen]
  )

  // No frames while the hero is off screen or the tab is hidden.
  useEffect(() => setFrameloop(active ? "always" : "never"), [active, setFrameloop])

  useFrame((state, delta) => {
    const p = progress.current ?? 0
    const step = stepOf(p)
    const value = step === 1 ? AMOUNT * clamp((p - 0.36) / 0.18, 0, 1) : step === 2 ? PROFIT * clamp((p - 0.68) / 0.2, 0, 1) : 0
    screen.draw(step, value)

    const t = state.clock.elapsedTime
    // Narrower than the 900×1000 pictures: pull the camera back so the whole scene fits the width, like object-contain.
    state.camera.position.z = 12 * Math.max(1, 0.9 / (state.size.width / state.size.height))
    // Same framing on every screen: the camera keeps the height, so one set of poster pictures fits all.
    const scale = 1
    const baseX = -0.55
    tilt.current.y = lerp(tilt.current.y, lerp(-0.75, 0.3, p) + mouse.current.x * 0.12, 0.08)
    tilt.current.x = lerp(tilt.current.x, 0.12 - p * 0.12 + mouse.current.y * 0.06, 0.08)
    card.current!.rotation.set(tilt.current.x, tilt.current.y, 0)
    card.current!.position.set(baseX, Math.sin(t * 0.8) * 0.08, 0)
    card.current!.scale.setScalar(scale)

    coinGroup.current!.children.forEach((coin, i) => {
      const u = coin.userData
      const fly = clamp((p - 0.18 - i * 0.02) / 0.2, 0, 1)
      const e = fly * fly * (3 - 2 * fly)
      const fx = baseX + u.sx * scale
      const fy = u.sy * scale + Math.sin(t * 0.7 + u.ph) * 0.2
      coin.position.set(lerp(fx, baseX, e), lerp(fy, 0, e), lerp(u.sz, 0.3, e))
      coin.scale.setScalar(scale * (1 - e * 0.95))
      coin.visible = e < 0.98
      coin.rotation.x = 1.25 + Math.sin(t * 0.8 + u.ph) * 0.35
      coin.rotation.z = Math.sin(t * 0.5 + u.ph) * 0.5
    })

    const grow = clamp((p - 0.68) / 0.15, 0, 1)
    bars.current!.children.forEach((bar, i) => {
      const h = bar.userData.h as number
      bar.visible = grow > 0
      bar.scale.set(scale, Math.max(0.01, grow) * scale, scale)
      bar.position.set(baseX + (1.9 + i * 0.55) * scale, (-1.8 + (h * grow) / 2) * scale, 0.6)
    })

    // Quality steps by FPS in two-second windows: first DPR 1, then the picture instead of 3D.
    const f = frames.current
    if (!f.ready && ++f.shown === 3) {
      f.ready = true
      onReady()
    }
    if (capture) return
    // A long frame means the tab was hidden or the page stalled, not a slow GPU: start the window again.
    if (delta > 0.25) {
      f.count = 0
      f.time = 0
      return
    }
    f.count++
    f.time += delta
    if (f.time >= 2) {
      const fps = f.count / f.time
      f.count = 0
      f.time = 0
      if (fps < minFps && f.degraded) onSlow()
      else if (fps < 40 && !f.degraded) {
        f.degraded = true
        setDpr(1)
      }
    }
  })

  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 6, 8]} intensity={1.1} />
      <pointLight position={[-6, -2, 4]} color={0x6e6cff} intensity={40} distance={30} />
      <group ref={card}>
        <mesh geometry={body}>
          {/* Standard, not physical with clearcoat: its shader compile was the longest task on a phone (perf-auditor). */}
          <meshStandardMaterial color={0x343848} metalness={0.6} roughness={0.28} envMapIntensity={2.6} />
        </mesh>
        <mesh geometry={face} position-z={0.112}>
          <meshBasicMaterial map={screen.texture} toneMapped={false} />
        </mesh>
        <mesh geometry={face} position-z={0.116}>
          <meshStandardMaterial color={0xffffff} metalness={0} roughness={0.05} transparent opacity={0.06} envMapIntensity={2} />
        </mesh>
      </group>
      <group ref={coinGroup}>
        {coinMeshes.map((m, i) => (
          <primitive key={i} object={m} />
        ))}
      </group>
      <group ref={bars}>
        {[
          [1.2, 0x1f7a52],
          [0.8, 0x9a3b35],
          [1.6, 0x1f7a52],
        ].map(([h, color], i) => (
          <mesh key={i} userData={{ h }} rotation-y={0.4} visible={false}>
            <boxGeometry args={[0.34, h, 0.34]} />
            <meshStandardMaterial color={color} metalness={0} roughness={0.65} envMapIntensity={0.3} />
          </mesh>
        ))}
      </group>
    </>
  )
}

/**
 * The hero 3D scene: a screen card that turns with the scroll, coins that fly into it, bars that grow.
 * Loaded as its own chunk after the page is shown; the parent keeps the picture until `onReady`.
 */
export default function HeroScene({
  progress,
  labels,
  compact,
  active,
  onReady,
  onFail,
  capture = false,
}: {
  progress: RefObject<number>
  labels: ScreenLabels
  compact: boolean
  /** Keeps the drawn frame readable (scripts/capture-hero.mjs). */
  capture?: boolean
  active: boolean
  onReady: () => void
  onFail: () => void
}) {
  const font = useMemo(() => getComputedStyle(document.body).fontFamily, [])
  return (
    <Canvas
      aria-hidden
      tabIndex={-1}
      className="pointer-events-none"
      style={{ pointerEvents: "none" }}
      flat
      dpr={compact ? 1 : [1, 1.5]}
      camera={{ position: [0, 0, 12], fov: 35, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power", preserveDrawingBuffer: capture }}
      onCreated={({ gl, scene }) => {
        scene.fog = new THREE.Fog(0x09090c, 12, 26)
        gl.domElement.addEventListener("webglcontextlost", onFail, { once: true })
      }}
    >
      <Rig progress={progress} labels={labels} font={font} active={active} capture={capture} minFps={compact ? 30 : 24} onReady={onReady} onSlow={onFail} />
    </Canvas>
  )
}
