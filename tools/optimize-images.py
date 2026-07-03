#!/usr/bin/env python3
"""One-shot image optimizer for the portfolio.

Converts the 8 heaviest legacy images to WebP (quality 80; the two large
photos are downscaled to max 2000px wide), updates every HTML reference,
and removes the originals. Verified savings: ~5.0MB -> ~0.6MB (-88%).

Run from the repository root:

    python3 tools/optimize-images.py

Requires either Pillow (`pip3 install Pillow`) or cwebp (`brew install webp`).
Afterwards review with `git status`, then commit and push:

    git add -A && git commit -m "assets: convert heavy images to WebP" && git push

Safe to delete this script once it has run.
"""
import os
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "assets", "images")

# (filename, max_width or None)
JOBS = [
    ("pexels-tima-miroshnichenko-8376233.jpeg", 2000),
    ("upstream-it.jpg", 2000),
    ("1.1-research-affinity-diagram-1.png", None),
    ("1.2-research-service-blueprint.png", None),
    ("1.3-research-customer-journey-map.png", None),
    ("2.1-example-one-pager.png", None),
    ("5a-v1.png", None),
    ("5b-v3.png", None),
]

# exact HTML reference swaps (file, old, new)
SWAPS = [
    ("index.html",
     'src="assets/images/pexels-tima-miroshnichenko-8376233.jpeg" alt="A clinician conducting a telehealth video visit from her desk" loading="lazy" width="4128" height="2322"',
     'src="assets/images/pexels-tima-miroshnichenko-8376233.webp" alt="A clinician conducting a telehealth video visit from her desk" loading="lazy" width="2000" height="1125"'),
    ("mayo-telehealth.html",
     'content="https://halcykon.github.io/UXPortfolio/assets/images/pexels-tima-miroshnichenko-8376233.jpeg"',
     'content="https://halcykon.github.io/UXPortfolio/assets/images/pexels-tima-miroshnichenko-8376233.webp"'),
    ("mayo-telehealth.html",
     "url('assets/images/pexels-tima-miroshnichenko-8376233.jpeg')",
     "url('assets/images/pexels-tima-miroshnichenko-8376233.webp')"),
    ("mayo-telehealth.html", "assets/images/1.1-research-affinity-diagram-1.png", "assets/images/1.1-research-affinity-diagram-1.webp"),
    ("mayo-telehealth.html", "assets/images/1.2-research-service-blueprint.png", "assets/images/1.2-research-service-blueprint.webp"),
    ("mayo-telehealth.html", "assets/images/1.3-research-customer-journey-map.png", "assets/images/1.3-research-customer-journey-map.webp"),
    ("mayo-telehealth.html", "assets/images/2.1-example-one-pager.png", "assets/images/2.1-example-one-pager.webp"),
    ("exxonmobil-upstream.html",
     'content="https://halcykon.github.io/UXPortfolio/assets/images/upstream-it.jpg"',
     'content="https://halcykon.github.io/UXPortfolio/assets/images/upstream-it.webp"'),
    ("exxonmobil-upstream.html", "url('assets/images/upstream-it.jpg')", "url('assets/images/upstream-it.webp')"),
    ("exxonmobil-upstream.html", "assets/images/5b-v3.png", "assets/images/5b-v3.webp"),
    ("exxonmobil-upstream.html", "assets/images/5a-v1.png", "assets/images/5a-v1.webp"),
]


def convert_pillow(src, dst, max_w):
    from PIL import Image
    im = Image.open(src).convert("RGB")
    if max_w and im.width > max_w:
        im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
    im.save(dst, "WEBP", quality=80, method=6)


def convert_cwebp(src, dst, max_w):
    cmd = ["cwebp", "-q", "80", "-m", "6"]
    if max_w:
        cmd += ["-resize", str(max_w), "0"]
    cmd += [src, "-o", dst]
    subprocess.run(cmd, check=True, capture_output=True)


def main():
    try:
        import PIL  # noqa: F401
        convert = convert_pillow
        engine = "Pillow"
    except ImportError:
        if shutil.which("cwebp"):
            convert = convert_cwebp
            engine = "cwebp"
        else:
            sys.exit("Need Pillow (pip3 install Pillow) or cwebp (brew install webp).")

    print(f"Converting with {engine}…")
    total_before = total_after = 0
    for name, max_w in JOBS:
        src = os.path.join(IMG, name)
        if not os.path.exists(src):
            print(f"  skip (already converted?): {name}")
            continue
        dst = os.path.join(IMG, os.path.splitext(name)[0] + ".webp")
        before = os.path.getsize(src)
        convert(src, dst, max_w)
        after = os.path.getsize(dst)
        assert after > 0, f"empty output for {name}"
        os.remove(src)
        total_before += before
        total_after += after
        print(f"  {name}: {before // 1024}KB -> {after // 1024}KB")

    print("Updating HTML references…")
    for fname, old, new in SWAPS:
        path = os.path.join(ROOT, fname)
        s = open(path, encoding="utf-8").read()
        if old in s:
            open(path, "w", encoding="utf-8").write(s.replace(old, new))
            print(f"  {fname}: swapped {old[:60]}…")
        elif new.split("/")[-1].split('"')[0] in s or ".webp" in new and new in s:
            print(f"  {fname}: already swapped")
        else:
            print(f"  WARNING {fname}: pattern not found: {old[:70]}…")

    if total_before:
        print(f"\nDone. {total_before // 1024}KB -> {total_after // 1024}KB "
              f"(saved {(total_before - total_after) // 1024}KB).")
    print("Review with `git status`, then:\n"
          '  git add -A && git commit -m "assets: convert heavy images to WebP" && git push')


if __name__ == "__main__":
    main()
