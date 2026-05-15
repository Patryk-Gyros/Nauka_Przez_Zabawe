console.log("JS działa");

window.startEuropeGameLogic = function () {

    console.log("Start gry");

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const img = new Image();
    const hitmap = new Image();

    img.src = "/mapa/assets/maps/europe_now.png";
    hitmap.src = "/mapa/assets/maps/europe_now.hitmap.png";

    // 🔥 RGB -> kraj (ODWROTNIE niż wcześniej)
    const regions = {
        "240,0,0": "Polska",
        "255,200,0": "Niemcy",
        "0,200,150": "Francja",
        "0,130,210": "Szwecja",
        "255,255,0": "Ukraina",
        "200,160,10": "Białoruś",
        "150,0,150": "Rosja"
    };

    let currentTarget = null;
    let score = 0;
    let combo = 0;

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");

    let hitmapReady = false;

    hitmap.onload = () => {
        tempCanvas.width = hitmap.width;
        tempCanvas.height = hitmap.height;
        tempCtx.drawImage(hitmap, 0, 0);
        hitmapReady = true;
        console.log("Hitmap OK");
    };

    img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        nextQuestion();
        console.log("Mapa OK");
    };

    function getRandomRegion() {
        const values = Object.values(regions);
        return values[Math.floor(Math.random() * values.length)];
    }

    function nextQuestion() {
        currentTarget = getRandomRegion();
        document.getElementById("question").innerText =
            "Kliknij kraj: " + currentTarget;
    }

    canvas.onclick = function (e) {

        if (!hitmapReady) return;

        const rect = canvas.getBoundingClientRect();

        const x = Math.floor((e.clientX - rect.left) * (hitmap.width / rect.width));
        const y = Math.floor((e.clientY - rect.top) * (hitmap.height / rect.height));

        const pixel = tempCtx.getImageData(x, y, 1, 1).data;

        const key = `${pixel[0]},${pixel[1]},${pixel[2]}`;

        console.log("KLIK:", key);

        // 🔥 dokładne dopasowanie
        const clicked = regions[key];

        if (!clicked) {
            console.log("BRAK REGIONU:", key);
            return;
        }

        console.log("REGION:", clicked);

        const correct = clicked === currentTarget;

        if (correct) {
            combo++;
            const pts = 10 + combo * 2;
            score += pts;
            showFeedback("+" + pts, "good");
        } else {
            combo = 0;
            showFeedback("❌", "bad");
        }

        updateHUD();

        setTimeout(() => {
            nextQuestion();
        }, 350);
    };

    function updateHUD() {
        document.getElementById("hud").innerText =
            "Punkty: " + score + " | Combo: " + combo;
    }

    function showFeedback(text, type) {
        const el = document.createElement("div");
        el.className = "feedback " + type;
        el.innerText = text;

        document.body.appendChild(el);

        setTimeout(() => el.remove(), 600);
    }
};