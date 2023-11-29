// the image section in home.html functions
let currentImageIndex = 1;
let totalImages = 8;
let slideshowInterval;

function startSlideshow() {
  slideshowInterval = setInterval(function () {
    changeImage(1);
  }, 5000); // Change image every 5 seconds
}

function stopSlideshow() {
  clearInterval(slideshowInterval);
}

function changeImage(direction) {
  currentImageIndex += direction;

  if (currentImageIndex < 1) {
    currentImageIndex = totalImages;
  } else if (currentImageIndex > totalImages) {
    currentImageIndex = 1;
  }

  let imageElement = document.getElementById("city-image");
  imageElement.src = "media/image" + currentImageIndex + ".jpg";
}

startSlideshow();