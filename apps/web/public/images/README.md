# Agenci brand-card background

## Layered Norwegian valley scene (September 2026)

Used only in the interactive Meet Agenci scene. Original user photograph `C:/Users/ImaFernandesDaCosta/Downloads/_DSC1857.jpeg` remains untouched. This is an AI-edited wide interpretation of a Norwegian glacial valley, not an unaltered location photograph or an invented open-water fjord.

- `agenci-meet-norwegian-valley-v2.webp`: 1536 × 1024, 238 KB, built-in image tool edit exported to WebP. Reused behind and in front of the live app; all UI remains real React controls.
- `agenci-meet-foreground-mask-v2.webp`: 1536 × 1024, 254 KB, built-in image tool luminance mask, lossless WebP. Black removes the upper scene; white keeps the lower terrain. CSS masks the duplicate photograph, so there is no rendered checkerboard. A separate attempted transparent cutout did not contain alpha and was discarded, not shipped.

The stack is background (z=0), interactive window (z=1), and decorative masked foreground (z=2). Foreground and images have `pointer-events: none`, no tab stops, and empty alt text. The foreground is also aria-hidden and clipped to its lower band. A decorative lower window lip reserves terrain overlap space without covering controls. Mobile uses a smaller lip and mask. Only that decorative lip fades; the working UI remains fully visible. Unsupported luminance masks omit the foreground instead of covering the demo.

Mode: built-in image editing; no CLI fallback. Sources: `exec-234c8fb6-f476-4f5a-9041-0b70d660be18.png` and `exec-b01218cb-9b56-4d07-853a-e328aaa433a4.png` under the Codex generated-images directory.

### Exact background prompt

Use case: precise-object-edit. Asset type: wide photographic backdrop for a live interactive dashboard, landscape 3:2. Input image 1 is the edit target, a user-supplied Norwegian glacial valley photograph. Adapt this portrait photograph into a wide cinematic composition by extending the scene sideways and opening the center for a real UI that will be added separately. Preserve the recognizable glacier, waterfall, rugged blue-gray rock, low mist, natural forest greens and soft overcast blue daylight of the supplied photo. No invented ocean, buildings, people or UI. Composition: upper 65 percent mostly quiet pale silver-blue sky and soft atmospheric mist, distant glacial valley visible through the lower middle. A sharply defined, dark green and rocky foreground ridge frames only the bottom: its upper silhouette begins around 72 percent down at the far left, descends toward 91 percent down at the center, and rises toward 75 percent down at the far right. The center of the foreground forms a broad low V, leaving a generous unobstructed rectangular area for the dashboard. Foreground foliage richly detailed and natural, distant mountains subtle and low contrast. Keep an authentic photographic Norwegian landscape, not an illustration. The entire output is scenery only. No interface, text, logo, watermark, borders or checkerboard. This is an edited wide composition, not a claim of an unaltered photograph.

### Exact foreground-mask prompt

Use case: background-extraction. Input image is the edit target. Output a BLACK AND WHITE CUTOUT MASK ONLY, not a photograph. Keep canvas exactly 1536 x 1024. Pure black (#000000) removes scenery; pure white (#FFFFFF) retains it. The entire upper 70 percent MUST be solid black, with no texture, no checkerboard, no other colors. In the bottom 30 percent trace a natural irregular low valley-shaped treetop / rock silhouette: the white shape begins at about y=760 at the left edge, y=825 at x=200, y=900 at x=400, y=960 at x=768, y=890 at x=1150, y=810 at x=1350, y=760 at the right edge. Everything below this gently irregular organic silhouette is PURE WHITE. Everything above is PURE BLACK. Small natural foliage and tree crown irregularities, maximum 15px, following the visible nearest forest in the reference. No tall isolated trees. The purpose is a luminance mask that puts ONLY the low foreground strip in front of an interactive dashboard. Only two colors with subtly anti-aliased edges. No gray photographic objects, no text.

## Previous flat Meet Agenci landscape (September 2026)

`agenci-meet-forest.webp` is a decorative AI-generated landscape, not a real Agenci location. Generated with the built-in image tool and converted to WebP (1586 × 992, 61 KB). Retained as the previous version, no longer used by the Meet Agenci component. The user-selected Daybreak / Adaline project informed the silver sky, dark woodland, reflective water and translucent window treatment. The actual Agenci logo and supplied dashboard screenshots informed the live UI, without publishing customer details from those screenshots.

Generation brief: Standalone photorealistic wallpaper with a quiet silver overcast sky, dark forested slopes framing a valley, and still reflective water along the bottom. Restrained natural greens, soft atmospheric depth and a calm central area for an overlaid translucent dashboard. No UI, lettering, logos, people, buildings or checkerboard. The UI is never flattened into the landscape.

Source generation: `exec-e2349968-b3e3-4ef7-b44a-246124e20168.png`. The earlier grassy-hills concept was superseded by this forest-and-water direction. No other product cards use this asset.

## Nature palette (September 2026)

- `agenci-nature-touch.webp`: user-supplied cream sleeve / green field photograph, converted without cropping or recoloring from `codex-clipboard-684c7cfb-2c20-41df-9788-5b87f43704a7.png`. 800 × 1200, 71 KB.
- `agenci-nature-sky.webp`: user-supplied blue sky / green field photograph, converted without cropping or recoloring from `codex-clipboard-b0cba0ef-f801-45bb-9faf-dbb6f9956ee9.png`. 736 × 1308, 110 KB.
- `agenci-nature-hills.webp`: user-supplied deep-green hills reference from `codex-clipboard-387b5bad-2975-4b2e-bd38-efa99583ce86.png`. Converted to WebP; its outer reference frame is cropped only by CSS, preserving the source image.

These are decorative media backdrops, not images of the Agenci team. Next/Image handles responsive delivery; CSS `object-fit` sets the visible crop. All product UI, copy and playback controls remain live React/Remotion, not flattened screenshots. The images were supplied as references; confirm publishing rights before public launch.

The previous studio background below is retained but no longer used in the brand cards.

`agenci-brand-studio.webp` is a decorative AI-generated image created with the built-in image generation tool. It is not a photograph of Agenci's actual office. Exported as a 1440 × 1080 WebP (approximately 65 KB). The original generated image is preserved outside the project.

## Generation prompt

Use case: photorealistic-natural. Asset type: decorative background photograph for the large brand-personality card of Agenci, a Norwegian customer support SaaS website. Create one polished editorial interior photograph, landscape 4:3 composition. A quiet contemporary Scandinavian work studio with a pale cool-gray plaster wall, tall window at far right, soft translucent linen curtain and beautiful daylight shadows. A brushed steel desk and a small charcoal ceramic cup partly visible along the lower right edge, a subtle out-of-focus branch at far right. Top left 60% must be light nearly white empty wall, offering clear negative space for dark website headings. Lower central region calm and pale for two overlaid product UI panels, not rendered in the image. Palette white, cool silver gray, muted slate and charcoal, no mint, no blue cast, no warm beige dominance. Tactile real photographic details, natural daylight, restrained luxury editorial aesthetic, gently shallow depth of field but visibly a photographed room, not an abstract gradient. No text, no logos, no watermark, no people, no UI, no frames.
