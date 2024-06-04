// Load given image and display it
function loadImage(event) {
	let image = document.getElementById("output");
	image.src = URL.createObjectURL(event.target.files[0]);
	// image.onload = function () {
	// 	drawImage(this);
	// };
}
