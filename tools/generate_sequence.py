"""
Generates a procedural "constellation assembly" WebP frame sequence —
particles appearing and connecting into a neural network over time, with
a slow camera push-in and rotation. Themed to match the site's existing
Neural Constellation palette (void / cyan / violet / coral).

Output: frontend/public/sequence/frame-001.webp ... frame-NNN.webp
"""

import math
import random

from PIL import Image, ImageDraw, ImageFilter, ImageChops

random.seed(7)

NUM_FRAMES = 64
SUPER_W, SUPER_H = 1920, 1080       # render resolution (supersampled)
OUT_W, OUT_H = 960, 540              # final downsampled resolution
NUM_NODES = 60
K_NEIGHBORS = 2

VOID = (6, 6, 17)
VOID_SOFT = (12, 13, 31)
PALETTE = [
    (103, 232, 249),  # cyan
    (192, 132, 252),  # violet
    (251, 146, 60),   # coral
]

OUT_DIR = "/home/claude/project/AI-Q-A-Website-main/frontend/public/sequence"


def make_background(w, h):
    bg = Image.new("RGB", (w, h), VOID)
    # soft radial gradient, lighter toward center
    cx, cy = w / 2, h / 2
    max_r = math.hypot(cx, cy)
    grad = Image.new("L", (w, h), 0)
    gd = ImageDraw.Draw(grad)
    steps = 60
    for i in range(steps, 0, -1):
        t = i / steps
        r = max_r * t
        val = int(40 * (1 - t))  # subtle lightening toward center
        gd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=val)
    soft = Image.new("RGB", (w, h), VOID_SOFT)
    bg = Image.composite(soft, bg, grad)
    return bg


BASE_BG = make_background(SUPER_W, SUPER_H)


class Node:
    def __init__(self, idx):
        # normalized position in [-1, 1], biased toward center for a denser core
        ang = random.uniform(0, math.pi * 2)
        rad = random.uniform(0, 1) ** 0.7
        self.x = math.cos(ang) * rad
        self.y = math.sin(ang) * rad * 0.62
        self.color = PALETTE[idx % len(PALETTE)]
        # stagger appearance across the first ~70% of frames
        self.appear_frame = random.uniform(0, NUM_FRAMES * 0.7)
        self.fade_frames = 6


nodes = [Node(i) for i in range(NUM_NODES)]

# nearest-neighbor edges (precomputed once, same topology throughout)
edges = []
for i, a in enumerate(nodes):
    dists = []
    for j, b in enumerate(nodes):
        if i == j:
            continue
        d = math.hypot(a.x - b.x, a.y - b.y)
        dists.append((d, j))
    dists.sort()
    for d, j in dists[:K_NEIGHBORS]:
        if d < 0.55:
            pair = tuple(sorted((i, j)))
            if pair not in edges:
                edges.append(pair)


def node_alpha(node, frame):
    t = frame - node.appear_frame
    if t <= 0:
        return 0.0
    if t >= node.fade_frames:
        return 1.0
    return t / node.fade_frames


def edge_alpha(i, j, frame):
    a = node_alpha(nodes[i], frame)
    b = node_alpha(nodes[j], frame)
    return min(a, b) * 0.95


def project(node, frame, scale, angle, w, h):
    x, y = node.x, node.y
    cos_a, sin_a = math.cos(angle), math.sin(angle)
    rx = x * cos_a - y * sin_a
    ry = x * sin_a + y * cos_a
    px = w / 2 + rx * scale * (w * 0.46)
    py = h / 2 + ry * scale * (h * 0.46)
    return px, py


def render_frame(frame_idx):
    progress = frame_idx / (NUM_FRAMES - 1)
    scale = 0.86 + 0.22 * progress           # slow push-in
    angle = progress * math.radians(10)       # gentle rotation

    base = BASE_BG.copy()
    glow = Image.new("RGBA", (SUPER_W, SUPER_H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)

    positions = [project(n, frame_idx, scale, angle, SUPER_W, SUPER_H) for n in nodes]

    # edges (glow layer)
    for (i, j) in edges:
        a = edge_alpha(i, j, frame_idx)
        if a <= 0.01:
            continue
        x1, y1 = positions[i]
        x2, y2 = positions[j]
        col = tuple(int(c) for c in nodes[i].color) + (int(255 * a),)
        gdraw.line([x1, y1, x2, y2], fill=col, width=7)

    # node glow blobs
    for idx, n in enumerate(nodes):
        a = node_alpha(n, frame_idx)
        if a <= 0.01:
            continue
        px, py = positions[idx]
        r = 18
        col = tuple(int(c) for c in n.color) + (int(190 * a),)
        gdraw.ellipse([px - r, py - r, px + r, py + r], fill=col)

    glow = glow.filter(ImageFilter.GaussianBlur(9))

    glow_rgb = Image.new("RGB", glow.size, (0, 0, 0))
    glow_rgb.paste(glow, mask=glow.split()[3])
    composed = ImageChops.screen(base, glow_rgb)

    # sharp bright cores on top: thin crisp lines + node centers
    core = Image.new("RGBA", (SUPER_W, SUPER_H), (0, 0, 0, 0))
    cdraw = ImageDraw.Draw(core)
    for (i, j) in edges:
        a = edge_alpha(i, j, frame_idx)
        if a <= 0.01:
            continue
        x1, y1 = positions[i]
        x2, y2 = positions[j]
        mix = tuple(
            int((nodes[i].color[k] + nodes[j].color[k]) / 2) for k in range(3)
        )
        col = mix + (int(150 * a),)
        cdraw.line([x1, y1, x2, y2], fill=col, width=2)
    for idx, n in enumerate(nodes):
        a = node_alpha(n, frame_idx)
        if a <= 0.01:
            continue
        px, py = positions[idx]
        r = 4.6
        col = (250, 248, 255, int(235 * a))
        cdraw.ellipse([px - r, py - r, px + r, py + r], fill=col)

    composed = composed.convert("RGBA")
    composed = Image.alpha_composite(composed, core).convert("RGB")

    final = composed.resize((OUT_W, OUT_H), Image.LANCZOS)
    return final


import os

os.makedirs(OUT_DIR, exist_ok=True)
for f in range(NUM_FRAMES):
    img = render_frame(f)
    path = os.path.join(OUT_DIR, f"frame-{f+1:03d}.webp")
    img.save(path, "WEBP", quality=82, method=4)
    if f % 8 == 0:
        print(f"frame {f+1}/{NUM_FRAMES} done")

print("All frames rendered to", OUT_DIR)
