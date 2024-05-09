const validGridSizes = [9, 13, 19];
const gridSize =
  validGridSizes[Math.floor(Math.random() * validGridSizes.length)];
const edgePadding = 30;
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
  let canvas = board.getContext("2d");
  canvas.fillStyle = "#DCB069";
  canvas.fillRect(0, 0, board.width, board.height);
  const boardBG = document.getElementById("boardBG");
  canvas.drawImage(boardBG, 0, 0);

  // draw markers
  const innerBoardSize = board.width - edgePadding * 2;
  const markerSpacing = innerBoardSize / (gridSize - 1);
  switch (gridSize) {
    case 9:
      drawMarker(
        canvas,
        pieceIndexToCanvas(2, markerSpacing, edgePadding),
        pieceIndexToCanvas(2, markerSpacing, edgePadding),
        markerSize,
      );
      drawMarker(
        canvas,
        pieceIndexToCanvas(2, markerSpacing, edgePadding),
        pieceIndexToCanvas(6, markerSpacing, edgePadding),
        markerSize,
      );
      drawMarker(
        canvas,
        pieceIndexToCanvas(6, markerSpacing, edgePadding),
        pieceIndexToCanvas(2, markerSpacing, edgePadding),
        markerSize,
      );
      drawMarker(
        canvas,
        pieceIndexToCanvas(6, markerSpacing, edgePadding),
        pieceIndexToCanvas(6, markerSpacing, edgePadding),
        markerSize,
      );
      break;
    case 13:
      drawMarker(
        canvas,
        pieceIndexToCanvas(3, markerSpacing, edgePadding),
        pieceIndexToCanvas(3, markerSpacing, edgePadding),
        markerSize,
      );
      drawMarker(
        canvas,
        pieceIndexToCanvas(3, markerSpacing, edgePadding),
        pieceIndexToCanvas(9, markerSpacing, edgePadding),
        markerSize,
      );
      drawMarker(
        canvas,
        pieceIndexToCanvas(9, markerSpacing, edgePadding),
        pieceIndexToCanvas(3, markerSpacing, edgePadding),
        markerSize,
      );
      drawMarker(
        canvas,
        pieceIndexToCanvas(9, markerSpacing, edgePadding),
        pieceIndexToCanvas(9, markerSpacing, edgePadding),
        markerSize,
      );
      drawMarker(
        canvas,
        pieceIndexToCanvas(6, markerSpacing, edgePadding),
        pieceIndexToCanvas(6, markerSpacing, edgePadding),
        markerSize,
      );
      break;
    case 19:
      for (let i = 3; i < 19; i += 6) {
        for (let j = 3; j < 19; j += 6) {
          drawMarker(
            canvas,
            pieceIndexToCanvas(i, markerSpacing, edgePadding),
            pieceIndexToCanvas(j, markerSpacing, edgePadding),
            markerSize,
          );
        }
      }
      break;
  }
  drawBoardLines(canvas, innerBoardSize, edgePadding, gridSize, markerSpacing);

  placeBlackStone(canvas, 3, 3, markerSpacing);
  placeWhiteStone(canvas, 3, 4, markerSpacing);
}

function placeWhiteStone(canvas, x, y, markerSpacing) {
  let whiteStone = whiteStones[Math.floor(Math.random() * whiteStones.length)];
  let stoneWidth = markerSpacing;
  canvas.drawImage(
    whiteStone,
    pieceIndexToCanvas(x, markerSpacing, edgePadding) - stoneWidth / 2,
    pieceIndexToCanvas(y, markerSpacing, edgePadding) - stoneWidth / 2,
    stoneWidth,
    stoneWidth,
  );
}

function placeBlackStone(canvas, x, y, markerSpacing) {
  let stoneWidth = markerSpacing;
  canvas.drawImage(
    blackStone,
    pieceIndexToCanvas(x, markerSpacing, edgePadding) - stoneWidth / 2,
    pieceIndexToCanvas(y, markerSpacing, edgePadding) - stoneWidth / 2,
    stoneWidth,
    stoneWidth,
  );
}

// grid draw
function drawBoardLines(
  canvas,
  innerBoardSize,
  edgePadding,
  gridSize,
  markerSpacing,
) {
  canvas.strokeStyle = "#000000";
  canvas.strokeRect(edgePadding, edgePadding, innerBoardSize, innerBoardSize);
  for (let i = 1; i < gridSize - 1; i++) {
    let x = pieceIndexToCanvas(i, markerSpacing, edgePadding);
    drawLine(canvas, x, edgePadding, x, edgePadding + innerBoardSize);
    drawLine(canvas, edgePadding, x, edgePadding + innerBoardSize, x);
  }
}

function drawLine(canvas, x, y, x2, y2) {
  canvas.beginPath();
  canvas.moveTo(x, y);
  canvas.lineTo(x2, y2);
  canvas.stroke();
}

function drawMarker(canvas, x, y, w) {
  canvas.fillStyle = "#000000";
  canvas.beginPath();
  canvas.arc(x, y, w, 0, 2 * Math.PI);
  canvas.fill();
}
