export async function preprocessImage(base64string, targetHeight = 48, targetWidth = 1152) {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = base64string;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const scale = targetHeight / image.naturalHeight;
  const newWidth = Math.min(Math.floor(image.naturalWidth * scale), targetWidth);

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(image, 0, 0, newWidth, targetHeight);

  const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const data = imageData.data;

  const floatData = new Float32Array(targetHeight * targetWidth);
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const i = (y * targetWidth + x) * 4;
      floatData[y * targetWidth + x] = data[i] / 255.0; // R만 사용 (grayscale)
    }
  }

  return floatData;
}
