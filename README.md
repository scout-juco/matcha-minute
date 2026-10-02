# Matcha Minute

A colorful, 90-second HTML5 matcha café arcade game. All game code, CSS, and original SVG illustrations live in `public/index.html`. No build step or runtime JavaScript dependencies.

## Play locally

```sh
npm run dev
```

Open http://127.0.0.1:4173. You can also open `public/index.html` directly. Google Fonts are optional; local font fallbacks work offline.

## The game

- Orders arrive left to right. Click a ticket to select it. Each ticket keeps its own drink progress.
- **Matcha:** Drag powder into the bowl for each scoop. Hold the water pitcher and release within 8 ml of the target. Hold inside the bowl and trace steady circles to whisk. Moving too fast or slowly does not advance the whisk.
- **Build:** Drag the requested ice, milk, and syrup into the cup. Add the prepared matcha last.
- **Finish:** Add the requested topping, then the lid. Click Serve or drag the completed cup to its order ticket.
- A drink earns 100 coins plus up to 50 in tips. Speed and accuracy affect tips. Total coins determine stars: 120 / 300 / 500.
- Rounds last 90 seconds. Customers wait 45 seconds. Untimed practice does not change your personal best.
- `1`, `2`, `3`: stations. `P` or Escape: pause. Tab to ingredients and press Enter to add them; hold Space on the pitcher to pour, or on the bowl to whisk. The game pauses when hidden or when its window loses focus.
- Personal best is saved locally when storage is available. A blocked iframe storage policy does not prevent play.

The first version supports one drink per ticket, four recipes, four simultaneous orders, pointer/touch controls, an untimed practice mode, synthesized sound effects, and replay. There are no upgrades, progression, accounts, or backend.

## Cloudflare Pages

`wrangler.jsonc` is the deployment configuration and sets `pages_build_output_dir` to `./public`, following [Cloudflare's Pages configuration documentation](https://developers.cloudflare.com/pages/functions/wrangler-configuration/).

For a Git-connected Cloudflare Pages project:

- Framework preset: None
- Build command: leave empty
- Build output directory: `public`

Or deploy through the CLI after signing into your Cloudflare account:

```sh
npx wrangler@4 login
npm run deploy
```

The first deployment may prompt you to create the `matcha-minute` Pages project. Change `name` in `wrangler.jsonc` if you want a different project name. Deployment has not been performed as part of this local build.

## Embed

Replace the example URL with your deployed Pages address:

```html
<iframe
  src="https://YOUR-PROJECT.pages.dev"
  title="Matcha Minute café game"
  width="100%"
  height="900"
  style="border:0;border-radius:20px;display:block"
  allow="autoplay; fullscreen"
  loading="lazy"
></iframe>
```

No frame-blocking headers are set. The game is responsive and scrolls on smaller frames; use about 900–1100 px of iframe height on phones so the recipe and station controls fit comfortably. If the host uses a restrictive iframe sandbox, it must allow scripts; local storage may be unavailable. No parent-page messaging is required.

## Checks

```sh
npm test
```

Tests cover every recipe's stage gates, water tolerance, independent drink state, circular-whisk speed validation, scoring, star boundaries, inline JavaScript syntax, and deployment output configuration.

For browser integration checks, run the local server and open `/__test`. This development-only route serves `tests/browser.html` and is not included in the Cloudflare deployment. The suite sends input events to the game in an iframe and checks brewing, building, serving, ticket switching, pause/resume, customer expiry, the real 90-second timer, results, and replay. Leave the test tab active until it finishes (about 105 seconds).

Use `/__test?mobile` for the shorter gameplay check in a 390 px iframe. Both checks preserve the previously stored personal best.

Tune round length, patience, arrival interval, water pour rate, whisk speed, and star thresholds in `RULES` near the beginning of the first script in `public/index.html`.
