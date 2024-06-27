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
  // return if too few corners
  // if (corners.length != 3 && corners.length != 4) {
  //   console.log("Too few board corners");
  //   return;
  // }
  const board = document.getElementById("go-game");
  // estimate board skew
  var destCorners = [0, 0, 1, 0, 0, 1, 1, 1];
  var perspT = PerspT(corners.flat(), destCorners);

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
