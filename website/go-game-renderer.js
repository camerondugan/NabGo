// constants
const validGridSizes = [19]; //[9, 13, 19];
const gridSize =
  validGridSizes[Math.floor(Math.random() * validGridSizes.length)];
const boardPixels = 1000;
const edgePadding = 100;
const starSize = 4;
const blackStone = new Image();
blackStone.src = "/assets/b.png";
const whiteStones = [];
const alphabet = "ABCDEFGHJKLMNOPQRSTUVWXYZ".split("");
// globals
let board = null;
let numStonesPlaced = 0;
let placedStones = [];
let analysisStones = [];
let lastMousePosX = null;
let lastMousePosY = null;
let playing = false;
let moves = [];
let boardAtMove = [];
let mouseOverBoard = false;
let dragging = false;
let draggedStone = null;
let initialPosition = null;

/**
 * Change state to signal that player is done editing and ready to play
 */
function play() {
  if (!playing) {
    playing = true;
    boardAtMove = [];
    boardAtMove.push(JSON.stringify(placedStones));
  }
}

/**
 * Initialize digital board
 */
function init_board() {
  // let firstTime = board == null;
  board = document.getElementById("go-game");
  for (let i = 0; i < gridSize; i++) {
    placedStones[i] = new Array(gridSize);
    analysisStones[i] = new Array(gridSize);
    for (let j = 0; j < gridSize; j++) {
      placedStones[i][j] = -1;
      analysisStones[i][j] = [-1, -1];
    }
  }
  initWhiteStoneImages();
  trackTheMouse();
  updateNumMoves(-999);
  drawBoard();
  // if (firstTime) {
  //   placeExampleStones();
  // }
}

/**
 * Initialize white stone images
 */
function initWhiteStoneImages() {
  let whiteStone = new Image();
  whiteStone.src = "/assets/w.png";
  whiteStones.push(whiteStone);
  for (let i = 1; i < 15; i++) {
    let whiteStone = new Image();
    whiteStone.src = "/assets/w" + i + ".png";
    whiteStones.push(whiteStone);
  }
}

// Track mouse movement and add functionality for different mouse events
function trackTheMouse() {
  const board = document.getElementById("go-game");
  let color = 0;
  if (board == null || !board.getContext) {
    // avoid crash
    return;
  }
  // Allow stones to be dragged during editing phase
  document.addEventListener("mousedown", (e) => {
    if (e.button == 0 && !playing) {
      let m = mouseToCanvas(e.clientX, e.clientY, board);
      let mi = m[0];
      let mj = gridSize - 1 - m[1];
      if (mi >= 0 && mi < gridSize && mj >= 0 && mj < gridSize) {
        if (occupied(mi, mj)) {
          dragging = true;
          draggedStone = { mi, mj, color: placedStones[mi][mj] };
          initialPosition = { mi, mj };
          placedStones[mi][mj] = -1;
          drawBoard();
        }
      }
    }
  });
  // Draw transparent stone at mouse position
  document.addEventListener("mousemove", (e) => {
      let boardBoundingBox = board.getBoundingClientRect();
      // if mouse not on board, skip math
      if (
        e.clientX > boardBoundingBox.right ||
        e.clientY > boardBoundingBox.bottom ||
        e.clientY < boardBoundingBox.top ||
        e.clientX < boardBoundingBox.left
      ) {
        mouseOverBoard = false;
        return;
      }
      mouseOverBoard = true;
      // find mouse position as canvas coordinates
      let m = mouseToCanvas(e.clientX, e.clientY, board, boardBoundingBox);
      let mi = m[0];
      let mj = gridSize - 1 - m[1];
      // don't redraw if not needed
      if (mi == lastMousePosX && mj == lastMousePosY) {
        lastMousePosX = mi;
        lastMousePosY = mj;
        return;
      }
      lastMousePosX = mi;
      lastMousePosY = mj;
  
      drawBoard();
      if (mi >= 0 && mi < gridSize && mj >= 0 && mj < gridSize) {
        let ctx = board.getContext("2d");
        if (occupied(mi, mj)) {
          return;
        }
        // transparent stone
        if(dragging) {
          if(draggedStone.color == 0) {
            placeBlackStone(ctx, mi, mj, board, 1);
          } else {
            placeWhiteStone(ctx, mi, mj, board, draggedStone.color, 1);
          }
        }
        else {
          if (color == 0) {
            placeBlackStone(ctx, mi, mj, board, 0.5);
            
          } else {
            placeWhiteStone(ctx, mi, mj, board, 1, 0.5);
          }
        }
      }
  });
  document.addEventListener("mouseup", (e) => {
    if (e.button == 0) {
      if(dragging) {
        dragging = false;
        let m = mouseToCanvas(e.clientX, e.clientY, board);
        let mi = m[0];
        let mj = gridSize - 1 - m[1];
        if (mi >= 0 && mi < gridSize && mj >= 0 && mj < gridSize) {
          if (!occupied(mi, mj)) {
            placedStones[mi][mj] = draggedStone.color;
            if (playing) {
              updateNumMoves(1, true);
              moves.push([draggedStone.color == 0 ? "b" : "w", [mi, mj]]);
              removeCapturedStones();
            }
            drawBoard();
            if (draggedStone.color == 0) {
              color = 1;
            } else {
              color = 0;
            }
          } else {
            // If the new position is occupied, return the stone to its initial position
            placedStones[initialPosition.mi][initialPosition.mj] = draggedStone.color;
            drawBoard();
          }
        } else {
          // If the new position is out of bounds, return the stone to its initial position
          placedStones[initialPosition.mi][initialPosition.mj] = draggedStone.color;
          drawBoard();
        }
        draggedStone = null;
        initialPosition = null;
      }  
      else {
        let m = mouseToCanvas(e.clientX, e.clientY, board);
        let mi = m[0];
        let mj = gridSize - 1 - m[1];
        if (mi >= 0 && mi < gridSize && mj >= 0 && mj < gridSize) {
          if (occupied(mi, mj)) {
            return;
          }
          let randStone =
            Math.floor(Math.random() * (whiteStones.length - 1)) + 1;
          placedStones[mi][mj] = color * randStone;
          if (playing) {
            updateNumMoves(1, true);
          }
          drawBoard();
  
          if (playing) {
            moves.push([color == 0 ? "b" : "w", [mi, mj]]);
            removeCapturedStones();
          }
  
          if (color == 0) {
            color = 1;
          } else {
            color = 0;
          }
        }
      }
      }
  });
  // Remove stone when right clicked
  document.addEventListener("contextmenu", (e) => {
    if (playing || !mouseOverBoard) {
      return;
    }
    e.preventDefault();
    let m = mouseToCanvas(e.clientX, e.clientY, board);
    let mi = m[0];
    let mj = gridSize - 1 - m[1];
    console.log(m);
    if (
      mi >= 0 &&
      mi < gridSize &&
      mj >= 0 &&
      mj < gridSize &&
      occupied(mi, mj)
    ) {
      placedStones[mi][mj] = -1;
      updateNumMoves(-1);
      drawBoard();
    }
  });
  // Change color when spacebar is pressed
  document.addEventListener("keydown", (e) => {
    if (e.key == " " && mouseOverBoard && !playing) {
      e.preventDefault();
      if (color == 0) {
        color = 1;
      } else {
        color = 0;
      }
    }
  });
}

/**
 * Translate mouse position to canvas position
 * @param x x coord 
 * @param y y coord
 * @param board Game board
 * @param boardBoundingBox Bounding box for game board
 * @returns Translation to canvas position
 */
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

/**
 * Place example stones when page is loaded (no longer used)
 */
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
      if (placedStones[i][j] == -1) {
        continue;
      }
      if (placedStones[i][j] == 0) {
        placeBlackStone(ctx, i, j, board);
      } else {
        placeWhiteStone(ctx, i, j, board, placedStones[i][j]);
      }
    }
  }
  for (let i = 0; i < analysisStones.length; i++) {
    // col
    for (let j = 0; j < analysisStones[i].length; j++) {
      if (analysisStones[i][j][0] == -1) {
        continue;
      }
      if (analysisStones[i][j][0] == 0) {
        placeBlackStone(ctx, i, j, board, 0.5);
      } else {
        placeWhiteStone(ctx, i, j, board, analysisStones[i][j][0], 0.5);
      }
      ctx.fillText(
        String(analysisStones[i][j][1]),
        pieceIndexToCanvas(i, stoneSpacing) - 0.5 * stoneSpacing,
        pieceIndexToCanvas(gridSize - 1 - j, stoneSpacing) - 0.5 * stoneSpacing,
      );
    }
  }
}

// Place white stone on board
function placeWhiteStone(ctx, x, y, board, variant = null, alpha = 1) {
  if (variant == null || variant >= whiteStones.length) {
    variant = Math.floor(Math.random() * (whiteStones.length - 1)) + 1;
  }
  let whiteStone = whiteStones[variant];
  let stoneWidth = boardStoneSpacing(board);
  ctx.globalAlpha = alpha;
  ctx.drawImage(
    whiteStone,
    pieceIndexToCanvas(x, stoneWidth) - stoneWidth / 2,
    pieceIndexToCanvas(gridSize - 1 - y, stoneWidth) - stoneWidth / 2,
    stoneWidth,
    stoneWidth,
  );
  ctx.globalAlpha = 1;
}

// Place black stone on board
function placeBlackStone(ctx, x, y, board, alpha = 1) {
  let stoneWidth = boardStoneSpacing(board);
  ctx.globalAlpha = alpha;
  ctx.drawImage(
    blackStone,
    pieceIndexToCanvas(x, stoneWidth) - stoneWidth / 2,
    pieceIndexToCanvas(gridSize - 1 - y, stoneWidth) - stoneWidth / 2,
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

// Draw board line
function drawLine(ctx, x, y, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// Draw star on board
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

/**
 * Determine if space is occupied
 * @param x x coord
 * @param y y coord
 * @returns True if space is occupied
 */
function occupied(x, y) {
  return placedStones[x][y] != -1;
}

// Convert canvas position to piece index
function canvasToPieceIndex(x, board) {
  return Math.floor(
    (x - edgePadding + boardStoneSpacing(board) / 2) / boardStoneSpacing(board),
  );
}

// Convert piece index to canvas position
function pieceIndexToCanvas(i, stoneSpacing) {
  return i * stoneSpacing + edgePadding;
}
