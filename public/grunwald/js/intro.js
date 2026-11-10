const polska =
document.getElementById("polska");

const litwa =
document.getElementById("litwa");

const krzyzacy =
document.getElementById("krzyzacy");
const herbPolska =
document.getElementById("herb-polska");

const herbLitwa =
document.getElementById("herb-litwa");

const herbKrzyzacy =
document.getElementById("herb-krzyzacy");
const pergamin =
document.getElementById("pergamin");

const flash =
document.getElementById("flash");

const title =
document.getElementById("title");

const godloUnii =
document.getElementById("godlo-unii");

const mapa1410 =
document.getElementById("mapa-1410");

const mapaZmudz =
document.getElementById("mapa-zmudz");


const markerPowstanie =
document.getElementById("marker-powstanie");
const ulrich =
document.getElementById("ulrich");

const jagielloKrol =
document.getElementById("jagiello-krol");

const witold =
document.getElementById("witold");

const symbolWojny =
document.getElementById("symbol-wojny");
//
// 1 sekunda
// błysk
//

setTimeout(() => {

    flash.style.opacity = "1";

    setTimeout(() => {

        flash.style.opacity = "0";

    },200);

},1000);


//
// 2 sekunda
// pergamin
//

setTimeout(() => {

    pergamin.style.opacity = "1";

},2000);


//
// 4 sekunda
// rok 1409
//

setTimeout(() => {

    title.innerHTML =
"ROK 1409";

title.style.top = "50%";
title.style.opacity = "1";

},4000);


//
// 7 sekunda
//

setTimeout(() => {

    title.style.opacity = "0";

},7000);


//
// 9 sekunda
//

setTimeout(() => {

    title.innerHTML =
    "EUROPA STOI<br>NA KRAWĘDZI WOJNY";

    title.style.opacity = "1";

},9000);


//
// 13 sekunda
//

setTimeout(() => {

    title.style.opacity = "0";

},13000);
const europa =
document.getElementById("europa");
const mapContainer =
document.getElementById("map-container");

const rok =
document.getElementById("rok");

const mapBackground =
document.getElementById("map-background");
const mapaKrewo =
document.getElementById("mapa-krewo");
const mapaKrewoUnia =
document.getElementById("mapa-krewo-unia");

const markerKrewo =
document.getElementById("marker-krewo");
const markerSlub =
document.getElementById("marker-slub");
const jadwigaSlub =
document.getElementById("jadwiga-slub");

const jagielloSlub =
document.getElementById("jagiello-slub");
//
// przejście do mapy Europy
//



setTimeout(() => {

    rok.style.opacity = "1";
    rok.style.top = "3%";

    mapBackground.style.opacity = "1";

    europa.style.opacity = "1";


},17000);


setTimeout(() => {

    pergamin.style.opacity = "0";

},14500);

//
// POLSKA + LITWA
//

setTimeout(() => {

    polska.style.opacity = "1";
    litwa.style.opacity = "1";


    herbPolska.style.opacity = "1";
    herbPolska.style.left = "20px";

    herbLitwa.style.opacity = "1";
    herbLitwa.style.right = "20px";

},20000);

setTimeout(() => {

title.style.fontSize = "48px";

title.innerHTML =
"POLSKA I LITWA<br><br>ZJEDNOCZONE W SOJUSZU";

title.style.top = "82%";
title.style.opacity = "1";

},22000);
setTimeout(() => {

    title.style.opacity = "0";

},25000);
setTimeout(() => {

title.style.fontSize = "48px";

title.innerHTML =
"MUSZĄ STAWIĆ CZOŁA<br><br>PAŃSTWU KRZYŻACKIEMU";

title.style.top = "78%";
title.style.opacity = "1";

},28000);

setTimeout(() => {

    title.style.opacity = "0";

},31500);
setTimeout(() => {

    krzyzacy.style.opacity = "1";

    herbKrzyzacy.style.opacity = "1";
    herbKrzyzacy.style.top = "15px";

},28000);
setTimeout(() => {
title.style.fontSize = "82px";
    title.innerHTML =
    "WOJNA JEST PEWNA";

    title.style.top = "60%";
    title.style.opacity = "1";

},32500);setTimeout(() => {

    title.style.opacity = "0";

},36000);
//
// WYGASZENIE MAPY
//

setTimeout(() => {

    europa.style.opacity = "0";


    polska.style.opacity = "0";
    litwa.style.opacity = "0";
    krzyzacy.style.opacity = "0";

    herbPolska.style.opacity = "0";
    herbLitwa.style.opacity = "0";
    herbKrzyzacy.style.opacity = "0";

    rok.style.opacity = "0";

    mapBackground.style.opacity = "0";

},37000);
//
// POWRÓT DO PERGAMINU
//

setTimeout(() => {

    pergamin.style.opacity = "1";

},48500);

setTimeout(() => {

    title.style.fontSize = "70px";

    title.innerHTML =
    "25 LAT WCZEŚNIEJ...";

    title.style.top = "50%";
    title.style.opacity = "1";

},50000);
setTimeout(() => {

    title.style.opacity = "0";

},52000);
setTimeout(() => {

    title.style.fontSize = "80px";

    title.innerHTML =
    "1385";

    title.style.top = "45%";
    title.style.opacity = "1";

},53500);
setTimeout(() => {

    title.style.opacity = "0";

},55500);
//
// MAPA KREWA
//

setTimeout(() => {

    pergamin.style.opacity = "1";

    mapBackground.style.opacity = "1";

    europa.style.opacity = "0";

    mapaKrewo.style.opacity = "1";

    mapaKrewo.style.filter = "brightness(1)";

},56000);
setTimeout(() => {

    markerKrewo.style.opacity = "1";

},57500);
setTimeout(() => {

    mapaKrewo.style.opacity = "0";

    mapaKrewoUnia.style.opacity = "1";


    mapaKrewoUnia.style.filter =
        "brightness(1) saturate(1)";

},59000);; setTimeout(() => {

    title.style.fontSize = "48px";

    title.innerHTML =
    "W Krewie podpisano unię,<br>która połączyła Polskę i Litwę";

    title.style.top = "78%";

    title.style.opacity = "1";

},61000);
//
// KONIEC SCENY UNII
//

setTimeout(() => {

    title.style.opacity = "0";

   

},66000);

//
// POWRÓT NA MAPĘ
//

setTimeout(() => {

    pergamin.style.opacity = "1";

    mapBackground.style.opacity = "1";

    mapaKrewo.style.opacity = "0";

    mapaKrewoUnia.style.opacity = "1";

},67500);
setTimeout(() => {

    title.style.fontSize = "46px";

    title.innerHTML =
    "ROK PÓŹNIEJ W KRAKOWIE<br>DOSZŁO DO ŚLUBU";

    title.style.top = "12%";

    title.style.opacity = "1";

},69000);
setTimeout(() => {

    markerSlub.style.opacity = "1";

},70500);
setTimeout(() => {

    mapBackground.style.opacity = "0";

    mapaKrewoUnia.style.opacity = "0";

    markerKrewo.style.opacity = "0";
    markerSlub.style.opacity = "0";

    title.style.opacity = "0";

},74000);
setTimeout(() => {

    pergamin.style.opacity = "1";

},75000);
setTimeout(() => {

    markerSlub.style.opacity = "0";
    markerKrewo.style.opacity = "0";

    mapaKrewo.style.opacity = "0";
    mapaKrewoUnia.style.opacity = "0";

},75000);
setTimeout(() => {

    title.style.fontSize = "38px";

    title.innerHTML =
    "Nowożeńcami byli<br><br>" +
    "wielki książę litewski Jagiełło<br>" +
    "i Jadwiga Andegaweńska – Królowa Polski";

    title.style.top = "22%";

    title.style.opacity = "1";

},76500);
setTimeout(() => {

    jadwigaSlub.style.opacity = "1";
    jadwigaSlub.style.left = "20%";

    jagielloSlub.style.opacity = "1";
    jagielloSlub.style.right = "20%";

},76500);
setTimeout(() => {

    jadwigaSlub.style.left = "24%";

    jagielloSlub.style.right = "24%";

},78500);
setTimeout(() => {

    jadwigaSlub.style.opacity = "0";
    jagielloSlub.style.opacity = "0";

    title.style.opacity = "0";

},83000);
setTimeout(() => {

    godloUnii.style.opacity = "1";

    godloUnii.style.transform =
    "translate(-50%,-50%) scale(1)";

},85000);
setTimeout(() => {

    title.style.fontSize = "52px";

    title.innerHTML =
    "UNIA POLSKO-LITEWSKA<br>ZOSTAŁA SCEMENTOWANA";

    title.style.top = "78%";

    title.style.opacity = "1";

},87000);

setTimeout(() => {

    godloUnii.style.opacity = "0";

    title.style.opacity = "0";

},92000);
setTimeout(() => {

    title.style.fontSize = "70px";

    title.innerHTML =
    "TYMCZASEM 23 LATA PÓŹNIEJ...";

    title.style.top = "50%";

    title.style.opacity = "1";

},94000);
setTimeout(() => {
mapBackground.style.opacity = "1";
    title.style.opacity = "0";

},96000);

setTimeout(() => {

    mapBackground.style.opacity = "1";

    mapaZmudz.style.opacity = "1";


},100000);
setTimeout(() => {

    title.style.fontSize = "25px";

title.style.color = "white";
title.style.top = "28%";
title.style.left = "58%";
    title.innerHTML = "ŻMUDŹ";

},101000);
setTimeout(() => {

    title.style.fontSize = "42px";

   title.style.left = "50%";
title.style.transform = "translateX(-50%)";

title.innerHTML =
"W rządzonej przez Krzyżaków części Litwy –<br>Żmudzi – wybucha powstanie";

    title.style.top = "78%";

    title.style.opacity = "1";

},103000);setTimeout(() => {

    markerPowstanie.style.opacity = "1";

},104000);
setTimeout(() => {

    title.style.fontSize = "42px";

   
title.style.left = "50%";
title.style.transform = "translateX(-50%)";

title.innerHTML =
"Polska i Litwa<br>wspierają powstańców";    title.style.top = "78%";

    title.style.opacity = "1";

},107000);
setTimeout(() => {

    title.style.fontSize = "42px";

    title.style.left = "50%";
title.style.transform = "translateX(-50%)";

title.innerHTML =
"To nie mogło spodobać się Krzyżakom";

},111000);
setTimeout(() => {
    mapBackground.style.opacity = "0";

mapaZmudz.style.opacity = "0";
markerPowstanie.style.opacity = "0";

    pergamin.style.opacity = "1";

    ulrich.style.opacity = "1";
    ulrich.style.top = "10%";

    title.style.fontSize = "40px";

    
title.style.left = "50%";
title.style.transform = "translateX(-50%)";

title.innerHTML =
"Ulrich von Jungingen żąda<br>zaprzestania wsparcia powstańców";
    title.style.top = "55%";

    title.style.opacity = "1";

},120000);
setTimeout(() => {

   

    jagielloKrol.style.opacity = "1";
    jagielloKrol.style.left = "8%";

    witold.style.opacity = "1";
    witold.style.right = "8%";

   
title.style.left = "50%";
title.style.transform = "translateX(-50%)";

title.innerHTML =
"Jagiełło i Witold odmawiają";

},125000);
setTimeout(() => {

    title.style.opacity = "0";

},127000);
setTimeout(() => {

    symbolWojny.style.opacity = "1";

    symbolWojny.style.transform =
    "translate(-50%,-50%) scale(1)";

},128000);
setTimeout(() => {
title.style.opacity = "1";

    title.style.fontSize = "72px";



title.style.left = "50%";
title.style.transform = "translateX(-50%)";

title.innerHTML =
"W 1409 ROKU<br>WYBUCHA WOJNA";
ulrich.style.opacity = "0";
jagielloKrol.style.opacity = "0";
witold.style.opacity = "0";
symbolWojny.style.opacity = "0";

},128000);
setTimeout(() => {

    jagielloKrol.style.opacity = "0";
    witold.style.opacity = "0";

    symbolWojny.style.opacity = "0";

},129000);
setTimeout(() => {

    title.style.fontSize = "140px";

    title.style.top = "35%";

},130000);
setTimeout(() => {

    title.style.fontSize = "110px";

    title.style.top = "40%";

},132000);
