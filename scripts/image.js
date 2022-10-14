const beforeImage = document.getElementById("image-old");
const beforeImageCanvas = document.getElementById("image-old-canvas");
const afterImage = document.getElementById("image-preview");
const afterImageCanvas = document.getElementById("image-preview-canvas");
const imageInput = document.getElementById("image-input");

imageInput.addEventListener("change", readSingleFile, false);
palettePreview.addEventListener("change", updatePreviewImage, false);

// Update the image preview when the palette changes
observer = new MutationObserver(updatePreviewImage);
observer.observe(palettePreview, { childList: true });

let image = "";

function readSingleFile(e) {
  //Retrieve the first (and only!) File from the FileList object
  let file = e.target.files[0];

  if (file) {
    let reader = new FileReader();
    reader.onload = (event) => {
      if (isValidPng(file)) {
        image = event.target.result;
        updatePreviewImage();
      } else {
        e.target.value = null;
        resetImage();
        alert("Not a valid PNG file!");
      }
    };
    reader.readAsDataURL(file);
  } else {
    resetImage();
    alert("Failed to load file");
  }
}

function updatePreviewImage() {
  // Must wait until the image loads or you won't be able to load the image data
  beforeImage.onload = () => {
    if (image && palette.length !== 0) {
      dyeImage(beforeImage);
    }
    updateBeforeImageCanvas(beforeImage);
  };
  beforeImage.src = image;

  // Manually clear the preview because the image won't technically "load" if
  // it's just being cleared, thus onload events won't be called
  if (!image) {
    afterImage.src = "";
  }

  afterImageCanvas.hidden = !image || palette.length === 0;
  beforeImageCanvas.hidden = !image;
}

function resetImage() {
  image = "";
  updatePreviewImage();
}

function dyeImage(image) {
  // Must grab the canvas as is needed so the image can load first
  const width = image.width || image.naturalWidth;
  const height = image.height || image.naturalHeight;
  afterImageCanvas.width = width;
  afterImageCanvas.height = height;
  let context = afterImageCanvas.getContext("2d", {
    willReadFrequently: true,
  });

  context.drawImage(image, 0, 0);

  let imageData = context.getImageData(0, 0, width, height),
    pix = imageData.data;

  // Loop through all of the pixels and modify the components
  for (let i = 0, n = pix.length; i < n; i += 4) {
    let pixelColor = new Color(pix[i], pix[i + 1], pix[i + 2]);
    let newColor = getMostSimilarColor(pixelColor).colorArray;
    pix[i] = newColor[0]; // Red component
    pix[i + 1] = newColor[1]; // Blue component
    pix[i + 2] = newColor[2]; // Green component
    //pix[i+3] is the transparency.
  }

  context.putImageData(imageData, 0, 0);

  afterImage.src = afterImageCanvas.toDataURL("image/png");
}

function updateBeforeImageCanvas(image) {
  // Must grab the canvas as is needed so the image can load first
  const width = image.width || image.naturalWidth;
  const height = image.height || image.naturalHeight;
  beforeImageCanvas.width = width;
  beforeImageCanvas.height = height;
  let context = beforeImageCanvas.getContext("2d", {
    willReadFrequently: true,
  });

  context.drawImage(image, 0, 0);

  let imageData = context.getImageData(0, 0, width, height);

  context.putImageData(imageData, 0, 0);

  beforeImage.src = beforeImageCanvas.toDataURL("image/png");
}
