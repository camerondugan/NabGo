const validGridSizes = [9, 13, 19];
const gridSize =
  validGridSizes[Math.floor(Math.random() * validGridSizes.length)];
const edgePadding = 80;
const starSize = 3;
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

function init() {
  initWhiteStones();
  drawBoard();
}

function initWhiteStones() {
  whiteStones[0].src = "assets/w.png";
  for (let i = 1; i < whiteStones.length; i++) {
    whiteStones[i].src = "assets/w" + i + ".png";
  }
}

function drawBoard() {
  const board = document.getElementById("GoGame");
  if (board == null || !board.getContext) {
    // avoid crash
    return;
  }

  // Become square ;)
  const boardPixels = 1000;
  board.width = boardPixels;
  board.height = boardPixels;

  // Draw the go board
  let ctx = board.getContext("2d");
  ctx.fillStyle = "#DCB069";
  ctx.fillRect(0, 0, board.width, board.height);
  const boardBG = document.getElementById("boardBG");
  const innerBoardSize = board.width - edgePadding * 2;
  const stoneSpacing = innerBoardSize / (gridSize - 1);

  // draw background
  ctx.drawImage(boardBG, 0, 0, boardPixels * 1.1, boardPixels * 1.1);

  // draws lines for the game
  drawBoardLines(ctx, innerBoardSize, edgePadding, gridSize, stoneSpacing);

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
            pieceIndexToCanvas(i, stoneSpacing, edgePadding),
            pieceIndexToCanvas(j, stoneSpacing, edgePadding),
            starSize,
          );
        }
      }
      break;
  }

  // Place example stones
  for (let i = 0; i < gridSize * 3; i++) {
    if (i % 2 == 0) {
      placeBlackStone(
        ctx,
        Math.floor(Math.random() * gridSize),
        Math.floor(Math.random() * gridSize),
        stoneSpacing,
      );
      continue;
    }
    placeWhiteStone(
      ctx,
      Math.floor(Math.random() * gridSize),
      Math.floor(Math.random() * gridSize),
      stoneSpacing,
    );
  }
}

// TODO: track placements for later board draws
function placeWhiteStone(ctx, x, y, stoneSpacing) {
  let whiteStone = whiteStones[Math.floor(Math.random() * whiteStones.length)];
  let stoneWidth = stoneSpacing;
  ctx.drawImage(
    whiteStone,
    pieceIndexToCanvas(x, stoneSpacing, edgePadding) - stoneWidth / 2,
    pieceIndexToCanvas(y, stoneSpacing, edgePadding) - stoneWidth / 2,
    stoneWidth,
    stoneWidth,
  );
}

function placeBlackStone(ctx, x, y, stoneSpacing) {
  let stoneWidth = stoneSpacing;
  ctx.drawImage(
    blackStone,
    pieceIndexToCanvas(x, stoneSpacing, edgePadding) - stoneWidth / 2,
    pieceIndexToCanvas(y, stoneSpacing, edgePadding) - stoneWidth / 2,
    stoneWidth,
    stoneWidth,
  );
}

// grid draw
function drawBoardLines(
  ctx,
  innerBoardSize,
  edgePadding,
  gridSize,
  stoneSpacing,
) {
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
    pieceIndexToCanvas(2, stoneSpacing, edgePadding),
    pieceIndexToCanvas(2, stoneSpacing, edgePadding),
    starSize,
  );
  drawStar(
    ctx,
    pieceIndexToCanvas(2, stoneSpacing, edgePadding),
    pieceIndexToCanvas(6, stoneSpacing, edgePadding),
    starSize,
  );
  drawStar(
    ctx,
    pieceIndexToCanvas(6, stoneSpacing, edgePadding),
    pieceIndexToCanvas(2, stoneSpacing, edgePadding),
    starSize,
  );
  drawStar(
    ctx,
    pieceIndexToCanvas(6, stoneSpacing, edgePadding),
    pieceIndexToCanvas(6, stoneSpacing, edgePadding),
    starSize,
  );
}
function draw13x13Stars(ctx, stoneSpacing) {
  drawStar(
    ctx,
    pieceIndexToCanvas(3, stoneSpacing, edgePadding),
    pieceIndexToCanvas(3, stoneSpacing, edgePadding),
    starSize,
  );
  drawStar(
    ctx,
    pieceIndexToCanvas(3, stoneSpacing, edgePadding),
    pieceIndexToCanvas(9, stoneSpacing, edgePadding),
    starSize,
  );
  drawStar(
    ctx,
    pieceIndexToCanvas(9, stoneSpacing, edgePadding),
    pieceIndexToCanvas(3, stoneSpacing, edgePadding),
    starSize,
  );
  drawStar(
    ctx,
    pieceIndexToCanvas(9, stoneSpacing, edgePadding),
    pieceIndexToCanvas(9, stoneSpacing, edgePadding),
    starSize,
  );
  drawStar(
    ctx,
    pieceIndexToCanvas(6, stoneSpacing, edgePadding),
    pieceIndexToCanvas(6, stoneSpacing, edgePadding),
    starSize,
  );
}

function pieceIndexToCanvas(i, stoneSpacing, edgePadding) {
  return i * stoneSpacing + edgePadding;
}
