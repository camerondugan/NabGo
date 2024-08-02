/**
 * Checks if user is logged in
 * @returns Whether user is logged in
 */
function isLoggedin() {
  //https://stackoverflow.com/questions/5968196/how-do-i-check-if-a-cookie-exists
  let login = document.cookie.match(
    /^(.*;)?\s*edgedb-auth-token\s*=\s*[^;]+(.*)?$/,
  );
  if (login == null) {
    alert("Please login to access this feature");
    return false;
  }
  return true;
}

/**
 * Get SGF format for current board state
 * @param b Current board 
 * @returns SGF for board
 */
function getSGF(b) {
  const fetchOptions = {
    method: "post",
    body: JSON.stringify(b),
  };

  if (!isLoggedin()) {
    return;
  }

  // fetch("http://localhost:8888/sgf", fetchOptions)
  fetch("https://bl.nabgo.us/sgf", fetchOptions)
    .then((response) => response.text())
    .then((text) => {
      console.log(text);
      navigator.clipboard.writeText(text);
      return text;
    })
    .catch((err) => {
      return err;
    });
}

/**
 * Send user input to Gollama and send back response
 * @param {string} b User query
 * @returns Gollama response
 */
function llamaTalk(b) {
  const fetchOptions = {
    method: "post",
    body: b,
  };

  if (!isLoggedin()) {
    return;
  }

  // fetch("http://localhost:8888/sgf", fetchOptions)
  fetch("https://bl.nabgo.us/ollama", fetchOptions)
    .then((response) => response.text())
    .then((text) => {
      console.log(text);
      document.getElementById("chatOut").innerText = text;
      return text;
    })
    .catch((err) => {
      return err;
    });
}

/**
 * Analyze current board
 * @returns Any errors that occur
 */
function analyzeCurrentBoard() {
  if (!isLoggedin()) {
    return;
  }
  clearAnalysisStones();
  // placedStones but not the last one
  let prevBoard = [];

  for (let i = 0; i < placedStones.length; i++) {
    for (let j = 0; j < placedStones[i].length; j++) {
      if (placedStones[i][j] == -1) {
        continue;
      }
      prevBoard.push([
        placedStones[i][j] == 0 ? "b" : "w",
        alphabet[i].toString().toLowerCase() + (j + 1).toString(),
      ]);
    }
  }

  console.log(prevBoard);
  // moves but only the last one
  if (!playing || moves.length == 0) {
    return;
  }
  let ourMoves = [];
  for (let i = 0; i < moves.length; i++) {
    if (moves[i][1].length == 2) {
      // moves[i][1][1] = 19 - moves[i][1][1];
      ourMoves.push([
        moves[i][0],
        alphabet[moves[i][1][0]].toString().toLowerCase() +
          (moves[i][1][1] + 1).toString(),
      ]);
    }
  }

  // remove played
  let lastMove = ourMoves[ourMoves.length - 1];
  let moveIndex = -1;
  for (let i = 0; i < prevBoard.length; i++) {
    let x = prevBoard[i];
    if (lastMove[0] === x[0] && lastMove[1] === x[1]) {
      moveIndex = i;
      break;
    }
  }
  prevBoard.splice(moveIndex, 1);

  let arg1 = JSON.stringify(prevBoard);
  let arg2 = JSON.stringify([lastMove]);
  const fetchOptions = {
    method: "post",
    body: JSON.stringify([arg1, arg2]),
  };
  fetch("https://bl.nabgo.us/analyze", fetchOptions)
    .then((response) => response.json())
    .then((json) => {
      if (json.moveInfos == null) {
        console.log(json);
        return;
      }
      // this flips analysis info
      for (let i = 0; i < json.moveInfos.length; i++) {
        let m = json.moveInfos[i].move;
        let l = m[0];
        m = m.slice(1, m.length);
        m = gridSize + 1 - Number(m);
        json.moveInfos[i].move = l + m.toString();
        for (let j = 0; j < json.moveInfos[i].pv.length; j++) {
          let m = json.moveInfos[i].pv[j];
          let l = m[0];
          m = m.slice(1, m.length);
          json.moveInfos[i].pv[j] = l + m;
        }
      }
      // use analysis info on front-end
      console.log(json);
      console.log(json.rootInfo.winrate);
      console.log(json.rootInfo.scoreLead);
      console.log(json.rootInfo.utility);
      clearAnalysisStones();
      if (json.moveInfos.length < 3) {
        return;
      }
      for (let i = 0; i < 3; i++) {
        let m = json.moveInfos[i].move;
        let x = alphabet.indexOf(m[0]);
        let y = Number(m.slice(1, m.length)) - 1;
        let rank = i + 1;
        analysisStones[x][y] =
          json.rootInfo.currentPlayer == "W" ? [1, rank] : [0, rank];
      }
      drawBoard();
      drawWinrateBar(json.rootInfo.winrate, json.rootInfo.scoreLead);
    })
    .catch((err) => {
      console.log(err);
      return err;
    });
}

/**
 * Load image and ask for prediction
 * @param event User uploaded image of game board 
 * @returns Any errors that occur
 */
function loadImage(event) {
  if (!isLoggedin()) {
    return;
  }
  let form = document.querySelector("form");
  let image = document.getElementById("output");
  let file = event.target.files[0];
  image.src = URL.createObjectURL(file);
  image.classList.remove("hidden");

  const formData = new FormData(form);

  image.onload = function () {
    const fetchOptions = {
      method: "post",
      body: formData,
    };

    // fetch("http://localhost:8888/predict", fetchOptions)
    fetch("https://bl.nabgo.us/predict", fetchOptions)
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        drawPredictions(json);
      })
      .catch((err) => {
        return err;
      });
  };
}

// PREDICTION ONLY PAST THIS COMMENT
const ModelClasses = {
  blackStone: 0,
  board: 1,
  boardCorner: 2,
  empty: 3,
  emptyCorner: 4,
  emptyEdge: 5,
  whiteStone: 6,
};

/**
 * Estimate board corners from prediction with bounding boxes
 * @param boxes Boxes from prediction
 * @param classes Classes for boxes (ex: black stone)
 * @returns Any errors that occur
 */
function estimateCorners(boxes, classes) {
  console.log("Estimating Corners, model found too few.");
  let bottomLeft = boxes[0];
  let bottomRight = boxes[0];
  let topLeft = boxes[0];
  let topRight = boxes[0];
  // let startingBox = boxes[0]; // attempt for better accuracy
  // let minDistMax = 999999999; // fails at diff resolutions
  // let minDist = minDistMax; // supposed to take those into account but fails
  // somehow

  for (let b = 0; b < boxes.length; b++) {
    if (classes[b] == ModelClasses.board) {
      continue;
    }
    let box = boxes[b];
    box[0] += 0.5 * box[2];
    box[1] += 0.5 * box[3];
    // if (b != 0) {
    //   // distance is smaller than minDist
    //   let dist = Math.sqrt(
    //     Math.pow(box[0] - startingBox[0], 2) +
    //       Math.pow(box[1] - startingBox[1], 2),
    //   );
    //   if (dist < minDist) {
    //     minDist = dist;
    //   }
    // }
    if (box[0] <= bottomLeft[0] && box[1] <= bottomLeft[1]) {
      bottomLeft = box;
    }
    if (box[0] >= bottomRight[0] && box[1] <= bottomRight[1]) {
      bottomRight = box;
    }
    if (box[0] <= topLeft[0] && box[1] >= topLeft[1]) {
      topLeft = box;
    }
    if (box[0] >= topRight[0] && box[1] >= topRight[1]) {
      topRight = box;
    }
  }
  bottomLeft = bottomLeft.slice(0, 2);
  bottomRight = bottomRight.slice(0, 2);
  topLeft = topLeft.slice(0, 2);
  topRight = topRight.slice(0, 2);
  // let rightShift = minDist * 5;
  // let upShift = -minDist * 2;
  // let pieceSpacingToBoardCornerFactor = 1;
  // bottomLeft[0] -= minDist * pieceSpacingToBoardCornerFactor - rightShift;
  // bottomLeft[1] -= minDist * pieceSpacingToBoardCornerFactor - upShift;
  // bottomRight[0] += minDist * pieceSpacingToBoardCornerFactor + rightShift;
  // bottomRight[1] -= minDist * pieceSpacingToBoardCornerFactor - upShift;
  // topLeft[0] -= minDist * pieceSpacingToBoardCornerFactor - rightShift;
  // topLeft[1] += minDist * pieceSpacingToBoardCornerFactor + upShift;
  // topRight[0] += minDist * pieceSpacingToBoardCornerFactor + rightShift;
  // topRight[1] += minDist * pieceSpacingToBoardCornerFactor + upShift;
  return [bottomLeft, bottomRight, topLeft, topRight];
}

/**
 * Remove captured stones from board
 * @returns Any errors that occur
 */
function removeCapturedStones() {
  if (!playing || moves.length == 0) {
    return;
  }
  var lm = moves[moves.length - 1][1];
  var o = {
    LastMove: lm,
    Stones: placedStones,
  };
  const fetchOptions = {
    method: "post",
    body: JSON.stringify(o),
  };
  // fetch("http://localhost:8888/removeStones", fetchOptions)
  fetch("https://bl.nabgo.us/removeStones", fetchOptions)
    .then((response) => response.json())
    .then((json) => {
      console.log(json);
      for (let i = 0; i < json.length; i++) {
        let pos = json[i];
        placedStones[pos[0]][pos[1]] = -1;
      }
      drawBoard();
    })
    .catch((err) => {
      return err;
    });
}

/**
 * Draw digital game board from prediction
 * @param json Prediction with bounding boxes
 * @returns Any errors that occur
 */
function drawPredictions(json) {
  init_board(); // ignore undeclared error
  const classes = json.classes;
  const boxes = json.boxes;
  if (!classes.includes(ModelClasses.board)) {
    console.log("No board, you are bad at the game");
    return;
  }
  // find corners
  let corners = [];
  let i = 0;
  for (const cls in classes) {
    if (cls == ModelClasses.boardCorner) {
      corners.push(boxes[i][0]);
      corners.push(boxes[i][1]);
      console.log(corners[i]);
    }
    i += 1;
  }
  console.log("corners", corners);
  // approximate if too few corners
  if (corners.length != 6 && corners.length != 8) {
    corners = estimateCorners(boxes, classes);
    console.log("estimatedCorners", corners);
  }
  // estimate board skew
  var origCorners = corners.flat();
  var destCorners = [0, 0, 1, 0, 0, 1, 1, 1];
  var perspT = PerspT(origCorners, destCorners);
  for (let i = 0; i < corners.length; i++) {
    const corner = corners[i];
    console.log("original " + corner[0] + ", " + corner[1]);
    console.log("transformed " + perspT.transform(corner[0], corner[1]));
  }

  for (let b = 0; b < boxes.length; b++) {
    let box = boxes[b];
    box[0] += 0.5 * box[2];
    box[1] += 0.5 * box[3];
    let point = perspT.transform(box[0], box[1]);
    boxes[b] = point;
    // console.log("Box 0" + box[0]);
    // console.log("Box 1" + box[1]);
  }
  //estimateBoardSize(boxes);
  const boardSize = 19;

  const board = document.getElementById("go-game");
  let ctx = board.getContext("2d");

  for (let b = 0; b < boxes.length; b++) {
    const box = boxes[b];
    let x = parseInt(box[0] * boardSize, 10);
    let y = parseInt(box[1] * boardSize, 10);
    y = gridSize - 1 - y;
    //console.log(x, y);
    if (x < 0 || y < 0 || x >= boardSize || y >= boardSize) {
      continue;
    }
    if (classes[b] == ModelClasses.blackStone) {
      placeBlackStone(ctx, x, y, board);
      placedStones[x][y] = 0;
    } else if (classes[b] == ModelClasses.whiteStone) {
      let randStone = Math.floor(Math.random() * (whiteStones.length - 1)) + 1;
      placeWhiteStone(ctx, x, y, board, randStone);
      placedStones[x][y] = randStone;
    }
  }
}

/**
 * Clear suggested moves
 */
function clearAnalysisStones() {
  for (let i = 0; i < analysisStones.length; i++) {
    for (let j = 0; j < analysisStones.length; j++) {
      analysisStones[i][j] = [-1, -1];
    }
  }
}

/**
 * Unload uploaded image from screen
 */
function unloadImage() {
  let image = document.getElementById("output");
  image.src = "";
}

/** 
 * Draw bar representing win probability
 */
function drawWinrateBar(winrate, scorelead) {
  console.log(scorelead);
  let blackWPercent = (winrate + 1) * 50;
  let whiteWPercent = 100 - blackWPercent;

  const bar = document.getElementById("winrate-bar");
  bar.style.background = `linear-gradient(to right, black ${blackWPercent}%, white ${whiteWPercent}%)`;

  document.getElementById("analysis-stats").innerHTML =
    `Black Win Probability: ${blackWPercent}%<br>Black Score Lead: ${scorelead}`;
}

/**
 * Switch from upload panel to analysis panel
 */
function switchRightContent() {
  document.getElementById("upload-cell").style.display = "none";
  document.getElementById("analysis-cell").style.display = "table-cell";
  document.getElementById("edit").style.display = "none";
}
