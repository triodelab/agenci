# Agenci hero conversations

The marketing hero embeds a lazy-loaded Remotion Player. Each conversation has the same duration as its source film: city 13.93 seconds, Arne's phone call 16.53 seconds, and sofa 10.57 seconds. `ended` advances the film and conversation together; the hero films do not loop. Pause stops both, hidden tabs and offscreen playback suspend, and reduced motion replaces the Player with a readable static exchange.

The frosted surface sits outside the Player so backdrop blur samples the actual hero video. The composition itself is transparent HTML with frame-driven motion.

The live Player follows its container width instead of shrinking a desktop canvas, preserving readable message type on phones. Studio previews use a 368 × 304 canvas.

## Edit and preview

- `bun run hero:studio` — Studio at `http://localhost:3004`, with three individually named compositions.
- `bun run hero:typecheck` — checks the isolated animation and its Player integration without depending on the backend app's TypeScript configuration.
- Conversations and film sources: `modules/landing/hero-stories.ts`.
- Message timing: `modules/landing/remotion/conversation.tsx`.
- Glass and typography: `styles/tokens.css`, the `.agenci-story` rules.

The city and sofa message cadence is compressed to their source films instead of extending the media. Arne's call remains matched to his speech beats: opening request at 0.6s, Agenci answers at 5.3s while he listens, his laugh and confirmation arrive at 10s, and Agenci closes the exchange at 14.3s. The sofa conversation adds a visual product result at 8.6s: a size-M linen shirt and the fictional address `din-nettbuttik.no/lin-skjorte-m`. Named `Interactive` layers and inline interpolation keep the motion editable in Studio.

The three examples are fictional design demonstrations. They do not submit deliveries, bookings, or purchases. The shopping thumbnail is generated with Higgsfield; provenance is recorded in `public/hero/README.md`.
