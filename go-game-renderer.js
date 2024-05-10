const validGridSizes = [9, 13, 19];
const gridSize =
  validGridSizes[Math.floor(Math.random() * validGridSizes.length)];
const boardPixels = 1000;
const edgePadding = 80;
const starSize = 4;
const blackStone = new Image();
blackStone.src = "assets/b.png";
const whiteStones = [
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image(),
];
let board = null;

function init() {
  board = document.getElementById("GoGame");
  initWhiteStones();
  trackTheMouse();
  drawBoard();
}

function initWhiteStones() {
  whiteStones[0].src = "assets/w.png";
  for (let i = 1; i < whiteStones.length; i++) {
    whiteStones[i].src = "assets/w" + i + ".png";
  }
}

// relative to canvas
function trackTheMouse() {
  const board = document.getElementById("GoGame");
  if (board == null || !board.getContext) {
    // avoid crash
    return;
  }
  document.addEventListener("mousemove", (e) => {
    let x = e.clientX;
    let y = e.clientY;
    let boardBoundingBox = board.getBoundingClientRect();
    // transpose to where element is
    x -= boardBoundingBox.left;
    y -= boardBoundingBox.top;
    // detect bounds
    let inBoundX = x >= 0 && x < boardBoundingBox.width;
    let inBoundY = y >= 0 && y < boardBoundingBox.height;
    if (inBoundX && inBoundY) {
      // scale properly:
      x *= boardPixels / boardBoundingBox.width;
      y *= boardPixels / boardBoundingBox.height;
      // redraw board
      drawBoard();
      let ctx = board.getContext("2d");
      // place stone example at current mouse spot
      let mi = canvasToPieceIndex(x, board);
      let mj = canvasToPieceIndex(y, board);
      if (mi >= 0 && mi < gridSize && mj >= 0 && mj < gridSize) {
        placeBlackStone(ctx, mi, mj, board, 0.5);
      }
    }
  });
}

function placeExampleStones(ctx, board) {
  // Place example stones
  for (let i = 0; i < gridSize * 3; i++) {
    if (i % 2 == 0) {
      placeBlackStone(
        ctx,
        Math.floor(Math.random() * gridSize),
        Math.floor(Math.random() * gridSize),
        board,
      );
      continue;
    }
    placeWhiteStone(
      ctx,
      Math.floor(Math.random() * gridSize),
      Math.floor(Math.random() * gridSize),
      board,
    );
  }
}

function InnerSize(board) {
  return board.width - edgePadding * 2;
}

function boardStoneSpacing(board) {
  return InnerSize(board) / (gridSize - 1);
}

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
  const boardBG = document.getElementById("boardBG");
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

  // placeExampleStones(ctx, stoneSpacing);
}

// TODO: track placements for later board draws
function placeWhiteStone(ctx, x, y, board) {
  let whiteStone = whiteStones[Math.floor(Math.random() * whiteStones.length)];
  let stoneWidth = boardStoneSpacing(board);
  ctx.drawImage(
    whiteStone,
    pieceIndexToCanvas(x, stoneWidth) - stoneWidth / 2,
    pieceIndexToCanvas(y, stoneWidth) - stoneWidth / 2,
    stoneWidth,
    stoneWidth,
  );
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

function canvasToPieceIndex(x, board) {
  return Math.floor(
    (x - edgePadding + boardStoneSpacing(board) / 2) / boardStoneSpacing(board),
  );
}

function pieceIndexToCanvas(i, stoneSpacing) {
  return i * stoneSpacing + edgePadding;
}
