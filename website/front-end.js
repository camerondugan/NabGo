// Request
function getSGF(b) {
  const fetchOptions = {
    method: "post",
    body: JSON.stringify(b),
  };
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

// Analyze current board state
function analyzeCurrentBoard() {
  // placedStones but not the last one
  let prevBoard = [];

  for (let i = 0; i < placedStones.length; i++) {
    for (let j = 0; j < placedStones[i].length; j++) {
      if (placedStones[i][j] == -1) {
        continue;
      }
      prevBoard.push([
        placedStones[i][j] == 0 ? "b" : "w",
        alphabet[i].toString() + (j + 1).toString(),
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
        alphabet[moves[i][1][0]].toString() + (moves[i][1][1] + 1).toString(),
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
    .then((response) => response.text())
    .then((text) => {
      console.log(text);
    })
    .catch((err) => {
      console.log(err);
      return err;
    });
}

// Load given image, display, and ask for prediction
function loadImage(event) {
  let form = document.querySelector("form");
  let image = document.getElementById("output");
  let file = event.target.files[0];
  image.src = URL.createObjectURL(file);

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

function estimateCorners(boxes, classes) {
  console.log("Estimating Corners, model found too few.");
  let bottomLeft = boxes[0];
  let bottomRight = boxes[0];
  let topLeft = boxes[0];
  let topRight = boxes[0];

  for (let b = 0; b < boxes.length; b++) {
    if (classes[b] == ModelClasses.board) {
      continue;
    }
    let box = boxes[b];
    box[0] += 0.5 * box[2];
    box[1] += 0.5 * box[3];
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
  return [
    bottomLeft.slice(0, 2),
    bottomRight.slice(0, 2),
    topLeft.slice(0, 2),
    topRight.slice(0, 2),
  ];
}

// function estimateBoardSize(midpoints) {
//   let unique = [[], []]; // first array is x, second is y
//   // for every midpoint
//   for (let i = 0; i < midpoints.length; i++) {
//     // for x and y
//     for (let k = 0; k < 2; k++) {
//       unique[k].push(midpoints[i][k]);
//     }
//   }
//   return [unique[0].length, unique[1].length];
// }

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
  } else {
    // TODO: sort corners to match destination corners (minTotal, smaller y, smaller x, maxTotal)
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
