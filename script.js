// NPC movement: two avatars follow short adjustable routes and swap sprites when moving left/right
// Configure NPCs here: adjust `route` arrays to limit where they walk.
const npcConfigs = [
  {
    elId: 'avatar',
    // small route segment (edit these coordinates to change the area the NPC walks)
    route: [ {x:260, y:300}, {x:340, y:270} ],
    speed: 20,
    sprites: {
      left: 'images/avatar-left.png',
      right: 'images/avatar-right.png',
      default: 'images/avatar.png'
    }
  },
  {
    elId: 'avatar2',
    route: [ {x:450, y:490}, {x:480, y:460} ],
    speed: 15,
    sprites: {
      left: 'images/avatar2-left.png',
      right: 'images/avatar2-right.png',
      default: 'images/avatar2.png'
    }
  }
];

function startNPCFromConfig(cfg) {
  const element = document.getElementById(cfg.elId);
  if (!element || !cfg.route || cfg.route.length < 2) return;

  // set default sprite if provided
  if (cfg.sprites && cfg.sprites.default) element.src = cfg.sprites.default;

  let idx = 0;
  let x = cfg.route[0].x;
  let y = cfg.route[0].y;
  element.style.left = Math.round(x) + 'px';
  element.style.top = Math.round(y) + 'px';

  let lastTs = null;

  function step(ts) {
    if (!lastTs) lastTs = ts;
    const dt = (ts - lastTs) / 1000; // seconds
    lastTs = ts;

    const target = cfg.route[(idx + 1) % cfg.route.length];
    const dx = target.x - x;
    const dy = target.y - y;
    const dist = Math.hypot(dx, dy);

    if (dist < 0.5) {
      idx = (idx + 1) % cfg.route.length;
      x = target.x; y = target.y;
      element.style.left = Math.round(x) + 'px';
      element.style.top = Math.round(y) + 'px';
      requestAnimationFrame(step);
      return;
    }

    const move = cfg.speed * dt;
    const ratio = Math.min(1, move / dist);
    const nx = x + dx * ratio;
    const ny = y + dy * ratio;

    // Determine facing based on horizontal movement
    const horiz = nx - x;
    if (cfg.sprites) {
      if (horiz < -0.1 && cfg.sprites.left) element.src = cfg.sprites.left;
      else if (horiz > 0.1 && cfg.sprites.right) element.src = cfg.sprites.right;
      else if (cfg.sprites.default) element.src = cfg.sprites.default;
    }

    x = nx; y = ny;
    element.style.left = Math.round(x) + 'px';
    element.style.top = Math.round(y) + 'px';

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// start all configured NPCs
// NPC movement disabled for now — keep NPCs static at their CSS starting positions.
// To re-enable movement, uncomment the line below.
// npcConfigs.forEach(startNPCFromConfig);

// --- NPC dialogue bubbles: alternate dialogue every 30s ---
document.addEventListener('DOMContentLoaded', () => {
  const bubbleA = document.getElementById('bubble-avatar');
  const bubbleB = document.getElementById('bubble-avatar2');
  const avatarEl = document.getElementById('avatar');
  const avatar2El = document.getElementById('avatar2');

  if (!bubbleA || !bubbleB || !avatarEl || !avatar2El) return;

  const dialoguesA = [
    "Lovely day for a read!",
    "Currently reading 'My Brilliant Friend'",
    "Can't wait to start my DPhil!",
    "I recommend the mystery shelf."
  ];

  const dialoguesB = [
    "Quiet please — I've got a biography to read.",
    "I'm definitely punching!",
    "This aisle has rare editions.",
    "Grab a tea and enjoy the book." 
  ];

  let idxA = 0;
  let idxB = 0;

  function positionBubble(bubble, avatarEl) {
    const bx = avatarEl.offsetLeft + (avatarEl.offsetWidth / 2);
    const by = avatarEl.offsetTop; // place bubble above top
    bubble.style.left = Math.round(bx) + 'px';
    bubble.style.top = Math.round(by) + 'px';
  }

  function showBubble(bubble, text, avatarEl, duration = 5000) {
    bubble.textContent = text;
    positionBubble(bubble, avatarEl);
    bubble.style.display = 'block';
    // hide after duration
    setTimeout(() => { bubble.style.display = 'none'; }, duration);
  }

  function cycleDialogues() {
    showBubble(bubbleA, dialoguesA[idxA], avatarEl);
    showBubble(bubbleB, dialoguesB[idxB], avatar2El);
    idxA = (idxA + 1) % dialoguesA.length;
    idxB = (idxB + 1) % dialoguesB.length;
  }

    // schedule B: start 10s after A, then repeat every 30s (keeps them staggered)
    setTimeout(() => {
      showBubble(bubbleB, dialoguesB[idxB], avatar2El);
      idxB = (idxB + 1) % dialoguesB.length;
      setInterval(() => {
        showBubble(bubbleB, dialoguesB[idxB], avatar2El);
        idxB = (idxB + 1) % dialoguesB.length;
      }, 30000);
    }, 17800);
  
    // initial show
    // cycleDialogues();
    // every 30 seconds
    setInterval(cycleDialogues, 30000);

  // reposition bubbles if window resizes (still static avatars)
  window.addEventListener('resize', () => {
    positionBubble(bubbleA, avatarEl);
    positionBubble(bubbleB, avatar2El);
  });
});

// --- Hotspot popups for objects in the bookshop ---
document.addEventListener('DOMContentLoaded', () => {
  const bookshop = document.getElementById('bookshop');
  if (!bookshop) return;

  // Configure hotspots here: x,y,w,h are pixels relative to #bookshop
  // image: path to book image, text: initial caption
  const hotspots = [
    { id: 'obj2', x: 270, y: 250, w: 30, h: 30, image: 'images/book.png', text: "Dear diary, I miss my boyfriend." },
    { id: 'obj3', x: 260, y: 485, w: 30, h: 30, image: 'images/book.png', text: "Boston 2025 Scrapbook!" },
    { id: 'obj4', x: 140, y: 170, w: 30, h: 30},
    { id: 'obj5', x: 470, y: 260, w: 30, h: 30, image: 'images/book.png', text: "The Digital Divide in Education: Investigating the Effect of Poor Internet Connectivity on Post-COVID Educational Outcomes" },
    { id: 'obj6', x: 340, y: 70, w: 10, h: 30, text: "BOOM" },
    { id: 'obj7', x: 140, y: 510, w: 30, h: 30, text: "ZZZ" }
];

  hotspots.forEach(cfg => {
    // create hotspot element
    const hs = document.createElement('div');
    hs.className = 'hotspot';
    hs.dataset.id = cfg.id;
    hs.style.left = cfg.x + 'px';
    hs.style.top = cfg.y + 'px';
    hs.style.width = cfg.w + 'px';
    hs.style.height = cfg.h + 'px';

    // Only create hotspot and open full-screen modal on click (no hover popup)
    bookshop.appendChild(hs);

    function openObjectModal() {
      const modal = document.createElement('div');
      modal.className = 'object-modal';

      const inner = document.createElement('div');
      inner.className = 'modal-inner';

      const wrapper = document.createElement('div');
      wrapper.className = 'overlay';

      const bigImg = document.createElement('img');
      bigImg.src = cfg.image;
      bigImg.alt = cfg.id;
      wrapper.appendChild(bigImg);

      // non-editable fixed text overlay
      const overlayText = document.createElement('div');
      overlayText.className = 'overlay-text';
      overlayText.textContent = cfg.text || '';
      wrapper.appendChild(overlayText);

      inner.appendChild(wrapper);
      modal.appendChild(inner);
      document.body.appendChild(modal);

      function closeModal() {
        // do not modify cfg.text here since text is fixed (read-only)
        if (document.body.contains(modal)) document.body.removeChild(modal);
      }

      // close when clicking outside inner
      modal.addEventListener('click', (ev) => {
        if (ev.target === modal) closeModal(true);
      });

      // pressing Escape closes
      document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
          closeModal();
          document.removeEventListener('keydown', escHandler);
        }
      });
    }

    hs.addEventListener('click', () => {
      if (cfg.id === 'obj4') {
        // open Wordle game (modal inserted in HTML)
        if (typeof openWordleGame === 'function') openWordleGame();
      } else if (cfg.id === 'obj6') {
        // boom sparkle animation: position inside #bookshop
        const bx = cfg.x + (cfg.w || 0) / 2;
        const by = cfg.y + (cfg.h || 0) / 2;
        createBoomAnimation(bookshop, bx, by, cfg.text);
      } else if (cfg.id === 'obj7') {
        // dog sleeping: floating "zzzz" text
        const bx = cfg.x + (cfg.w || 0) / 2;
        const by = cfg.y + (cfg.h || 0) / 2;
        createFloatingText(bookshop, bx, by, cfg.text || 'zzzz');
      } else {
        openObjectModal();
      }
    });
  });

  // createBoomAnimation: append DOM sparkles/flash/text inside the given container
  function createBoomAnimation(containerEl, x, y, label) {
    // containerEl is the #bookshop element (position: relative)
    const wrapperLeft = x;
    const wrapperTop = y;

    const sparkleContainer = document.createElement('div');
    sparkleContainer.className = 'sparkle-container';
    sparkleContainer.style.left = (wrapperLeft) + 'px';
    sparkleContainer.style.top = (wrapperTop) + 'px';
    containerEl.appendChild(sparkleContainer);

    const flash = document.createElement('div');
    flash.className = 'flash-overlay';
    flash.style.left = (wrapperLeft - 100) + 'px';
    flash.style.top = (wrapperTop - 100) + 'px';
    flash.style.width = '200px';
    flash.style.height = '200px';
    containerEl.appendChild(flash);

    const boomText = document.createElement('div');
    boomText.className = 'boom-text';
    boomText.textContent = label || 'BOOM!';
    // center the text on the hotspot
    boomText.style.left = wrapperLeft + 'px';
    boomText.style.top = wrapperTop + 'px';
    containerEl.appendChild(boomText);

    const numSparkles = 20;
    for (let i = 0; i < numSparkles; i++) {
      const sparkle = document.createElement('div');
      const angle = (Math.PI * 2 * i) / numSparkles;
      const distance = 30 + Math.random() * 60;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      sparkle.className = i % 3 === 0 ? 'sparkle star' : 'sparkle';
      sparkle.style.setProperty('--tx', tx + 'px');
      sparkle.style.setProperty('--ty', ty + 'px');
      sparkle.style.animationDelay = (Math.random() * 0.15) + 's';
      sparkleContainer.appendChild(sparkle);
    }

    // some extra random sparkles
    for (let i = 0; i < 12; i++) {
      const sparkle = document.createElement('div');
      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * 80;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      sparkle.className = 'sparkle';
      sparkle.style.setProperty('--tx', tx + 'px');
      sparkle.style.setProperty('--ty', ty + 'px');
      sparkle.style.animationDelay = (Math.random() * 0.25) + 's';
      sparkleContainer.appendChild(sparkle);
    }

    // cleanup
    setTimeout(() => {
      if (sparkleContainer && sparkleContainer.parentNode) sparkleContainer.parentNode.removeChild(sparkleContainer);
      if (flash && flash.parentNode) flash.parentNode.removeChild(flash);
      if (boomText && boomText.parentNode) boomText.parentNode.removeChild(boomText);
    }, 1200);
  }

  // createFloatingText: shows a small floating 'zzzz' (or provided text) that drifts up and fades
  function createFloatingText(containerEl, x, y, text) {
    const floatEl = document.createElement('div');
    floatEl.className = 'floating-text';
    floatEl.textContent = text || 'zzzz';
    // position relative to container
    floatEl.style.left = x + 'px';
    floatEl.style.top = y + 'px';
    containerEl.appendChild(floatEl);

    // remove after animation
    const duration = 2000; // ms
    setTimeout(() => {
      if (floatEl && floatEl.parentNode) floatEl.parentNode.removeChild(floatEl);
    }, duration + 200);
  }
});

// Welcome modal behavior: require secret password to enter
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('welcome-modal');
  const enterBtn = document.getElementById('enter-btn');
  const passwordInput = document.getElementById('Narnia');
  const errorEl = document.getElementById('password-error');

  // Change this value to set the secret password
  const SECRET_PASSWORD = 'Narnia';

  if (!modal || !enterBtn || !passwordInput) return;

  function showError(msg) {
    if (errorEl) errorEl.textContent = msg || 'Incorrect password';
    const content = modal.querySelector('.modal-content');
    if (!content) return;
    content.classList.remove('shake');
    // trigger reflow to restart animation
    void content.offsetWidth;
    content.classList.add('shake');
  }

  function accept() {
    modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
    if (errorEl) errorEl.textContent = '';
    passwordInput.value = '';
  }

  enterBtn.addEventListener('click', () => {
    // const val = (passwordInput.value || '').trim();
    // if (val === SECRET_PASSWORD) {
      accept();
    // } else {
    //   showError('Incorrect password');
    // }
  });

  passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') enterBtn.click();
  });
});

// Wordle game module: initializes the modal added to Website.html
document.addEventListener('DOMContentLoaded', () => {
  // keep Wordle state scoped inside this module
  const modal = document.getElementById('wordle-modal');
  const gridEl = document.getElementById('wordle-grid');
  const keyboardEl = document.getElementById('wordle-keyboard');
  const messageEl = document.getElementById('wordle-message');
  const closeBtn = document.getElementById('close-wordle');
  const resetBtn = document.getElementById('reset-wordle');

  if (!modal || !gridEl || !keyboardEl || !messageEl || !closeBtn || !resetBtn) return;

  const WORD_LIST = ['LOVEU','DREAM','HELLO','FLAME','HENRY','BITCH'];
  let targetWord = '';
  let currentRow = 0;
  let currentGuess = '';
  let gameOver = false;
  const MAX_GUESSES = 6;
  const keyStates = {};

  const keyboard = [
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L'],
    ['ENTER','Z','X','C','V','B','N','M','BACK']
  ];

  function openWordleGame() {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    initGame();
  }

  function closeWordleGame() {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }

  function initGame() {
    targetWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    currentRow = 0; currentGuess = ''; gameOver = false; messageEl.textContent = '';
    Object.keys(keyStates).forEach(k => delete keyStates[k]);
    createGrid(); createKeyboard();
  }

  function createGrid() {
    gridEl.innerHTML = '';
    for (let r=0;r<MAX_GUESSES;r++){
      const row = document.createElement('div'); row.className='wordle-row';
      for (let c=0;c<5;c++){ const tile = document.createElement('div'); tile.className='wordle-tile'; tile.id = `tile-${r}-${c}`; row.appendChild(tile); }
      gridEl.appendChild(row);
    }
  }

  function createKeyboard(){
    keyboardEl.innerHTML = '';
    keyboard.forEach(row=>{
      const rowEl = document.createElement('div'); rowEl.className='keyboard-row';
      row.forEach(k=>{
        const kEl = document.createElement('button'); kEl.className='key'; kEl.textContent = k;
        if (k==='ENTER' || k==='BACK') kEl.classList.add('wide');
        if (keyStates[k]) kEl.classList.add(keyStates[k]);
        kEl.addEventListener('click', ()=> handleKey(k));
        rowEl.appendChild(kEl);
      }); keyboardEl.appendChild(rowEl);
    });
  }

  function handleKey(key){
    if (gameOver) return;
    if (key==='BACK'){
      if (currentGuess.length>0){ currentGuess = currentGuess.slice(0,-1); updateCurrentRow(); }
    } else if (key==='ENTER'){
      if (currentGuess.length===5) submitGuess();
    } else {
      if (currentGuess.length<5){ currentGuess += key; updateCurrentRow(); }
    }
  }

  function updateCurrentRow(){
    for (let i=0;i<5;i++){ const tile = document.getElementById(`tile-${currentRow}-${i}`); tile.textContent = currentGuess[i]||''; tile.className = 'wordle-tile'+(currentGuess[i]?' filled':''); }
  }

  function submitGuess(){
    const guess = currentGuess;
    const result = checkGuess(guess);
    for (let i=0;i<5;i++){ const tile = document.getElementById(`tile-${currentRow}-${i}`); setTimeout(()=>{ tile.classList.add(result[i]); }, i*120); }
    updateKeyboard(guess,result);
    if (guess === targetWord){ setTimeout(()=>{ messageEl.textContent = '🎉 You won! 🎉'; gameOver = true; }, 500); }
    else if (currentRow === MAX_GUESSES-1){ setTimeout(()=>{ messageEl.textContent = `Game Over! Word was: ${targetWord}`; gameOver = true; }, 500); }
    else { currentRow++; currentGuess=''; }
  }

  function checkGuess(guess){
    const result = Array(5).fill('absent');
    const targetLetters = targetWord.split('');
    const guessLetters = guess.split('');
    for (let i=0;i<5;i++){ if (guessLetters[i]===targetLetters[i]){ result[i]='correct'; targetLetters[i]=null; } }
    for (let i=0;i<5;i++){ if (result[i] === 'absent' && targetLetters.includes(guessLetters[i])){ result[i]='present'; targetLetters[targetLetters.indexOf(guessLetters[i])] = null; } }
    return result;
  }

  function updateKeyboard(guess,result){
    for (let i=0;i<5;i++){ const letter = guess[i]; const state = result[i]; if (!keyStates[letter] || (keyStates[letter]==='absent' && state!=='absent') || (keyStates[letter]==='present' && state==='correct')){ keyStates[letter]=state; } }
    createKeyboard();
  }

  // wire buttons and keyboard events
  closeBtn.addEventListener('click', closeWordleGame);
  resetBtn.addEventListener('click', initGame);
  document.addEventListener('keydown', (e)=>{ if (modal.classList.contains('hidden')) return; const k = e.key.toUpperCase(); if (k==='ENTER') handleKey('ENTER'); else if (k==='BACKSPACE') handleKey('BACK'); else if (/^[A-Z]$/.test(k)) handleKey(k); });

  // expose openWordleGame globally for hotspot handler
  window.openWordleGame = openWordleGame;
});

