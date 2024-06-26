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
      .then((response) => {
        drawPredictions(response.json());
        console.log(response.json());
      })
      .then((data) => {
        console.log(data);
      });
  };
}

function drawPredictions(json) {
  const data = JSON.parse(json);
  const classes = data.classes;
  const boxes = data.boxes;
  // "classes": output[0].boxes.cls.tolist(),
  // "boxes": output[0].boxes.xywh.tolist(),
}
