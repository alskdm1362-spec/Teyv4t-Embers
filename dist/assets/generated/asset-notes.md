# Generated pixel assets — provenance and recovery

Generated on 2026-11-15 using the built-in ImageGen tool. This family contains new fan-game artwork, not official extracted game sprites. The four original generated PNG sheets are retained unchanged. Following a workspace reset, these assets were deterministically recovered from those surviving original sheets without new image generation.

## Identity and style references

- Existing Frostbound inventory Lohen standing, camp Lohen illustration, Alice illustration and 96×96 combat sprite supplied the compact chibi proportions, simplified shadows and crisp pixel-cluster style target.
- Old smooth anime Mitya/Jahoda illustrations supplied costume identity only; their illustration style was explicitly excluded.
- Illuga is a fan visual interpretation of short silver hair, violet eyes, gray/black fur-collar coat, gold geometric accents and lantern. Precise costume fidelity remains user review.
- The breakdown generation used the existing Frostbound Lohen inventory standing and the three newly generated standing illustrations as direct identity/style references. These were visually inspected before generation.

## Source sheets

| Included sheet | Original generation filename | Contents |
|---|---|---|
| heroes-source.png | exec-8fdeac2f-95ed-4d7c-a837-681817d708ac.png | Mitya, Jahoda, Illuga |
| enemies-source.png | exec-04dfd388-f74d-40db-9a01-786bb206ca37.png | Rifthound, angler, Primus, sentinel |
| enemies-second-source.png | exec-038d9ec3-0745-4ef9-bde4-b5bdb6469dd6.png | Wanderer, hunter, mimic, nightmare lord |
| breakdown-source.png | exec-74c71812-9a69-4018-b164-43112d999592.png | Lohen, Mitya, Illuga, Jahoda breakdown |

## Prompt set

### Hero family

Transparent horizontal three-column sheet with isolated full-body characters. Match existing Frostbound compact chibi pixel standing/combat style, approximately 2.8-head proportions, crisp clusters, simplified shadows, gold accents, three-quarter side view facing right and common baseline. Mitya: youthful male, lavender wavy hair, violet eyes, violet/gold coat, white inner shirt and purple magic. Jahoda: blonde braided pigtails, black catlike pointed cap, pink goggles, red scarf/cape, black-white-gold outfit and dagger. Illuga: youthful male, short silver hair, violet eyes, gray-black fur-collar coat, gold armor and warm golden lantern. Costume reference only from the old anime portrait, never its smooth illustration style. No Lohen, text, UI, scene, floor shadow or extra subjects. Genuine transparent background.

### First enemy family

Transparent four-column whole-body sheet in the same chunky pixel/chibi style, facing left and isolated with gutters. Rifthound-inspired charcoal/purple bony wolf with gold edges and violet fissures; dark angler-inspired floating void fish with light lure and violet maw; Breacher Primus-inspired organic spherical purple core, pale lilac shell petals and tentacles; fallen celestial sentinel-inspired white/gold angular floating armored construct with star pieces and dark core. Fan reinterpretations, no official-render claim, no environment, text or UI.

### Second enemy family

Use first enemy sheet as style reference. Transparent four-column whole-body left-facing enemies: wasteland wanderer as thin floating purple-hooded spectral ghost with scythe and torn cloak; wasteland hunter as low agile many-limbed black/purple spectral beast; abyss mimic as angular black/violet horned draconic creature with jagged wings; nightmare lord as massive crowned floating voidfish with dark core and turquoise/purple plume fins. Same crisp clustered shading, no scene, text, ground shadow or extra subject.

### Dedicated breakdown family

Transparent four-column sheet with actual changed stressed poses, not recolors. Preserve reference hair, face and clothes. Lohen: gray-teal hair, sharp red eyes, blue-white-gold uniform, spear grip and hand pressing temple, defensive hunch. Mitya: lavender hair, violet/gold coat, hand over forehead, fracturing purple magic. Illuga: silver hair, fur collar and lantern, hunched protecting the lantern against chest. Jahoda: braided blonde pigtails, catlike cap/goggles, red scarf, one hand gripping headwear and another holding dagger defensively. Strained readable faces, fractured violet shadow ribbons, whole figures visible. No smiles, gore, injuries, sexualization, text, interface or environment. Exact current chibi pixel-illustration family.

## Deterministic normalization

1. Threshold generated alpha at 128 and crop only transparent outer margins.
2. Hero and first enemy sheets: split three/four equal columns before transparent-margin crop.
3. Second enemy sheet: equal column bounds crossed the scythe/claw extents despite non-overlapping opaque silhouettes. Split by connected opaque subject components instead. Preserve the lord's detached armor pieces with its main body.
4. Battle sprites: nearest-neighbor fit into 88×88, quantize RGB to 63 colors while preserving binary alpha, center in 96×96 RGBA at baseline y=92.
5. Hero standing and dedicated breakdown cutins: nearest-neighbor fit into 176×240, quantize RGB to 96 colors, center in 192×256 at baseline y=252.
6. Hero portraits: upper 53% of the cropped normal figure, fit within 120×120 and place in 128×128 RGBA.
7. Nightmare large: fit within 176×176, 96-color palette, place in 192×192 at baseline y=188.

Python was used only for deterministic slicing, alpha thresholding, palette normalization, resizing and preview assembly. No costume painting, generative edits or invented body parts were created with Python.

## Runtime files

- Heroes: `mitya.png`, `jahoda.png`, `illuga.png`.
- Standing: each hero's `-standing.png`.
- Portraits: each hero's `-portrait.png`.
- Enemies: `rifthound.png`, `angler.png`, `primus.png`, `sentinel.png`, `wanderer.png`, `hunter.png`, `mimic.png`, `nightmare.png`.
- Boss large: `nightmare-large.png`.
- Dedicated breakdowns: `lohen-break.png`, `mitya-break.png`, `illuga-break.png`, `jahoda-break.png`.

## Validation and limits

- All 22 runtime PNGs have RGBA and real transparency; battle/cutin alpha is binary.
- Eleven 96×96 battle sprites have at most 64 colors including transparent pixels.
- Four breakdown cutins have 90–96 colors and visible changed poses/expressions.
- Three dark-background contact sheets were visually inspected after recovery. No opaque silhouette was clipped by a normalization boundary.
- `asset-report.json`, `asset-second-report.json` and `breakdown-report.json` record dimensions, bounds, colors and alpha extrema. `asset-manifest.json` connects subjects to source sheets.
- These are one-frame ready poses and cutins, not authored attack or idle animation sequences.
- In-game composition, mobile readability, exact character identity and final approval are separate review steps. Do not claim animation or human play validation from asset generation alone.
- Breakdown pose meanings are fan interpretations and do not establish verified official personality traits.

