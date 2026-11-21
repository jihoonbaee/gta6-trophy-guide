import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const browser = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1187/chrome-linux/headless_shell';
const scenes = [
  { name: 'cover', file: '1-cover.jpg', height: 720 },
  { name: 'guide', file: '2-guide.jpg', height: 900 },
  { name: 'roadmap', file: '3-roadmap.jpg', height: 900 },
  { name: 'tracker', file: '4-tracker.jpg', height: 900 },
];
mkdirSync(resolve(root, 'screenshots'), { recursive: true });
const convert = `
from PIL import Image, ImageStat
from pathlib import Path
import sys
image = Image.open(sys.argv[1]).convert('RGB')
target = Path(sys.argv[2])
assert image.size == (int(sys.argv[3]), int(sys.argv[4])), image.size
for quality in range(86, 44, -1):
    image.save(target, 'JPEG', quality=quality, optimize=True)
    if target.stat().st_size <= 262144:
        break
assert target.stat().st_size <= 262144
assert min(image.size) >= 480 and max(image.size) <= 1280
assert max(ImageStat.Stat(image).var) > 100
bottom = image.crop((0, image.height - 30, image.width, image.height))
assert max(ImageStat.Stat(bottom).var) > 10, 'Empty bottom band'
print(f'{target.name}: {image.width}x{image.height}, {target.stat().st_size} bytes, quality {quality}')
`;

for (const scene of scenes) {
  const png = `/tmp/opencode/codex-${scene.name}.png`;
  const flags = [
    '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
    '--force-device-scale-factor=1', '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=10000', `--window-size=1280,${scene.height}`,
    `--screenshot=${png}`, '--dump-dom', `http://localhost:8080/?shot=${scene.name}`,
  ];
  const dom = execFileSync(browser, flags, { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
  if (!dom.includes('data-render-ready="true"') || !/Guide-level citations: \d+ across \d+ sources/.test(dom)) {
    throw new Error(`Scene ${scene.name} did not become ready.`);
  }
  if (!dom.includes('Vice Got a Price!') && !dom.includes('A Long Road')) throw new Error(`Scene ${scene.name} contains no trophy names.`);
  if (!dom.includes('id="app-error" role="alert" hidden')) throw new Error(`Scene ${scene.name} reports a startup error.`);
  execFileSync('python3', ['-c', convert, png, resolve(root, 'screenshots', scene.file), '1280', String(scene.height)], { stdio: 'inherit' });
}
