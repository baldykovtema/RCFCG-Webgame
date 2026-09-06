const donut = document.getElementById("donut");
const donutBoostInfo = document.getElementById("donutBoostInfo");

const DONUT_INTERVAL = 5 * 60 * 1000; // 5 минут
const DONUT_BOOST_DURATION = 60 * 1000; // 1 минута
const DONUT_VISIBLE_DURATION = 15 * 1000; // пончик виден 15 секунд

let donutTimer = null;
let donutBoostTimer = null;

function showDonut() {
    if (!currentUser) return;
    donut.style.display = "block";
    setTimeout(() => {
        donut.style.display = "none";
    }, DONUT_VISIBLE_DURATION);
}

function activateDonutBoost() {
    donutBoostActive = true;
    donutBoostInfo.style.display = "block";
    donut.style.display = "none";
    if (donutBoostTimer) clearTimeout(donutBoostTimer);
    donutBoostTimer = setTimeout(() => {
        donutBoostActive = false;
        donutBoostInfo.style.display = "none";
    }, DONUT_BOOST_DURATION);
}

donut.addEventListener("click", activateDonutBoost);

function startDonutSpawner() {
    if (donutTimer) return;
    donutTimer = setInterval(showDonut, DONUT_INTERVAL);
}

function stopDonutSpawner() {
    if (donutTimer) {
        clearInterval(donutTimer);
        donutTimer = null;
    }
    donut.style.display = "none";
    donutBoostActive = false;
    donutBoostInfo.style.display = "none";
    if (donutBoostTimer) {
        clearTimeout(donutBoostTimer);
        donutBoostTimer = null;
    }
}