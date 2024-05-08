function init() {
  const board = document.getElementById("GoGame");
  if (!board.getContext) {
    // avoid crash if method not exist
    return;
  }

  let canvas = board.getContext("2d");
  canvas.fillStyle = "#DCB069";
  canvas.strokeStyle = "red";

  canvas.fillRect(0, 0, board.width, board.height);
}
init();
