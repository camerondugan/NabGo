const validGridSizes = [9, 13, 19];
const gridSize =
  validGridSizes[Math.floor(Math.random() * validGridSizes.length)];
const edgePadding = 80;
const markerSize = 3;
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
whiteStones[0].src = "assets/w.png";
for (let i = 1; i < whiteStones.length; i++) {
  whiteStones[i].src = "assets/w" + i + ".png";
}

function init() {
  drawBoard();
}

function pieceIndexToCanvas(i, markerSpacing, edgePadding) {
  return i * markerSpacing + edgePadding;
}

function drawBoard() {
  const board = document.getElementById("GoGame");
  if (board == null || !board.getContext) {
    // avoid crash if method not exist
    return;
  }

  // Become square ;)
  const boardPixels = Math.max(board.width, board.height);
  board.width = boardPixels;
  board.height = boardPixels;

  // Draw the go board
  let ctx = board.getContext("2d");
  ctx.fillStyle = "#DCB069";
  ctx.fillRect(0, 0, board.width, board.height);
  const boardBG = document.getElementById("boardBG");
  ctx.drawImage(boardBG, 0, 0);

  // draw markers
  const innerBoardSize = board.width - edgePadding * 2;
  const markerSpacing = innerBoardSize / (gridSize - 1);
  switch (gridSize) {
    case 9:
      drawMarker(
        ctx,
        pieceIndexToCanvas(2, markerSpacing, edgePadding),
        pieceIndexToCanvas(2, markerSpacing, edgePadding),
        markerSize,
      );
      drawMarker(
        ctx,
        pieceIndexToCanvas(2, markerSpacing, edgePadding),
        pieceIndexToCanvas(6, markerSpacing, edgePadding),
        markerSize,
      );
      drawMarker(
        ctx,
        pieceIndexToCanvas(6, markerSpacing, edgePadding),
        pieceIndexToCanvas(2, markerSpacing, edgePadding),
        markerSize,
      );
      drawMarker(
        ctx,
        pieceIndexToCanvas(6, markerSpacing, edgePadding),
        pieceIndexToCanvas(6, markerSpacing, edgePadding),
        markerSize,
      );
      break;
    case 13:
      drawMarker(
        ctx,
        pieceIndexToCanvas(3, markerSpacing, edgePadding),
        pieceIndexToCanvas(3, markerSpacing, edgePadding),
        markerSize,
      );
      drawMarker(
        ctx,
        pieceIndexToCanvas(3, markerSpacing, edgePadding),
        pieceIndexToCanvas(9, markerSpacing, edgePadding),
        markerSize,
      );
      drawMarker(
        ctx,
        pieceIndexToCanvas(9, markerSpacing, edgePadding),
        pieceIndexToCanvas(3, markerSpacing, edgePadding),
        markerSize,
      );
      drawMarker(
        ctx,
        pieceIndexToCanvas(9, markerSpacing, edgePadding),
        pieceIndexToCanvas(9, markerSpacing, edgePadding),
        markerSize,
      );
      drawMarker(
        ctx,
        pieceIndexToCanvas(6, markerSpacing, edgePadding),
        pieceIndexToCanvas(6, markerSpacing, edgePadding),
        markerSize,
      );
      break;
    case 19:
      for (let i = 3; i < 19; i += 6) {
        for (let j = 3; j < 19; j += 6) {
          drawMarker(
            ctx,
            pieceIndexToCanvas(i, markerSpacing, edgePadding),
            pieceIndexToCanvas(j, markerSpacing, edgePadding),
            markerSize,
          );
        }
      }
      break;
  }
  drawBoardLines(ctx, innerBoardSize, edgePadding, gridSize, markerSpacing);

  for (let i = 0; i < gridSize * 3; i++) {
    if (i % 2 == 0) {
      placeBlackStone(
        ctx,
        Math.floor(Math.random() * gridSize),
        Math.floor(Math.random() * gridSize),
        markerSpacing,
      );
      continue;
    }
    placeWhiteStone(
      ctx,
      Math.floor(Math.random() * gridSize),
      Math.floor(Math.random() * gridSize),
      markerSpacing,
    );
  }
}

// TODO: draw shadows
// TODO: track placements for later board draws
function placeWhiteStone(ctx, x, y, markerSpacing) {
  let whiteStone = whiteStones[Math.floor(Math.random() * whiteStones.length)];
  let stoneWidth = markerSpacing;
  ctx.drawImage(
    whiteStone,
    pieceIndexToCanvas(x, markerSpacing, edgePadding) - stoneWidth / 2,
    pieceIndexToCanvas(y, markerSpacing, edgePadding) - stoneWidth / 2,
    stoneWidth,
    stoneWidth,
  );
}

function placeBlackStone(ctx, x, y, markerSpacing) {
  let stoneWidth = markerSpacing;
  ctx.drawImage(
    blackStone,
    pieceIndexToCanvas(x, markerSpacing, edgePadding) - stoneWidth / 2,
    pieceIndexToCanvas(y, markerSpacing, edgePadding) - stoneWidth / 2,
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
  markerSpacing,
) {
  ctx.strokeStyle = "#000000";
  ctx.strokeRect(edgePadding, edgePadding, innerBoardSize, innerBoardSize);
  for (let i = 1; i < gridSize - 1; i++) {
    let x = pieceIndexToCanvas(i, markerSpacing, edgePadding);
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

function drawMarker(ctx, x, y, w) {
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(x, y, w, 0, 2 * Math.PI);
  ctx.fill();
}
