// Update bubble text
const bubble = document.getElementById('bubble1');
if (bubble) bubble.textContent = "Reading: '1984'";

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
    "I recommend the mystery shelf."
  ];

  const dialoguesB = [
    "Quiet please — I've got a biography to read.",
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
    }, 17500);
  
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
    { id: 'obj2', x: 280, y: 250, w: 30, h: 30, image: 'images/book.png', text: "Dear diary, I miss my boyfriend." },
    { id: 'obj3', x: 260, y: 485, w: 30, h: 30, image: 'images/book.png', text: "Boston 2025 Scrapbook!" }
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
      openObjectModal();
    });
  });
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
    // password check temporarily disabled for editing — accept immediately
    accept();
  });

  passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') enterBtn.click();
  });
});

