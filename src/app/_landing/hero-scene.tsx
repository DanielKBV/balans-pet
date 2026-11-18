"use client"

import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { PerformanceMonitor, useGLTF } from "@react-three/drei"
import * as THREE from "three"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"

import { stepOf, type ScreenLabels } from "./hero-shared"

const AMOUNT = 5_400
const PROFIT = 142_800
/** Blender coins, Draco-compressed (docs/launch/PATCH_MONETY.md); the decoder is served from /draco, not a CDN. */
const COINS_URL = "/models/balans-coins.glb"
const DRACO_URL = "/draco/"

type CoinKind = "som" | "usd" | "eur" | "rub" | "btc" | "b"
/** [kind, x, y, z, tilt x, tilt y, tilt z, size], relative to the phone centre (phone 2.5 × 5).
    Rule: a coin over the phone is either in front of the glass (z ≥ 1.8) or behind it (z ≤ −1.8), never inside. */
type Slot = [CoinKind, number, number, number, number, number, number, number]
const DESKTOP_SLOTS: Slot[] = [
  ["som", -1.75, 1.95, 1.9, -0.35, 0.85, 0.15, 1.15],
  ["eur", 1.5, 2.3, -1.9, 0.3, -0.7, -0.2, 0.9],
  ["b", -2.2, -0.35, 1.95, 0.2, 0.95, -0.1, 0.9],
  ["usd", 2.0, 0.4, 2.0, -0.25, -0.9, 0.25, 1.1],
  ["som", -1.5, -2.35, -1.8, 0.45, 0.6, 0.1, 0.9],
  ["btc", 1.65, -2.0, 1.8, 0.4, -0.75, -0.3, 1.2],
  ["rub", 2.75, -0.85, -0.5, -0.1, -1.0, 0.1, 0.85],
]
const MOBILE_SLOTS: Slot[] = [
  ["som", -1.85, 1.85, 1.9, -0.35, 0.85, 0.15, 1.45],
  ["usd", 1.95, 1.25, 2.0, -0.25, -0.9, 0.25, 1.3],
  ["btc", 0.15, 2.95, -1.8, 0.4, -0.75, -0.3, 1.0],
  ["b", -2.35, -0.75, 1.9, 0.2, 0.95, -0.1, 1.0],
]
const COIN_RADIUS = 0.55
const FACE_Y = 0.085
/** The live scene starts at the moment the posters were shot (capture time), so the swap poster → 3D is not seen. */
const START_TIME = 1.5

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const ease = (t: number) => t * t * (3 - 2 * t)
const FACE_CAMERA = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0))
const _tilt = new THREE.Quaternion()
const _euler = new THREE.Euler()

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


/** Normalised pointer position, written by a window listener; returns the cleanup. */
function trackPointer(target: { current: { x: number; y: number } }) {
  const onMove = (e: PointerEvent) => {
    target.current = { x: (e.clientX / innerWidth) * 2 - 1, y: (e.clientY / innerHeight) * 2 - 1 }
  }
  addEventListener("pointermove", onMove, { passive: true })
  return () => removeEventListener("pointermove", onMove)
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


/** The «room» environment of three.js baked into reflections (no HDR file); returns the cleanup. */
function applyRoom(gl: THREE.WebGLRenderer, scene: THREE.Scene) {
  const pmrem = new THREE.PMREMGenerator(gl)
  const room = new RoomEnvironment()
  const env = pmrem.fromScene(room, 0.04).texture
  pmrem.dispose()
  room.dispose()
  scene.environment = env
  return () => {
    scene.environment = null
    env.dispose()
  }
}

/* ---------- coins ---------- */

type CoinNodes = Record<string, THREE.Mesh>

/** «Silver» from prototype v4; the shader program is shared by all coins. */
function coinMaterials() {
  return {
    body: new THREE.MeshStandardMaterial({ color: "#cfd1d6", metalness: 1, roughness: 0.22, envMapIntensity: 1.25 }),
    sym: new THREE.MeshStandardMaterial({ color: "#ebecef", metalness: 1, roughness: 0.12, envMapIntensity: 1.35 }),
  }
}

/** Coin = group → inner group (radius 0.55) → body + the symbol on both faces. Geometry is shared by all coins. */
function buildCoin(nodes: CoinNodes, kind: CoinKind) {
  const { body, sym } = coinMaterials()
  const outer = new THREE.Group()
  const inner = new THREE.Group()
  inner.scale.setScalar(COIN_RADIUS)
  outer.add(inner)
  inner.add(new THREE.Mesh(nodes.coin_body.geometry, body))
  const top = new THREE.Mesh(nodes[`sym_${kind}`].geometry, sym)
  top.position.y = FACE_Y
  const bottom = new THREE.Mesh(nodes[`sym_${kind}`].geometry, sym)
  bottom.position.y = -FACE_Y
  bottom.rotation.x = Math.PI
  inner.add(top, bottom)
  outer.userData.materials = [body, sym]
  return outer
}

/** Tilt quaternion × «face the camera» (rotation.x = π/2). */
function orient(coin: THREE.Object3D, ax: number, ay: number, az: number) {
  _euler.set(ax, ay, az)
  _tilt.setFromEuler(_euler)
  coin.quaternion.copy(_tilt).multiply(FACE_CAMERA)
}

/** Shared state the card rig writes every frame and the coins read. */
type Pose = { p: number; t: number; baseX: number; baseY: number; scale: number; mobile: boolean; mouse: { x: number; y: number } }

/** Calls `onReady` once the coins have been drawn twice: only then the canvas replaces the poster. */
function Coins({ pose, mobile, onReady }: { pose: RefObject<Pose>; mobile: boolean; onReady: () => void }) {
  const { nodes } = useGLTF(COINS_URL, DRACO_URL) as unknown as { nodes: CoinNodes }
  const slots = mobile ? MOBILE_SLOTS : DESKTOP_SLOTS
  const coins = useMemo(() => slots.map(([kind]) => buildCoin(nodes, kind)), [nodes, slots])
  const drawn = useRef(0)

  useEffect(
    () => () => coins.forEach((c) => (c.userData.materials as THREE.Material[]).forEach((m) => m.dispose())),
    [coins]
  )

  useFrame(() => {
    const { p, t, baseX, baseY, scale, mouse } = pose.current!
    const wobble = 1
    const cs = mobile ? 1 : scale
    const targetY = mobile ? baseY + 2.6 : 0
    coins.forEach((coin, i) => {
      const [, x, y, z, ax, ay, az, size] = slots[i]
      const ph = i * (mobile ? 1.7 : 1.3)
      const fx = baseX + x * cs
      const fy = y * cs + Math.sin(t * 0.7 + ph) * 0.12 * wobble
      // Fly-in: first out (sideways for coins behind the phone, and forward), then to the centre in front of the glass.
      const e = ease(clamp((p - 0.18 - i * 0.02) / 0.24, 0, 1))
      const side = Math.sign(x) || 1
      const outX = baseX + side * Math.max(Math.abs(x), 2.5) * cs
      let px: number
      let py = fy
      let pz: number
      let shrink = 1
      if (e < 0.5) {
        const a = ease(e * 2)
        px = lerp(fx, z < 0 ? outX : fx, a)
        pz = lerp(z, 1.6, a)
      } else {
        const a = ease((e - 0.5) * 2)
        px = lerp(z < 0 ? outX : fx, baseX, a)
        py = lerp(fy, targetY, a)
        pz = 1.6
        shrink = 1 - a * 0.96
      }
      coin.position.set(px, py, pz)
      coin.scale.setScalar(cs * shrink * size * 0.85)
      // Hidden before it shrinks to a dot on the screen (a grey speck on a still frame).
      coin.visible = shrink > 0.15
      orient(
        coin,
        ax * (1 - e) + Math.sin(t * 0.55 + ph) * 0.12 * wobble + mouse.y * 0.12,
        ay * (1 - e) + Math.sin(t * 0.4 + ph) * 0.18 * wobble + mouse.x * 0.2,
        az + Math.sin(t * 0.3 + ph) * 0.08 * wobble
      )
    })
    if (++drawn.current === 2) onReady()
  })

  return (
    <>
      {coins.map((coin, i) => (
        <primitive key={i} object={coin} />
      ))}
    </>
  )
}

/* ---------- scene ---------- */

function Rig({
  progress,
  labels,
  font,
  active,
  capture,
  mobile,
  onReady,
}: {
  progress: RefObject<number>
  labels: ScreenLabels
  font: string
  active: boolean
  capture: boolean
  /** Below 900 px: the phone is bigger and half visible, 4 coins, no 3D bars. */
  mobile: boolean
  onReady: () => void
}) {
  const { gl, scene, setFrameloop } = useThree()
  const screen = useMemo(() => createScreen(labels, font), [labels, font])
  const card = useRef<THREE.Group>(null)
  const bars = useRef<THREE.Group>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const tilt = useRef({ x: 0, y: 0 })
  const started = useRef(false)
  const smoothMouse = useRef({ x: 0, y: 0 })
  const pose = useRef<Pose>({ p: 0, t: 0, baseX: 0, baseY: 0, scale: 1, mobile, mouse: { x: 0, y: 0 } })

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

  useEffect(() => applyRoom(gl, scene), [gl, scene])
  useEffect(() => trackPointer(mouse), [])
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

  useFrame((state) => {
    const p = progress.current ?? 0
    const step = stepOf(p)
    const value = step === 1 ? AMOUNT * clamp((p - 0.36) / 0.18, 0, 1) : step === 2 ? PROFIT * clamp((p - 0.68) / 0.2, 0, 1) : 0
    screen.draw(step, value)

    // Capture mode freezes the time, so the pictures of both languages show the coins in the same places.
    const t = START_TIME + (capture ? 0 : state.clock.elapsedTime)
    // Too narrow for the scene (coins near the camera reach ~3.4 sideways): pull the camera back so it fits the width, like object-contain.
    state.camera.position.z = 12 * Math.max(1, 0.9 / (state.size.width / state.size.height))
    const scale = mobile ? 1.5 : 1
    const baseX = 0
    const baseY = mobile ? -2.75 : 0
    // The pointer leans in gently, so the first live frames match the poster (shot without a pointer).
    smoothMouse.current.x = lerp(smoothMouse.current.x, mouse.current.x, 0.04)
    smoothMouse.current.y = lerp(smoothMouse.current.y, mouse.current.y, 0.04)
    const m = smoothMouse.current
    const targetY = lerp(-0.75, 0.3, p) + m.x * 0.12
    const targetX = 0.12 - p * 0.12 + m.y * 0.06
    // First frame: straight to the pose (the poster's), afterwards follow it smoothly.
    tilt.current.y = started.current ? lerp(tilt.current.y, targetY, 0.08) : targetY
    tilt.current.x = started.current ? lerp(tilt.current.x, targetX, 0.08) : targetX
    started.current = true
    card.current!.rotation.set(tilt.current.x, tilt.current.y, 0)
    card.current!.position.set(baseX, baseY + Math.sin(t * 0.8) * 0.08, 0)
    card.current!.scale.setScalar(scale)
    Object.assign(pose.current, { p, t, baseX, baseY, scale, mobile, mouse: m })

    const grow = clamp((p - 0.68) / 0.15, 0, 1)
    bars.current!.children.forEach((bar, i) => {
      const h = bar.userData.h as number
      bar.visible = grow > 0 && !mobile
      bar.scale.set(scale, Math.max(0.01, grow) * scale, scale)
      // Close to the phone (its edge is at 1.25): further out the right bar was cut on narrow boxes (1024 px).
      bar.position.set(baseX + (1.6 + i * 0.5) * scale, (-1.8 + (h * grow) / 2) * scale, 0.6)
    })

  })

  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 6, 8]} intensity={1.1} />
      <pointLight position={[-6, -2, 4]} color={0x6e6cff} intensity={40} distance={30} />
      <group ref={card}>
        <mesh geometry={body}>
          {/* Standard, not physical with clearcoat: its shader compile was the longest task on a phone (perf-auditor). */}
          <meshStandardMaterial color={0x3a3e52} metalness={0.9} roughness={0.18} envMapIntensity={1.8} />
        </mesh>
        <mesh geometry={face} position-z={0.112}>
          <meshBasicMaterial map={screen.texture} toneMapped={false} />
        </mesh>
        <mesh geometry={face} position-z={0.116}>
          <meshStandardMaterial color={0xffffff} metalness={0} roughness={0.05} transparent opacity={0.06} envMapIntensity={2} />
        </mesh>
      </group>
      {/* The canvas stays hidden behind the poster until the coins are in, then replaces it in one go. */}
      <Suspense fallback={null}>
        <Coins pose={pose} mobile={mobile} onReady={onReady} />
      </Suspense>
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
 * The hero 3D scene: a screen card that turns with the scroll, Blender coins that fly into it, bars that grow.
 * Loaded as its own chunk on the visitor's first action; the parent keeps the picture until `onReady`.
 */
export default function HeroScene({
  progress,
  labels,
  mobile,
  active,
  onReady,
  onFail,
  capture = false,
}: {
  progress: RefObject<number>
  labels: ScreenLabels
  mobile: boolean
  /** Keeps the drawn frame readable (scripts/capture-hero.mjs). */
  capture?: boolean
  active: boolean
  onReady: () => void
  onFail: () => void
}) {
  const font = useMemo(() => getComputedStyle(document.body).fontFamily, [])
  // Sharp like the screen (max 2); if the first seconds run below 40 FPS: 1.5, then 1, then the pictures.
  const [dpr, setDpr] = useState(() => Math.min(devicePixelRatio, 2))
  return (
    <Canvas
      aria-hidden
      tabIndex={-1}
      className="pointer-events-none"
      style={{ pointerEvents: "none" }}
      dpr={dpr}
      camera={{ position: [0, 0, 12], fov: 35, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power", preserveDrawingBuffer: capture }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 0.9
        scene.fog = new THREE.Fog(0x09090c, 12, 26)
        gl.domElement.addEventListener("webglcontextlost", onFail, { once: true })
      }}
    >
      {!capture && (
        <PerformanceMonitor
          ms={200}
          iterations={10}
          bounds={(refresh) => [40, refresh > 90 ? 90 : 60]}
          onDecline={() => {
            if (dpr > 1.5) setDpr(1.5)
            else if (dpr > 1) setDpr(1)
            else onFail()
          }}
        />
      )}
      <Rig progress={progress} labels={labels} font={font} active={active} capture={capture} mobile={mobile} onReady={onReady} />
    </Canvas>
  )
}

/** Fetch the model once the poster is up (called by the hero when it decides to load 3D). */
export function preloadCoins() {
  useGLTF.preload(COINS_URL, DRACO_URL)
}
