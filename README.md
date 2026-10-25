# 掘金跑者

A Lode Runner-style game you can play in the browser. Original pixel art only — nothing from the Nintendo or Tozai games. The on-screen language is Traditional Chinese for Hong Kong.

## Open it

No install and no build step. From this folder:

```bash
python3 -m http.server 8741
```

Then open [http://127.0.0.1:8741](http://127.0.0.1:8741).

You can also open `index.html` directly. Stage 1 starts immediately: move, dig, and collect gold. There is no account and no network API.

## How to play

| Action | Keyboard | On screen |
| --- | --- | --- |
| Move, climb ladders | Arrow keys or WASD | Direction pad |
| Dig the brick to your left | Z, Q, or Left Shift | 挖左 |
| Dig the brick to your right | X, E, or Right Shift | 挖右 |
| Pause | Esc | 暫停 |
| Confirm a card | Enter or Space | The gold button |

- Orange bricks can be dug. Blue-gray concrete cannot.
- A hole stays open for about seven seconds, then the brick grows back.
- White ladders are for climbing. White ropes can be crossed; press down to drop off.
- Collect every gold pile. The escape ladder at the top then lights up. Climb into the exit to clear the stage.
- Guards chase you. Touching a guard who is awake costs a life and restarts the stage.
- A guard who falls into a hole is stuck for a few seconds. You can walk over them. If the brick closes while they are still in the hole, that guard is buried and comes back later.
- If you are sealed into a small room, press up to punch through the brick overhead.
- Four stages, five lives. Your best score stays in this browser.

## Files

- `index.html` — page, HUD, and touch controls
- `style.css` — cabinet layout
- `game.js` — levels, rules, and drawing
