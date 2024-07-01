import { init_board } from "./go-game-renderer.js";
import { PerspT } from "./perspective-transform.min.js";

// Load given image and display it
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

    fetch("https://b.nabgo.us/predict", fetchOptions)
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
  return [bottomLeft, bottomRight, topLeft, topRight];
}

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
  for (let cls in classes) {
    if (cls == ModelClasses.boardCorner) {
      corners.push(boxes[i]);
      console.log(corners[i]);
    }
    i += 1;
  }
  // approximate if too few corners
  if (corners.length != 3 && corners.length != 4) {
    corners = estimateCorners(boxes, classes);
  }
  const board = document.getElementById("go-game");
  // estimate board skew
  var origCorners = corners.flat();
  var destCorners = [0, 0, 1, 0, 0, 1, 1, 1];
  var perspT = PerspT(origCorners, destCorners);

  for (let b = 0; b < boxes.length; b++) {
    let box = boxes[b];
    box[0] += 0.5 * box[2];
    box[1] += 0.5 * box[3];
    let point = perspT.transform(box[0], box[1]);
    box[0] = point[0];
    box[1] = point[1];
    console.log("Box 0" + box[0]);
    console.log("Box 1" + box[1]);
  }
  // find
}
