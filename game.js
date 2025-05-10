// ===========================
// TILE TYPE LOGIC
// ===========================

function getRandomTileType() {
  const types = [
    { type: "sword", weight: 3 },
    { type: "cat", weight: 3 },
    { type: "necklace", weight: 1 },
    { type: "heart", weight: 3 },
    { type: "shroom", weight: 5 },
    { type: "flame", weight: 1 },
    { type: "key", weight: 1 },
    { type: "bone", weight: 10 },
    { type: "skull", weight: 3 },
    { type: "crown", weight: 1 },
    { type: "bottle", weight: 3 },
    { type: "soil", weight: 10 },
    { type: "coin", weight: 1 },
    { type: "pebble", weight: 5 },
    { type: "note", weight: 3 },
    { type: "eye", weight: 3 },
    { type: "root", weight: 5 },
    { type: "spider", weight: 3 },
    { type: "worm", weight: 3 },
    { type: "bell", weight: 3 },
    { type: "darkness", weight: 30 },
  ];

  const roll = Math.random() * 100;
  let cumulative = 0;

  for (const { type, weight } of types) {
    cumulative += weight;
    if (roll < cumulative) return type;
  }
}

// ===========================
// PLAYER STATE
// ===========================

const player = {
  x: 150,
  y: 150,
  spawnX: 150,
  spawnY: 150,
  day: 1,
  stepsLeft: 50,
  maxSteps: 50,
  digs: 0,
  sword: 0,
  cat: 0,
  necklace: 0,
  heart: 0,
  shroom: 0,
  flame: 0,
  key: 0,
  bone: 0,
  skull: 0,
  crown: 0,
  bottle: 0,
  soil: 0,
  coin: 0,
  pebble: 0,
  note: 0,
  eye: 0,
  root: 0,
  spider: 0,
  worm: 0,
  bell: 0,
  inventory: [null, null, null, null]
};

function updateCounters() {
  document.getElementById("step-count").textContent = player.stepsLeft;
  document.getElementById("digs-count").textContent = player.digs;
  document.getElementById("sword-count").textContent = player.sword;
  document.getElementById("cat-count").textContent = player.cat;
  document.getElementById("necklace-count").textContent = player.necklace;
  document.getElementById("heart-count").textContent = player.heart;
  document.getElementById("shroom-count").textContent = player.shroom;
  document.getElementById("flame-count").textContent = player.flame;
  document.getElementById("key-count").textContent = player.key;
  document.getElementById("bone-count").textContent = player.bone;
  document.getElementById("skull-count").textContent = player.skull;
  document.getElementById("crown-count").textContent = player.crown;
  document.getElementById("bottle-count").textContent = player.bottle;
  document.getElementById("soil-count").textContent = player.soil;
  document.getElementById("coin-count").textContent = player.coin;
  document.getElementById("pebble-count").textContent = player.pebble;
  document.getElementById("note-count").textContent = player.note;
  document.getElementById("eye-count").textContent = player.eye;
  document.getElementById("root-count").textContent = player.root;
  document.getElementById("spider-count").textContent = player.spider;
  document.getElementById("worm-count").textContent = player.worm;
  document.getElementById("bell-count").textContent = player.bell;
  document.getElementById("day-count").textContent = player.day;
}

// ===========================
// GRID & TILE CREATION
// ===========================

function createGrid(container) {
  for (let y = 0; y < 300; y++) {
    for (let x = 0; x < 300; x++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.dataset.x = x;
      tile.dataset.y = y;
      tile.dataset.type = getRandomTileType();
      container.appendChild(tile);
    }
  }
}

function getTile(x, y) {
  return document.querySelector(`.tile[data-x="${x}"][data-y="${y}"]`);
}

function rebindGridEvents() {
  document.querySelectorAll(".tile").forEach(tile => {
    tile.addEventListener("click", () => {
      const x = parseInt(tile.dataset.x, 10);
      const y = parseInt(tile.dataset.y, 10);
      mineTile(x, y);
    });
  });
}

// ===========================
// MINING LOGIC
// ===========================

function mineTile(x, y) {
  const tile = getTile(x, y);
  if (!tile || tile.classList.contains("mined")) return;

  tile.classList.add("mined");
  player.digs++;

  const type = tile.dataset.type;
  player[type] = (player[type] || 0) + 1;

  updateCounters();
}

function collectMinedTile(tile) {
  if (!tile.classList.contains("mined")) return;

  const type = tile.dataset.type;
  const slotIndex = player.inventory.findIndex(item => item === null);

  if (slotIndex !== -1) {
    player.inventory[slotIndex] = type;
    tile.classList.remove("mined");
    tile.classList.add("empty");
    updateInventoryUI();
  }
}

// ===========================
// GAME LOGIC, MOVEMENT, UI
// ===========================

let mineTimeout = null;

function initGame() {
  const gameContainer = document.getElementById("game");

  gameContainer.innerHTML = "";
  createGrid(gameContainer);

  updatePlayerPosition();          // ✅ add this
  centerCameraOnPlayer();
  updateCounters();

  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
}

function updatePlayerPosition() {
  document.querySelectorAll(".player").forEach(el => el.classList.remove("player"));
  const tile = document.querySelector(`.tile[data-x="${player.x}"][data-y="${player.y}"]`);
  if (tile) tile.classList.add("player");
}

function centerCameraOnPlayer() {
  const tile = document.querySelector(`.tile[data-x="${player.x}"][data-y="${player.y}"]`);
  if (tile) {
    tile.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  }
}

let moveInterval = null;
let heldDirection = null;
let lastMoveTime = 0;
const moveCooldown = 200;

function movePlayer(key) {
  const now = Date.now();
  if (now - lastMoveTime < moveCooldown) return;
  if (player.stepsLeft <= 0) return;

  let newX = player.x;
  let newY = player.y;

  switch (key) {
    case "arrowup": case "w": newY--; break;
    case "arrowdown": case "s": newY++; break;
    case "arrowleft": case "a": newX--; break;
    case "arrowright": case "d": newX++; break;
    default: return;
  }

  const nextTile = getTile(newX, newY);
  if (!nextTile || nextTile.dataset.type === "darkness") return;

  player.x = newX;
  player.y = newY;
  player.stepsLeft--;
  updateStepDisplay();

  if (player.stepsLeft <= 0) {
    showDayEndOverlay();
    return;
  }

  lastMoveTime = now;
  updatePlayerPosition();
  centerCameraOnPlayer();
}

function handleKeyDown(e) {
  const key = e.key.toLowerCase();
  if (e.repeat || moveInterval) return;

  if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
    heldDirection = key;
    movePlayer(heldDirection);
    moveInterval = setInterval(() => movePlayer(heldDirection), 250);
  }

  if (key === " ") {
    if (!mineTimeout) {
      mineTimeout = setTimeout(() => {
        mineTile(player.x, player.y);
        mineTimeout = null;
      }, 1000);
    }
  }

  if (key === "e") {
    const tile = getTile(player.x, player.y);
    if (tile) collectMinedTile(tile);
  }
}

function handleKeyUp(e) {
  if (e.key.toLowerCase() === heldDirection) {
    clearInterval(moveInterval);
    moveInterval = null;
    heldDirection = null;
  }

  if (e.key === " " && mineTimeout) {
    clearTimeout(mineTimeout);
    mineTimeout = null;
  }
}

function updateStepDisplay() {
  const el = document.getElementById("step-count");
  if (el) el.textContent = player.stepsLeft;
}

const tileImages = {
  sword: "images/sword.png",
  cat: "images/cat.png",
  necklace: "images/necklace.png",
  heart: "images/heart.png",
  shroom: "images/shroom.png",
  flame: "images/flame.png",
  key: "images/key.png",
  bone: "images/bone.png",
  skull: "images/skull.png",
  crown: "images/crown.png",
  bottle: "images/bottle.png",
  soil: "images/soil.png",
  coin: "images/coin.png",
  pebble: "images/pebble.png",
  note: "images/note.png",
  eye: "images/eye.png",
  root: "images/root.png",
  spider: "images/spider.png",
  worm: "images/worm.png",
  bell: "images/bell.png",
};

function updateInventoryUI() {
  player.inventory.forEach((type, i) => {
    const slot = document.getElementById(`slot-${i + 1}`);
    slot.innerHTML = ""; // Clear previous content

    if (type) {
      const img = document.createElement("img");
      img.src = tileImages[type];
      img.alt = type;
      img.classList.add("inventory-icon");
      slot.appendChild(img);
    }
  });
}

function showDayEndOverlay() {
  const overlay = document.getElementById("day-end-overlay");
  if (overlay) {
    document.getElementById("stat-digs").textContent = player.digs || 0;
    overlay.classList.add("active");
  }
}

window.startNewDay = function () {
  const overlay = document.getElementById("day-end-overlay");
  if (overlay) overlay.classList.remove("active");

  player.stepsLeft = player.maxSteps;
  player.x = player.spawnX;
  player.y = player.spawnY;

  player.day += 1;

  updatePlayerPosition();
  centerCameraOnPlayer();
  updateStepDisplay();
  updateCounters();
};

// Start game and allow music trigger
window.addEventListener("DOMContentLoaded", () => {
  initGame();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const startOverlay = document.getElementById("start-screen-overlay");
    if (startOverlay && startOverlay.classList.contains("active")) {
      startOverlay.classList.remove("active");
      if (typeof startMusic === "function") startMusic();
    }
  }
});

/* SAVES */

function saveGame(slot) {
    // Save grid state
    const gridData = [];
    document.querySelectorAll('.tile').forEach(tile => {
        gridData.push({
            x: parseInt(tile.dataset.x),
            y: parseInt(tile.dataset.y),
            type: tile.dataset.type,
            classes: Array.from(tile.classList)
        });
    });

    // Save everything
    const saveData = {
        player: structuredClone(player),   // deep copy of player
        grid: gridData
    };

    localStorage.setItem(`gravedigger_save_${slot}`, JSON.stringify(saveData));
    console.log(`Game saved to slot ${slot}`);
}

/*LOADS*/

function loadGame(slot) {
    const data = localStorage.getItem(`gravedigger_save_${slot}`);
    if (!data) {
        console.warn(`No save data found for slot ${slot}`);
        return;
    }

    const saveData = JSON.parse(data);

    // Restore player
    Object.assign(player, saveData.player);

    // Clear + rebuild grid
    const gameContainer = document.getElementById("game");
    gameContainer.innerHTML = "";

    saveData.grid.forEach(tileData => {
        const tile = document.createElement("div");
        tile.classList.add(...tileData.classes);
        tile.dataset.x = tileData.x;
        tile.dataset.y = tileData.y;
        tile.dataset.type = tileData.type;
        gameContainer.appendChild(tile);
    });

    updatePlayerPosition();
    updateCounters();
    updateInventoryUI();
    centerCameraOnPlayer();
    console.log(`Game loaded from slot ${slot}`);
}
