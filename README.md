# Stickman Smash Royale

A playable, solo browser platform fighter built from Dante's game ideas with Codex assistance. Choose a stick fighter, battle four random bots, and be the last fighter standing.

This repository preserves the complete playable version from November 25, 2026: all ten fighters, seven arenas, game art drawn in code, inventory, victory trophies, and automated checks.

## Play locally

No build step or dependencies are required. From the repository directory:

```sh
python3 -m http.server 8000 --directory dist
```

Open **http://localhost:8000** in a browser. Keep the server running while playing. ES modules require an HTTP server; opening `index.html` as a local file will not work.

The existing hosted game is [here](https://stickman-smash-royale-dante.dante-garcia-9136.chatgpt.site). That deployment has its own private access settings; this public repository lets anyone download and run the game.

## Controls

| Key / input | Action |
| --- | --- |
| A / D or Left / Right | Move |
| Space, W, or Up | Jump; jump twice for a double jump |
| X | Attack with automatic aim |
| Mouse + left click | Aim and shoot |
| Z | Character power |
| W / Up, S / Down near vines | Climb up / down |
| Space on a vine | Jump off |
| R | Activate the saved item selected in the lobby |
| F | Use the active Fire Flower or Super Star |
| Q | Order your unicorn army or zombie pack to attack the aimed-at enemy |
| L, on Ocean Rafts | Hold to swim upward; A/D steers; Space leaps onto a raft |
| Escape | Pause / resume |

Touch controls are included; landscape orientation is recommended. Sound is optional.

## Fighters

| Fighter | Power |
| --- | --- |
| Volt | Lightning dash |
| Ember | Fan of fire bolts |
| Bulwark | Three-second shield |
| Bloom | Grow climbable vines |
| Nova | Teleport beside the farthest surviving rival |
| Blaze | One-hit fire sword and inferno lunge; nearby cats suppress his fire |
| Kobalt | Inhale a nearby rival and copy their form, weapon, and power for 14 seconds |
| Pixie | Touch rivals to recruit glitter-farting unicorn allies |
| Rott | Green dog that turns touched rivals into zombie dog allies |
| Kaidog | Dark-green atomic dog: 36-damage mouth balls and a 72-damage breath beam, with a six-second power cooldown |

## Arenas

Choose **Classic**, **Desert**, **Deserted Island**, **Cloud Islands**, **Volcano**, **City**, or **Ocean Rafts** in the lobby. Every map has its own platform layout and scenery. Cloud Islands has extra islands; Volcano has damaging lava. Ocean Rafts is the only map with swimmable water. Releasing L lets you dive. After four seconds fully submerged, drowning starts damaging your health. Bots can swim too.

## Match rules and rewards

- Exactly five distinct characters fight each round: the player and four randomly selected bots.
- Everyone starts with five lives. Knockouts and falls cost a life; zero lives means elimination.
- Eliminated players spectate until the last surviving fighter wins. If only an allied army remains, its members break free for a final showdown.
- The winner receives a stickman victory trophy. Player wins also earn saved items, alternating **Fire Flower, Super Star, Fire Flower, Super Star**, and so on.
- Select an item in the lobby. R consumes and activates it during the round; starting a match does not spend anything.
- Fire Flower gives exactly **five small, straight fireballs** fired with F. Aim with the mouse or arrow keys; otherwise they follow your facing direction. Remaining shots carry across respawns in that round.
- Super Star gives **ten seconds of invincibility**, including against lava, drowning, falls, and the danger zone. F performs a close-range attack. Only one star may be activated per round.
- Saved rewards use browser-local storage and are not synced across browsers or devices. Older saved flowers are preserved.

Floating mystery blocks cycle between random armor (Wood, Iron, Diamond, Gold, Netherite, Wool, Emerald, Ruby), rings plus speed boosts, and size plus health changes. Jump into them from below; they recharge after seven seconds. Health and rapid-fire pickups also appear around the arena.

## Source and verification

`dist/` contains the actual handwritten, buildless application source, including the HTML, CSS, and JavaScript modules. It is deliberately tracked so the game is immediately runnable. There are no bundled binary game assets or required API keys. Google Fonts are optional external styling resources; fallback fonts are configured.

With Node.js 22 or newer:

```sh
npm test
```

The current checks pass **165 gameplay checks** and **41 complete seeded matches across all seven maps**, plus an app integration harness that exercises actual app controls and rendering code with a mocked DOM/canvas. This is automated programmatic coverage, not a visual browser acceptance test. Fresh visual browser QA was blocked by the local agent-owned browser allocation permissions; touch input has not been checked on a physical phone.

Private hosting identifiers, credentials, browser profiles, local storage, scratch files, and deployment archives are excluded from this repository. This is a solo game against bots; online multiplayer is not implemented.
