/* ============================ SAFE SPLASH ============================ */
/* Advances every 3s, Skip works, and it can NEVER trap the page.      */
(function splashSafe(){
  function run(){
    const intro = document.getElementById("intro");
    if (!intro) return; // nothing to do

    const word = document.getElementById("introWord");
    const sub  = document.getElementById("introSub");
    const skip = document.getElementById("introSkip");

    // Show splash on every visit (simplest + least error-prone).
    // If you want "show once", uncomment the next 4 lines.
    // if (localStorage.getItem("introSeen") === "1" && !/[?&]intro=1/.test(location.search)) {
    //   intro.remove();
    //   return;
    // }
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
    el.classList.toggle("jp", isJP(t))  ;   // <<— applies the JP handwritten stack
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
  word.textContent = s.text;
  word.classList.toggle("script", !!s.script);
  sub.textContent = "";

  // re-trigger the blur-in animation on every slide
  word.style.animation = "none";
  // force reflow then set our blurIn
  requestAnimationFrame(() => { word.style.animation = "blurIn 900ms cubic-bezier(.2,.8,.2,1)"; });
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
      timer = setTimeout(step, 1000); // 3 seconds per word
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

/* ============================ VINYL PLAYER (LOCAL FILES) ============================ */
(function player(){
  try{
    const $ = (s, r=document)=>r.querySelector(s);
    const audio    = $("#audio");         if (!audio) return;
    const player   = $("#player");
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

    /* >>> EDIT THIS PLAYLIST with your own files <<< */
    const playlist = [
      { title: "Track One",   artist: "Vivian Le", src: "audio/track1.mp3", cover: "covers/cover1.jpg" },
      { title: "Track Two",   artist: "Vivian Le", src: "audio/track2.mp3", cover: "covers/cover2.jpg" },
      { title: "Track Three", artist: "Vivian Le", src: "audio/track3.mp3", cover: "covers/cover3.jpg" },
    ];

    

    let index=0, isShuffle=false, isRepeat=false, seeking=false, noteTimer=null;

    const fmt = (sec)=>!isFinite(sec)?"0:00":`${Math.floor(sec/60)}:${String(Math.floor(sec%60)).padStart(2,"0")}`;

    function setPlayingUI(on){
      player.classList.toggle("is-playing", on);
      vinyl.classList.toggle("spinning", on);
      if (on) startNotes(); else stopNotes();
      playBtn.setAttribute("aria-label", on ? "Pause" : "Play");
    }

    function loadTrack(k){
      const t = playlist[k]; if(!t) return;
      titleEl.textContent  = t.title;
      artistEl.textContent = t.artist;
      if (t.cover) coverEl.src = t.cover;
      audio.src = t.src;
      audio.load();
      seek.style.setProperty("--p","0%");
    }

    // music notes
    const glyphs=["♪","♫","♬","♩"];
    function spawnNote(){
      const el=document.createElement("span");
      el.className="note";
      el.textContent=glyphs[(Math.random()*glyphs.length)|0];
      el.style.fontSize=(14+Math.random()*10)+"px";
      const R=(notesEl.clientWidth||200)*0.36, a=Math.random()*Math.PI*2;
      const x0=Math.cos(a)*R, y0=Math.sin(a)*R, dx=Math.cos(a)*48, dy=Math.sin(a)*48-12;
      el.style.setProperty("--x0",x0+"px"); el.style.setProperty("--y0",y0+"px");
      el.style.setProperty("--dx",dx+"px"); el.style.setProperty("--dy",dy+"px");
      notesEl.appendChild(el); el.addEventListener("animationend",()=>el.remove());
    }
    function startNotes(){ if(noteTimer) return; spawnNote(); noteTimer=setInterval(spawnNote,650); }
    function stopNotes(){ clearInterval(noteTimer); noteTimer=null; }

    // init
    loadTrack(index);

    // controls
    playBtn.addEventListener("click", async ()=>{
      if (audio.paused) { try{ await audio.play(); } catch { setPlayingUI(true); } }
      else { audio.pause(); setPlayingUI(false); }
    });
    $(".vinyl-wrap")?.addEventListener("click", ()=> playBtn.click());

    nextBtn.addEventListener("click", async ()=>{
      index = isShuffle ? Math.floor(Math.random()*playlist.length) : (index+1)%playlist.length;
      loadTrack(index);
      try{ await audio.play(); } catch { setPlayingUI(true); }
    });
    prevBtn.addEventListener("click", async ()=>{
      if (audio.currentTime > 3){ audio.currentTime = 0; return; }
      index = (index-1+playlist.length)%playlist.length;
      loadTrack(index);
      try{ await audio.play(); } catch { setPlayingUI(true); }
    });
    shuffleBtn.addEventListener("click", ()=>{ isShuffle=!isShuffle; shuffleBtn.setAttribute("aria-pressed", String(isShuffle)); });
    repeatBtn.addEventListener("click",  ()=>{ isRepeat=!isRepeat;  repeatBtn.setAttribute("aria-pressed", String(isRepeat));  });

    // audio events
    audio.addEventListener("play",  ()=> setPlayingUI(true));
    audio.addEventListener("pause", ()=> setPlayingUI(false));
    audio.addEventListener("loadedmetadata", ()=>{
      seek.max = audio.duration || 100;
      durationEl.textContent = fmt(audio.duration);
      currentEl.textContent  = fmt(audio.currentTime);
    });
    audio.addEventListener("timeupdate", ()=>{
      if(!seeking) seek.value = audio.currentTime;
      currentEl.textContent = fmt(audio.currentTime);
      const pct = (audio.currentTime/(audio.duration||1))*100;
      seek.style.setProperty("--p", pct + "%");
    });
    audio.addEventListener("ended", ()=>{
      if (isRepeat){ audio.currentTime=0; audio.play().catch(()=>{}); }
      else nextBtn.click();
    });

    // seek
    seek.addEventListener("input", ()=>{ seeking=true; const pct=(seek.value/(audio.duration||1))*100; seek.style.setProperty("--p", pct+"%"); });
    seek.addEventListener("change", ()=>{ audio.currentTime = +seek.value; seeking=false; });

    // keyboard
    window.addEventListener("keydown",(e)=>{
      const tag=(document.activeElement?.tagName||"");
      if(/input|textarea|select/i.test(tag)) return;
      if(e.code==="Space"){ e.preventDefault(); playBtn.click(); }
      if(e.code==="ArrowRight") audio.currentTime=Math.min((audio.currentTime||0)+5, audio.duration||0);
      if(e.code==="ArrowLeft")  audio.currentTime=Math.max((audio.currentTime||0)-5, 0);
    });

    // footer year
    const yr=document.querySelector("#yr"); if (yr) yr.textContent=new Date().getFullYear();
  }catch(e){
    // Never let a player error break the page
    console.error(e);
  }
})();

// ---------- My Wrap: count-up on scroll ----------
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

  // Start when the section is scrolled into view
  const section = document.querySelector('#my_wrap');
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



