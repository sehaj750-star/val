const PERSON = window.PERSON || { name: "Jayita", slug: "jayita" };
const PAGE_URL = `https://sehaj750-star.github.io/val/${PERSON.slug}/`;
const askTitle = `${PERSON.name}, will you go on a date with me?`;

document.title = askTitle;
document.getElementById("askTitle").textContent = askTitle;

const zone = document.getElementById("zone");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const noBtnShell = document.getElementById("noBtnShell");
const askScreen = document.getElementById("askScreen");
const dateScreen = document.getElementById("dateScreen");
const venueScreen = document.getElementById("venueScreen");
const venueSub = document.getElementById("venueSub");

const NOTIFY = {
  email: "sehaj750@gmail.com"
};

async function notifyYou(message, subject = `${PERSON.name} — date page update`) {
  if (!NOTIFY.email) return;

  await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(NOTIFY.email)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      _subject: subject,
      _template: "table",
      person: PERSON.name,
      message,
      page: PAGE_URL,
      time: new Date().toLocaleString("en-AU", { timeZone: "Australia/Sydney" })
    })
  }).catch(() => {});
}

const confettiCanvas = document.getElementById("confettiCanvas");

function resizeConfettiCanvas() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  confettiCanvas.width = Math.floor(window.innerWidth * dpr);
  confettiCanvas.height = Math.floor(window.innerHeight * dpr);
  confettiCanvas.style.width = "100vw";
  confettiCanvas.style.height = "100vh";
}

resizeConfettiCanvas();
window.addEventListener("resize", resizeConfettiCanvas);
window.addEventListener("orientationchange", () => setTimeout(resizeConfettiCanvas, 150));

const confettiInstance = confetti.create(confettiCanvas, {
  resize: false,
  useWorker: true
});

function fullScreenConfetti() {
  const end = Date.now() + 1600;

  (function frame() {
    confettiInstance({
      particleCount: 12,
      spread: 90,
      startVelocity: 45,
      ticks: 180,
      origin: { x: Math.random(), y: Math.random() * 0.3 }
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();

  setTimeout(() => {
    confettiInstance({
      particleCount: 300,
      spread: 140,
      startVelocity: 60,
      ticks: 220,
      origin: { x: 0.5, y: 0.55 }
    });
  }, 300);
}

let yesScale = 1;
function growYes() {
  yesScale = Math.min(2.2, yesScale + 0.1);
  yesBtn.style.transform = `translateY(-50%) scale(${yesScale})`;
}

const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
const chaseRadius = isTouchDevice ? 190 : 140;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function placeNo(left, top) {
  noBtnShell.style.left = left + "px";
  noBtnShell.style.top = top + "px";
  noBtnShell.style.transform = "none";
}

function zoneBounds() {
  const z = zone.getBoundingClientRect();
  const b = noBtnShell.getBoundingClientRect();
  return {
    z,
    maxLeft: Math.max(0, z.width - b.width),
    maxTop: Math.max(0, z.height - b.height),
    btnW: b.width,
    btnH: b.height
  };
}

function getYesRectInZone(pad = 16) {
  const z = zone.getBoundingClientRect();
  const yes = yesBtn.getBoundingClientRect();
  return {
    left: yes.left - z.left - pad,
    top: yes.top - z.top - pad,
    right: yes.right - z.left + pad,
    bottom: yes.bottom - z.top + pad
  };
}

function isValidNoPosition(left, top, btnW, btnH) {
  const yes = getYesRectInZone();
  const noRight = left + btnW;
  const noBottom = top + btnH;
  const overlaps = !(
    left > yes.right ||
    noRight < yes.left ||
    top > yes.bottom ||
    noBottom < yes.top
  );
  return !overlaps;
}

function scoreNoPosition(left, top, btnW, btnH, px, py) {
  const { z } = zoneBounds();
  const cx = z.left + left + btnW / 2;
  const cy = z.top + top + btnH / 2;
  const awayFromTouch = Math.hypot(cx - px, cy - py);
  const yes = yesBtn.getBoundingClientRect();
  const awayFromYes = Math.hypot(
    cx - (yes.left + yes.width / 2),
    cy - (yes.top + yes.height / 2)
  );
  return awayFromTouch + awayFromYes * 0.5;
}

function pickNoPosition(px, py, preferredLeft, preferredTop) {
  const { maxLeft, maxTop, btnW, btnH } = zoneBounds();

  if (
    preferredLeft != null &&
    isValidNoPosition(preferredLeft, preferredTop, btnW, btnH)
  ) {
    return { left: preferredLeft, top: preferredTop };
  }

  let bestLeft = null;
  let bestTop = null;
  let bestScore = -1;

  for (let i = 0; i < 28; i++) {
    const left = Math.random() * maxLeft;
    const top = Math.random() * maxTop;
    if (!isValidNoPosition(left, top, btnW, btnH)) continue;
    const score = scoreNoPosition(left, top, btnW, btnH, px, py);
    if (score > bestScore) {
      bestScore = score;
      bestLeft = left;
      bestTop = top;
    }
  }

  if (bestLeft != null) {
    return { left: bestLeft, top: bestTop };
  }

  const yes = getYesRectInZone();
  const candidates = [
    { left: yes.right + 8, top: yes.top },
    { left: yes.right + 8, top: yes.bottom - btnH },
    { left: maxLeft, top: maxTop },
    { left: 0, top: maxTop }
  ];

  for (const spot of candidates) {
    const left = clamp(spot.left, 0, maxLeft);
    const top = clamp(spot.top, 0, maxTop);
    if (isValidNoPosition(left, top, btnW, btnH)) {
      return { left, top };
    }
  }

  return { left: maxLeft, top: maxTop };
}

function instantDodgeNo(px, py) {
  const { left, top } = pickNoPosition(px, py);
  placeNo(left, top);
  growYes();
}

function moveNo(px, py) {
  const { z, maxLeft, maxTop } = zoneBounds();
  const b = noBtnShell.getBoundingClientRect();

  let dx = (b.left + b.width / 2) - px;
  let dy = (b.top + b.height / 2) - py;
  let mag = Math.hypot(dx, dy) || 1;
  dx /= mag;
  dy /= mag;

  const jump = isTouchDevice ? 190 : 150;
  let newLeft = (b.left - z.left) + dx * jump;
  let newTop = (b.top - z.top) + dy * jump;

  newLeft = clamp(newLeft, 0, maxLeft);
  newTop = clamp(newTop, 0, maxTop);

  const picked = pickNoPosition(px, py, newLeft, newTop);
  placeNo(picked.left, picked.top);
  growYes();
}

function chasePointer(px, py) {
  const b = noBtnShell.getBoundingClientRect();
  const d = Math.hypot(
    (b.left + b.width / 2) - px,
    (b.top + b.height / 2) - py
  );
  if (d < chaseRadius) moveNo(px, py);
}

zone.addEventListener("pointermove", e => chasePointer(e.clientX, e.clientY));
zone.addEventListener("touchmove", e => {
  const t = e.touches[0];
  if (t) chasePointer(t.clientX, t.clientY);
}, { passive: true });

let lastNoDodge = 0;

function onNoTap(e) {
  e.preventDefault();
  e.stopPropagation();
  const now = Date.now();
  if (now - lastNoDodge < 100) return;
  lastNoDodge = now;
  const point = e.touches?.[0] ?? e;
  instantDodgeNo(point.clientX, point.clientY);
}

noBtn.addEventListener("pointerdown", onNoTap, { passive: false });
noBtn.addEventListener("click", e => e.preventDefault());

function showScreen(screen) {
  askScreen.style.display = screen === askScreen ? "block" : "none";
  dateScreen.classList.toggle("active", screen === dateScreen);
  venueScreen.classList.toggle("active", screen === venueScreen);
}

function confirmDay(day) {
  if (day === "Other") {
    notifyYou(
      `${PERSON.name} picked Other — text her to confirm which day works.`,
      `${PERSON.name} picked Other 💬`
    );
    venueSub.textContent = "Venue to follow soon — I'll message you to pick the day! ✨";
  } else {
    notifyYou(`${PERSON.name} picked ${day} for the date!`, `${PERSON.name} picked a day 💕`);
    venueSub.textContent = `Can't wait for ${day}! Venue details coming your way ✨`;
  }

  showScreen(venueScreen);
  resizeConfettiCanvas();
  fullScreenConfetti();
}

document.querySelectorAll(".choice-btn[data-day]").forEach(btn => {
  btn.addEventListener("click", () => confirmDay(btn.dataset.day));
});

yesBtn.addEventListener("click", () => {
  notifyYou(`${PERSON.name} said YES to the date!`, `${PERSON.name} said yes! 🎉`);

  if (PERSON.skipDatePicker) {
    venueSub.textContent = "Can't wait — venue details coming your way! ✨";
    showScreen(venueScreen);
  } else {
    showScreen(dateScreen);
  }

  resizeConfettiCanvas();
  fullScreenConfetti();
});
