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
const Classes = {
  blackStone: 0,
  board: 1,
  boardCorner: 2,
  empty: 3,
  emptyCorner: 4,
  emptyEdge: 5,
  whiteStone: 6,
}

function drawPredictions(json) {
  init_board();
  const board = document.getElementById("go-game");
  const classes = json.classes;
  const boxes = json.boxes;
  let corners = [];
  : ['black_stone', 'board', 'board_corner', 'empty', 'empty_corner', 'empty_edge', 'white_stone']
  // "classes": output[0].boxes.cls.tolist(),
  // "boxes": output[0].boxes.xywh.tolist(),
}
