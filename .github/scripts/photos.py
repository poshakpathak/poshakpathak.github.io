"""Get photos/ ready for the Photos app.

Runs on every push that touches photos/. For each image it:
  - turns iPhone HEIC (and PNG/WebP) into JPG, so every browser can show it
  - rotates it upright and strips EXIF, so GPS location never goes public
  - shrinks it to 2000px on the long side
  - writes a 640px thumbnail to photos/t/ for the grid
"""
import os, sys
from PIL import Image, ImageOps
try:
    import pillow_heif
    pillow_heif.register_heif_opener()
except ImportError:
    pass

D = sys.argv[1] if len(sys.argv) > 1 else 'photos'
EXT = ('.jpg', '.jpeg', '.png', '.heic', '.heif', '.webp')
changed = []
for name in sorted(os.listdir(D)):
    path = os.path.join(D, name)
    base, ext = os.path.splitext(name)
    if not os.path.isfile(path) or ext.lower() not in EXT:
        continue
    out = os.path.join(D, base + '.jpg')
    thumb = os.path.join(D, 't', base + '.jpg')
    im = Image.open(path)
    fresh = ext != '.jpg' or 'exif' in im.info or max(im.size) > 2000
    if not fresh and os.path.exists(thumb):
        continue
    im = ImageOps.exif_transpose(im).convert('RGB')
    if fresh:
        full = im.copy()
        full.thumbnail((2000, 2000), Image.LANCZOS)
        full.save(out, 'JPEG', quality=85, optimize=True, progressive=True)
        if path != out:
            os.remove(path)
    os.makedirs(os.path.dirname(thumb), exist_ok=True)
    im.thumbnail((640, 640), Image.LANCZOS)
    im.save(thumb, 'JPEG', quality=80, optimize=True, progressive=True)
    changed.append(base + '.jpg')
print('\n'.join(changed) or 'nothing to do')
