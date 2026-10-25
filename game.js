/* 掘金跑者 — original Lode Runner-style game. No Nintendo / Tozai assets. */
(function () {
  "use strict";

  const COLS = 28;
  const ROWS = 16;
  const TILE = 16;
  const VIEW_W = COLS * TILE;
  const VIEW_H = ROWS * TILE + 24;

  const PLAYER_WALK = 0.15;
  const PLAYER_FALL = 0.085;
  const GUARD_FALL = 0.085;
  const HOLE_TIME = 7;
  const TRAP_TIME = 4.2;
  const DIG_COOL = 0.16;

  const GUARD_WALK = [0.21, 0.195, 0.18, 0.17];

  const LEVELS = [
    {
      name: "淺層礦道",
      hint: "先爬梯搬金塊。右下金庫要挖開磚頂才入得去。",
      rows: [
        "############################",
        "#..!.......................#",
        "#..^.......................#",
        "#..^.......................#",
        "#.....*.H.....*...H........#",
        "#..=====H=========H======..#",
        "#.......H.........H........#",
        "#.......H...*..&..H........#",
        "#..=====H=========H====....#",
        "#.......H.........H........#",
        "#.......H.........H........#",
        "#.......H.....*...H........#",
        "#..=====H=========H======..#",
        "#...@...H.........H.#..*.#.#",
        "#==========================#",
        "############################",
      ],
    },
    {
      name: "繩索橫坑",
      hint: "抓住白繩橫過深坑。繩上按下就鬆手。",
      rows: [
        "############################",
        "#...........!..............#",
        "#...........^..............#",
        "#....H..*.........*...H....#",
        "#..==H================H==..#",
        "#....H................H....#",
        "#...*H.&-------------&H.*..#",
        "#..==H=====.......====H===.#",
        "#....H................H....#",
        "#....H................H....#",
        "#....H..*.............H....#",
        "#..==H======.....=====H===.#",
        "#..==H================H==..#",
        "#..@.H.......#..*..#..H....#",
        "#==========================#",
        "############################",
      ],
    },
    {
      name: "守衛金庫",
      hint: "藍灰石壁挖不穿，只可挖橙色磚頂。三名守衛會追你。",
      rows: [
        "############################",
        "#...!......................#",
        "#...^......................#",
        "#.....H........H.......H...#",
        "#.####H##====##H#######H##.#",
        "#.....H.#..*.#.H.......H...#",
        "#.....H..####..H.......H...#",
        "#...*.H...&....H.......H...#",
        "#.####H########H#====##H##.#",
        "#.....H........H#..*.#.H...#",
        "#.....H........H.####..H...#",
        "#.....H........H..&.*..H...#",
        "#.####H##====##H#######H##.#",
        "#..@..H.#..*.#.H....&..H...#",
        "#==========================#",
        "############################",
      ],
    },
    {
      name: "深層礦脈",
      hint: "繩、梯、挖洞都要用。守衛更快，留條退路。",
      rows: [
        "############################",
        "#.................!........#",
        "#.................^........#",
        "#...H.................H....#",
        "#.##H#######=====#####H###.#",
        "#...H......#..*..#....H....#",
        "#...H.......#####.....H....#",
        "#...H.*&-----------&*.H....#",
        "#.##H#####.......#####H###.#",
        "#...H.................H....#",
        "#...H.................H....#",
        "#...H...........*.&...H....#",
        "#.##H###=====#########H###.#",
        "#..@H..#..*..#........H....#",
        "#==========================#",
        "############################",
      ],
    },
  ];

  const PAL_PLAYER = {
    k: "#2a1038",
    p: "#c44adf",
    P: "#f0b6ff",
    d: "#7a2498",
    s: "#ffd0ae",
    w: "#ffffff",
    b: "#1a0a24",
  };
  const PAL_GUARD = {
    k: "#06240e",
    h: "#f4fff8",
    p: "#3cba4a",
    P: "#b6f5a4",
    d: "#14661e",
    w: "#ffffff",
    s: "#d8ffd0",
  };

  const SPRITES = {
    stand: [
      "................",
      "................",
      "......kkkk......",
      ".....kPPPPk.....",
      ".....kPssPk.....",
      ".....kPwswk.....",
      ".....kPssPk.....",
      "......kkkk......",
      ".....kddddk.....",
      "....kppddppk....",
      "....kp.dd.pk....",
      ".......dd.......",
      "......p..p......",
      ".....pp..pp.....",
      "....kk....kk....",
      "....k......k....",
    ],
    runA: [
      "................",
      "................",
      "......kkkk......",
      ".....kPPPPk.....",
      ".....kPssPk.....",
      ".....kPwswk.....",
      ".....kPssPk.....",
      "......kkkk......",
      "....kddddddk....",
      "...kppddpppk....",
      "...kp.dd........",
      ".....dd..pp.....",
      "....p..p..kk....",
      "...pp..pp.......",
      "..kk............",
      "..k.............",
    ],
    runB: [
      "................",
      "................",
      "......kkkk......",
      ".....kPPPPk.....",
      ".....kPssPk.....",
      ".....kPwswk.....",
      ".....kPssPk.....",
      "......kkkk......",
      ".....kddddk.....",
      "....kppddppk....",
      "......dd.pk.....",
      ".....p..p.......",
      "....pp..pp......",
      "...kk....kk.....",
      "........k..k....",
      "...........k....",
    ],
    climb: [
      "................",
      "................",
      ".....kkkk.......",
      "....kPPPPk......",
      "....kPwswk......",
      "....kPssPk......",
      "..k.kkkk.k......",
      ".kp.dddd.pk.....",
      ".kp.pddp.pk.....",
      "....pddp........",
      "....p..p........",
      "...pp..pp.......",
      "..kk....kk......",
      "..k......k......",
      "................",
      "................",
    ],
    dig: [
      "................",
      "................",
      "......kkkk......",
      ".....kPPPPk.....",
      ".....kPwswk.....",
      ".....kPssPk.....",
      "......kkkk......",
      "....kddddk......",
      "...kppddpp......",
      "...kp.dd........",
      ".....dd..pppp...",
      "....p..p...kk...",
      "...pp..pp.......",
      "..kk............",
      "..k.............",
      "................",
    ],
    fall: [
      "................",
      "................",
      "......kkkk......",
      ".....kPPPPk.....",
      ".....kPwswk.....",
      ".....kPssPk.....",
      "......kkkk......",
      "...k.dddd.k.....",
      "..kp.pddp.pk....",
      "..k...dd...k....",
      "......dd........",
      ".....p..p.......",
      "....pp..pp......",
      "...k......k.....",
      "..k........k....",
      "................",
    ],
    guard: [
      "................",
      "................",
      "....hhhhhhhh....",
      "...hhkkkkkkhh...",
      "...hhhpppphhh...",
      "...hhwwhwwhhh...",
      "...hhhpppphhh...",
      "....kkkkkkkk....",
      "...kppppppppk...",
      "..kpppddddpppk..",
      "..kp..dddd..pk..",
      ".......dd.......",
      "......p..p......",
      ".....pp..pp.....",
      "....kk....kk....",
      "....k......k....",
    ],
    guardRun: [
      "................",
      "................",
      "....hhhhhhhh....",
      "...hhkkkkkkhh...",
      "...hhhpppphhh...",
      "...hhwwhwwhhh...",
      "...hhhpppphhh...",
      "....kkkkkkkk....",
      "...kppppppppk...",
      "..kpppdddd.....",
      "..kp..dd..pppp..",
      "......dd...kk...",
      ".....p..p.......",
      "....pp..pp......",
      "...kk...........",
      "...k............",
    ],
  };

  // Fix a short row in runA if I miscounted — normalized below.
  function normalizeSprites() {
    for (const key of Object.keys(SPRITES)) {
      const rows = SPRITES[key];
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].length < 16) rows[i] = rows[i] + ".".repeat(16 - rows[i].length);
        if (rows[i].length > 16) rows[i] = rows[i].slice(0, 16);
      }
      while (rows.length < 16) rows.push("................");
    }
  }
  normalizeSprites();

  const FONT = {
    S: ["111", "100", "111", "001", "111"],
    T: ["111", "010", "010", "010", "010"],
    A: ["010", "101", "111", "101", "101"],
    G: ["111", "100", "101", "101", "111"],
    E: ["111", "100", "110", "100", "111"],
    "0": ["111", "101", "101", "101", "111"],
    "1": ["110", "010", "010", "010", "111"],
    "2": ["111", "001", "111", "100", "111"],
    "3": ["111", "001", "111", "001", "111"],
    "4": ["101", "101", "111", "001", "001"],
    " ": ["000", "000", "000", "000", "000"],
  };

  const BEST_KEY = "lode-hk-best";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const keys = new Set();
  const touchKeys = new Set();
  const scripted = new Set();

  let grid = [];
  let gold = [];
  let guards = [];
  let player = null;
  let holes = new Map();
  let particles = [];
  let floats = [];
  let levelIndex = 0;
  let goldLeft = 0;
  let lives = 5;
  let score = 0;
  let best = 0;
  let mode = "playing"; // playing | pause | help | death | clear | gameover | victory
  let grace = 0;
  let shake = 0;
  let toastT = 0;
  let deathT = 0;
  let deathReason = "";
  let exitAnnounced = false;
  let silent = false;
  let muted = false;
  let overlayKind = null;
  let actx = null;
  let animTime = 0;
  let digPrefer = "digL";
  let digLatch = 0;
  let digLatchT = 0;

  try {
    best = Number(localStorage.getItem(BEST_KEY) || 0) || 0;
    muted = localStorage.getItem("lode-hk-muted") === "1";
  } catch (err) {
    /* private mode */
  }

  function $(id) {
    return document.getElementById(id);
  }

  function pressed(name) {
    return keys.has(name) || touchKeys.has(name) || scripted.has(name);
  }

  function guardDur() {
    return GUARD_WALK[levelIndex] ?? 0.2;
  }

  function inBounds(c, r) {
    return c >= 0 && r >= 0 && c < COLS && r < ROWS;
  }

  function isHole(c, r) {
    return holes.has(c + "," + r);
  }

  function isSolid(c, r) {
    if (!inBounds(c, r)) return true;
    if (isHole(c, r)) return false;
    const ch = grid[r][c];
    return ch === "#" || ch === "=";
  }

  function canOccupy(c, r) {
    return inBounds(c, r) && !isSolid(c, r);
  }

  function isLadder(c, r) {
    if (!inBounds(c, r)) return false;
    const ch = grid[r][c];
    if (ch === "H") return true;
    if (ch === "^" && goldLeft === 0) return true;
    return false;
  }

  function isRope(c, r) {
    return inBounds(c, r) && grid[r][c] === "-";
  }

  function trappedGuardAt(c, r) {
    for (const g of guards) {
      if (!g.dead && g.trapped && g.c === c && g.r === r) return true;
    }
    return false;
  }

  function hasSupport(actor) {
    const c = actor.c;
    const r = actor.r;
    if (isLadder(c, r) || isRope(c, r)) return true;
    if (trappedGuardAt(c, r + 1)) return true;
    if (isSolid(c, r + 1)) return true;
    // Guards are caught inside a dug hole even when the shaft below is open.
    // The player falls through, so vaults under a thin ceiling stay reachable.
    if (actor.isGuard && isHole(c, r)) return true;
    return false;
  }

  function legalMoves(actor, asPlayer) {
    const c = actor.c;
    const r = actor.r;
    const sup = hasSupport(actor);
    const holeUp = asPlayer && canOccupy(c, r - 1) && (isHole(c, r) || isHole(c, r - 1));
    if (!sup && canOccupy(c, r + 1)) {
      const moves = [{ dc: 0, dr: 1, kind: "fall" }];
      if (holeUp) moves.push({ dc: 0, dr: -1, kind: "climb" });
      return moves;
    }
    const moves = [];
    if (sup) {
      if (canOccupy(c - 1, r)) moves.push({ dc: -1, dr: 0, kind: "walk" });
      if (canOccupy(c + 1, r)) moves.push({ dc: 1, dr: 0, kind: "walk" });
    }
    if (canOccupy(c, r - 1) && (isLadder(c, r) || isLadder(c, r - 1) || holeUp)) {
      moves.push({ dc: 0, dr: -1, kind: "climb" });
    }
    if (canOccupy(c, r + 1) && (isLadder(c, r) || isRope(c, r) || isLadder(c, r + 1))) {
      moves.push({ dc: 0, dr: 1, kind: "down" });
    }
    return moves;
  }

  function canDig(c, r, dc) {
    if (!hasSupport({ c, r })) return false;
    const tc = c + dc;
    const tr = r + 1;
    if (!inBounds(tc, tr)) return false;
    if (grid[tr][tc] !== "=") return false;
    if (isHole(tc, tr)) return false;
    if (isSolid(c + dc, r)) return false;
    return true;
  }

  function unlockAudio() {
    if (silent || muted) return;
    try {
      if (!actx) actx = new AudioContext();
      if (actx.state === "suspended") actx.resume();
    } catch (err) {
      /* ignore */
    }
  }

  function tone(freq, dur, type, vol, slide) {
    if (silent || muted) return;
    try {
      unlockAudio();
      if (!actx) return;
      const t0 = actx.currentTime;
      const o = actx.createOscillator();
      const g = actx.createGain();
      o.type = type || "square";
      o.frequency.setValueAtTime(freq, t0);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, slide), t0 + dur);
      g.gain.setValueAtTime(vol, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      o.connect(g);
      g.connect(actx.destination);
      o.start(t0);
      o.stop(t0 + dur + 0.02);
    } catch (err) {
      /* ignore */
    }
  }

  const sfx = {
    dig() {
      tone(180, 0.08, "square", 0.05, 70);
      tone(90, 0.1, "triangle", 0.04);
    },
    gold() {
      tone(660, 0.08, "square", 0.05);
      tone(880, 0.12, "square", 0.05);
    },
    die() {
      tone(440, 0.2, "sawtooth", 0.06, 80);
    },
    clear() {
      [523, 659, 784, 1046].forEach((f, i) => {
        setTimeout(() => tone(f, 0.12, "square", 0.05), i * 90);
      });
    },
    thud() {
      tone(120, 0.1, "square", 0.05, 60);
    },
    bury() {
      tone(80, 0.18, "triangle", 0.06, 40);
    },
    exit() {
      tone(740, 0.1, "square", 0.05);
      tone(988, 0.16, "square", 0.05);
    },
  };

  function toast(msg, seconds) {
    toastT = seconds || 2.8;
    const el = $("toast");
    el.hidden = false;
    el.textContent = msg;
  }

  function spawnParticles(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 70,
        vy: -20 - Math.random() * 50,
        life: 0.35 + Math.random() * 0.3,
        color,
      });
    }
  }

  function floatText(x, y, text, color) {
    floats.push({ x, y, text, color, life: 0.8 });
  }

  function makePlayer(c, r) {
    return {
      c, r, spawnC: c, spawnR: r,
      move: null, facing: 1,
      digCool: 0, digT: 0, digDir: 1,
      steps: 0, dead: false, trapped: false, escaping: 0,
    };
  }

  function makeGuard(c, r) {
    return {
      c, r, spawnC: c, spawnR: r, isGuard: true,
      move: null, facing: player && player.c < c ? -1 : 1,
      steps: 0, dead: false, trapped: false, trapT: 0,
      escaping: 0, respawn: 0, blink: 0, think: 0, plan: null,
    };
  }

  function loadLevel(index, opt) {
    opt = opt || {};
    if (opt.resetRun) {
      score = 0;
      lives = 5;
    }
    levelIndex = index;
    const level = LEVELS[index];
    grid = level.rows.map((row) => row.split(""));
    gold = [];
    guards = [];
    holes = new Map();
    particles = [];
    floats = [];
    exitAnnounced = false;
    player = null;
    for (let r = 0; r < ROWS; r++) {
      if (grid[r].length !== COLS) {
        throw new Error("bad row " + index + ":" + r);
      }
      for (let c = 0; c < COLS; c++) {
        const ch = grid[r][c];
        if (ch === "@") {
          player = makePlayer(c, r);
          grid[r][c] = ".";
        } else if (ch === "&") {
          guards.push(makeGuard(c, r));
          grid[r][c] = ".";
        } else if (ch === "*") {
          gold.push({ c, r, taken: false });
          grid[r][c] = ".";
        }
      }
    }
    if (!player) throw new Error("no player");
    goldLeft = gold.length;
    grace = 0.45;
    shake = 0;
    digLatch = 0;
    digLatchT = 0;
    mode = "playing";
    overlayKind = null;
    $("overlay").hidden = true;
    if (!opt.quiet) toast("第 " + (index + 1) + " 關　" + level.name + "　" + level.hint, 3.2);
    updateHud();
  }

  function actorOrigin(a) {
    let ox = 0;
    let oy = 0;
    if (a.move) {
      const u = Math.min(1, a.move.t / a.move.dur);
      ox = a.move.dc * u * TILE;
      oy = a.move.dr * u * TILE;
    }
    return { x: a.c * TILE + ox, y: a.r * TILE + oy };
  }

  function openHole(c, r) {
    if (!inBounds(c, r) || grid[r][c] !== "=" || isHole(c, r)) return false;
    holes.set(c + "," + r, { c, r, t: HOLE_TIME });
    return true;
  }

  function tryDig(dc) {
    if (!canDig(player.c, player.r, dc)) return false;
    const tc = player.c + dc;
    const tr = player.r + 1;
    openHole(tc, tr);
    player.digCool = DIG_COOL;
    player.digT = 0.18;
    player.digDir = dc;
    player.facing = dc;
    shake = Math.max(shake, 1.5);
    sfx.dig();
    spawnParticles(tc * TILE + 8, tr * TILE + 4, "#e7a15a", 8);
    return true;
  }

  function pocketSize() {
    const seen = new Set();
    const q = [[player.c, player.r]];
    seen.add(player.c + "," + player.r);
    while (q.length) {
      const cur = q.pop();
      const moves = legalMoves({ c: cur[0], r: cur[1] }, true);
      for (const m of moves) {
        const nc = cur[0] + m.dc;
        const nr = cur[1] + m.dr;
        const k = nc + "," + nr;
        if (!seen.has(k) && canOccupy(nc, nr)) {
          seen.add(k);
          q.push([nc, nr]);
          if (seen.size > 40) return seen.size;
        }
      }
    }
    return seen.size;
  }

  function tryEmergency() {
    if (!pressed("up")) return false;
    if (!inBounds(player.c, player.r - 1)) return false;
    if (grid[player.r - 1][player.c] !== "=") return false;
    if (isHole(player.c, player.r - 1)) return false;
    if (legalMoves(player, true).some((m) => m.dr === -1)) return false;
    if (pocketSize() > 28) return false;
    return openHole(player.c, player.r - 1);
  }

  function choosePlayerMove() {
    const moves = legalMoves(player, true);
    const up = pressed("up");
    const dn = pressed("down");
    const lf = pressed("left");
    const rt = pressed("right");
    if (!hasSupport(player)) {
      if (up) {
        const climb = moves.find((m) => m.dr === -1);
        if (climb) return climb;
      }
      const fall = moves.find((m) => m.kind === "fall");
      if (fall) return fall;
    }
    if (player.digCool <= 0) {
      const wantL = pressed("digL");
      const wantR = pressed("digR");
      if (wantL && wantR) {
        if (digPrefer === "digL" && tryDig(-1)) return null;
        if (digPrefer === "digR" && tryDig(1)) return null;
      }
      if (wantL && tryDig(-1)) {
        digLatch = 0;
        return null;
      }
      if (wantR && tryDig(1)) {
        digLatch = 0;
        return null;
      }
      if (!wantL && !wantR && digLatch && tryDig(digLatch)) {
        digLatch = 0;
        digLatchT = 0;
        return null;
      }
    }
    if (up && tryEmergency()) {
      const climb = legalMoves(player, true).find((m) => m.dr === -1);
      if (climb) return climb;
    }
    if (up) {
      const climb = moves.find((m) => m.dr === -1);
      if (climb) return climb;
    }
    if (dn) {
      const downMove = moves.find((m) => m.dr === 1);
      if (downMove) return downMove;
    }
    if (lf && !rt) {
      const m = moves.find((m) => m.dc === -1);
      if (m) return m;
    }
    if (rt && !lf) {
      const m = moves.find((m) => m.dc === 1);
      if (m) return m;
    }
    return null;
  }

  function scanFloor(g) {
    if (g.r !== player.r || player.dead) return 0;
    const dir = Math.sign(player.c - g.c);
    if (!dir) return 0;
    if (Math.abs(player.c - g.c) > 16) return 0;
    for (let c = g.c + dir; c !== player.c + dir; c += dir) {
      if (!canOccupy(c, g.r)) return 0;
      const floor =
        isSolid(c, g.r + 1) ||
        isHole(c, g.r + 1) ||
        isLadder(c, g.r) ||
        isRope(c, g.r) ||
        trappedGuardAt(c, g.r + 1);
      if (!floor) return 0;
    }
    return dir;
  }

  function guardNav(c, r) {
    const actor = { c, r };
    const moves = legalMoves(actor, false);
    const out = [];
    for (const m of moves) {
      const nc = c + m.dc;
      const nr = r + m.dr;
      if (m.kind === "walk" && !hasSupport({ c: nc, r: nr })) {
        // Stepping into open air is fine unless it drops straight into a dug hole.
        if (isHole(nc, nr + 1)) continue;
      }
      if (isHole(nc, nr) && hasSupport({ c: nc, r: nr })) continue;
      out.push([nc, nr]);
    }
    return out;
  }

  function bfsStep(g) {
    const startKey = g.c + "," + g.r;
    const goalKey = player.c + "," + player.r;
    const q = [[g.c, g.r]];
    const prev = new Map();
    prev.set(startKey, null);
    let found = startKey === goalKey;
    let n = 0;
    while (q.length && !found && n < 900) {
      n++;
      const cur = q.shift();
      for (const nxt of guardNav(cur[0], cur[1])) {
        const k = nxt[0] + "," + nxt[1];
        if (prev.has(k)) continue;
        prev.set(k, cur);
        if (k === goalKey) {
          found = true;
          break;
        }
        q.push(nxt);
      }
    }
    if (!found || startKey === goalKey) return null;
    let cur = [player.c, player.r];
    let p = prev.get(goalKey);
    while (p && !(p[0] === g.c && p[1] === g.r)) {
      cur = p;
      p = prev.get(p[0] + "," + p[1]);
    }
    return { c: cur[0], r: cur[1] };
  }

  function chooseGuardMove(g) {
    const moves = legalMoves(g, false);
    if (!moves.length) return null;
    if (!hasSupport(g)) {
      return moves.find((m) => m.kind === "fall") || moves[0];
    }
    const scan = scanFloor(g);
    if (scan) {
      const m = moves.find((m) => m.dc === scan && m.dr === 0);
      if (m) return m;
    }
    g.think -= 1;
    if (!g.plan || g.think <= 0) {
      g.plan = bfsStep(g);
      g.think = 2;
    }
    const next = g.plan;
    if (next && (next.c !== g.c || next.r !== g.r)) {
      const dc = Math.sign(next.c - g.c);
      const dr = Math.sign(next.r - g.r);
      let m = moves.find((mv) => mv.dc === dc && mv.dr === dr);
      if (!m && dc) m = moves.find((mv) => mv.dc === dc && mv.dr === 0);
      if (!m && dr) m = moves.find((mv) => mv.dr === dr && mv.dc === 0);
      if (m) return m;
      g.plan = null;
    }
    const dc = Math.sign(player.c - g.c);
    const dr = Math.sign(player.r - g.r);
    let m = dc && moves.find((mv) => mv.dc === dc && mv.dr === 0);
    if (m) return m;
    m = dr && moves.find((mv) => mv.dr === dr && mv.dc === 0);
    if (m && m.kind !== "fall") return m;
    return null;
  }

  function checkPickups() {
    if (!player || mode !== "playing") return;
    for (const g of gold) {
      if (!g.taken && g.c === player.c && g.r === player.r) {
        g.taken = true;
        goldLeft -= 1;
        score += 250;
        sfx.gold();
        const o = actorOrigin(player);
        spawnParticles(o.x + 8, o.y + 8, "#ffd23f", 10);
        floatText(o.x, o.y, "+250", "#ffd23f");
        if (goldLeft === 0 && !exitAnnounced) {
          exitAnnounced = true;
          toast("出口已開啟！爬上閃光逃生梯", 3.2);
          sfx.exit();
          shake = Math.max(shake, 2);
        }
        updateHud();
      }
    }
    if (goldLeft === 0 && grid[player.r][player.c] === "!") winLevel();
  }

  function onArrive(actor, asPlayer) {
    if (!asPlayer && isHole(actor.c, actor.r) && hasSupport(actor) && actor.escaping <= 0) {
      actor.trapped = true;
      actor.trapT = TRAP_TIME;
      actor.move = null;
      sfx.thud();
      return;
    }
    if (asPlayer) checkPickups();
  }

  function startMove(actor, move, asPlayer) {
    const dur = move.kind === "fall" ? (asPlayer ? PLAYER_FALL : GUARD_FALL) : (asPlayer ? PLAYER_WALK : guardDur());
    actor.move = { dc: move.dc, dr: move.dr, t: 0, dur, kind: move.kind };
    if (move.dc) actor.facing = Math.sign(move.dc);
  }

  function releaseTrap(g) {
    if (canOccupy(g.c, g.r - 1)) {
      g.trapped = false;
      g.escaping = 0.75;
      g.move = { dc: 0, dr: -1, t: 0, dur: guardDur(), kind: "climb" };
      return;
    }
    g.trapT = 0.35;
  }

  function updateActor(actor, dt, asPlayer) {
    if (actor.dead) return;
    if (actor.trapped) {
      actor.trapT -= dt;
      if (actor.trapT <= 0) releaseTrap(actor);
      return;
    }
    if (actor.escaping > 0) actor.escaping -= dt;
    let time = dt;
    for (let i = 0; i < 8 && time >= 0; i++) {
      if (mode !== "playing") return;
      if (actor.move) {
        actor.move.t += time;
        if (actor.move.t < actor.move.dur) return;
        time = actor.move.t - actor.move.dur;
        actor.c += actor.move.dc;
        actor.r += actor.move.dr;
        actor.move = null;
        actor.steps += 1;
        onArrive(actor, asPlayer);
        if (actor.trapped || actor.dead || mode !== "playing") return;
        continue;
      }
      const move = asPlayer ? choosePlayerMove() : chooseGuardMove(actor);
      if (!move) return;
      startMove(actor, move, asPlayer);
      if (time <= 0) return;
    }
  }

  function boxesOverlap(a, b) {
    const A = actorOrigin(a);
    const B = actorOrigin(b);
    const inset = 3;
    return (
      A.x + inset < B.x + TILE - inset &&
      A.x + TILE - inset > B.x + inset &&
      A.y + inset < B.y + TILE - inset &&
      A.y + TILE - inset > B.y + inset
    );
  }

  function checkOverlap() {
    if (grace > 0 || mode !== "playing") return;
    for (const g of guards) {
      if (g.dead || g.trapped) continue;
      if (boxesOverlap(player, g)) {
        killPlayer("guard");
        return;
      }
    }
  }

  function killPlayer(reason) {
    if (mode !== "playing" || grace > 0) return;
    deathReason = reason;
    lives -= 1;
    shake = 6;
    sfx.die();
    updateHud();
    if (lives <= 0) {
      mode = "gameover";
      rememberBest();
      showOverlay("gameover");
      return;
    }
    mode = "death";
    deathT = 1.15;
    showOverlay("death");
  }

  function buryGuard(g) {
    if (g.dead) return;
    g.dead = true;
    g.trapped = false;
    g.move = null;
    g.respawn = 2.8;
    score += 200;
    sfx.bury();
    floatText(g.c * TILE, g.r * TILE, "+200", "#9aef8a");
    spawnParticles(g.c * TILE + 8, g.r * TILE + 8, "#9aef8a", 8);
    updateHud();
  }

  function closeHole(hole) {
    const key = hole.c + "," + hole.r;
    holes.delete(key);
    const occupants = [player, ...guards];
    for (const a of occupants) {
      if (!a || a.dead) continue;
      if (a.c !== hole.c || a.r !== hole.r) continue;
      if (a.move && a.move.dr === -1 && a.move.t > a.move.dur * 0.55) continue;
      if (a === player) killPlayer("crush");
      else buryGuard(a);
    }
  }

  function tryRespawn(g) {
    if (player.c === g.spawnC && player.r === g.spawnR) {
      g.respawn = 0.35;
      return;
    }
    if (!canOccupy(g.spawnC, g.spawnR)) {
      g.respawn = 0.35;
      return;
    }
    g.dead = false;
    g.trapped = false;
    g.c = g.spawnC;
    g.r = g.spawnR;
    g.move = null;
    g.escaping = 0.45;
    g.blink = 0.45;
    g.plan = null;
  }

  function winLevel() {
    if (mode !== "playing") return;
    const last = levelIndex >= LEVELS.length - 1;
    score += 1000 * (levelIndex + 1);
    mode = last ? "victory" : "clear";
    sfx.clear();
    rememberBest();
    showOverlay(last ? "victory" : "clear");
  }

  function rememberBest() {
    if (score > best) {
      best = score;
      try {
        localStorage.setItem(BEST_KEY, String(best));
      } catch (err) {
        /* ignore */
      }
    }
  }

  function update(dt) {
    dt = Math.min(0.05, Math.max(0, dt));
    animTime += dt;
    if (toastT > 0) {
      toastT -= dt;
      if (toastT <= 0) $("toast").hidden = true;
    }
    shake = Math.max(0, shake - dt * 10);
    if (mode === "death") {
      deathT -= dt;
      if (deathT <= 0) loadLevel(levelIndex, { keep: true });
      return;
    }
    if (mode !== "playing") {
      updateFloats(dt);
      return;
    }
    grace = Math.max(0, grace - dt);
    player.digCool = Math.max(0, player.digCool - dt);
    player.digT = Math.max(0, player.digT - dt);
    if (digLatchT > 0) {
      digLatchT -= dt;
      if (digLatchT <= 0) digLatch = 0;
    }
    updateActor(player, dt, true);
    if (mode !== "playing") return;
    for (const g of guards) {
      g.blink = Math.max(0, g.blink - dt);
      if (g.dead) {
        g.respawn -= dt;
        if (g.respawn <= 0) tryRespawn(g);
      } else {
        updateActor(g, dt, false);
        if (mode !== "playing") return;
      }
    }
    for (const hole of [...holes.values()]) {
      hole.t -= dt;
      if (hole.t <= 0) closeHole(hole);
      if (mode !== "playing") return;
    }
    checkOverlap();
    checkPickups();
    updateParticles(dt);
    updateFloats(dt);
  }

  function updateParticles(dt) {
    particles = particles.filter((p) => {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 180 * dt;
      return p.life > 0;
    });
  }

  function updateFloats(dt) {
    floats = floats.filter((f) => {
      f.life -= dt;
      f.y -= 18 * dt;
      return f.life > 0;
    });
  }

  function blit(rows, x, y, pal, flip) {
    for (let j = 0; j < rows.length; j++) {
      const row = rows[j];
      for (let i = 0; i < row.length; i++) {
        const ch = row[flip ? row.length - 1 - i : i];
        const color = pal[ch];
        if (!color) continue;
        ctx.fillStyle = color;
        ctx.fillRect(x + i, y + j, 1, 1);
      }
    }
  }

  function paintCourse(x, y, offset) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, TILE, 6);
    ctx.clip();
    for (let i = -1; i < 3; i++) {
      const bx = x + ((offset % 8) + 8) % 8 + i * 8 - 8;
      ctx.fillStyle = "#c56a2c";
      ctx.fillRect(bx, y, 7, 6);
      ctx.fillStyle = "#f0a15a";
      ctx.fillRect(bx, y, 7, 1);
      ctx.fillStyle = "#ffd2a4";
      ctx.fillRect(bx + 1, y + 1, 2, 1);
      ctx.fillStyle = "#7a3414";
      ctx.fillRect(bx, y + 5, 7, 1);
    }
    ctx.restore();
  }

  function drawBrick(x, y, seed) {
    ctx.fillStyle = "#4a2414";
    ctx.fillRect(x, y, TILE, TILE);
    paintCourse(x, y + 1, seed);
    paintCourse(x, y + 9, seed + 4);
  }

  function drawConcrete(x, y) {
    ctx.fillStyle = "#3c4b6a";
    ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = "#7d8eb4";
    ctx.fillRect(x, y, TILE, 2);
    ctx.fillStyle = "#243049";
    ctx.fillRect(x, y + 14, TILE, 2);
    ctx.fillRect(x, y + 7, TILE, 1);
    ctx.fillStyle = "#d5def2";
    ctx.fillRect(x + 3, y + 3, 2, 2);
    ctx.fillRect(x + 11, y + 3, 2, 2);
    ctx.fillRect(x + 3, y + 10, 2, 2);
    ctx.fillRect(x + 11, y + 10, 2, 2);
  }

  function drawLadder(x, y, hot) {
    const rail = hot ? "#fff3c4" : "#f4f4f8";
    const rung = hot ? "#ffe08a" : "#ffffff";
    ctx.fillStyle = rail;
    ctx.fillRect(x + 3, y, 2, TILE);
    ctx.fillRect(x + 11, y, 2, TILE);
    ctx.fillStyle = hot ? "#e7c56a" : "#b7b7c8";
    ctx.fillRect(x + 4, y, 1, TILE);
    ctx.fillStyle = rung;
    for (let i = 1; i < TILE; i += 4) ctx.fillRect(x + 3, y + i, 10, 2);
  }

  function drawRope(x, y) {
    ctx.fillStyle = "#f7f7fb";
    ctx.fillRect(x, y + 2, TILE, 2);
    ctx.fillStyle = "#b7b7c8";
    ctx.fillRect(x, y + 4, TILE, 1);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + 1, y + 1, 2, 4);
    ctx.fillRect(x + 13, y + 1, 2, 4);
  }

  function drawGold(x, y, t) {
    const bob = Math.sin(t * 5) > 0 ? 0 : 1;
    ctx.fillStyle = "#6a480e";
    ctx.fillRect(x + 3, y + 13, 10, 2);
    const pile = [
      "....yyyyyy....",
      "...yywyyyyy...",
      "..yyyyyyyyyy..",
      ".yyyyyyyyyyyy.",
      "yyyyyyyyyyyyyy",
    ];
    for (let j = 0; j < pile.length; j++) {
      for (let i = 0; i < pile[j].length; i++) {
        const ch = pile[j][i];
        if (ch === ".") continue;
        ctx.fillStyle = ch === "w" ? "#fff6c2" : "#ffd23f";
        ctx.fillRect(x + 1 + i, y + 8 + j - bob, 1, 1);
      }
    }
    ctx.fillStyle = "#c88812";
    ctx.fillRect(x + 2, y + 12 - bob, 12, 1);
  }

  function drawHole(x, y, hole) {
    ctx.fillStyle = "#000";
    ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = "#140a06";
    ctx.fillRect(x + 2, y + 2, 12, 12);
    ctx.fillStyle = "#4a2414";
    ctx.fillRect(x, y, 2, TILE);
    ctx.fillRect(x + 14, y, 2, TILE);
    ctx.fillStyle = "#c56a2c";
    ctx.fillRect(x, y, 1, TILE);
    ctx.fillRect(x + 15, y, 1, TILE);
    if (hole.t < 0.8) {
      const u = 1 - hole.t / 0.8;
      const w = Math.max(1, Math.floor(u * 8));
      drawBrick(x, y, x);
      ctx.fillStyle = "#000";
      ctx.fillRect(x + w, y + 1, TILE - w * 2, TILE - 2);
    }
  }

  function drawGoal(x, y, open) {
    const flash = open && Math.sin(animTime * 10) > 0;
    ctx.fillStyle = flash ? "#fff1a8" : open ? "#ffd23f" : "#3a2458";
    ctx.fillRect(x + 3, y + 2, 10, 13);
    ctx.fillStyle = flash ? "#fff" : open ? "#fff6c2" : "#1a1028";
    ctx.fillRect(x + 5, y + 4, 6, 9);
    ctx.fillStyle = open ? "#c88812" : "#6a5088";
    ctx.fillRect(x + 2, y + 1, 12, 2);
    ctx.fillRect(x + 4, y + 14, 8, 2);
  }

  function drawPixelText(text, x, y, scale, color) {
    ctx.fillStyle = color;
    let cx = x;
    for (const ch of text) {
      const glyph = FONT[ch] || FONT[" "];
      for (let j = 0; j < glyph.length; j++) {
        for (let i = 0; i < glyph[j].length; i++) {
          if (glyph[j][i] === "1") ctx.fillRect(cx + i * scale, y + j * scale, scale, scale);
        }
      }
      cx += 4 * scale;
    }
  }

  function render() {
    const mag = shake > 0.15 ? Math.round(Math.sin(animTime * 40) * Math.min(3, shake)) : 0;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, mag, 0);

    const hot = goldLeft === 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = c * TILE;
        const y = r * TILE;
        const ch = grid[r][c];
        if (isHole(c, r)) {
          drawHole(x, y, holes.get(c + "," + r));
          continue;
        }
        if (ch === "=") drawBrick(x, y, (c * 3 + r * 5) % 8);
        else if (ch === "#") drawConcrete(x, y);
        else if (ch === "H") drawLadder(x, y, false);
        else if (ch === "^") {
          if (hot) drawLadder(x, y, true);
        } else if (ch === "-") drawRope(x, y);
        else if (ch === "!") drawGoal(x, y, hot);
      }
    }

    for (const g of gold) {
      if (!g.taken) drawGold(g.c * TILE, g.r * TILE, animTime + g.c);
    }

    if (!player.move && mode === "playing") {
      for (const dc of [-1, 1]) {
        const show = dc === -1 ? pressed("digL") : pressed("digR");
        if (!show) continue;
        if (!canDig(player.c, player.r, dc)) continue;
        const x = (player.c + dc) * TILE;
        const y = (player.r + 1) * TILE;
        ctx.strokeStyle = Math.sin(animTime * 18) > 0 ? "#fff" : "#ffd23f";
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
      }
    }

    for (const g of guards) {
      if (g.dead) continue;
      if (g.blink > 0 && Math.sin(animTime * 30) > 0) continue;
      const o = actorOrigin(g);
      const y = o.y + (g.trapped ? -6 : 0);
      const frame = g.move && g.move.dc ? (g.steps % 2 === 0 ? SPRITES.guard : SPRITES.guardRun) : SPRITES.guard;
      blit(frame, o.x, y, PAL_GUARD, g.facing < 0);
      if (g.trapped) {
        ctx.fillStyle = Math.sin(animTime * 8) > 0 ? "#fff" : "#ffe08a";
        const sx = o.x + 5;
        const sy = y - 2;
        ctx.fillRect(sx, sy, 2, 2);
        ctx.fillRect(sx + 5, sy + 1, 2, 2);
        ctx.fillRect(sx + 2, sy + 3, 2, 2);
      }
    }

    if (player && mode !== "gameover") {
      const o = actorOrigin(player);
      let frame = SPRITES.stand;
      if (player.digT > 0) frame = SPRITES.dig;
      else if (player.move && player.move.kind === "fall") frame = SPRITES.fall;
      else if (player.move && player.move.dr !== 0) frame = SPRITES.climb;
      else if (isLadder(player.c, player.r) && (pressed("up") || pressed("down"))) frame = SPRITES.climb;
      else if (player.move && player.move.dc) frame = player.steps % 2 === 0 ? SPRITES.runA : SPRITES.runB;
      const blink = mode === "death" && Math.sin(animTime * 24) > 0;
      if (!blink) blit(frame, o.x, o.y, PAL_PLAYER, player.facing < 0 && player.digT <= 0 ? true : player.digT > 0 ? player.digDir < 0 : player.facing < 0);
    }

    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life * 2);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 2, 2);
    }
    ctx.globalAlpha = 1;

    ctx.font = "bold 10px sans-serif";
    for (const f of floats) {
      ctx.globalAlpha = Math.max(0, f.life * 1.4);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, ROWS * TILE, VIEW_W, 24);
    ctx.fillStyle = "#2a1044";
    ctx.fillRect(0, ROWS * TILE, VIEW_W, 2);
    const label = "STAGE " + (levelIndex + 1);
    const scale = 2;
    const width = label.length * 4 * scale;
    drawPixelText(label, Math.floor((VIEW_W - width) / 2), ROWS * TILE + 6, scale, "#f3e9ff");

    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  function updateHud() {
    $("stageNum").textContent = String(levelIndex + 1);
    $("goldNum").textContent = String(goldLeft);
    $("livesNum").textContent = String(lives);
    $("scoreNum").textContent = String(score);
    $("levelName").textContent = "STAGE " + (levelIndex + 1) + "　" + LEVELS[levelIndex].name;
    const goldStat = $("goldNum").parentElement;
    goldStat.classList.toggle("pulse", goldLeft === 0);
    const bestEl = $("bestScore");
    if (best > 0) {
      bestEl.hidden = false;
      $("bestNum").textContent = String(best);
    }
    $("btnMute").textContent = muted ? "音效關" : "音效開";
    $("btnPause").textContent = mode === "pause" ? "繼續" : "暫停";
  }

  function showOverlay(kind) {
    overlayKind = kind;
    const ov = $("overlay");
    const title = $("ovTitle");
    const text = $("ovText");
    const eye = $("ovEye");
    const btn = $("ovBtn");
    const alt = $("ovAlt");
    ov.hidden = false;
    alt.hidden = true;
    text.replaceChildren();
    if (kind === "help") {
      eye.textContent = "教學";
      title.textContent = "點樣玩";
      const ul = document.createElement("ul");
      ul.className = "help-list";
      [
        "方向鍵或 WASD：左右移動，上下爬梯。",
        "Z、Q 或左 Shift：向左挖磚。X、E 或右 Shift：向右挖磚。",
        "橙色磚可以挖，藍灰色石壁挖不穿。",
        "白色梯子可以爬。白色橫繩可以抓住橫行，按下就鬆手。",
        "收齊金塊後，逃生梯會亮起，爬到出口就過關。",
        "守衛跌進洞裡會昏迷幾秒，你可以踏著他的頭走過去。",
        "洞口約七秒後合上；還在洞裡的守衛會被埋掉，稍後重新出現。",
        "碰到清醒的守衛會失去一條生命。",
        "如果被關在小房間，按上可以打穿頭上的磚。",
      ].forEach((line) => {
        const li = document.createElement("li");
        li.textContent = line;
        ul.appendChild(li);
      });
      text.appendChild(ul);
      btn.textContent = "返回遊戲";
    } else if (kind === "pause") {
      eye.textContent = "暫停";
      title.textContent = "暫停";
      text.textContent = "準備好就繼續跑。守衛會在原地等你。";
      btn.textContent = "繼續遊戲";
    } else if (kind === "death") {
      eye.textContent = "第 " + (levelIndex + 1) + " 關";
      title.textContent = "失手！";
      text.textContent =
        (deathReason === "crush" ? "磚塊合上，你被埋住了。" : "守衛抓住了你。") +
        "餘下生命：" + lives + "。";
      btn.textContent = "繼續本關";
    } else if (kind === "clear") {
      eye.textContent = LEVELS[levelIndex].name;
      title.textContent = "過關！";
      text.textContent = "第 " + (levelIndex + 1) + " 關完成，金塊已經搬光。分數 " + score + "。";
      btn.textContent = "下一關";
    } else if (kind === "victory") {
      eye.textContent = "全部通關";
      title.textContent = "礦坑清空！";
      text.textContent = "四關都過了。今次分數 " + score + (best ? "，最高 " + best + "。" : "。");
      btn.textContent = "再玩一次";
    } else if (kind === "gameover") {
      eye.textContent = "生命用盡";
      title.textContent = "遊戲結束";
      text.textContent = "今次分數 " + score + (best ? "。最高分數 " + best + "。" : "。");
      btn.textContent = "重新開始";
      alt.hidden = false;
      alt.textContent = "重試本關";
    }
    btn.focus();
  }

  function hideOverlay() {
    $("overlay").hidden = true;
    overlayKind = null;
  }

  function overlayAction() {
    if (overlayKind === "help") {
      const back = helpReturn;
      helpReturn = null;
      if (back === "pause") {
        mode = "pause";
        showOverlay("pause");
      } else if (back && back !== "playing" && back !== "help") {
        mode = back;
        showOverlay(back);
      } else {
        mode = "playing";
        hideOverlay();
      }
      updateHud();
      return;
    }
    if (overlayKind === "pause") {
      hideOverlay();
      mode = "playing";
      updateHud();
      return;
    }
    if (overlayKind === "death") {
      deathT = 0;
      loadLevel(levelIndex, { keep: true });
      return;
    }
    if (overlayKind === "clear") {
      loadLevel(levelIndex + 1, { keep: true });
      return;
    }
    if (overlayKind === "victory" || overlayKind === "gameover") {
      loadLevel(0, { resetRun: true });
      return;
    }
  }

  function loop(now) {
    if (!loop.last) loop.last = now;
    const dt = (now - loop.last) / 1000;
    loop.last = now;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  function setMuted(next) {
    muted = next;
    try {
      localStorage.setItem("lode-hk-muted", muted ? "1" : "0");
    } catch (err) {
      /* ignore */
    }
    updateHud();
  }

  function bindTouch(btn) {
    const name = btn.dataset.k;
    const down = (e) => {
      e.preventDefault();
      btn.classList.add("held");
      touchKeys.add(name);
      if (name === "digL" || name === "digR") {
        digPrefer = name;
        digLatch = name === "digL" ? -1 : 1;
        digLatchT = 0.4;
      }
      unlockAudio();
      try {
        btn.setPointerCapture(e.pointerId);
      } catch (err) {
        /* ignore */
      }
    };
    const up = () => {
      btn.classList.remove("held");
      touchKeys.delete(name);
    };
    btn.addEventListener("pointerdown", down);
    btn.addEventListener("pointerup", up);
    btn.addEventListener("pointercancel", up);
  }

  function onKeyDown(e) {
    if (e.repeat) return;
    const fromCode = { ShiftLeft: "digL", ShiftRight: "digR" }[e.code];
    const fromKey = {
      ArrowLeft: "left",
      ArrowRight: "right",
      ArrowUp: "up",
      ArrowDown: "down",
      a: "left",
      d: "right",
      w: "up",
      s: "down",
      A: "left",
      D: "right",
      W: "up",
      S: "down",
      z: "digL",
      Z: "digL",
      q: "digL",
      Q: "digL",
      x: "digR",
      X: "digR",
      e: "digR",
      E: "digR",
    }[e.key];
    const name = fromCode || fromKey;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
    if (e.key === "Escape") {
      e.preventDefault();
      if (mode === "playing") {
        mode = "pause";
        showOverlay("pause");
      } else if (mode === "pause" || mode === "help") {
        hideOverlay();
        mode = "playing";
        updateHud();
      }
      return;
    }
    if (mode !== "playing") {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        overlayAction();
      }
      return;
    }
    if (!name) return;
    e.preventDefault();
    keys.add(name);
    if (name === "digL" || name === "digR") {
      digPrefer = name;
      digLatch = name === "digL" ? -1 : 1;
      digLatchT = 0.4;
    }
    unlockAudio();
  }

  function onKeyUp(e) {
    const fromCode = { ShiftLeft: "digL", ShiftRight: "digR" }[e.code];
    const fromKey = {
      ArrowLeft: "left",
      ArrowRight: "right",
      ArrowUp: "up",
      ArrowDown: "down",
      a: "left",
      d: "right",
      w: "up",
      s: "down",
      A: "left",
      D: "right",
      W: "up",
      S: "down",
      z: "digL",
      Z: "digL",
      q: "digL",
      Q: "digL",
      x: "digR",
      X: "digR",
      e: "digR",
      E: "digR",
    }[e.key];
    const name = fromCode || fromKey;
    if (name) keys.delete(name);
  }

  $("btnRetry").addEventListener("click", () => {
    unlockAudio();
    if (lives <= 0) lives = 5;
    loadLevel(levelIndex, { keep: true });
  });
  let helpReturn = null;
  $("btnHelp").addEventListener("click", () => {
    unlockAudio();
    helpReturn = mode;
    if (mode === "playing" || mode === "pause") mode = "help";
    showOverlay("help");
  });
  $("btnPause").addEventListener("click", () => {
    unlockAudio();
    if (mode === "playing") {
      mode = "pause";
      showOverlay("pause");
    } else if (mode === "pause" || mode === "help") {
      hideOverlay();
      mode = "playing";
      updateHud();
    }
  });
  $("btnMute").addEventListener("click", () => {
    setMuted(!muted);
    unlockAudio();
  });
  $("ovBtn").addEventListener("click", () => {
    unlockAudio();
    overlayAction();
  });
  $("ovAlt").addEventListener("click", () => {
    unlockAudio();
    if (overlayKind === "gameover") {
      lives = 5;
      loadLevel(levelIndex, { keep: true });
    }
  });
  document.querySelectorAll(".touch button").forEach(bindTouch);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  function floodFrom(c, r) {
    const seen = new Set();
    const q = [[c, r]];
    seen.add(c + "," + r);
    while (q.length) {
      const cur = q.pop();
      for (const m of legalMoves({ c: cur[0], r: cur[1] }, true)) {
        const nc = cur[0] + m.dc;
        const nr = cur[1] + m.dr;
        const k = nc + "," + nr;
        if (!seen.has(k) && canOccupy(nc, nr)) {
          seen.add(k);
          q.push([nc, nr]);
        }
      }
    }
    return seen;
  }

  function reachableWithDigs() {
    const savedHoles = new Map(holes);
    const savedGold = goldLeft;
    holes = new Map();
    let reach = floodFrom(player.spawnC, player.spawnR);
    let guard = 0;
    let changed = true;
    while (changed && guard < 80) {
      guard++;
      changed = false;
      const candidates = [];
      for (const key of reach) {
        const [c, r] = key.split(",").map(Number);
        if (!hasSupport({ c, r })) continue;
        for (const dc of [-1, 1]) {
          if (canDig(c, r, dc)) candidates.push([c + dc, r + 1]);
        }
      }
      for (const [hc, hr] of candidates) {
        holes = new Map([[hc + "," + hr, { c: hc, r: hr, t: 9 }]]);
        const seen = floodFrom(player.spawnC, player.spawnR);
        holes = new Map();
        let grew = false;
        for (const k of seen) {
          if (!reach.has(k)) {
            reach.add(k);
            grew = true;
          }
        }
        if (grew) changed = true;
      }
    }
    holes = savedHoles;
    goldLeft = savedGold;
    return reach;
  }

  function analyzeCurrent() {
    const spawnC = player.spawnC;
    const spawnR = player.spawnR;
    const saved = goldLeft;
    goldLeft = Math.max(saved, 1);
    holes = new Map();
    const plain = floodFrom(spawnC, spawnR);
    const withDig = reachableWithDigs();
    const goldCells = gold.map((g) => g.c + "," + g.r);
    const plainGold = goldCells.filter((k) => plain.has(k)).length;
    const digGold = goldCells.filter((k) => withDig.has(k)).length;
    let goal = null;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) if (grid[r][c] === "!") goal = c + "," + r;
    }
    goldLeft = saved;
    holes = new Map();
    const goalClosed = goal && floodFrom(spawnC, spawnR).has(goal);
    goldLeft = 0;
    const opened = reachableWithDigs();
    const goalOpen = goal && opened.has(goal);
    goldLeft = saved;
    holes = new Map();
    return {
      plainGold,
      digGold,
      total: goldCells.length,
      goalClosed: !!goalClosed,
      goalOpen: !!goalOpen,
    };
  }

  function step(seconds) {
    const n = Math.max(1, Math.round(seconds * 60));
    for (let i = 0; i < n; i++) update(1 / 60);
  }

  function selfTest() {
    const fails = [];
    const assert = (name, cond) => {
      if (!cond) fails.push(name);
    };
    silent = true;
    try {
      assert("levels", LEVELS.length >= 3);
      for (let i = 0; i < LEVELS.length; i++) {
        loadLevel(i, { quiet: true, resetRun: i === 0 });
        assert("L" + i + " guards", guards.length >= (i === 0 ? 1 : i === 1 ? 2 : 3));
        assert("L" + i + " gold", gold.length >= 4);
        const report = analyzeCurrent();
        assert("L" + i + " dig gold " + JSON.stringify(report), report.digGold === report.total);
        assert("L" + i + " dig required", report.plainGold < report.total);
        assert("L" + i + " goal closed", report.goalClosed === false);
        assert("L" + i + " goal open", report.goalOpen === true);
        const ropes = LEVELS[i].rows.join("").split("-").length - 1;
        if (i === 1 || i === 3) assert("L" + i + " ropes", ropes > 4);
      }

      loadLevel(0, { quiet: true, resetRun: true });
      grace = 0;
      guards.forEach((g) => {
        g.dead = true;
      });
      const startC = player.c;
      setInput({ right: true });
      step(0.5);
      setInput({});
      assert("move right", player.c > startC);

      let spot = null;
      for (let r = 3; r < ROWS - 1 && !spot; r++) {
        for (let c = 1; c < COLS - 1; c++) {
          if (grid[r][c] === "H" && grid[r - 1][c] === "H" && grid[r - 2][c] === "H") {
            spot = { c, r };
            break;
          }
        }
      }
      assert("ladder spot", !!spot);
      player.c = spot.c;
      player.r = spot.r;
      player.move = null;
      const before = player.r;
      setInput({ up: true });
      step(0.55);
      setInput({});
      assert("climb from " + before + " to " + player.r, player.r <= before - 2);

      loadLevel(1, { quiet: true });
      grace = 99;
      guards.forEach((g) => {
        g.dead = true;
      });
      let rope = null;
      for (let r = 1; r < ROWS - 1 && !rope; r++) {
        for (let c = 1; c < COLS - 2; c++) {
          if (grid[r][c] === "-" && grid[r][c + 1] === "-") {
            rope = { c, r };
            break;
          }
        }
      }
      assert("rope", !!rope);
      player.c = rope.c;
      player.r = rope.r;
      player.move = null;
      setInput({ right: true });
      step(0.45);
      setInput({});
      assert("rope walk", player.r === rope.r && player.c > rope.c);

      loadLevel(0, { quiet: true, resetRun: true });
      grace = 0;
      const guard = guards[0];
      const gc = guard.c;
      const gr = guard.r;
      player.c = gc - 1;
      player.r = gr;
      player.move = null;
      player.facing = 1;
      assert("can dig under guard", canDig(player.c, player.r, 1));
      setInput({ digR: true });
      update(1 / 60);
      setInput({});
      assert("hole opened", isHole(gc, gr + 1));
      let trapped = false;
      for (let i = 0; i < 200; i++) {
        update(1 / 60);
        if (guard.trapped && guard.c === gc && guard.r === gr + 1) {
          trapped = true;
          break;
        }
      }
      assert("guard trapped", trapped);
      setInput({ right: true });
      for (let i = 0; i < 90; i++) {
        update(1 / 60);
        if (player.c >= gc) {
          player.move = null;
          break;
        }
      }
      setInput({});
      step(0.5);
      assert(
        "walk over guard got " + player.c + "," + player.r + " mode " + mode +
          " guard " + guard.c + "," + guard.r + " trapped " + guard.trapped,
        player.c === gc && player.r === gr && mode === "playing"
      );
      const hole = holes.get(gc + "," + (gr + 1));
      assert("hole exists", !!hole);
      hole.t = 0.02;
      const scoreBefore = score;
      update(1 / 30);
      assert("refill kills guard", guard.dead);
      assert("brick returns", !isHole(gc, gr + 1) && isSolid(gc, gr + 1));
      assert("bury score", score > scoreBefore);
      assert("player survived refill", mode === "playing" && lives === 5);

      loadLevel(0, { quiet: true });
      grace = 0;
      const g2 = guards[0];
      const livesBefore = lives;
      player.c = g2.c;
      player.r = g2.r;
      player.move = null;
      update(1 / 60);
      assert("touch dies", mode === "death" && lives === livesBefore - 1);

      loadLevel(0, { quiet: true });
      grace = 99;
      guards.forEach((g) => {
        g.dead = true;
      });
      const nugget = gold[0];
      const beforeGold = goldLeft;
      player.c = nugget.c;
      player.r = nugget.r;
      player.move = null;
      update(1 / 60);
      assert("collect gold", goldLeft === beforeGold - 1);

      gold.forEach((g) => {
        g.taken = true;
      });
      goldLeft = 0;
      exitAnnounced = true;
      let goal = null;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) if (grid[r][c] === "!") goal = { c, r };
      }
      assert("escape becomes ladder", isLadder(goal.c, goal.r + 1) || isLadder(goal.c, goal.r));
      player.c = goal.c;
      player.r = goal.r + 1;
      player.move = null;
      setInput({ up: true });
      step(0.7);
      setInput({});
      assert("stage clear", mode === "clear");

      loadLevel(0, { quiet: true, resetRun: true });
    } catch (err) {
      fails.push("threw " + (err && err.stack ? err.stack : err));
    }
    silent = false;
    scripted.clear();
    return { ok: fails.length === 0, fails };
  }

  function setInput(obj) {
    scripted.clear();
    Object.keys(obj).forEach((k) => {
      if (obj[k]) scripted.add(k);
    });
  }

  (function paintLogo() {
    const c = $("logo");
    const g = c.getContext("2d");
    g.imageSmoothingEnabled = false;
    g.fillStyle = "#3a1270";
    g.fillRect(0, 0, 32, 32);
    g.fillStyle = "#ffd23f";
    g.fillRect(4, 24, 24, 5);
    g.fillStyle = "#fff1a8";
    g.fillRect(7, 22, 7, 3);
    g.fillRect(18, 23, 5, 2);
    g.fillStyle = "#c44adf";
    g.fillRect(12, 6, 8, 9);
    g.fillStyle = "#f0b6ff";
    g.fillRect(12, 6, 8, 2);
    g.fillStyle = "#ffd0ae";
    g.fillRect(14, 9, 4, 3);
    g.fillStyle = "#fff";
    g.fillRect(14, 10, 1, 1);
    g.fillRect(17, 10, 1, 1);
    g.fillStyle = "#f4f4f8";
    g.fillRect(7, 14, 2, 8);
    g.fillRect(23, 14, 2, 8);
    g.fillRect(7, 16, 18, 2);
    g.fillRect(7, 20, 18, 2);
  })();

  loadLevel(0);
  requestAnimationFrame(loop);

  window.__LODE = {
    selfTest,
    setInput,
    loadLevel,
    get mode() {
      return mode;
    },
    get levelIndex() {
      return levelIndex;
    },
    get goldLeft() {
      return goldLeft;
    },
    get lives() {
      return lives;
    },
    get score() {
      return score;
    },
  };
})();
