# Stickman Smash Royale

A browser platform fighting game built with Codex from Dante's game ideas: twelve fighters, seven maps, five lives each, wild powers, saved winning rewards, solo bots, and online multiplayer rooms.

## Play with friends

Open [the public game](https://stickman-smash-royale-dante.dante-garcia-9136.chatgpt.site) on each device. No ChatGPT sign-in is required.

1. Choose a fighter and enter a player name.
2. One person selects a map and clicks **Create Room**.
3. Share the six-character code. Friends choose different fighters, enter the code, and click **Join Room**.
4. The host clicks **Start Match**. Two to five people can play; bots fill open slots for five fighters total.

Online matches continue when one player leaves or switches tabs. After a short disconnect timeout, a bot takes over that fighter. Temporary network errors retry while the tab stays open. Refreshing the page loses that room session. Online matches cannot be paused. Rooms expire after 30 minutes without requests.

The 22-second opening cartoon cutscene shows choreographed fights and the full cast's powers: dash/shield collisions, sword blocks and uppercuts, vines and teleportation, inhale/copy, atomic breath and darkness, and unicorn/zombie transformations. It can be skipped with **Space** or **Skip Intro**, and replayed with **Watch Intro**. Reduced-motion preference skips autoplay.

## Run locally

Node.js **22.13 or newer** is required; no npm dependencies are needed. Node may print an experimental notice for its SQLite module.

```sh
npm start
```

Open http://localhost:8000. The server creates a private `.local/rooms.sqlite` database. To connect devices on the same Wi-Fi:

```sh
npm start -- --host 0.0.0.0
```

Other devices open `http://YOUR-COMPUTER-LAN-IP:8000`, subject to your network/firewall settings. For solo-only static hosting, run `python3 -m http.server 8000 --directory dist`. Rooms require the application server.

## Controls

| Input | Action |
| --- | --- |
| A/D or Left/Right | Move |
| Space, W, or Up | Jump; double jump |
| X | Attack with automatic aim |
| Mouse + left click | Aim and shoot |
| Z | Character power |
| W/Up or S/Down near a vine | Climb up/down |
| Space on a vine | Jump off |
| R | Activate the saved item selected in the lobby |
| F | Use active Fire Flower or Super Star |
| Q | Order your unicorn army or zombie pack to attack the aimed-at rival |
| L on Ocean Rafts | Hold to swim upward; A/D steers; Space leaps out |
| Escape | Pause/resume solo play |
| Space during montage | Skip intro |

Phone and iPad controls are detected automatically, including tablets that also have a mouse or trackpad. Use **Touch On/Off** in the header to choose controls manually. The left thumb stick moves horizontally; slide it up/down to climb vines. The larger right buttons jump/double jump, attack, and use powers. Secondary buttons activate saved items, use them, command an army, or swim when relevant. Fire and item attacks auto-aim; touching the arena temporarily provides manual aim. You can hold movement and attack while tapping Jump with another finger.

The camera follows your fighter on small portrait screens. A small arena overview marks your position with a white outline. Layouts accommodate portrait, landscape, display cutouts, and changing browser bars. Keyboard and mouse controls remain available on computers and hybrid devices. No app installation is required. Sound is optional.

## Fighters

| Fighter | Power |
| --- | --- |
| Volt | Lightning dash |
| Ember | Fan of fire bolts |
| Bulwark | Three-second shield |
| Bloom | Grow climbable vines |
| Nova | Teleport beside the farthest surviving rival |
| Blaze | One-hit fire sword and lunge; cats suppress his fire |
| Kobalt | Inhale and copy a rival's form, weapon, and power for 14 seconds |
| Pixie | Touch rivals to recruit glitter-farting unicorn allies |
| Rott | Green dog that turns touched rivals into zombie dog allies |
| Shade | Six-second proximity aura; entering rivals get ten seconds of near-black vision while Shade keeps his sight |
| Ivory | Punches and uppercuts, no gun; immune to Blaze attacks |
| Kaidog | Dark-green atomic dog: 36-damage mouth balls and 72-damage breath beam; five-second power cooldown |

## Maps and rules

Choose **Classic**, **Desert**, **Deserted Island**, **Cloud Islands**, **Volcano**, **City**, or **Ocean Rafts**. Every arena has different collision geometry and scenery. Cloud Islands has extra islands; Volcano has damaging lava. Ocean Rafts is the only swimmable map. Release L to dive; after four seconds fully submerged, drowning drains health.

Exactly five distinct fighters enter each match, with five lives each. Knockouts and falls cost a life; zero means elimination. Eliminated players spectate until the last surviving fighter wins. If only an allied army remains, it breaks free for a final showdown.

The winner gets a stickman victory trophy. A winning human also earns a saved reward, alternating **Fire Flower, Super Star, Fire Flower, Super Star**. Rewards stay in the winner's browser and do not sync between devices. Existing saved flowers are preserved.

Select a saved item in the lobby, then press R during a round to consume and activate it. Starting a round does not spend it. Fire Flower gives exactly five small straight fireballs fired with F, aimed with the mouse or arrow keys, otherwise following your facing direction. Remaining shots carry across respawns that round. Ivory stays unarmed: his flower uses become five close-range fire punches instead of projectiles. Super Star gives ten seconds of invincibility, including against danger zones, drowning, lava, and falls; F attacks nearby rivals. Only one star activation is allowed per round.

Floating mystery blocks cycle between random armor (Wood, Iron, Diamond, Gold, Netherite, Wool, Emerald, Ruby), rings plus speed, and size plus health. Jump into them from below; they recharge after seven seconds. Health and rapid-fire pickups also spawn.

## Source and tests

`dist/` contains the authored HTML, CSS, and JavaScript source and procedural game art. There are no required external game assets or API keys. Google Fonts are optional, with fallback fonts configured.

`server/rooms.js` runs the game engine on the server. Clients send bounded control inputs and receive authoritative snapshots. Room revisions prevent concurrent updates from overwriting one another. Session tokens are returned only to the joining player; only their hashes are stored in the database. Bots fill unused and disconnected slots.

`npm run build` embeds browser assets and room code into `dist/server/index.js`. The hosted version uses a Cloudflare Worker with a D1 binding named `DB`; the local server runs the same API using SQLite. Apply `drizzle/0000_multiplayer_rooms.sql` before deploying to your own Worker host. Private Sites hosting metadata is excluded from this public repository.

```sh
npm test
```

Verification includes **191 gameplay checks and 41 complete seeded matches across all seven arenas**, app integration checks, **13 proximity-blindness checks**, **19 touch/viewport checks** across eight phone/tablet sizes and three desktop sizes, and multiplayer tests covering concurrent joins, capacity, session authentication, independent human controls, authoritative powers and item limits, remote winners, disconnection fallback, and montage skipping. HTTP smoke tests use two independent sessions against the room server.

This is programmatic coverage. Fresh visual browser QA was blocked by agent-owned browser allocation permissions; touch input has not been checked on a physical phone. Room play uses HTTP snapshots and is intended for casual play, rather than competitive low-latency networking. Saved inventory is browser-local and is not a ranked anti-cheat system.

## Shade proximity blindness

Z activates a six-second aura with a 250-unit radius. Rivals entering it get ten seconds of nearly black vision, with only a faint small area around themselves visible. Remaining inside does not repeatedly restart the timer; leaving and re-entering can apply a fresh ten seconds. Shade and allies are unaffected by their own aura. Shields and Super Star protection block a new application. Blindness fades out at the end and clears on knockout/respawn. Blinded bots can sense only nearby rivals; touch auto-aim and the minimap also respect that limited sight. The server stores blindness per fighter, so a multiplayer victim's view changes without darkening the caster's screen.

All twelve Z super moves recharge in five seconds. Power durations, including Shade's aura and the ten-second blindness effect, are separate from recharge time.
