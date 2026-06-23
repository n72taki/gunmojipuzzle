from __future__ import annotations

import math
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from random import Random

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "data" / "cards.js"
GENERATED_DIR = ROOT / "assets" / "generated"

GOLD = (242, 182, 51)
GOLD_DARK = (151, 91, 18)
INK = (88, 63, 49)
CREAM = (255, 244, 214)
PAPER = (255, 249, 233)

FONT_CANDIDATES = [
    Path("C:/Windows/Fonts/meiryob.ttc"),
    Path("C:/Windows/Fonts/YuGothB.ttc"),
    Path("C:/Windows/Fonts/BIZ-UDGothicB.ttc"),
    Path("C:/Windows/Fonts/msgothic.ttc"),
]


@dataclass(frozen=True)
class CardSpec:
    card_id: str
    name_key: str
    reading: str
    art_key: str
    art_image: Path
    rarity_g: int


PALETTES = {
    "gunma-ken": {
        "primary": (31, 161, 152),
        "secondary": (86, 191, 102),
        "accent": (233, 95, 77),
        "sky": (177, 226, 224),
    },
    "akagi-san": {
        "primary": (22, 142, 137),
        "secondary": (108, 184, 84),
        "accent": (225, 82, 69),
        "sky": (195, 232, 228),
    },
    "daruma": {
        "primary": (219, 66, 51),
        "secondary": (30, 150, 145),
        "accent": (242, 184, 55),
        "sky": (255, 218, 191),
    },
    "maebashi": {
        "primary": (218, 76, 91),
        "secondary": (42, 156, 145),
        "accent": (248, 174, 71),
        "sky": (225, 239, 220),
    },
    "takasaki": {
        "primary": (218, 67, 55),
        "secondary": (45, 153, 184),
        "accent": (239, 172, 50),
        "sky": (247, 230, 196),
    },
    "kiryu": {
        "primary": (29, 125, 162),
        "secondary": (205, 77, 91),
        "accent": (241, 178, 58),
        "sky": (226, 238, 222),
    },
    "isesaki": {
        "primary": (225, 87, 100),
        "secondary": (44, 153, 170),
        "accent": (241, 184, 57),
        "sky": (250, 229, 202),
    },
    "ota": {
        "primary": (49, 148, 160),
        "secondary": (91, 180, 90),
        "accent": (227, 77, 67),
        "sky": (224, 234, 215),
    },
    "numata": {
        "primary": (42, 146, 131),
        "secondary": (104, 170, 65),
        "accent": (218, 64, 57),
        "sky": (232, 239, 214),
    },
    "tatebayashi": {
        "primary": (215, 88, 124),
        "secondary": (39, 157, 164),
        "accent": (242, 177, 54),
        "sky": (232, 238, 220),
    },
    "shibukawa": {
        "primary": (36, 148, 145),
        "secondary": (92, 180, 92),
        "accent": (232, 94, 74),
        "sky": (230, 237, 217),
    },
    "fujioka": {
        "primary": (132, 92, 194),
        "secondary": (43, 154, 145),
        "accent": (230, 92, 116),
        "sky": (235, 232, 215),
    },
    "tomioka": {
        "primary": (185, 91, 58),
        "secondary": (36, 153, 168),
        "accent": (238, 181, 55),
        "sky": (234, 234, 214),
    },
    "annaka": {
        "primary": (36, 150, 151),
        "secondary": (82, 175, 86),
        "accent": (225, 83, 74),
        "sky": (231, 237, 217),
    },
    "midori": {
        "primary": (31, 151, 139),
        "secondary": (95, 178, 72),
        "accent": (232, 92, 77),
        "sky": (220, 236, 214),
    },
}


def main() -> int:
    cards = load_cards()
    if not cards:
        raise SystemExit("No card art specs found.")

    for card in cards:
        size = (1024, 1536)

        image = render_card(card, size)
        out = ROOT / card.art_image
        out.parent.mkdir(parents=True, exist_ok=True)
        image.save(out, optimize=True)
        print(f"generated {card.art_image.as_posix()} {card.reading}")

    build_city_contact_sheet(cards)
    return 0


def load_cards() -> list[CardSpec]:
    text = DATA_FILE.read_text(encoding="utf-8")
    cards: list[CardSpec] = []
    for match in re.finditer(r"\{\s*id:\s*\"([^\"]+)\"(?P<body>.*?rightsStatus:\s*\"[^\"]+\",\s*)\}", text, re.S):
        body = match.group("body")
        art = read_js_string(body, "artImage")
        if not art:
            continue
        card_id = match.group(1)
        cards.append(
            CardSpec(
                card_id=card_id,
                name_key=read_js_string(body, "nameKey") or card_id,
                reading=read_js_string(body, "readingKana") or "",
                art_key=read_js_string(body, "artKey") or "",
                art_image=Path(art),
                rarity_g=int(read_js_number(body, "rarityG") or 1),
            )
        )
    return cards


def read_js_string(body: str, key: str) -> str | None:
    match = re.search(rf"{re.escape(key)}:\s*\"([^\"]*)\"", body)
    return match.group(1) if match else None


def read_js_number(body: str, key: str) -> str | None:
    match = re.search(rf"{re.escape(key)}:\s*([0-9.]+)", body)
    return match.group(1) if match else None


def font(size: int) -> ImageFont.FreeTypeFont:
    for candidate in FONT_CANDIDATES:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    return ImageFont.load_default(size=size)


def add_shadow(image: Image.Image, mask: Image.Image, offset: tuple[int, int], blur: int, color: tuple[int, int, int, int]) -> None:
    shadow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    shadow_layer = Image.new("RGBA", image.size, color)
    shifted = Image.new("L", image.size, 0)
    shifted.paste(mask, offset)
    shadow_layer.putalpha(shifted.filter(ImageFilter.GaussianBlur(blur)))
    shadow.alpha_composite(shadow_layer)
    image.alpha_composite(shadow)


def ellipse_mask(size: tuple[int, int], bbox: tuple[float, float, float, float]) -> Image.Image:
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse(tuple(int(v) for v in bbox), fill=255)
    return mask


def rounded_mask(size: tuple[int, int], bbox: tuple[float, float, float, float], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle(tuple(int(v) for v in bbox), radius=radius, fill=255)
    return mask


def glossy_ellipse(
    image: Image.Image,
    bbox: tuple[float, float, float, float],
    color: tuple[int, int, int],
    outline: tuple[int, int, int] | None = None,
    rim: int | None = None,
    shine: bool = True,
) -> None:
    w, h = image.size
    x0, y0, x1, y1 = bbox
    rx = max(1, (x1 - x0) / 2)
    ry = max(1, (y1 - y0) / 2)
    cx = (x0 + x1) / 2
    cy = (y0 + y1) / 2
    yy, xx = np.mgrid[0:h, 0:w]
    nx = (xx - cx) / rx
    ny = (yy - cy) / ry
    dist = np.sqrt(nx * nx + ny * ny)
    inside = dist <= 1
    light = np.clip((-0.72 * nx - 0.92 * ny + 0.55), 0, 1)
    shade = np.clip(0.72 + 0.42 * light - 0.28 * dist + 0.18 * np.clip(ny, 0, 1), 0.48, 1.32)
    base = np.array(color, dtype=np.float32)
    arr = np.zeros((h, w, 4), dtype=np.uint8)
    fill = base[None, None, :] * shade[..., None]
    fill = fill + (255 - fill) * (0.10 * light[..., None])
    arr[inside, :3] = np.clip(fill[inside], 0, 255).astype(np.uint8)
    edge = np.clip((1.0 - dist) / 0.035, 0, 1)
    arr[inside, 3] = np.clip(255 * edge[inside], 0, 255).astype(np.uint8)
    image.alpha_composite(Image.fromarray(arr, "RGBA"))

    draw = ImageDraw.Draw(image, "RGBA")
    if outline:
        draw.ellipse(bbox, outline=outline + (230,), width=rim or max(4, int(rx * 0.05)))
    if shine:
        draw.ellipse(
            (cx - rx * 0.48, cy - ry * 0.66, cx - rx * 0.12, cy - ry * 0.40),
            fill=(255, 255, 255, 105),
        )
        draw.ellipse(
            (cx + rx * 0.44, cy - ry * 0.44, cx + rx * 0.62, cy - ry * 0.26),
            fill=(255, 255, 255, 70),
        )


def glossy_round_rect(
    image: Image.Image,
    bbox: tuple[float, float, float, float],
    radius: int,
    color: tuple[int, int, int],
    outline: tuple[int, int, int] | None = None,
    width: int = 4,
) -> None:
    mask = rounded_mask(image.size, bbox, radius)
    add_shadow(image, mask, (0, max(4, int(radius * 0.16))), max(5, int(radius * 0.10)), (86, 52, 20, 74))
    draw = ImageDraw.Draw(image, "RGBA")
    draw.rounded_rectangle(bbox, radius=radius, fill=color + (245,))
    draw.rounded_rectangle(
        (bbox[0] + width, bbox[1] + width, bbox[2] - width, bbox[3] - width),
        radius=max(1, radius - width),
        outline=blend(color, (255, 255, 255), 0.45) + (120,),
        width=max(2, width // 2),
    )
    draw.rounded_rectangle(
        (bbox[0] + width * 2, bbox[1] + width * 2, bbox[2] - width * 2, bbox[1] + (bbox[3] - bbox[1]) * 0.34),
        radius=max(1, radius - width * 2),
        fill=(255, 255, 255, 42),
    )
    if outline:
        draw.rounded_rectangle(bbox, radius=radius, outline=outline + (220,), width=width)


def draw_gold_bead(draw: ImageDraw.ImageDraw, x: float, y: float, r: float) -> None:
    draw.ellipse((x - r * 1.1, y - r * 0.9, x + r * 1.1, y + r * 1.25), fill=(96, 58, 18, 55))
    draw.ellipse((x - r, y - r, x + r, y + r), fill=(224, 152, 22, 245), outline=(255, 229, 105, 230), width=max(1, int(r * 0.16)))
    draw.ellipse((x - r * 0.48, y - r * 0.58, x - r * 0.08, y - r * 0.24), fill=(255, 255, 255, 95))


def render_card(card: CardSpec, size: tuple[int, int]) -> Image.Image:
    rng = Random(card.card_id)
    w, h = size
    palette = PALETTES.get(card.name_key, PALETTES.get("gunma-ken"))
    image = Image.new("RGBA", size, PAPER + (255,))

    draw_background(image, palette, rng)
    draw_theme(image, card.name_key, palette, rng)
    draw_centerpiece(image, card.name_key, palette)

    draw_g_coin(image, w * 0.72, h * 0.70, min(w, h) * 0.17)
    draw_frame(image)
    draw_rarity_pips(image, card.rarity_g)
    draw_kana_balls(image, card.reading)

    return image.convert("RGB")


def draw_background(image: Image.Image, palette: dict[str, tuple[int, int, int]], rng: Random) -> None:
    w, h = image.size
    sky = np.array(palette["sky"], dtype=np.float32)
    paper = np.array(PAPER, dtype=np.float32)
    y = np.linspace(0, 1, h, dtype=np.float32)[:, None]
    gradient = sky * (1 - y * 0.55) + paper * (y * 0.55)
    arr = np.repeat(gradient[:, None, :], w, axis=1)

    cx, cy = w * 0.52, h * 0.24
    yy, xx = np.mgrid[0:h, 0:w]
    rays = ((np.arctan2(yy - cy, xx - cx) + math.pi) / (math.pi * 2) * 34).astype(int) % 2
    arr[rays == 0] = arr[rays == 0] * 0.93 + np.array((255, 255, 255)) * 0.07

    noise = rng.normalvariate(0, 1)
    texture = (
        np.sin(xx / 13.0 + noise)
        + np.cos(yy / 17.0 - noise)
        + np.sin((xx + yy) / 37.0 + noise * 0.7)
    ) * 2.0
    arr = np.clip(arr + texture[..., None], 0, 255)
    image.alpha_composite(Image.fromarray(arr.astype(np.uint8), "RGB").convert("RGBA"))

    draw = ImageDraw.Draw(image, "RGBA")
    draw.rounded_rectangle(
        (w * 0.075, h * 0.065, w * 0.925, h * 0.935),
        radius=int(w * 0.045),
        fill=(255, 248, 225, 42),
        outline=(255, 255, 255, 80),
        width=max(3, int(w * 0.006)),
    )
    for row in range(7):
        for col in range(7):
            x = w * (0.1 + col * 0.135)
            y0 = h * (0.12 + row * 0.11)
            if rng.random() > 0.42:
                draw.ellipse(
                    (x - w * 0.005, y0 - w * 0.005, x + w * 0.005, y0 + w * 0.005),
                    fill=(232, 170, 66, 35),
                )
    for x, y0, r in [(0.48, 0.07, 0.022), (0.83, 0.23, 0.025), (0.16, 0.66, 0.018), (0.64, 0.92, 0.016)]:
        draw_gold_bead(draw, w * x, h * y0, w * r)


def draw_frame(image: Image.Image) -> None:
    w, h = image.size
    draw = ImageDraw.Draw(image, "RGBA")
    outer = (w * 0.025, h * 0.018, w * 0.975, h * 0.982)
    inner = (w * 0.055, h * 0.048, w * 0.945, h * 0.952)
    core = (w * 0.078, h * 0.07, w * 0.922, h * 0.93)

    draw.rounded_rectangle(outer, radius=int(w * 0.07), outline=(121, 74, 13, 220), width=max(8, int(w * 0.034)))
    draw.rounded_rectangle(outer, radius=int(w * 0.07), outline=(255, 228, 92, 255), width=max(5, int(w * 0.023)))
    draw.rounded_rectangle(inner, radius=int(w * 0.055), outline=(184, 105, 13, 230), width=max(4, int(w * 0.012)))
    draw.rounded_rectangle((inner[0] + w * 0.008, inner[1] + w * 0.008, inner[2] - w * 0.008, inner[3] - w * 0.008), radius=int(w * 0.048), outline=(255, 238, 147, 210), width=max(3, int(w * 0.008)))
    draw.rounded_rectangle(core, radius=int(w * 0.042), outline=GOLD_DARK + (155,), width=max(2, int(w * 0.004)))

    corner = int(w * 0.145)
    for sx in [1, -1]:
        for sy in [1, -1]:
            x0 = w * (0.08 if sx == 1 else 0.92)
            y0 = h * (0.07 if sy == 1 else 0.93)
            pts = [
                (x0, y0 + sy * corner * 0.55),
                (x0 + sx * corner * 0.34, y0 + sy * corner * 0.55),
                (x0 + sx * corner * 0.34, y0 + sy * corner * 0.18),
                (x0 + sx * corner * 0.55, y0 + sy * corner * 0.18),
                (x0 + sx * corner * 0.55, y0),
                (x0 + sx * corner * 0.86, y0),
            ]
            draw.line(pts, fill=(117, 68, 9, 210), width=max(7, int(w * 0.014)), joint="curve")
            draw.line(pts, fill=(255, 222, 77, 248), width=max(4, int(w * 0.009)), joint="curve")
            draw.line(pts, fill=(255, 250, 202, 160), width=max(1, int(w * 0.003)), joint="curve")


def draw_theme(image: Image.Image, name_key: str, palette: dict[str, tuple[int, int, int]], rng: Random) -> None:
    if name_key == "daruma":
        draw_clouds(image, palette)
        draw_flowers(image, palette, count=3)
        draw_daruma(image, palette)
        return

    draw_clouds(image, palette)
    draw_mountains(image, palette, offset=0.0)
    draw_river(image, palette)

    if name_key == "gunma-ken":
        draw_hot_spring(image)
        draw_flowers(image, palette, count=3)
    elif name_key == "akagi-san":
        draw_wind(image, palette)
        draw_flowers(image, palette, count=2)
    elif name_key == "maebashi":
        draw_bridge(image, palette)
        draw_flowers(image, palette, count=5)
    elif name_key == "takasaki":
        draw_mini_daruma(image, palette)
        draw_music(image, palette)
        draw_city_blocks(image, palette)
    elif name_key == "kiryu":
        draw_weave_ribbons(image, palette)
        draw_spool(image, palette)
    elif name_key == "isesaki":
        draw_weave_ribbons(image, palette, bold=True)
        draw_flowers(image, palette, count=3)
    elif name_key == "ota":
        draw_castle(image, palette)
        draw_factory(image, palette)
    elif name_key == "numata":
        draw_terraces(image, palette)
        draw_apples(image)
    elif name_key == "tatebayashi":
        draw_lake(image, palette)
        draw_flowers(image, palette, count=6)
    elif name_key == "shibukawa":
        draw_stone_steps(image)
        draw_hot_spring(image, small=True)
    elif name_key == "fujioka":
        draw_wisteria(image)
        draw_flowers(image, palette, count=5)
    elif name_key == "tomioka":
        draw_brick_building(image, palette)
        draw_spool(image, palette, x_factor=0.52, y_factor=0.57)
    elif name_key == "annaka":
        draw_train(image, palette)
        draw_bridge(image, palette)
    elif name_key == "midori":
        draw_train(image, palette, small=True)
        draw_valley_rail(image, palette)
    else:
        draw_flowers(image, palette, count=3)


def draw_centerpiece(image: Image.Image, name_key: str, palette: dict[str, tuple[int, int, int]]) -> None:
    if name_key == "daruma":
        return
    if name_key in {"gunma-ken", "takasaki"}:
        draw_luxury_daruma(image, palette, scale=0.94)
    else:
        draw_local_charm(image, palette, name_key)


def draw_local_charm(image: Image.Image, palette: dict[str, tuple[int, int, int]], name_key: str) -> None:
    w, h = image.size
    cx, cy = w * 0.50, h * 0.52
    rw, rh = w * 0.245, h * 0.185
    mask = ellipse_mask(image.size, (cx - rw, cy - rh, cx + rw, cy + rh))
    add_shadow(image, mask, (0, int(w * 0.035)), int(w * 0.035), (70, 39, 18, 112))
    glossy_ellipse(image, (cx - rw, cy - rh, cx + rw, cy + rh), palette["primary"], outline=(255, 244, 214), rim=max(8, int(w * 0.018)))
    draw = ImageDraw.Draw(image, "RGBA")

    face_w, face_h = rw * 1.02, rh * 0.70
    glossy_ellipse(
        image,
        (cx - face_w * 0.5, cy - face_h * 0.62, cx + face_w * 0.5, cy + face_h * 0.44),
        (255, 224, 184),
        outline=(255, 248, 226),
        rim=max(4, int(w * 0.010)),
        shine=False,
    )
    for dx in [-0.22, 0.22]:
        eye_x = cx + rw * dx
        eye_y = cy - rh * 0.20
        draw.ellipse((eye_x - rw * 0.10, eye_y - rw * 0.10, eye_x + rw * 0.10, eye_y + rw * 0.10), fill=(255, 255, 255, 250))
        draw.ellipse((eye_x - rw * 0.045, eye_y - rw * 0.045, eye_x + rw * 0.045, eye_y + rw * 0.045), fill=(45, 55, 63, 250))
        draw.ellipse((eye_x - rw * 0.025, eye_y - rw * 0.030, eye_x, eye_y - rw * 0.005), fill=(255, 255, 255, 230))
    draw.arc((cx - rw * 0.25, cy - rh * 0.08, cx + rw * 0.25, cy + rh * 0.22), 20, 160, fill=(84, 52, 38, 230), width=max(4, int(w * 0.010)))

    symbol_color = palette["accent"]
    if name_key in {"akagi-san", "numata", "shibukawa", "midori"}:
        draw.polygon(
            [(cx - rw * 0.58, cy + rh * 0.45), (cx - rw * 0.18, cy + rh * 0.04), (cx + rw * 0.20, cy + rh * 0.45)],
            fill=blend(palette["secondary"], (255, 255, 255), 0.05) + (230,),
        )
        draw.polygon(
            [(cx - rw * 0.04, cy + rh * 0.45), (cx + rw * 0.35, cy + rh * 0.02), (cx + rw * 0.64, cy + rh * 0.45)],
            fill=blend(palette["primary"], (0, 60, 70), 0.08) + (230,),
        )
    elif name_key in {"kiryu", "isesaki", "tomioka"}:
        for index, color in enumerate([palette["accent"], palette["secondary"], (255, 222, 104)]):
            y = cy + rh * (0.23 + index * 0.12)
            draw.line((cx - rw * 0.54, y, cx + rw * 0.54, y - rh * 0.12), fill=color + (230,), width=max(10, int(w * 0.020)))
    elif name_key in {"ota", "annaka"}:
        glossy_round_rect(
            image,
            (cx - rw * 0.42, cy + rh * 0.12, cx + rw * 0.42, cy + rh * 0.45),
            int(w * 0.018),
            blend(symbol_color, (255, 255, 255), 0.08),
            outline=(255, 244, 214),
            width=max(3, int(w * 0.007)),
        )
    elif name_key in {"maebashi", "tatebayashi", "fujioka"}:
        draw_flower(draw, cx - rw * 0.28, cy + rh * 0.34, w * 0.055, symbol_color)
        draw_flower(draw, cx + rw * 0.26, cy + rh * 0.38, w * 0.045, palette["secondary"])
    else:
        draw.arc((cx - rw * 0.42, cy + rh * 0.16, cx + rw * 0.42, cy + rh * 0.50), 190, 350, fill=(88, 205, 216, 210), width=max(8, int(w * 0.018)))

    for dx in [-0.34, 0.0, 0.34]:
        draw.rounded_rectangle(
            (cx + rw * dx - rw * 0.045, cy + rh * 0.58, cx + rw * dx + rw * 0.045, cy + rh * 0.86),
            radius=int(w * 0.025),
            fill=(255, 212, 66, 235),
            outline=(170, 95, 13, 170),
            width=max(2, int(w * 0.004)),
        )


def draw_luxury_daruma(image: Image.Image, palette: dict[str, tuple[int, int, int]], scale: float = 1.0) -> None:
    w, h = image.size
    draw = ImageDraw.Draw(image, "RGBA")
    x, y = w * 0.50, h * 0.54
    rw, rh = w * 0.255 * scale, h * 0.245 * scale
    mask = ellipse_mask(image.size, (x - rw, y - rh, x + rw, y + rh))
    add_shadow(image, mask, (0, int(w * 0.038)), int(w * 0.038), (70, 39, 18, 118))
    glossy_ellipse(image, (x - rw, y - rh, x + rw, y + rh), palette["primary"], outline=(255, 244, 214), rim=max(9, int(w * 0.020)))
    glossy_ellipse(
        image,
        (x - rw * 0.66, y - rh * 0.59, x + rw * 0.66, y + rh * 0.18),
        (255, 224, 184),
        outline=(255, 248, 226),
        rim=max(5, int(w * 0.012)),
        shine=False,
    )
    for dx in [-0.28, 0.28]:
        eye_x = x + rw * dx
        eye_y = y - rh * 0.25
        draw.ellipse((eye_x - rw * 0.13, eye_y - rw * 0.13, eye_x + rw * 0.13, eye_y + rw * 0.13), fill=(255, 255, 255, 255))
        draw.ellipse((eye_x - rw * 0.060, eye_y - rw * 0.060, eye_x + rw * 0.060, eye_y + rw * 0.060), fill=(43, 52, 60, 255))
        draw.ellipse((eye_x - rw * 0.032, eye_y - rw * 0.042, eye_x + rw * 0.006, eye_y - rw * 0.010), fill=(255, 255, 255, 240))
    draw.arc((x - rw * 0.50, y - rh * 0.49, x - rw * 0.04, y - rh * 0.17), 205, 330, fill=(60, 43, 38, 255), width=max(9, int(w * 0.022)))
    draw.arc((x + rw * 0.04, y - rh * 0.49, x + rw * 0.50, y - rh * 0.17), 210, 335, fill=(60, 43, 38, 255), width=max(9, int(w * 0.022)))
    draw.arc((x - rw * 0.42, y - rh * 0.02, x + rw * 0.42, y + rh * 0.26), 20, 160, fill=(68, 45, 38, 255), width=max(7, int(w * 0.016)))
    draw_flower(draw, x, y + rh * 0.43, w * 0.060 * scale, GOLD)
    for dx in [-0.42, -0.24, 0.24, 0.42]:
        draw.arc(
            (x + rw * dx - rw * 0.12, y + rh * 0.18, x + rw * dx + rw * 0.12, y + rh * 0.72),
            80,
            280,
            fill=(255, 218, 70, 230),
            width=max(8, int(w * 0.016)),
        )


def draw_mountains(image: Image.Image, palette: dict[str, tuple[int, int, int]], offset: float = 0.0) -> None:
    w, h = image.size
    draw = ImageDraw.Draw(image, "RGBA")
    primary = palette["primary"]
    secondary = palette["secondary"]
    points = [
        (w * 0.12, h * 0.58),
        (w * 0.33, h * (0.31 + offset)),
        (w * 0.52, h * 0.59),
        (w * 0.67, h * (0.26 + offset)),
        (w * 0.92, h * 0.60),
    ]
    draw.polygon(points[:3], fill=blend(primary, (255, 255, 255), 0.10) + (235,))
    draw.polygon(points[2:], fill=blend(primary, (0, 80, 80), 0.18) + (235,))
    for x, y, r in [(0.24, 0.60, 0.13), (0.44, 0.58, 0.10), (0.75, 0.59, 0.14), (0.85, 0.62, 0.09)]:
        draw.ellipse(
            (w * (x - r), h * (y - r * 0.9), w * (x + r), h * (y + r * 0.9)),
            fill=blend(secondary, (255, 255, 255), 0.05) + (245,),
        )
    for x, y in [(0.37, 0.38), (0.69, 0.34)]:
        draw.ellipse((w * x, h * y, w * (x + 0.045), h * (y + 0.025)), fill=(255, 255, 255, 80))


def draw_river(image: Image.Image, palette: dict[str, tuple[int, int, int]]) -> None:
    w, h = image.size
    draw = ImageDraw.Draw(image, "RGBA")
    pts = [
        (w * 0.47, h * 0.47),
        (w * 0.60, h * 0.58),
        (w * 0.46, h * 0.70),
        (w * 0.58, h * 0.86),
    ]
    draw.line(pts, fill=(92, 203, 216, 225), width=int(w * 0.105), joint="curve")
    draw.line(pts, fill=(235, 255, 255, 180), width=int(w * 0.020), joint="curve")
    for i in range(7):
        y = h * (0.53 + i * 0.045)
        draw.arc((w * 0.42, y, w * 0.63, y + h * 0.045), 205, 335, fill=(255, 255, 255, 120), width=max(2, int(w * 0.004)))


def draw_clouds(image: Image.Image, palette: dict[str, tuple[int, int, int]]) -> None:
    w, h = image.size
    draw = ImageDraw.Draw(image, "RGBA")
    for x, y, scale in [(0.25, 0.17, 0.9), (0.70, 0.14, 0.75), (0.78, 0.34, 0.65)]:
        draw_cloud(draw, w * x, h * y, w * 0.12 * scale)


def draw_cloud(draw: ImageDraw.ImageDraw, x: float, y: float, r: float) -> None:
    fill = (255, 247, 226, 220)
    outline = (235, 202, 144, 95)
    circles = [
        (x - r * 1.1, y, r * 0.65),
        (x - r * 0.45, y - r * 0.35, r * 0.75),
        (x + r * 0.35, y - r * 0.25, r * 0.65),
        (x + r * 0.95, y + r * 0.10, r * 0.55),
    ]
    for cx, cy, cr in circles:
        draw.ellipse((cx - cr, cy - cr, cx + cr, cy + cr), fill=fill, outline=outline, width=max(1, int(r * 0.05)))
    draw.rounded_rectangle((x - r * 1.45, y - r * 0.08, x + r * 1.45, y + r * 0.62), radius=int(r * 0.28), fill=fill)


def draw_hot_spring(image: Image.Image, small: bool = False) -> None:
    w, h = image.size
    draw = ImageDraw.Draw(image, "RGBA")
    cx, cy = w * 0.28, h * (0.70 if small else 0.68)
    rw = w * (0.16 if small else 0.20)
    rh = h * (0.050 if small else 0.060)
    draw.ellipse((cx - rw, cy - rh, cx + rw, cy + rh), fill=(120, 210, 206, 215), outline=(120, 104, 90, 160), width=max(3, int(w * 0.008)))
    for i in range(8):
        a = math.tau * i / 8
        draw.ellipse((cx + math.cos(a) * rw * 0.9 - w * 0.025, cy + math.sin(a) * rh * 1.2 - w * 0.025, cx + math.cos(a) * rw * 0.9 + w * 0.025, cy + math.sin(a) * rh * 1.2 + w * 0.025), fill=(145, 140, 130, 235))
    steam_font = font(max(28, int(w * 0.085)))
    for i, dx in enumerate([-0.08, 0.0, 0.08]):
        draw.text((cx + w * dx, cy - h * (0.13 + 0.02 * (i % 2))), "〜", font=steam_font, fill=(255, 255, 255, 225), anchor="mm")


def draw_wind(image: Image.Image, palette: dict[str, tuple[int, int, int]]) -> None:
    w, h = image.size
    draw = ImageDraw.Draw(image, "RGBA")
    for i, y in enumerate([0.22, 0.27, 0.32]):
        draw.arc((w * (0.16 + i * 0.04), h * y, w * (0.56 + i * 0.04), h * (y + 0.10)), 170, 350, fill=(69, 191, 198, 160), width=max(5, int(w * 0.012)))


def draw_flowers(image: Image.Image, palette: dict[str, tuple[int, int, int]], count: int) -> None:
    w, h = image.size
    draw = ImageDraw.Draw(image, "RGBA")
    positions = [(0.18, 0.74), (0.82, 0.77), (0.30, 0.86), (0.70, 0.84), (0.12, 0.60), (0.90, 0.58)]
    for i in range(count):
        x, y = positions[i % len(positions)]
        draw_flower(draw, w * x, h * y, w * (0.050 + 0.010 * (i % 2)), palette["accent"])


def draw_flower(draw: ImageDraw.ImageDraw, x: float, y: float, r: float, color: tuple[int, int, int]) -> None:
    for i in range(5):
        a = math.tau * i / 5
        cx = x + math.cos(a) * r * 0.65
        cy = y + math.sin(a) * r * 0.65
        draw.ellipse((cx - r * 0.62, cy - r * 0.50, cx + r * 0.62, cy + r * 0.50), fill=color + (230,), outline=(255, 244, 214, 210), width=max(1, int(r * 0.12)))
    draw.ellipse((x - r * 0.22, y - r * 0.22, x + r * 0.22, y + r * 0.22), fill=GOLD + (245,))


def draw_bridge(image: Image.Image, palette: dict[str, tuple[int, int, int]]) -> None:
    w, h = image.size
    draw = ImageDraw.Draw(image, "RGBA")
    y = h * 0.58
    draw.arc((w * 0.28, y - h * 0.08, w * 0.72, y + h * 0.11), 190, 350, fill=(190, 108, 61, 240), width=int(w * 0.035))
    draw.arc((w * 0.31, y - h * 0.055, w * 0.69, y + h * 0.095), 190, 350, fill=(255, 238, 190, 220), width=int(w * 0.014))


def draw_city_blocks(image: Image.Image, palette: dict[str, tuple[int, int, int]]) -> None:
    w, h = image.size
    draw = ImageDraw.Draw(image, "RGBA")
    for i in range(4):
        x = w * (0.18 + i * 0.10)
        y = h * (0.48 - i * 0.025)
        draw.rounded_rectangle((x, y, x + w * 0.085, h * 0.63), radius=int(w * 0.01), fill=blend(palette["secondary"], (255, 255, 255), 0.25) + (230,), outline=(255, 244, 214, 180), width=max(2, int(w * 0.004)))
        for j in range(3):
            draw.rectangle((x + w * 0.018, y + h * (0.025 + j * 0.035), x + w * 0.058, y + h * (0.043 + j * 0.035)), fill=(252, 224, 125, 180))


def draw_music(image: Image.Image, palette: dict[str, tuple[int, int, int]]) -> None:
    w, h = image.size
    draw = ImageDraw.Draw(image, "RGBA")
    f = font(int(w * 0.11))
    draw.text((w * 0.68, h * 0.43), "♪", font=f, fill=palette["secondary"] + (210,), anchor="mm")
    draw.text((w * 0.78, h * 0.50), "♪", font=f, fill=palette["accent"] + (190,), anchor="mm")


def draw_mini_daruma(image: Image.Image, palette: dict[str, tuple[int, int, int]]) -> None:
    w, h = image.size
    draw = ImageDraw.Draw(image, "RGBA")
    x, y = w * 0.50, h * 0.58
    rw, rh = w * 0.115, h * 0.105
    draw.ellipse((x - rw, y - rh, x + rw, y + rh), fill=palette["accent"] + (235,), outline=(255, 244, 214, 220), width=max(3, int(w * 0.008)))
    draw.ellipse((x - rw * 0.62, y - rh * 0.56, x + rw * 0.62, y + rh * 0.22), fill=(255, 225, 186, 235))
    draw.ellipse((x - rw * 0.32, y - rh * 0.25, x - rw * 0.10, y - rh * 0.03), fill=(60, 44, 40, 240))
    draw.ellipse((x + rw * 0.10, y - rh * 0.25, x + rw * 0.32, y - rh * 0.03), fill=(60, 44, 40, 240))


def draw_weave_ribbons(image: Image.Image, palette: dict[str, tuple[int, int, int]], bold: bool = False) -> None:
    w, h = image.size
    draw = ImageDraw.Draw(image, "RGBA")
    colors = [palette["primary"], palette["secondary"], palette["accent"], (219, 82, 112)]
    width = int(w * (0.085 if bold else 0.065))
    for i, color in enumerate(colors):
        y = h * (0.44 + i * 0.06)
        pts = [(w * 0.12, y), (w * 0.33, y - h * 0.06), (w * 0.58, y + h * 0.04), (w * 0.88, y - h * 0.03)]
        draw.line(pts, fill=color + (220,), width=width, joint="curve")
        draw.line(pts, fill=(255, 244, 214, 120), width=max(2, int(width * 0.18)), joint="curve")


def draw_spool(image: Image.Image, palette: dict[str, tuple[int, int, int]], x_factor: float = 0.35, y_factor: float = 0.70) -> None:
    w, h = image.size
    draw = ImageDraw.Draw(image, "RGBA")
    x, y = w * x_factor, h * y_factor
    draw.rounded_rectangle((x - w * 0.07, y - h * 0.12, x + w * 0.07, y + h * 0.12), radius=int(w * 0.035), fill=palette["primary"] + (230,), outline=(255, 244, 214, 220), width=max(3, int(w * 0.008)))
    draw.ellipse((x - w * 0.10, y - h * 0.145, x + w * 0.10, y - h * 0.095), fill=(210, 137, 45, 245), outline=(255, 226, 130, 220), width=max(2, int(w * 0.006)))
    draw.ellipse((x - w * 0.10, y + h * 0.095, x + w * 0.10, y + h * 0.145), fill=(210, 137, 45, 245), outline=(255, 226, 130, 220), width=max(2, int(w * 0.006)))


def draw_castle(image: Image.Image, palette: dict[str, tuple[int, int, int]]) -> None:
    w, h = image.size
    draw = ImageDraw.Draw(image, "RGBA")
    x, y = w * 0.30, h * 0.53
    draw.rectangle((x - w * 0.12, y, x + w * 0.12, y + h * 0.12), fill=(220, 208, 178, 235), outline=(135, 98, 61, 190), width=max(2, int(w * 0.004)))
    for i in range(3):
        draw.polygon([(x - w * 0.16 + i * w * 0.10, y), (x - w * 0.11 + i * w * 0.10, y - h * 0.065), (x - w * 0.06 + i * w * 0.10, y)], fill=palette["primary"] + (235,))
    for i in range(3):
        draw.rectangle((x - w * 0.09 + i * w * 0.065, y + h * 0.035, x - w * 0.055 + i * w * 0.065, y + h * 0.07), fill=(72, 139, 151, 190))


def draw_factory(image: Image.Image, palette: dict[str, tuple[int, int, int]]) -> None:
    w, h = image.size
    draw = ImageDraw.Draw(image, "RGBA")
    x, y = w * 0.55, h * 0.60
    draw.rounded_rectangle((x - w * 0.12, y, x + w * 0.14, y + h * 0.10), radius=int(w * 0.015), fill=(205, 126, 72, 230), outline=(255, 244, 214, 200), width=max(2, int(w * 0.005)))
    for i in range(3):
        draw.rectangle((x - w * 0.10 + i * w * 0.07, y + h * 0.03, x - w * 0.06 + i * w * 0.07, y + h * 0.06), fill=(255, 222, 126, 180))
    draw.rectangle((x + w * 0.08, y - h * 0.08, x + w * 0.12, y), fill=(150, 112, 82, 220))


def draw_terraces(image: Image.Image, palette: dict[str, tuple[int, int, int]]) -> None:
    w, h = image.size
    draw = ImageDraw.Draw(image, "RGBA")
    for i in range(5):
        y = h * (0.52 + i * 0.055)
        draw.arc((w * 0.12, y - h * 0.08, w * 0.74, y + h * 0.08), 10, 170, fill=blend(palette["secondary"], (255, 255, 255), i * 0.05) + (220,), width=int(w * 0.030))


def draw_apples(image: Image.Image) -> None:
    w, h = image.size
    draw = ImageDraw.Draw(image, "RGBA")
    for x, y in [(0.23, 0.61), (0.30, 0.66), (0.78, 0.72)]:
        r = w * 0.045
        draw.ellipse((w * x - r, h * y - r, w * x + r, h * y + r), fill=(220, 59, 50, 235), outline=(255, 244, 214, 200), width=max(2, int(w * 0.005)))
        draw.ellipse((w * x - r * 0.15, h * y - r * 1.15, w * x + r * 0.35, h * y - r * 0.65), fill=(82, 164, 82, 230))


def draw_lake(image: Image.Image, palette: dict[str, tuple[int, int, int]]) -> None:
    w, h = image.size
    draw = ImageDraw.Draw(image, "RGBA")
    draw.ellipse((w * 0.20, h * 0.56, w * 0.78, h * 0.78), fill=(91, 199, 210, 210), outline=(255, 244, 214, 190), width=max(3, int(w * 0.007)))
    for i in range(4):
        draw.arc((w * (0.28 + i * 0.08), h * (0.61 + i * 0.01), w * (0.50 + i * 0.08), h * (0.67 + i * 0.01)), 195, 345, fill=(255, 255, 255, 120), width=max(2, int(w * 0.004)))


def draw_stone_steps(image: Image.Image) -> None:
    w, h = image.size
    draw = ImageDraw.Draw(image, "RGBA")
    x = w * 0.38
    for i in range(8):
        y = h * (0.46 + i * 0.045)
        step_w = w * (0.18 + i * 0.022)
        draw.rounded_rectangle((x - step_w / 2, y, x + step_w / 2, y + h * 0.03), radius=int(w * 0.012), fill=(176, 155, 130, 230), outline=(255, 244, 214, 130), width=max(1, int(w * 0.003)))


def draw_wisteria(image: Image.Image) -> None:
    w, h = image.size
    draw = ImageDraw.Draw(image, "RGBA")
    for i, x in enumerate([0.18, 0.28, 0.38, 0.52]):
        draw.line((w * x, h * 0.12, w * (x - 0.02), h * 0.42), fill=(91, 124, 72, 200), width=max(2, int(w * 0.005)))
        for j in range(6):
            y = h * (0.19 + j * 0.04)
            r = w * (0.030 - j * 0.002)
            draw.ellipse((w * x - r, y - r, w * x + r, y + r), fill=(146, 98, 200, 220), outline=(230, 207, 255, 120), width=max(1, int(w * 0.002)))


def draw_brick_building(image: Image.Image, palette: dict[str, tuple[int, int, int]]) -> None:
    w, h = image.size
    draw = ImageDraw.Draw(image, "RGBA")
    x0, y0, x1, y1 = w * 0.18, h * 0.42, w * 0.82, h * 0.58
    draw.rounded_rectangle((x0, y0, x1, y1), radius=int(w * 0.012), fill=(182, 91, 55, 235), outline=(255, 244, 214, 180), width=max(3, int(w * 0.007)))
    for row in range(4):
        y = y0 + (y1 - y0) * (row + 0.25) / 4
        draw.line((x0, y, x1, y), fill=(245, 174, 111, 150), width=max(1, int(w * 0.003)))
    for col in range(6):
        x = x0 + (x1 - x0) * (col + 0.5) / 6
        draw.arc((x - w * 0.035, y0 + h * 0.035, x + w * 0.035, y0 + h * 0.13), 180, 360, fill=(255, 232, 180, 220), width=max(3, int(w * 0.008)))


def draw_train(image: Image.Image, palette: dict[str, tuple[int, int, int]], small: bool = False) -> None:
    w, h = image.size
    draw = ImageDraw.Draw(image, "RGBA")
    x, y = w * (0.25 if not small else 0.24), h * (0.58 if not small else 0.50)
    scale = 1.0 if not small else 0.78
    draw.rounded_rectangle((x - w * 0.15 * scale, y - h * 0.065 * scale, x + w * 0.16 * scale, y + h * 0.06 * scale), radius=int(w * 0.025 * scale), fill=palette["primary"] + (235,), outline=(255, 244, 214, 220), width=max(3, int(w * 0.007)))
    for i in range(3):
        draw.rectangle((x - w * 0.105 * scale + i * w * 0.075 * scale, y - h * 0.035 * scale, x - w * 0.055 * scale + i * w * 0.075 * scale, y + h * 0.002 * scale), fill=(235, 245, 255, 205))
    draw.ellipse((x - w * 0.12 * scale, y + h * 0.045 * scale, x - w * 0.08 * scale, y + h * 0.085 * scale), fill=(63, 72, 78, 230))
    draw.ellipse((x + w * 0.08 * scale, y + h * 0.045 * scale, x + w * 0.12 * scale, y + h * 0.085 * scale), fill=(63, 72, 78, 230))


def draw_valley_rail(image: Image.Image, palette: dict[str, tuple[int, int, int]]) -> None:
    w, h = image.size
    draw = ImageDraw.Draw(image, "RGBA")
    for offset in [-0.02, 0.02]:
        draw.line([(w * (0.22 + offset), h * 0.58), (w * (0.38 + offset), h * 0.70), (w * (0.30 + offset), h * 0.84)], fill=(132, 100, 70, 190), width=max(2, int(w * 0.007)))


def draw_daruma(image: Image.Image, palette: dict[str, tuple[int, int, int]]) -> None:
    draw_luxury_daruma(image, palette, scale=1.05)


def draw_g_coin(image: Image.Image, x: float, y: float, r: float) -> None:
    draw = ImageDraw.Draw(image, "RGBA")
    mask = ellipse_mask(image.size, (x - r, y - r, x + r, y + r))
    add_shadow(image, mask, (0, int(r * 0.22)), int(r * 0.18), (78, 43, 11, 112))
    glossy_ellipse(image, (x - r, y - r, x + r, y + r), (238, 176, 40), outline=(255, 239, 135), rim=max(5, int(r * 0.07)))
    draw.ellipse((x - r * 0.76, y - r * 0.76, x + r * 0.76, y + r * 0.76), outline=(150, 87, 14, 180), width=max(4, int(r * 0.045)))
    draw.arc((x - r * 0.88, y - r * 0.88, x + r * 0.88, y + r * 0.88), 205, 335, fill=(255, 255, 255, 120), width=max(2, int(r * 0.026)))
    g_font = font(int(r * 1.15))
    draw.text((x + r * 0.035, y + r * 0.055), "G", font=g_font, anchor="mm", fill=(111, 67, 18, 155), stroke_width=max(2, int(r * 0.030)), stroke_fill=(105, 59, 12, 110))
    draw.text((x, y - r * 0.02), "G", font=g_font, anchor="mm", fill=(255, 225, 62, 255), stroke_width=max(2, int(r * 0.030)), stroke_fill=(149, 85, 12, 230))


def draw_rarity_pips(image: Image.Image, rarity: int) -> None:
    draw = ImageDraw.Draw(image, "RGBA")
    w, h = image.size
    r = w * 0.028
    for i in range(rarity):
        x = w * 0.15 + i * r * 2.25
        y = h * 0.105
        draw_gold_bead(draw, x, y, r)
        draw.text((x, y), "G", font=font(max(12, int(r * 1.35))), anchor="mm", fill=(130, 78, 18, 230))


def draw_kana_balls(image: Image.Image, reading: str) -> None:
    chars = [ch for ch in reading if not ch.isspace()]
    if not chars:
        return
    w, h = image.size
    positions = ball_positions(len(chars), w, h)
    base_radius = min(w, h) * (0.105 if len(chars) <= 4 else 0.095)
    if max(w, h) >= 1400:
        base_radius *= 1.05
    colors = [
        (224, 72, 85),
        (34, 119, 190),
        (35, 163, 154),
        (239, 171, 49),
        (209, 91, 123),
        (52, 142, 178),
    ]
    for index, ch in enumerate(chars):
        x, y = positions[index]
        color = colors[index % len(colors)]
        draw_kana_ball(image, x, y, base_radius, ch, color)


def ball_positions(count: int, w: int, h: int) -> list[tuple[float, float]]:
    layouts = {
        1: [(0.50, 0.17)],
        2: [(0.26, 0.18), (0.74, 0.18)],
        3: [(0.24, 0.18), (0.76, 0.18), (0.25, 0.80)],
        4: [(0.20, 0.17), (0.80, 0.17), (0.20, 0.55), (0.80, 0.80)],
        5: [(0.20, 0.16), (0.50, 0.15), (0.80, 0.17), (0.21, 0.77), (0.58, 0.84)],
        6: [(0.18, 0.15), (0.43, 0.14), (0.76, 0.16), (0.18, 0.54), (0.47, 0.84), (0.79, 0.78)],
        7: [(0.18, 0.15), (0.42, 0.14), (0.66, 0.15), (0.84, 0.42), (0.18, 0.55), (0.38, 0.83), (0.70, 0.82)],
    }
    normalized = layouts.get(count)
    if not normalized:
        normalized = []
        for i in range(count):
            a = -math.pi * 0.82 + i * (math.pi * 1.64 / max(1, count - 1))
            normalized.append((0.50 + math.cos(a) * 0.34, 0.50 + math.sin(a) * 0.39))
    return [(w * x, h * y) for x, y in normalized]


def draw_kana_ball(image: Image.Image, x: float, y: float, r: float, text: str, color: tuple[int, int, int]) -> None:
    draw = ImageDraw.Draw(image, "RGBA")
    mask = ellipse_mask(image.size, (x - r * 1.03, y - r * 1.03, x + r * 1.03, y + r * 1.03))
    add_shadow(image, mask, (0, int(r * 0.24)), int(r * 0.18), (88, 50, 18, 98))
    draw.ellipse(
        (x - r * 1.08, y - r * 1.08, x + r * 1.08, y + r * 1.08),
        fill=(255, 249, 230, 255),
        outline=(221, 181, 92, 205),
        width=max(5, int(r * 0.10)),
    )
    glossy_ellipse(image, (x - r * 0.86, y - r * 0.86, x + r * 0.86, y + r * 0.86), color, outline=blend(color, (0, 0, 0), 0.22), rim=max(3, int(r * 0.035)))

    draw = ImageDraw.Draw(image, "RGBA")
    draw.ellipse((x - r * 0.42, y - r * 0.55, x - r * 0.04, y - r * 0.32), fill=(255, 255, 255, 118))
    draw.ellipse((x + r * 0.44, y - r * 0.45, x + r * 0.62, y - r * 0.28), fill=(255, 255, 255, 78))
    text_font = font(max(20, int(r * 1.28)))
    stroke = max(3, int(r * 0.050))
    draw.text((x + r * 0.055, y + r * 0.065), text, font=text_font, anchor="mm", fill=(76, 50, 35, 115), stroke_width=stroke, stroke_fill=(76, 50, 35, 80))
    draw.text((x, y), text, font=text_font, anchor="mm", fill=(255, 246, 225, 255), stroke_width=stroke, stroke_fill=(255, 255, 255, 205))


def build_city_contact_sheet(cards: list[CardSpec]) -> None:
    city_cards = [card for card in cards if card.card_id.startswith("season1-")]
    if not city_cards:
        return
    thumbs: list[Image.Image] = []
    for card in city_cards:
        with Image.open(ROOT / card.art_image) as image:
            thumbs.append(image.resize((180, 270), Image.Resampling.LANCZOS).convert("RGB"))
    cols = 4
    rows = math.ceil(len(thumbs) / cols)
    sheet = Image.new("RGB", (cols * 180, rows * 270), (255, 250, 236))
    for index, thumb in enumerate(thumbs):
        sheet.paste(thumb, ((index % cols) * 180, (index // cols) * 270))
    sheet.save(GENERATED_DIR / "card-city-contact-sheet.png", optimize=True)
    print("generated assets/generated/card-city-contact-sheet.png")


def blend(a: tuple[int, int, int], b: tuple[int, int, int], amount: float) -> tuple[int, int, int]:
    return tuple(int(a[i] * (1 - amount) + b[i] * amount) for i in range(3))


if __name__ == "__main__":
    sys.exit(main())
