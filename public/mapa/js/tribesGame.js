function startTribesGame() {

  const canvas = document.getElementById("mapCanvas");
  const ctx = canvas.getContext("2d");

  const baseImg = new Image();
  const hitmapImg = new Image();

  baseImg.src = "assets/maps/poland/poland_base.png";
  hitmapImg.src = "assets/maps/poland/poland_hitmap.png";

  let hitmapCanvas = document.createElement("canvas");
  let hitmapCtx = hitmapCanvas.getContext("2d");

  baseImg.onload = () => {
    canvas.width = baseImg.width;
    canvas.height = baseImg.height;
    ctx.drawImage(baseImg, 0, 0);
  };

  hitmapImg.onload = () => {
    hitmapCanvas.width = hitmapImg.width;
    hitmapCanvas.height = hitmapImg.height;
    hitmapCtx.drawImage(hitmapImg, 0, 0);
  };

  const tribes = {
    "255,0,0": "polanie",
    "0,255,0": "mazowszanie",
    "0,0,255": "wislanie"
    // 👉 NA RAZIE TESTOWE — potem dopasujemy do Twojej hitmapy
  };

  canvas.onclick = (e) => {

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);

    const pixel = hitmapCtx.getImageData(x, y, 1, 1).data;

    const key = `${pixel[0]},${pixel[1]},${pixel[2]}`;
    const tribe = tribes[key];

    if (!tribe) return;

    console.log("Klik:", tribe);

    showFeedback(ctx, x, y, true);
    playSound(true);
  };
}

// ===== EFEKT =====
function showFeedback(ctx, x, y, correct) {
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fillStyle = correct ? "rgba(0,255,0,0.5)" : "rgba(255,0,0,0.5)";
  ctx.fill();
}

// ===== DŹWIĘK =====
function playSound(correct) {
  const sound = new Audio(
    correct ? "assets/audio/correct.mp3" : "assets/audio/wrong.mp3"
  );
  sound.play();
}