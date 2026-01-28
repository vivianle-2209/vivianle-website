/* ============================ SAFE SPLASH ============================ */
/* Advances every 3s, Skip works, and it can NEVER trap the page.      */
(function splashSafe(){
  function run(){
    const intro = document.getElementById("intro");
    if (!intro) return; // nothing to do

    const word = document.getElementById("introWord");
    const sub  = document.getElementById("introSub");
    const skip = document.getElementById("introSkip");

    // Inline greeting rotator: Hello / Xin chào / こんにちは
    (function greetInline(){
      const el = document.getElementById("greetWord");
      if(!el) return;

      const words = ["Xin chào","Hello","こんにちは","你好","Bonjour","Hola","Ciao","안녕하세요","Hallo","Olá","مرحبا","नमस्ते","สวัสดี","Hej","Salve","Szia","Ahoj","Halo"];
      const isJP = s => /[\u3040-\u30FF\u31F0-\u31FF\uFF66-\uFF9F]/.test(s);

      let i = 0;
      function show(){
        const t = words[i % words.length];
        i++;
        el.textContent = t;
        el.classList.toggle("jp", isJP(t));
        el.style.animation = "none";
        requestAnimationFrame(()=>{ el.style.animation = "greetIn 900ms cubic-bezier(.2,.8,.2,1)"; });
      }

      show();
      setInterval(show, 2000);
    })();

    document.body.classList.add("no-scroll");

    const slides = [
      { text: "Welcome to",     script: true },
      { text: "Vivian's world", script: true },
    ];

    let i = 0;
    let timer = null;

    function show(idx){
      const s = slides[idx];
      if (word) {
        word.textContent = s.text;
        word.classList.toggle("script", !!s.script);
        word.style.animation = "none";
        requestAnimationFrame(() => { word.style.animation = "blurIn 900ms cubic-bezier(.2,.8,.2,1)"; });
      }
      if (sub) sub.textContent = "";
    }

    function finish(){
      clearTimeout(timer);
      intro.classList.add("hidden");
      document.body.classList.remove("no-scroll");
      try { localStorage.setItem("introSeen","1"); } catch {}
      setTimeout(() => intro.remove(), 650);
    }

    function step(){
      if (i >= slides.length) { finish(); return; }
      show(i++);
      timer = setTimeout(step, 1000);
    }

    // Bind skip (click anywhere, the button, or any key)
    const skipAll = (e) => { if (e) e.stopPropagation(); finish(); };
    intro.addEventListener("click", skipAll);
    if (skip) skip.addEventListener("click", skipAll);
    window.addEventListener("keydown", skipAll, { once: true });

    // Start sequence
    step();

    // Absolute fallback: if *anything* goes wrong, remove splash after 20s
    setTimeout(() => {
      if (document.body.classList.contains("no-scroll")) finish();
    }, 20000);
  }

  // Run when DOM is ready (works even if defer is missing)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();


/* ============================ TYPING EFFECT ============================ */
(function typing(){
  try{
    const el = document.querySelector("#typing");
    if (!el) return;

    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let words = [];
    try { words = JSON.parse(el.getAttribute("data-words") || "[]"); } catch {}
    if (!Array.isArray(words) || !words.length) words = [el.textContent.trim() || "Portfolio"];
    if (reduce) { el.textContent = words[0]; return; }

    const speed = parseInt(el.getAttribute("data-speed") || "85", 10);
    const back  = Math.max(30, Math.round(speed * 0.6));
    const hold  = parseInt(el.getAttribute("data-hold")  || "1400", 10);

    let i=0, j=0, del=false;
    (function tick(){
      const w = words[i % words.length];
      if (!del){
        el.textContent = w.slice(0, j++);
        if (j > w.length){ del=true; return setTimeout(tick, hold); }
        return setTimeout(tick, speed + Math.random()*50);
      }else{
        el.textContent = w.slice(0, j--);
        if (j < 0){ del=false; i++; return setTimeout(tick, 500); }
        return setTimeout(tick, back);
      }
    })();
  }catch(e){}
})();


/* ============================ VINYL PLAYER (GENRE TRACKS) ============================ */
(function player(){
  try{
    const $ = (s, r=document)=>r.querySelector(s);

    const audio    = $("#audio");         if (!audio) return;
    const playerEl = $("#player");
    const titleEl  = $("#title");
    const artistEl = $("#artist");
    const coverEl  = $("#cover");
    const vinyl    = $("#vinyl");
    const notesEl  = $("#notes");

    const playBtn    = $("#play");
    const nextBtn    = $("#next");
    const prevBtn    = $("#prev");
    const shuffleBtn = $("#shuffle");
    const repeatBtn  = $("#repeat");

    const seek       = $("#seek");
    const currentEl  = $("#current");
    const durationEl = $("#duration");

    // Cover rule: always cover1.jpeg
    const FIXED_COVER  = "covers/cover1.jpeg";
    const FIXED_ARTIST = "Vivian Le";

    // Genre -> title + mp3 file
    const GENRE_META = {
      "R&B":         { title: "Midnight Conversations",           src: "audio/rb-midnight-conversations.mp3" },
      "Hip Hop":     { title: "Blueprints from the Concrete",     src: "audio/hiphop-blueprints-from-the-concrete.mp3" },
      "Pop":         { title: "Neon Hearts Don’t Sleep",          src: "audio/pop-neon-hearts-dont-sleep.mp3" },
      "Classical":   { title: "A Letter Written in Moonlight",    src: "audio/classical-a-letter-written-in-moonlight.mp3" },
      "Jazz":        { title: "Smoke in a Blue Room",             src: "audio/jazz-smoke-in-a-blue-room.mp3" },
      "Rock":        { title: "Still Loud After the Echo",        src: "audio/rock-still-loud-after-the-echo.mp3" },
      "Indie":       { title: "Postcards I Never Sent",           src: "audio/indie-postcards-i-never-sent.mp3" },
      "Electronic":  { title: "Signals Between Stars",            src: "audio/electronic-signals-between-stars.mp3" },
      "EDM":         { title: "We Were Electric Once",            src: "audio/edm-we-were-electric-once.mp3" },
      "Lo-Fi":       { title: "Rain on Repeat",                   src: "audio/lofi-rain-on-repeat.mp3" },
      "Ambient":     { title: "Breathing Between Thoughts",       src: "audio/ambient-breathing-between-thoughts.mp3" },
      "Soul":        { title: "Where the Truth Softly Lives",     src: "audio/soul-where-the-truth-softly-lives.mp3" },
      "Funk":        { title: "Dancing with Gravity",             src: "audio/funk-dancing-with-gravity.mp3" },
      "Acoustic":    { title: "Barefoot on Old Wooden Floors",    src: "audio/acoustic-barefoot-on-old-wooden-floors.mp3" },
      "Instrumental":{ title: "Emotions Without Words",           src: "audio/instrumental-emotions-without-words.mp3" },
      "Chill":       { title: "Time Slows Here",                  src: "audio/chill-time-slows-here.mp3" },
      "House":       { title: "Lights Stay On Till Morning",      src: "audio/house-lights-stay-on-till-morning.mp3" },
      "Techno":      { title: "Machines That Dream",              src: "audio/techno-machines-that-dream.mp3" },
      "Latin":       { title: "Echoes of Warm Streets",           src: "audio/latin-echoes-of-warm-streets.mp3" },
      "K-Pop":       { title: "Starlight After Midnight",         src: "audio/kpop-starlight-after-midnight.mp3" },
    };

    // For Next/Prev: cycle through the genres in this order
    const GENRE_ORDER = [
      "R&B","Hip Hop","Pop","Classical","Jazz","Rock","Indie","Electronic","EDM","Lo-Fi",
      "Ambient","Soul","Funk","Acoustic","Instrumental","Chill","House","Techno","Latin","K-Pop"
    ];

    // default starting genre
    let index = Math.max(0, GENRE_ORDER.indexOf("Lo-Fi"));

    let isShuffle=false, isRepeat=false, seeking=false, noteTimer=null;

    const fmt = (sec)=>!isFinite(sec)?"0:00":`${Math.floor(sec/60)}:${String(Math.floor(sec%60)).padStart(2,"0")}`;

    function setPlayingUI(on){
      playerEl?.classList.toggle("is-playing", on);
      vinyl?.classList.toggle("spinning", on);
      if (on) startNotes(); else stopNotes();
      playBtn?.setAttribute("aria-label", on ? "Pause" : "Play");
    }

    function applyTrackByIndex(i){
      const genre = GENRE_ORDER[i];
      const meta = GENRE_META[genre];
      if (!meta) return;

      // UI
      if (titleEl)  titleEl.textContent  = meta.title;
      if (artistEl) artistEl.textContent = FIXED_ARTIST;
      if (coverEl)  coverEl.src          = FIXED_COVER;

      // audio
      audio.src = meta.src;
      audio.load();
      if (seek) seek.style.setProperty("--p","0%");
    }

    async function playCurrent(){
      try { await audio.play(); }
      catch { setPlayingUI(true); }
    }

    // notes
    const glyphs=["♪","♫","♬","♩"];
    function spawnNote(){
      if (!notesEl) return;
      const el=document.createElement("span");
      el.className="note";
      el.textContent=glyphs[(Math.random()*glyphs.length)|0];
      el.style.fontSize=(14+Math.random()*10)+"px";
      const R=(notesEl.clientWidth||200)*0.36, a=Math.random()*Math.PI*2;
      const x0=Math.cos(a)*R, y0=Math.sin(a)*R, dx=Math.cos(a)*48, dy=Math.sin(a)*48-12;
      el.style.setProperty("--x0",x0+"px"); el.style.setProperty("--y0",y0+"px");
      el.style.setProperty("--dx",dx+"px"); el.style.setProperty("--dy",dy+"px");
      notesEl.appendChild(el);
      el.addEventListener("animationend",()=>el.remove());
    }
    function startNotes(){ if(noteTimer) return; spawnNote(); noteTimer=setInterval(spawnNote,650); }
    function stopNotes(){ clearInterval(noteTimer); noteTimer=null; }

    // init
    applyTrackByIndex(index);

    // expose for search bar
    window.playGenre = async function(genre){
      const meta = GENRE_META[genre];
      if (!meta) return;

      const i = GENRE_ORDER.indexOf(genre);
      if (i >= 0) index = i;

      applyTrackByIndex(index);
      await playCurrent();
    };

    // controls
    playBtn?.addEventListener("click", async ()=>{
      if (audio.paused) await playCurrent();
      else { audio.pause(); setPlayingUI(false); }
    });
    $(".vinyl-wrap")?.addEventListener("click", ()=> playBtn?.click());

    nextBtn?.addEventListener("click", async ()=>{
      index = isShuffle
        ? Math.floor(Math.random() * GENRE_ORDER.length)
        : (index + 1) % GENRE_ORDER.length;

      applyTrackByIndex(index);
      await playCurrent();
    });

    prevBtn?.addEventListener("click", async ()=>{
      if (audio.currentTime > 3){ audio.currentTime = 0; return; }

      index = (index - 1 + GENRE_ORDER.length) % GENRE_ORDER.length;
      applyTrackByIndex(index);
      await playCurrent();
    });

    shuffleBtn?.addEventListener("click", ()=>{
      isShuffle=!isShuffle;
      shuffleBtn.setAttribute("aria-pressed", String(isShuffle));
    });

    repeatBtn?.addEventListener("click", ()=>{
      isRepeat=!isRepeat;
      repeatBtn.setAttribute("aria-pressed", String(isRepeat));
    });

    // audio events
    audio.addEventListener("play",  ()=> setPlayingUI(true));
    audio.addEventListener("pause", ()=> setPlayingUI(false));
    audio.addEventListener("loadedmetadata", ()=>{
      if (seek) seek.max = audio.duration || 100;
      if (durationEl) durationEl.textContent = fmt(audio.duration);
      if (currentEl)  currentEl.textContent  = fmt(audio.currentTime);
    });
    audio.addEventListener("timeupdate", ()=>{
      if(seek && !seeking) seek.value = audio.currentTime;
      if (currentEl) currentEl.textContent = fmt(audio.currentTime);
      const pct = (audio.currentTime/(audio.duration||1))*100;
      if (seek) seek.style.setProperty("--p", pct + "%");
    });
    audio.addEventListener("ended", ()=>{
      if (isRepeat){
        audio.currentTime=0;
        audio.play().catch(()=>{});
      } else {
        nextBtn?.click();
      }
    });

    // seek
    seek?.addEventListener("input", ()=>{
      seeking=true;
      const pct=(seek.value/(audio.duration||1))*100;
      seek.style.setProperty("--p", pct+"%");
    });
    seek?.addEventListener("change", ()=>{
      audio.currentTime = +seek.value;
      seeking=false;
    });

    // keyboard
    window.addEventListener("keydown",(e)=>{
      const tag=(document.activeElement?.tagName||"");
      if(/input|textarea|select/i.test(tag)) return;
      if(e.code==="Space"){ e.preventDefault(); playBtn?.click(); }
      if(e.code==="ArrowRight") audio.currentTime=Math.min((audio.currentTime||0)+5, audio.duration||0);
      if(e.code==="ArrowLeft")  audio.currentTime=Math.max((audio.currentTime||0)-5, 0);
    });

    // footer year
    const yr=document.querySelector("#yr");
    if (yr) yr.textContent=new Date().getFullYear();
  }catch(e){
    console.error(e);
  }
})();


/* ============================ MY WRAP: COUNT-UP ON SCROLL ============================ */
(() => {
  const counters = document.querySelectorAll('#my_wrap [data-counter]');
  if (!counters.length) return;

  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  const fmt = (n, d=0) =>
    n.toLocaleString(undefined, { minimumFractionDigits:d, maximumFractionDigits:d });

  function runCounter(el){
    if (el.dataset.started) return; // run once
    el.dataset.started = '1';

    const target   = parseFloat(el.dataset.target || '0');
    const divide   = parseFloat(el.dataset.divide || '1'); // show 150000 as 150k
    const dur      = parseInt(el.dataset.duration || '1600', 10);
    const decimals = parseInt(el.dataset.decimals || '0', 10);

    const final = target / divide;

    if (matchMedia('(prefers-reduced-motion: reduce)').matches){
      el.textContent = fmt(final, decimals);
      return;
    }

    const start = performance.now();
    function tick(now){
      const t = Math.min(1, (now - start) / dur);
      const val = final * easeOutCubic(t);
      el.textContent = fmt(val, decimals);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = fmt(final, decimals);
    }
    requestAnimationFrame(tick);
  }

  const section = document.querySelector('#my_wrap');
  if (!section) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting){
        counters.forEach(runCounter);
        io.disconnect(); // only once
      }
    });
  }, { threshold: 0.35, rootMargin: '0px 0px -10% 0px' });

  io.observe(section);
})();


/* ============================ PROJECTS: REVEAL ON SCROLL ============================ */
(() => {
  const items = document.querySelectorAll('.project[data-reveal]');
  if (!items.length) return;

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if (e.isIntersecting){
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.25, rootMargin: '0px 0px -8% 0px' });

  items.forEach(i => io.observe(i));
})();


/* ============================ GENRE SEARCH (SUGGEST + VALIDATE) ============================ */
const GENRES = [
  "R&B",
  "Hip Hop",
  "Pop",
  "Classical",
  "Jazz",
  "Rock",
  "Indie",
  "Electronic",
  "EDM",
  "Lo-Fi",
  "Ambient",
  "Soul",
  "Funk",
  "Acoustic",
  "Instrumental",
  "Chill",
  "House",
  "Techno",
  "Latin",
  "K-Pop"
];

const TOP_GENRES = ["Lo-Fi", "Pop", "R&B"];

const input = document.getElementById("songQuery");
const suggestBox = document.getElementById("songSuggest");
const form = document.getElementById("songSearch");

function normalize(str) {
  return String(str || "").toLowerCase().replace(/\s|-/g, "");
}

function renderSuggestions(list) {
  if (!suggestBox) return;
  suggestBox.innerHTML = "";
  list.forEach((genre) => {
    const item = document.createElement("div");
    item.className = "suggest-item";
    item.textContent = genre;
    item.addEventListener("click", () => {
      if (input) input.value = genre;
      suggestBox.innerHTML = "";
      if (typeof window.playGenre === "function") window.playGenre(genre);
    });
    suggestBox.appendChild(item);
  });
}

function showError() {
  if (!suggestBox) return;
  suggestBox.innerHTML = `
    <div class="error-msg">
      Sorry, your tracklist is not available.
    </div>
  `;
}

if (input && form && suggestBox){
  input.addEventListener("focus", () => {
    const value = input.value.trim();
    if (!value) renderSuggestions(TOP_GENRES);
  });

  input.addEventListener("input", () => {
    const value = input.value.trim();

    if (!value) {
      suggestBox.innerHTML = "";
      return;
    }

    const matches = GENRES.filter((g) =>
      normalize(g).includes(normalize(value))
    );

    if (!matches.length) {
      suggestBox.innerHTML = "";
      return;
    }

    renderSuggestions(matches);
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    suggestBox.innerHTML = "";

    const value = input.value.trim();
    const match = GENRES.find(g => normalize(g) === normalize(value));

    if (!match) {
      showError();
      return;
    }

    if (typeof window.playGenre === "function") window.playGenre(match);
  });

  // close suggestion box on outside click
  document.addEventListener("pointerdown", (e) => {
    const isClickInside = form.contains(e.target) || suggestBox.contains(e.target);
    if (!isClickInside) suggestBox.innerHTML = "";
  });
}


/* ============================ SEARCH OPEN/CLOSE (LEFT HERO) ============================ */
document.addEventListener('DOMContentLoaded', () => { 
  const leftCol = document.querySelector('.hero > :first-child');
  const searchRow = document.querySelector('.song-search');
  const inputEl = document.getElementById("songQuery");
  const suggest = document.getElementById("songSuggest");

  if (!leftCol || !searchRow || !inputEl || !suggest) return;

  const open = () => leftCol.classList.add('search-open');
  const close = () => {
    leftCol.classList.remove('search-open');
    suggest.innerHTML = "";
  };

  inputEl.addEventListener('focus', () => {
    open();
    if (!inputEl.value.trim()) renderSuggestions(TOP_GENRES);
  });

  inputEl.addEventListener('input', () => open());

  // Close only when clicking outside (capture phase)
  document.addEventListener('pointerdown', (e) => {
    const t = e.target;
    if (searchRow.contains(t) || suggest.contains(t) || searchRow.matches(':focus-within')) return;
    close();
  }, true);

  // ESC closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      inputEl.blur();
      close();
    }
  });

  // Clicking an item should also close a moment later (so it feels responsive)
  suggest.addEventListener('click', (e) => {
    const item = e.target.closest('.suggest-item');
    if (!item) return;
    inputEl.value = item.textContent.trim();
    if (typeof window.playGenre === "function") window.playGenre(inputEl.value);
    setTimeout(close, 120);
    inputEl.focus();
  });
});


/* ============================ EXPERIENCE: REVEAL ON SCROLL ============================ */
(() => {
  const items = document.querySelectorAll(".xp-item");
  if (!items.length) return;

  items.forEach((el, i) => el.style.setProperty("--d", i));

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.2, rootMargin: "0px 0px -10% 0px" });

  items.forEach((el) => io.observe(el));
})();
/* ============================ CAROUSEL CONTROLS ============================ */

const leftBtn = document.querySelector('.carousel-control.left');
const rightBtn = document.querySelector('.carousel-control.right');
const carouselInner = document.querySelector('.carousel-inner');
const totalItems = document.querySelectorAll('.carousel-item').length;
let currentIndex = 0;

function updateCarousel() {
  carouselInner.style.transform = `translateX(-${currentIndex * 100}%)`;
}

leftBtn.addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex--;
  } else {
    currentIndex = totalItems - 1; // Loop to the last item
  }
  updateCarousel();
});

rightBtn.addEventListener('click', () => {
  if (currentIndex < totalItems - 1) {
    currentIndex++;
  } else {
    currentIndex = 0; // Loop to the first item
  }
  updateCarousel();
});
/* ============================ END OF CAROUSEL CONTROLS ============================ */
