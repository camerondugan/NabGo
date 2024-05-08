function init() {
  const board = document.getElementById("GoGame");
  if (board == null || !board.getContext) {
    // avoid crash if method not exist
    return;
  }

  const validGridSizes = [3, 5, 7, 9, 15, 21];
  const gridSize =
    validGridSizes[Math.floor(Math.random() * validGridSizes.length)];

  // Become square ;)
  const boardPixels = Math.max(board.width, board.height);
  board.width = boardPixels;
  board.height = boardPixels;

  // Draw the go board
  let canvas = board.getContext("2d");
  canvas.fillStyle = "#DCB069";

  canvas.fillRect(0, 0, board.width, board.height);

  const edgePadding = boardPixels * (0.8 / gridSize);
  const markerSize = 3;
  const innerBoardSize = board.width - edgePadding * 2;
  const markerSpacing = innerBoardSize / (gridSize - 1);
  canvas.fillStyle = "#634F2F";
  function indexToCanvas(i) {
    return i * markerSpacing + edgePadding - markerSize / 2;
  }
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      canvas.fillRect(
        indexToCanvas(i),
        indexToCanvas(j),
        markerSize,
        markerSize,
      );
    }
  }
}
init();
