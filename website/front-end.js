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
        json.then((json) => drawPredictions(json));
        //drawPredictions(json);
      })
      .catch((err) => {
        return err;
      });
  };
}

function drawPredictions(json) {
  const classes = json.classes;
  const boxes = json.boxes;
  // "classes": output[0].boxes.cls.tolist(),
  // "boxes": output[0].boxes.xywh.tolist(),
}
