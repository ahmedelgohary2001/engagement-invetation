/* ============================================================
   Ahmed & Nada — Engagement page
   Plain JS. No build step. Drop into GitHub Pages and ship.
   ============================================================ */

/* ---------- 1. CONFIG (edit only this block) ---------- */
const CONFIG = {
  names: { groom: "Ahmed", bride: "Nada" },

  // Event time in Africa/Cairo (UTC+2, no DST). Adjust if needed.
  eventISO: "2026-07-17T19:00:00+02:00",
  eventEndISO: "2026-07-17T23:00:00+02:00",

  venue: {
    name: "Venice Hall · El Nasr Club",
    address: "Smouha, Alexandria, Egypt",
    mapsUrl: "https://maps.app.goo.gl/HsaA8M8Z5Fq2TGpp6"
  },

  hashtag: "#AhmedAndNada",

  // Two passphrases routing to two albums.
  // Replace the SHA-256 hashes below with hashes of YOUR passphrases.
  // To generate a hash, open dev console on this page and type:
  //     await __hash("your-secret-word")
  // then copy the hex string into `passphraseHash` below.
  gate: [
    {
      passphraseHash: "bab8345fd8f10f5462f285d8c0582334645afa7adab62b1d2f6eeb51be26acf4",
      albumUrl: "https://photos.app.goo.gl/cTHgRaeDZoxo3TPR7",
      noteText:
        "You really are close to us — thank you for being here. " +
        "If you have any photos of us, we'd love it if you added them to this album."
    },
    {
      passphraseHash: "275dbda9dedbb4a219a49e2ec4b35d325d3c5929a5ba1474264f09ae3d5492e9",
      albumUrl: "https://photos.app.goo.gl/CGrGjmzkRBHp1JBM6",
      noteText:
        "You really are close to us — thank you for being here. " +
        "If you have any photos of us, we'd love it if you added them to this album."
    }
  ]
};

/* ---------- 2. Helpers ---------- */
async function sha256Hex(text) {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(hash)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}
// expose for content authors who want to generate hashes from devtools
window.__hash = sha256Hex;

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.remove("show"), 1800);
}

/* ---------- 3. Envelope intro ---------- */
(function envelope() {
  const overlay = document.getElementById("envelope-overlay");
  if (!overlay) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce) {
    overlay.classList.add("hidden");
    return;
  }

  let opened = false;
  function open() {
    if (opened) return;
    opened = true;
    overlay.classList.add("open");
    // start music on this user gesture
    if (typeof window.__startMusic === "function") window.__startMusic();
    // remove overlay from the layer after the fly/fade completes (~1.85s)
    setTimeout(() => overlay.classList.add("hidden"), 2000);
  }

  overlay.addEventListener("click", open);
  overlay.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  });
})();

/* ---------- 4. Countdown ---------- */
(function countdown() {
  const target = new Date(CONFIG.eventISO).getTime();
  const els = {
    days: document.getElementById("cd-days"),
    hours: document.getElementById("cd-hours"),
    mins: document.getElementById("cd-mins"),
    secs: document.getElementById("cd-secs")
  };
  const done = document.getElementById("countdown-done");
  const wrap = document.getElementById("countdown");

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      wrap.hidden = true;
      done.hidden = false;
      clearInterval(timer);
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    els.days.textContent = d;
    els.hours.textContent = String(h).padStart(2, "0");
    els.mins.textContent = String(m).padStart(2, "0");
    els.secs.textContent = String(s).padStart(2, "0");
  }
  tick();
  const timer = setInterval(tick, 1000);
})();

/* ---------- 5. Calendar links ---------- */
(function calendar() {
  const start = new Date(CONFIG.eventISO);
  const end = new Date(CONFIG.eventEndISO);
  const fmt = d =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const title = encodeURIComponent(
    `Engagement of ${CONFIG.names.groom} & ${CONFIG.names.bride}`
  );
  const location = encodeURIComponent(
    `${CONFIG.venue.name}, ${CONFIG.venue.address}`
  );
  const details = encodeURIComponent("With love — see you there!");

  // Google Calendar
  const gcalUrl =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${title}` +
    `&dates=${fmt(start)}/${fmt(end)}` +
    `&location=${location}` +
    `&details=${details}`;
  document.getElementById("gcal-btn").href = gcalUrl;
})();

/* ---------- 6. Hashtag tap-to-copy ---------- */
(function hashtag() {
  document.getElementById("hashtag").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(CONFIG.hashtag);
      showToast("Copied!");
    } catch {
      showToast(CONFIG.hashtag);
    }
  });
})();

/* ---------- 7. Photo gate ---------- */
(function gate() {
  const form = document.getElementById("gate-form");
  const input = document.getElementById("gate-input");
  const hint = document.getElementById("gate-hint");
  const prompt = document.getElementById("gate-prompt");
  const reveal = document.getElementById("gate-reveal");
  const note = document.getElementById("gate-note");
  const album = document.getElementById("gate-album");

  function unlock(entry) {
    note.textContent = entry.noteText;
    album.href = entry.albumUrl;
    prompt.hidden = true;
    reveal.hidden = false;
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const typed = input.value;
    if (!typed) return;
    const hash = await sha256Hex(typed);
    const match = CONFIG.gate.find(g => g.passphraseHash === hash);
    if (match) {
      unlock(match);
    } else {
      // Not a passphrase — treat it as a sweet note and thank them.
      hint.textContent = "Thank you for your warm words 💗";
      input.value = "";
    }
  });
})();

/* ---------- 8. Music: auto-play on first user gesture, with toggle ---------- */
(function music() {
  const btn = document.getElementById("music-toggle");
  const audio = document.getElementById("bg-audio");
  audio.volume = 0.5;
  let playing = false;

  function setState(on) {
    playing = on;
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  }

  async function tryPlay() {
    try {
      await audio.play();
      setState(true);
    } catch {
      // First gesture didn't unlock it; user can still tap the toggle.
    }
  }

  // expose so the envelope intro can start music on its open gesture
  window.__startMusic = tryPlay;

  // Try immediately (will succeed in Safari iOS sometimes, fail in Chrome).
  tryPlay();

  // On the very first user gesture, start music.
  function firstGesture() {
    cleanup();
    if (!playing) tryPlay();
  }
  function cleanup() {
    ["pointerdown", "keydown", "touchstart", "scroll"].forEach(ev =>
      window.removeEventListener(ev, firstGesture, true)
    );
  }
  ["pointerdown", "keydown", "touchstart", "scroll"].forEach(ev =>
    window.addEventListener(ev, firstGesture, { capture: true, once: false, passive: true })
  );

  // Manual toggle (always works).
  btn.addEventListener("click", async e => {
    e.stopPropagation();
    if (!playing) {
      try {
        await audio.play();
        setState(true);
      } catch {
        showToast("Music unavailable");
      }
    } else {
      audio.pause();
      setState(false);
    }
  });
})();

/* ---------- 9. On-scroll reveal ---------- */
(function scrollReveal() {
  const obs = new IntersectionObserver(
    entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add("in-view");
          obs.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
})();

/* ---------- 10. Details roll-up accordion ---------- */
(function accordion() {
  const items = Array.from(document.querySelectorAll(".acc-item"));
  if (!items.length) return;

  items.forEach(item => {
    const trigger = item.querySelector(".acc-trigger");
    trigger.addEventListener("click", () => {
      const wasOpen = item.classList.contains("open");
      // single-open: collapse everything first
      items.forEach(i => {
        i.classList.remove("open");
        i.querySelector(".acc-trigger").setAttribute("aria-expanded", "false");
      });
      // then expand the clicked one if it had been closed
      if (!wasOpen) {
        item.classList.add("open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });
})();
