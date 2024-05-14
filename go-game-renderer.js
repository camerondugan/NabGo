// constants
const validGridSizes = [9, 13, 19];
const gridSize =
  validGridSizes[Math.floor(Math.random() * validGridSizes.length)];
const boardPixels = 1000;
const edgePadding = 100;
const starSize = 4;
const blackStone = new Image();
blackStone.src = "assets/b.png";
const whiteStones = [];
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
// globals
let board = null;
let numStonesPlaced = 0;
let placedStones = [];
let lastMousePosX = null;
let lastMousePosY = null;

function init() {
  board = document.getElementById("go-game");
  for (let i = 0; i < gridSize; i++) {
    placedStones[i] = new Array(gridSize);
  }
  initWhiteStones();
  trackTheMouse();
  drawBoard();
  placeExampleStones();
}

function initWhiteStones() {
  let whiteStone = new Image();
  whiteStone.src = "assets/w.png";
  whiteStones.push(whiteStone);
  for (let i = 1; i < 15; i++) {
    let whiteStone = new Image();
    whiteStone.src = "assets/w" + i + ".png";
    whiteStones.push(whiteStone);
  }
}

// relative to canvas
function trackTheMouse() {
  const board = document.getElementById("go-game");
  if (board == null || !board.getContext) {
    // avoid crash
    return;
  }
  // TODO: only redraw if transparent stone needs to move
  document.addEventListener("mousemove", (e) => {
    let boardBoundingBox = board.getBoundingClientRect();
    // if mouse not on board, skip math
    if (
      e.clientX > boardBoundingBox.right ||
      e.clientY > boardBoundingBox.bottom ||
      e.clientY < boardBoundingBox.top ||
      e.clientX < boardBoundingBox.left
    ) {
      return;
    }
    // find mouse position as canvas coordinates
    let m = mouseToCanvas(e.clientX, e.clientY, board, boardBoundingBox);
    let mi = m[0];
    let mj = m[1];
    // don't redraw if not needed
    if (mi == lastMousePosX && mj == lastMousePosY) {
      lastMousePosX = mi;
      lastMousePosY = mj;
      return;
    }
    // redraw board
    drawBoard();
    if (mi >= 0 && mi < gridSize && mj >= 0 && mj < gridSize) {
      let ctx = board.getContext("2d");
      if (occupied(mi, mj)) {
        return;
      }
      if (numStonesPlaced % 2 == 0) {
        placeBlackStone(ctx, mi, mj, board, 0.5);
      } else {
        placeWhiteStone(ctx, mi, mj, board, 1, 0.5);
      }
    }
    lastMousePosX = mi;
    lastMousePosY = mj;
  });
  document.addEventListener("mouseup", (e) => {
    let m = mouseToCanvas(e.clientX, e.clientY, board);
    let mi = m[0];
    let mj = m[1];
    if (mi >= 0 && mi < gridSize && mj >= 0 && mj < gridSize) {
      if (occupied(mi, mj)) {
        return;
      }
      let randStone = Math.floor(Math.random() * (whiteStones.length - 1)) + 1;
      let newStone = (numStonesPlaced % 2) * randStone;
      placedStones[mi][mj] = newStone;
      numStonesPlaced++;
    }
  });
}

function mouseToCanvas(x, y, board, boardBoundingBox = null) {
  if (boardBoundingBox == null) {
    boardBoundingBox = board.getBoundingClientRect();
  }
  // translate
  x -= boardBoundingBox.left;
  y -= boardBoundingBox.top;
  // scale properly:
  x *= boardPixels / boardBoundingBox.width;
  y *= boardPixels / boardBoundingBox.height;
  // place transparent stone at mouse spot
  return [canvasToPieceIndex(x, board), canvasToPieceIndex(y, board)];
}

function placeExampleStones() {
  const board = document.getElementById("go-game");
  if (board == null || !board.getContext) {
    // avoid crash
    return;
  }
  let ctx = board.getContext("2d");

  // Place example stones
  for (let i = 0; i < gridSize * 3; i++) {
    let x = Math.floor(Math.random() * gridSize);
    let y = Math.floor(Math.random() * gridSize);
    if (i % 2 == 0) {
      placeBlackStone(ctx, x, y, board);
      placedStones[x][y] = 0;
      continue;
    }
    let randStone = Math.floor(Math.random() * (whiteStones.length - 1)) + 1;
    placeWhiteStone(ctx, x, y, board, randStone);
    placedStones[x][y] = randStone;
  }
}

// finds inner size of board without padding
function InnerSize(board) {
  return board.width - edgePadding * 2;
}

// finds distance from stone to stone
function boardStoneSpacing(board) {
  return InnerSize(board) / (gridSize - 1);
}

// draws the whole bloody board from start to finish
function drawBoard() {
  if (board == null || !board.getContext) {
    // avoid crash
    return;
  }

  // Become square ;)
  board.width = boardPixels;
  board.height = boardPixels;

  // Draw the go board
  let ctx = board.getContext("2d");
  ctx.fillStyle = "#DCB069";
  ctx.fillRect(0, 0, board.width, board.height);

  const stoneSpacing = boardStoneSpacing(board);

  // draw background
  const boardBG = document.getElementById("board-bg");
  ctx.drawImage(boardBG, 0, 0, boardPixels * 1.1, boardPixels * 1.1);

  // draws lines for the game
  drawBoardLines(ctx, board, gridSize);

  // draw star point
  switch (gridSize) {
    case 9:
      draw9x9Stars(ctx, stoneSpacing);
      break;
    case 13:
      draw13x13Stars(ctx, stoneSpacing);
      break;
    case 19:
      for (let i = 3; i < 19; i += 6) {
        for (let j = 3; j < 19; j += 6) {
          drawStar(
            ctx,
            pieceIndexToCanvas(i, stoneSpacing),
            pieceIndexToCanvas(j, stoneSpacing),
            starSize,
          );
        }
      }
      break;
  }

  // draw bottom coordinate
  let edgeRatio = 2 / 3;
  let innerBoardSize = InnerSize(board);
  let offsetx = -12;
  let offsety = 12 - edgePadding * edgeRatio;
  let offsety2 = 12 + edgePadding * edgeRatio;
  ctx.font = "32px serif";
  ctx.textAligh = "center";
  //letters
  for (let i = 0; i < gridSize; i++) {
    ctx.fillText(
      alphabet[i],
      edgePadding + stoneSpacing * i + offsetx,
      edgePadding + offsety,
    );
    ctx.fillText(
      alphabet[i],
      edgePadding + stoneSpacing * i + offsetx,
      edgePadding + innerBoardSize + offsety2,
    );
  }
  offsetx = -13 + edgePadding * edgeRatio;
  let offsetx2 = -12 - edgePadding * edgeRatio;
  offsety = 12;
  // vert numbers
  for (let i = 0; i < gridSize; i++) {
    ctx.fillText(
      String(i + 1),
      edgePadding + innerBoardSize + offsetx,
      edgePadding + innerBoardSize - stoneSpacing * i + offsety,
    );
    ctx.fillText(
      String(i + 1),
      edgePadding + offsetx2,
      edgePadding + innerBoardSize - stoneSpacing * i + offsety,
    );
  }

  // draw placed pieces
  // row
  for (let i = 0; i < placedStones.length; i++) {
    // col
    for (let j = 0; j < placedStones[i].length; j++) {
      if (placedStones[i][j] == null) {
        continue;
      }
      if (placedStones[i][j] == 0) {
        placeBlackStone(ctx, i, j, board);
      } else {
        placeWhiteStone(ctx, i, j, board, placedStones[i][j]);
      }
    }
  }
}

function placeWhiteStone(ctx, x, y, board, variant = null, alpha = 1) {
  let randStone = Math.floor(Math.random() * (whiteStones.length - 1)) + 1;
  if (variant == null || variant >= whiteStones.length) {
    variant = randStone;
  }
  let whiteStone = whiteStones[variant];
  let stoneWidth = boardStoneSpacing(board);
  ctx.globalAlpha = alpha;
  ctx.drawImage(
    whiteStone,
    pieceIndexToCanvas(x, stoneWidth) - stoneWidth / 2,
    pieceIndexToCanvas(y, stoneWidth) - stoneWidth / 2,
    stoneWidth,
    stoneWidth,
  );
  ctx.globalAlpha = 1;
}

function placeBlackStone(ctx, x, y, board, alpha = 1) {
  let stoneWidth = boardStoneSpacing(board);
  ctx.globalAlpha = alpha;
  ctx.drawImage(
    blackStone,
    pieceIndexToCanvas(x, stoneWidth) - stoneWidth / 2,
    pieceIndexToCanvas(y, stoneWidth) - stoneWidth / 2,
    stoneWidth,
    stoneWidth,
  );
  ctx.globalAlpha = 1;
}

// grid draw
function drawBoardLines(ctx, board, gridSize) {
  let innerBoardSize = InnerSize(board);
  let stoneSpacing = boardStoneSpacing(board);
  ctx.strokeStyle = "#000000";
  ctx.strokeRect(edgePadding, edgePadding, innerBoardSize, innerBoardSize);
  for (let i = 1; i < gridSize - 1; i++) {
    let x = pieceIndexToCanvas(i, stoneSpacing, edgePadding);
    drawLine(ctx, x, edgePadding, x, edgePadding + innerBoardSize);
    drawLine(ctx, edgePadding, x, edgePadding + innerBoardSize, x);
  }
}

function drawLine(ctx, x, y, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawStar(ctx, x, y, w) {
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(x, y, w, 0, 2 * Math.PI);
  ctx.fill();
}

function draw9x9Stars(ctx, stoneSpacing) {
  drawStar(
    ctx,
    pieceIndexToCanvas(2, stoneSpacing),
    pieceIndexToCanvas(2, stoneSpacing),
    starSize,
  );
  drawStar(
    ctx,
    pieceIndexToCanvas(2, stoneSpacing),
    pieceIndexToCanvas(6, stoneSpacing),
    starSize,
  );
  drawStar(
    ctx,
    pieceIndexToCanvas(6, stoneSpacing),
    pieceIndexToCanvas(2, stoneSpacing),
    starSize,
  );
  drawStar(
    ctx,
    pieceIndexToCanvas(6, stoneSpacing),
    pieceIndexToCanvas(6, stoneSpacing),
    starSize,
  );
}
function draw13x13Stars(ctx, stoneSpacing) {
  drawStar(
    ctx,
    pieceIndexToCanvas(3, stoneSpacing),
    pieceIndexToCanvas(3, stoneSpacing),
    starSize,
  );
  drawStar(
    ctx,
    pieceIndexToCanvas(3, stoneSpacing),
    pieceIndexToCanvas(9, stoneSpacing),
    starSize,
  );
  drawStar(
    ctx,
    pieceIndexToCanvas(9, stoneSpacing),
    pieceIndexToCanvas(3, stoneSpacing),
    starSize,
  );
  drawStar(
    ctx,
    pieceIndexToCanvas(9, stoneSpacing),
    pieceIndexToCanvas(9, stoneSpacing),
    starSize,
  );
  drawStar(
    ctx,
    pieceIndexToCanvas(6, stoneSpacing),
    pieceIndexToCanvas(6, stoneSpacing),
    starSize,
  );
}

function occupied(x, y) {
  return placedStones[x][y] != null;
}

function canvasToPieceIndex(x, board) {
  return Math.floor(
    (x - edgePadding + boardStoneSpacing(board) / 2) / boardStoneSpacing(board),
  );
}

function pieceIndexToCanvas(i, stoneSpacing) {
  return i * stoneSpacing + edgePadding;
}
