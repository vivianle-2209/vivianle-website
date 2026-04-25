/* ============================ OPTION B: GLITCH-TO-REVEAL SPLASH ============================ */
(function splashSafe(){
  function run(){
    const intro       = document.getElementById("intro");
    if (!intro) return;

    const taglineEl   = document.getElementById("introTagline");
    const headlineEl  = document.getElementById("introHeadline");
    const particlesEl = document.getElementById("introParticles");
    const skip        = document.getElementById("introSkip");

    /* ---- hero greeting rotator (unchanged) ---- */
    (function greetInline(){
      const el = document.getElementById("greetWord");
      if(!el) return;
      const words = ["Xin chào","Hello","こんにちは","你好","Bonjour","Hola","Ciao","안녕하세요","Hallo","Olá","مرحبا","नमस्ते","สวัสดี","Hej","Salve","Szia","Ahoj","Halo"];
      const isJP = s => /[぀-ヿㇰ-ㇿｦ-ﾟ]/.test(s);
      let i = 0;
      function show(){
        el.classList.remove("visible");
        setTimeout(() => {
          const t = words[i++ % words.length];
          el.textContent = t;
          el.classList.toggle("jp", isJP(t));
          el.classList.add("visible");
        }, 320);
      }
      show(); setInterval(show, 2800);
    })();

    document.body.classList.add("no-scroll");

    const TAG_CHARS  = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%*+=~<>";
    const HEAD_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    /* ---- build scrambling character spans ---- */
    function buildGlitch(el, text, charset){
      if(!el) return { items:[], stop:()=>{} };
      el.innerHTML = "";
      const items = [];
      let charIdx = 0;

      [...text].forEach(ch => {
        const span = document.createElement("span");
        span.className = "glitch-char";
        if(ch === " "){
          span.style.cssText = "display:inline-block;width:0.28em;";
          span.textContent = " ";
          items.push({ span, real:ch, locked:true });
        } else {
          span.style.setProperty("--i", charIdx++);
          span.textContent = charset[Math.floor(Math.random() * charset.length)];
          items.push({ span, real:ch, locked:false });
        }
        el.appendChild(span);
      });

      const iv = setInterval(()=>{
        items.forEach(item=>{
          if(!item.locked)
            item.span.textContent = charset[Math.floor(Math.random() * charset.length)];
        });
      }, 48);

      return { items, stop:()=>clearInterval(iv) };
    }

    /* ---- lock characters in one by one ---- */
    function lockLine(items, stop, interval, onDone){
      const queue = items.filter(i => !i.locked);
      let idx = 0;
      function next(){
        if(idx >= queue.length){ stop(); onDone && onDone(); return; }
        const item = queue[idx++];
        item.span.textContent = item.real;
        item.span.classList.add("locked");
        item.locked = true;
        setTimeout(next, interval + Math.random() * 22);
      }
      next();
    }

    /* ---- sparkle burst per character ---- */
    function spawnFireworks(headEl, container) {
      if (!container || !headEl) return;
      const cRect  = container.getBoundingClientRect();
      const chars  = [...headEl.querySelectorAll('.glitch-char.locked')].filter(
        ch => ch.style.getPropertyValue('--i') !== ''
      );
      const COLORS = ["#e78ea6","#ffd7e8","#ff9dc4","#fff","#ffb3ce","#ffe0ef"];
      const GLYPHS = ["✶","✷","★","♥","♡","♪","♫","♬"];

      chars.forEach((ch, ci) => {
        const r  = ch.getBoundingClientRect();
        const cx = r.left - cRect.left + r.width  * 0.5;
        const cy = r.top  - cRect.top  + r.height * 0.5;

        for (let p = 0; p < 5; p++) {
          const spark = document.createElement("span");
          const ang  = (p / 5) * Math.PI * 2 + Math.random() * 0.8;
          const dist = 55 + Math.random() * 80;

          spark.style.left = cx + "px";
          spark.style.top  = cy + "px";
          spark.style.animationDelay    = (ci * 40 + Math.random() * 120) + "ms";
          spark.style.animationDuration = (0.8 + Math.random() * 0.5) + "s";
          spark.style.setProperty("--sx", Math.cos(ang) * dist + "px");
          spark.style.setProperty("--sy", Math.sin(ang) * dist + "px");

          if (p < 3) {
            spark.className = "intro-spark star";
            spark.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            spark.style.color = COLORS[Math.floor(Math.random() * COLORS.length)];
            spark.style.fontSize = (10 + Math.random() * 8) + "px";
          } else {
            spark.className = "intro-spark";
            const sz = (3 + Math.random() * 5) + "px";
            spark.style.width = sz; spark.style.height = sz;
            spark.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
          }
          container.appendChild(spark);
        }
      });
    }

    /* ---- finish / skip ---- */
    let autoTimer;
    function finish(){
      clearTimeout(autoTimer);
      intro.classList.add("hidden");
      document.body.classList.remove("no-scroll");
      try { localStorage.setItem("introSeen","1"); } catch{}
      setTimeout(()=>intro.remove(), 650);
    }

    /* ---- sequence ---- */
    const tag  = buildGlitch(taglineEl,  "Welcome to",     TAG_CHARS);
    const head = buildGlitch(headlineEl, "Vivian's World.", HEAD_CHARS);

    setTimeout(()=>{
      lockLine(tag.items, tag.stop, 58, ()=>{
        setTimeout(()=>{
          lockLine(head.items, head.stop, 88, ()=>{
            headlineEl && headlineEl.classList.add("bloomed");
            spawnFireworks(headlineEl, particlesEl);
            autoTimer = setTimeout(finish, 1800);
          });
        }, 180);
      });
    }, 350);

    const skipAll = e => { if(e) e.stopPropagation(); finish(); };
    if(skip) skip.addEventListener("click", skipAll);
    window.addEventListener("keydown", skipAll, { once:true });

    setTimeout(()=>{ if(document.body.classList.contains("no-scroll")) finish(); }, 20000);
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", run);
  } else { run(); }
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

    const FIXED_COVER  = "covers/cover1.jpeg";
    const FIXED_ARTIST = "Vivian Le";

    const GENRE_META = {
      "R&B":         { title: "Midnight Conversations",           src: "audio/rb-midnight-conversations.mp3" },
      "Hip Hop":     { title: "Blueprints from the Concrete",     src: "audio/hiphop-blueprints-from-the-concrete.mp3" },
      "Pop":         { title: "Neon Hearts Don't Sleep",          src: "audio/pop-neon-hearts-dont-sleep.mp3" },
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

    const GENRE_ORDER = [
      "R&B","Hip Hop","Pop","Classical","Jazz","Rock","Indie","Electronic","EDM","Lo-Fi",
      "Ambient","Soul","Funk","Acoustic","Instrumental","Chill","House","Techno","Latin","K-Pop"
    ];

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
      if (titleEl)  titleEl.textContent  = meta.title;
      if (artistEl) artistEl.textContent = FIXED_ARTIST;
      if (coverEl)  coverEl.src          = FIXED_COVER;
      audio.src = meta.src;
      audio.load();
      if (seek) seek.style.setProperty("--p","0%");
    }

    async function playCurrent(){
      try { await audio.play(); }
      catch { setPlayingUI(true); }
    }

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

    applyTrackByIndex(index);

    window.playGenre = async function(genre){
      const meta = GENRE_META[genre];
      if (!meta) return;
      const i = GENRE_ORDER.indexOf(genre);
      if (i >= 0) index = i;
      applyTrackByIndex(index);
      await playCurrent();
    };

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
      if (isRepeat){ audio.currentTime=0; audio.play().catch(()=>{}); }
      else { nextBtn?.click(); }
    });

    seek?.addEventListener("input", ()=>{
      seeking=true;
      seek.style.setProperty("--p", (seek.value/(audio.duration||1))*100+"%");
    });
    seek?.addEventListener("change", ()=>{ audio.currentTime = +seek.value; seeking=false; });

    window.addEventListener("keydown",(e)=>{
      const tag=(document.activeElement?.tagName||"");
      if(/input|textarea|select/i.test(tag)) return;
      if(e.code==="Space"){ e.preventDefault(); playBtn?.click(); }
      if(e.code==="ArrowRight") audio.currentTime=Math.min((audio.currentTime||0)+5, audio.duration||0);
      if(e.code==="ArrowLeft")  audio.currentTime=Math.max((audio.currentTime||0)-5, 0);
    });

    const yr=document.querySelector("#yr");
    if (yr) yr.textContent=new Date().getFullYear();
  }catch(e){ console.error(e); }
})();


/* ============================ MY WRAP: COUNT-UP ON SCROLL ============================ */
(() => {
  const counters = document.querySelectorAll('#my_wrap [data-counter]');
  if (!counters.length) return;
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  const fmt = (n, d=0) => n.toLocaleString(undefined, { minimumFractionDigits:d, maximumFractionDigits:d });
  function runCounter(el){
    if (el.dataset.started) return;
    el.dataset.started = '1';
    const target=parseFloat(el.dataset.target||'0'), divide=parseFloat(el.dataset.divide||'1');
    const dur=parseInt(el.dataset.duration||'1600',10), decimals=parseInt(el.dataset.decimals||'0',10);
    const final = target/divide;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches){ el.textContent=fmt(final,decimals); return; }
    const start=performance.now();
    function tick(now){
      const t=Math.min(1,(now-start)/dur);
      el.textContent=fmt(final*easeOutCubic(t),decimals);
      if(t<1) requestAnimationFrame(tick); else el.textContent=fmt(final,decimals);
    }
    requestAnimationFrame(tick);
  }
  const section=document.querySelector('#my_wrap');
  if(!section) return;
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting){ counters.forEach(runCounter); io.disconnect(); } });
  },{ threshold:0.35, rootMargin:'0px 0px -10% 0px' });
  io.observe(section);
})();


/* ============================ EDUCATION: TIMELINE PANEL + REVEAL ============================ */
(() => {
  // Scroll reveal for split + trophies
  const revealEls = document.querySelectorAll('.edu-split[data-reveal], .edu-trophy[data-reveal]');
  if (revealEls.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  // Node click → swap active panel
  document.querySelectorAll('.edu-node').forEach(node => {
    node.addEventListener('click', () => {
      const targetId = node.dataset.target;
      document.querySelectorAll('.edu-node').forEach(n => n.classList.remove('active'));
      document.querySelectorAll('.edu-panel').forEach(p => p.classList.remove('active'));
      node.classList.add('active');
      const panel = document.getElementById(targetId);
      if (panel) panel.classList.add('active');
    });
  });
})();

/* ============================ PROJECTS: REVEAL ON SCROLL ============================ */
(() => {
  const items=document.querySelectorAll('.project[data-reveal]');
  if(!items.length) return;
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('is-visible'); io.unobserve(e.target); } });
  },{ threshold:0.25, rootMargin:'0px 0px -8% 0px' });
  items.forEach(i=>io.observe(i));
})();


/* ============================ GENRE SEARCH (SUGGEST + VALIDATE) ============================ */
const GENRES = [
  "R&B","Hip Hop","Pop","Classical","Jazz","Rock","Indie","Electronic","EDM","Lo-Fi",
  "Ambient","Soul","Funk","Acoustic","Instrumental","Chill","House","Techno","Latin","K-Pop"
];
const TOP_GENRES = ["Lo-Fi","Pop","R&B"];
const input=document.getElementById("songQuery");
const suggestBox=document.getElementById("songSuggest");
const form=document.getElementById("songSearch");
function normalize(str){ return String(str||"").toLowerCase().replace(/\s|-/g,""); }
function renderSuggestions(list){
  if(!suggestBox) return;
  suggestBox.innerHTML="";
  list.forEach(genre=>{
    const item=document.createElement("div");
    item.className="suggest-item"; item.textContent=genre;
    item.addEventListener("click",()=>{ if(input) input.value=genre; suggestBox.innerHTML=""; if(typeof window.playGenre==="function") window.playGenre(genre); });
    suggestBox.appendChild(item);
  });
}
function showError(){ if(suggestBox) suggestBox.innerHTML=`<div class="error-msg">Sorry, your tracklist is not available.</div>`; }
if(input && form && suggestBox){
  input.addEventListener("focus",()=>{ if(!input.value.trim()) renderSuggestions(TOP_GENRES); });
  input.addEventListener("input",()=>{
    const v=input.value.trim();
    if(!v){ suggestBox.innerHTML=""; return; }
    const m=GENRES.filter(g=>normalize(g).includes(normalize(v)));
    if(!m.length){ suggestBox.innerHTML=""; return; }
    renderSuggestions(m);
  });
  form.addEventListener("submit",e=>{
    e.preventDefault(); suggestBox.innerHTML="";
    const match=GENRES.find(g=>normalize(g)===normalize(input.value.trim()));
    if(!match){ showError(); return; }
    if(typeof window.playGenre==="function") window.playGenre(match);
  });
  document.addEventListener("pointerdown",e=>{ if(!form.contains(e.target)&&!suggestBox.contains(e.target)) suggestBox.innerHTML=""; });
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

/* ============================ MORE ABOUT ME: CENTERED CAROUSEL ============================ */
(() => {
  const carousel = document.querySelector("[data-about-carousel]");
  if (!carousel) return;

  const cards = [...carousel.querySelectorAll(".about-card")];
  const prevBtn = carousel.querySelector(".about-carousel__arrow--prev");
  const nextBtn = carousel.querySelector(".about-carousel__arrow--next");
  if (!cards.length || !prevBtn || !nextBtn) return;

  let index = Math.min(2, cards.length - 1);
  let autoTimer = null;

  function clearStates() {
    cards.forEach(card => {
      card.classList.remove("is-active", "is-near", "is-left", "is-right", "is-hidden");
      card.setAttribute("aria-hidden", "true");
    });
  }

  function updateCarousel() {
    clearStates();
    const activeCard = cards[index];
    const leftCard = cards[(index - 1 + cards.length) % cards.length];
    const rightCard = cards[(index + 1) % cards.length];
    if (!activeCard || !leftCard || !rightCard) return;

    activeCard.classList.add("is-active");
    activeCard.setAttribute("aria-hidden", "false");

    leftCard.classList.add("is-near", "is-left");
    rightCard.classList.add("is-near", "is-right");
    leftCard.setAttribute("aria-hidden", "false");
    rightCard.setAttribute("aria-hidden", "false");

    cards.forEach((card, i) => {
      card.setAttribute("aria-label", `Card ${i + 1} of ${cards.length}`);
      card.dataset.active = i === index ? "true" : "false";
      if (card !== activeCard && card !== leftCard && card !== rightCard) {
        card.classList.add("is-hidden");
      }
    });
  }

  function goTo(nextIndex) {
    index = (nextIndex + cards.length) % cards.length;
    updateCarousel();
  }

  function startAuto() {
    stopAuto();
    autoTimer = window.setInterval(() => goTo(index + 1), 5000);
  }

  function stopAuto() {
    if (autoTimer) window.clearInterval(autoTimer);
    autoTimer = null;
  }

  prevBtn.addEventListener("click", () => {
    goTo(index - 1);
    startAuto();
  });

  nextBtn.addEventListener("click", () => {
    goTo(index + 1);
    startAuto();
  });

  carousel.addEventListener("mouseenter", stopAuto);
  carousel.addEventListener("mouseleave", startAuto);
  carousel.addEventListener("focusin", stopAuto);
  carousel.addEventListener("focusout", startAuto);

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(index - 1);
      startAuto();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(index + 1);
      startAuto();
    }
  });

  cards.forEach((card, cardIndex) => {
    card.addEventListener("click", () => {
      goTo(cardIndex);
      startAuto();
    });
    card.addEventListener("focus", () => goTo(cardIndex));
  });

  updateCarousel();
  startAuto();
})();


/* ============================ EXPERIENCE: PROPORTIONAL DURATION TIMELINE ============================ */
(function buildXpTimeline() {
  const timeline = document.querySelector(".xp-timeline");
  if (!timeline) return;
  const items = [...timeline.querySelectorAll(".xp-item[data-start][data-end]")];
  if (!items.length) return;

  timeline.querySelectorAll(".xp-axis-line, .xp-year").forEach(el => el.remove());

  const PX_PER_MONTH = 52;
  const PAD_TOP = 60;
  const PAD_BOTTOM = 80;
  const CARD_GAP = 14; // px of breathing room between touching cards

  // Convert "YYYY-MM" to absolute month index
  function toM(str) {
    const [y, m] = str.split("-").map(Number);
    return y * 12 + (m - 1);
  }

  // Determine range from the data
  let minM = Infinity, maxM = -Infinity;
  items.forEach(el => {
    minM = Math.min(minM, toM(el.dataset.start));
    maxM = Math.max(maxM, toM(el.dataset.end));
  });

  const startYear = Math.floor(minM / 12);
  const endYear   = Math.floor(maxM / 12);
  const rangeEndExclusive = maxM + 1;

  // Merge all covered time ranges so we can find empty gaps between experiences
  const MAX_GAP_MONTHS = 3; // any gap longer than this is visually capped
  const allRanges = items.map(el => ({
    s: toM(el.dataset.start), e: toM(el.dataset.end) + 1
  })).sort((a, b) => a.s - b.s);
  const merged = [{ ...allRanges[0] }];
  allRanges.forEach(r => {
    const last = merged[merged.length - 1];
    if (r.s <= last.e) last.e = Math.max(last.e, r.e);
    else merged.push({ ...r });
  });

  // monthToY with gap compression:
  // months inside covered ranges → full scale
  // months inside an empty gap   → excess beyond MAX_GAP_MONTHS is squeezed out
  function monthToY(m) {
    const baseY = PAD_TOP + (rangeEndExclusive - m - 1) * PX_PER_MONTH;
    let savings = 0;
    for (let i = 1; i < merged.length; i++) {
      const gBot = merged[i - 1].e; // earlier (lower) bound of gap
      const gTop = merged[i].s;     // later  (upper) bound of gap
      const excess = Math.max(0, gTop - gBot - MAX_GAP_MONTHS);
      if (!excess) continue;
      if (m < gBot)       savings += excess * PX_PER_MONTH;                              // m is fully below gap
      else if (m < gTop)  savings += ((gTop - m) / (gTop - gBot)) * excess * PX_PER_MONTH; // m is inside gap
    }
    return baseY - savings;
  }

  timeline.style.height = (monthToY(minM) + PAD_BOTTOM) + "px";

  // Axis line — animates in when the section enters the viewport
  const axis = document.createElement("div");
  axis.className = "xp-axis-line";
  timeline.insertBefore(axis, timeline.firstChild);
  new IntersectionObserver(([e], ob) => {
    if (e.isIntersecting) { axis.classList.add("drawn"); ob.disconnect(); }
  }, { threshold: 0.05 }).observe(timeline);

  // Position each card as a true duration bar on the continuous month scale.
  items.forEach((el, i) => {
    const startM = toM(el.dataset.start);
    const endExclusive = toM(el.dataset.end) + 1; // include full end month
    el.dataset.topY = String(monthToY(endExclusive - 1));
    el.dataset.bottomY = String(monthToY(startM));
    el.style.top = `${monthToY(endExclusive - 1) + CARD_GAP / 2}px`;
    el.style.height = `${(endExclusive - startM) * PX_PER_MONTH - CARD_GAP}px`;
    el.style.setProperty("--lane-shift", "0px");
    el.style.setProperty("--d", i);

    // Duration pill
    const months = endExclusive - startM;
    const label = months === 1 ? "1 month"
                : months < 12 ? `${months} months`
                : months % 12 === 0 ? `${months / 12} yr`
                : `${Math.floor(months / 12)} yr ${months % 12} mo`;
    const pill = document.createElement("span");
    pill.className = "xp-duration";
    pill.textContent = label;
    const card = el.querySelector(".xp-card");
    if (card) card.appendChild(pill);
  });

  // Year bubbles placed on actual year boundaries so the time scale reads correctly.
  for (let yr = endYear; yr >= startYear; yr--) {
    const janMonth = yr * 12;
    const yPx = monthToY(janMonth);

    const bubble = document.createElement("div");
    bubble.className = "xp-year";
    bubble.textContent = yr;
    bubble.style.top = yPx + "px";
    timeline.appendChild(bubble);
  }

  // Scroll-reveal: slide in from the card's side
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.05, rootMargin: "0px 0px -4% 0px" });
  items.forEach(el => io.observe(el));
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


/* ============================ MOBILE NAV (HAMBURGER) ============================ */
(function mobileNav() {
  const header    = document.querySelector('header.nav');
  const hamburger = document.querySelector('.hamburger');
  const navLinks  = document.querySelector('.nav-links');
  if (!header || !hamburger || !navLinks) return;

  function close() {
    header.classList.remove('nav-open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
  function open() {
    header.classList.add('nav-open');
    hamburger.setAttribute('aria-expanded', 'true');
  }

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    header.classList.contains('nav-open') ? close() : open();
  });

  // Close when any nav link is clicked (smooth scroll then close)
  navLinks.addEventListener('click', (e) => {
    if (e.target.closest('a')) close();
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) close();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
})();
