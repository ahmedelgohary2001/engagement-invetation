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
    mapsUrl: "https://maps.app.goo.gl/zMzpdBTR5856iqLg9?g_st=iw"
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

/* ---------- 3. Curtain reveal ---------- */
(function curtain() {
  const el = document.getElementById("curtain");
  const seen = localStorage.getItem("curtainSeen") === "1";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (seen || reduce) {
    el.classList.add("hidden");
    return;
  }
  // small delay so initial paint completes
  setTimeout(() => {
    el.classList.add("open");
    localStorage.setItem("curtainSeen", "1");
    // remove from layer after animation
    setTimeout(() => el.classList.add("hidden"), 2200);
  }, 350);
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

  // .ics download
  document.getElementById("ics-btn").addEventListener("click", () => {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//AhmedAndNada//Engagement//EN",
      "BEGIN:VEVENT",
      `UID:engagement-${start.getTime()}@ahmedandnada`,
      `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:Engagement of ${CONFIG.names.groom} & ${CONFIG.names.bride}`,
      `LOCATION:${CONFIG.venue.name}, ${CONFIG.venue.address}`,
      "DESCRIPTION:With love — see you there!",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ahmed-and-nada-engagement.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
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
    localStorage.setItem("gateUnlocked", JSON.stringify(entry));
  }

  // restore previous unlock
  const prior = localStorage.getItem("gateUnlocked");
  if (prior) {
    try { unlock(JSON.parse(prior)); } catch {}
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const typed = input.value;
    if (!typed) return;
    const hash = await sha256Hex(typed);
    const match = CONFIG.gate.find(g => g.passphraseHash === hash);
    if (match) {
      hint.textContent = "";
      unlock(match);
    } else {
      hint.textContent = "Hmm, not quite — try again.";
      input.value = "";
      input.focus();
    }
  });
})();

/* ---------- 8. Music toggle ---------- */
(function music() {
  const btn = document.getElementById("music-toggle");
  const audio = document.getElementById("bg-audio");
  let playing = false;

  btn.addEventListener("click", async () => {
    if (!playing) {
      try {
        await audio.play();
        playing = true;
        btn.setAttribute("aria-pressed", "true");
        localStorage.setItem("musicOn", "1");
      } catch {
        showToast("Music unavailable");
      }
    } else {
      audio.pause();
      playing = false;
      btn.setAttribute("aria-pressed", "false");
      localStorage.setItem("musicOn", "0");
    }
  });

  // Don't autoplay even if user opted-in last time — browsers block this.
  // We just leave the toggle in its previous visual state as a hint.
  if (localStorage.getItem("musicOn") === "1") {
    btn.setAttribute("aria-pressed", "false"); // still off until user taps
  }
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
