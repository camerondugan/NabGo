function updateNumMoves(increment, newPiece = false) {
  // find increment if text box updates
  if (increment == 0) {
    let next = parseInt(document.getElementById("HTMLmove").value);
    increment = next - numStonesPlaced;
  }

  numStonesPlaced += increment;

  if (numStonesPlaced < 0) {
    numStonesPlaced = 0;
  }
  if (numStonesPlaced >= moves.length) {
    numStonesPlaced = moves.length;
  }
  console.log(numStonesPlaced);
  console.log(moves.length);
  console.log("boardAtMove: " + boardAtMove.length);
  if (increment != 0) {
    if (newPiece && boardAtMove.length > numStonesPlaced) {
      console.log("new branch");
      moves = moves.slice(0, numStonesPlaced);
      boardAtMove = boardAtMove.slice(0, numStonesPlaced);
    }
    if (boardAtMove.length > numStonesPlaced) {
      console.log("load old state");
      placedStones = JSON.parse(boardAtMove[numStonesPlaced]);
      drawBoard();
    } else if (newPiece) {
      console.log("save new state");
      boardAtMove.push(JSON.stringify(placedStones));
    }
  }
  document.getElementById("HTMLmove").value = numStonesPlaced;
}
