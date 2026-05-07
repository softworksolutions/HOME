
document.addEventListener('DOMContentLoaded', () => {
  // === Login/Profile Toggle ===
  const isLoggedIn = localStorage.getItem("softwork_logged_in") === "true";
  const loginBtn = document.getElementById("login-button");
  const profileIconLink = document.getElementById("profile-icon-link");

  if (isLoggedIn) {
    if (loginBtn) loginBtn.style.display = "none";
    if (profileIconLink) profileIconLink.style.display = "inline-block";
  } else {
    if (loginBtn) loginBtn.style.display = "inline-block";
    if (profileIconLink) profileIconLink.style.display = "none";
  }

  const ghost = document.querySelector('.cursor-ghost');
  const speechBubble = ghost?.querySelector('.speech-bubble');
  const messages = [
    "Hi!", "What are you doing?", "Let's play!", "👻 Boo!",
    "Don't ignore me!", "I'm following you!", "Wanna code together?"
  ];
  let idleTimeout, messageInterval, isIdle = false;
  const now = new Date();

  if (now.getHours() >= 19 || now.getHours() <= 5) ghost?.classList.add('night');
  const costumes = ['hat', 'shades', null];
  const chosen = costumes[Math.floor(Math.random() * costumes.length)];
  if (chosen) ghost?.classList.add(chosen);

  let mouseX = 0, mouseY = 0;
  let spawn = localStorage.getItem('ghostSpawn');
  let ghostX, ghostY;
  if (spawn) {
    try {
      const { x, y } = JSON.parse(spawn);
      ghostX = x; ghostY = y;
      localStorage.removeItem('ghostSpawn');
    } catch {
      ghostX = window.innerWidth / 2; ghostY = window.innerHeight / 2;
    }
  } else {
    ghostX = window.innerWidth / 2; ghostY = window.innerHeight / 2;
  }

  let lastMoveTime = 0;
  document.addEventListener('mousemove', (e) => {
    const now = performance.now();
    if (now - lastMoveTime < 16) return; // ~60fps
    lastMoveTime = now;

    mouseX = e.clientX;
    mouseY = e.clientY;

    if (isIdle) ghost?.classList.remove('sleepy'), isIdle = false;
    clearTimeout(idleTimeout);
    idleTimeout = setTimeout(() => {
      ghost?.classList.add('sleepy'); isIdle = true;
    }, 4000);
  }, { passive: true });

  function followGhost() {
    ghostX += (mouseX - ghostX) * 0.1;
    ghostY += (mouseY - ghostY) * 0.1;
    if (ghost) {
      ghost.style.left = `${ghostX}px`;
      ghost.style.top = `${ghostY}px`;
    }
    requestAnimationFrame(followGhost);
  }

  if (window.innerWidth < 768) {
    if (ghost) ghost.style.display = "none";
  } else {
    followGhost();
  }

  setTimeout(() => {
    if (ghost && speechBubble) {
      speechBubble.textContent = "Hi there!";
      ghost.classList.add('show-bubble');
      setTimeout(() => ghost.classList.remove('show-bubble'), 2000);
    }
  }, 400);

  // === Liquid inside ghost animation (realistic physics with directional inertia) ===
  const liquidCanvas = document.getElementById("ghost-liquid");
  if (liquidCanvas) {
    const ctx = liquidCanvas.getContext("2d");

    let width = liquidCanvas.width = liquidCanvas.offsetWidth;
    let height = liquidCanvas.height = liquidCanvas.offsetHeight;

    let lastGX = ghostX;
    let lastGY = ghostY;
    let inertiaX = 0;
    let inertiaY = 0;
    let waveOffset = 0;

    const damping = 0.96; // realistic inertia decay
    const maxAmp = 18;
    const baseY = height * 0.78; // below necklace

    let splashParticles = [];

    function spawnSplash(x, y, dx, dy) {
      for (let i = 0; i < 5; i++) {
        splashParticles.push({
          x: x + Math.random() * 10 - 5,
          y: y + Math.random() * 10 - 5,
          vx: dx * (0.3 + Math.random() * 0.4),
          vy: dy * (0.3 + Math.random() * 0.4) - 1,
          radius: 1 + Math.random() * 1.5,
          alpha: 1
        });
      }
    }

    function drawSplash() {
      for (let i = 0; i < splashParticles.length; i++) {
        let p = splashParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.alpha -= 0.015;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,229,255,${p.alpha})`;
        ctx.fill();
      }
      splashParticles = splashParticles.filter(p => p.alpha > 0);
    }

    function drawLiquid() {
      ctx.clearRect(0, 0, width, height);

      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x++) {
        const directionalOffset = Math.sin((x + waveOffset) * 0.02 + inertiaX * 0.05);
        const waveY = directionalOffset * Math.abs(inertiaY) + baseY;
        ctx.lineTo(x, waveY);
      }
      ctx.lineTo(width, height);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, baseY - 40, 0, height);
      gradient.addColorStop(0, "rgba(0,229,255,0.4)");
      gradient.addColorStop(1, "rgba(0,188,212,0.9)");
      ctx.fillStyle = gradient;
      ctx.fill();

      drawSplash();
    }

    function animateLiquid() {
      const dx = ghostX - lastGX;
      const dy = ghostY - lastGY;

      inertiaX += dx * 0.4;
      inertiaY += dy * 0.3;

      inertiaX *= damping;
      inertiaY *= damping;

      if (Math.sqrt(dx * dx + dy * dy) > 2.5) {
        spawnSplash(width / 2, baseY, dx, dy);
      }

      waveOffset += 0.15;
      drawLiquid();

      lastGX = ghostX;
      lastGY = ghostY;

      requestAnimationFrame(animateLiquid);
    }

    animateLiquid();

    window.addEventListener("resize", () => {
      width = liquidCanvas.width = liquidCanvas.offsetWidth;
      height = liquidCanvas.height = liquidCanvas.offsetHeight;
    });
  }
  //finsihed

  document.addEventListener('click', () => {
    ghost?.classList.add('surprised');
    setTimeout(() => ghost?.classList.remove('surprised'), 600);
  });

  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => ghost?.classList.add('happy'));
    btn.addEventListener('mouseleave', () => ghost?.classList.remove('happy'));
  });

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
      const rect = e.target.getBoundingClientRect();
      const spawn = {
        x: rect.left + rect.width / 2,
        y: rect.top + window.scrollY - 40
      };
      localStorage.setItem('ghostSpawn', JSON.stringify(spawn));
    });
  });

  // === Highlight Active Nav Link ===
  document.querySelectorAll('.nav-links a').forEach(link => {
    const current = window.location.pathname.split("/").pop();
    if (link.getAttribute("href") === current || current === "" && link.getAttribute("href") === "index.html") {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  function setRandomMessage() {
    if (!ghost || !speechBubble) return;
    speechBubble.textContent = messages[Math.floor(Math.random() * messages.length)];
    ghost.classList.add('show-bubble');
    setTimeout(() => ghost.classList.remove('show-bubble'), 2200);
  }

  messageInterval = setInterval(setRandomMessage, 8000);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearInterval(messageInterval);
    else messageInterval = setInterval(setRandomMessage, 8000);
  });

  let mouse = { x: null, y: null };
  window.addEventListener('mousemove', (e) => {
    const scrollY = window.scrollY || window.pageYOffset;
    mouse.x = e.clientX;
    mouse.y = e.clientY + scrollY - 70;
  });

  // === Mobile Menu Toggle ===

  // INSIDE your main DOMContentLoaded block:
  const menuToggle = document.getElementById('menu-toggle');

  const mobileNav = document.createElement('div');
  mobileNav.classList.add('mobile-nav');

  const currentPage = window.location.pathname.split('/').pop();
  const isAccountPage = currentPage === 'account.html';

  mobileNav.innerHTML = `
  <button class="close-btn" aria-label="Close"><i data-lucide="x"></i></button>
  <label class="theme-switch">
    <span class="icon light"><i data-lucide="sun"></i></span>
    <input type="checkbox" id="mobile-theme-toggle">
    <span class="slider"></span>
    <span class="icon dark"><i data-lucide="moon"></i></span>
  </label>
  <a href="index.html">Home</a>
  <a href="services.html">Services</a>
  <a href="about.html">About</a>
  <a href="contact.html">Contact</a>
  ${isLoggedIn
      ? isAccountPage
        ? `<a id="mobile-logout" class="btn login-btn mobile-auth-btn">Log Out</a>`
        : `<a id="profile-icon-link" href="account.html" class="btn login-btn mobile-auth-btn" style="text-align: center; display: block; width: 100%; max-width: 300px; margin: 1rem auto;">Account</a>`
      : `<a id="login-button" class="btn login-btn mobile-auth-btn">Log In</a>`
    }
`;
  document.body.appendChild(mobileNav);
  lucide.createIcons();

  // Attach logout handler after element is added
  if (isLoggedIn) {
    document.getElementById("mobile-logout")?.addEventListener("click", (e) => {
      e.preventDefault();
      firebase.auth().signOut().then(() => {
        localStorage.removeItem("softwork_logged_in");
        window.location.href = "join.html";
      });
    });
  }

  menuToggle?.addEventListener('click', () => {
    mobileNav.classList.add('open');
  });
  mobileNav.querySelector('.close-btn')?.addEventListener('click', () => {
    mobileNav.classList.remove('open');
  });



  // === CANVAS BACKGROUND EFFECTS ===
  function networkEffect(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    const PARTICLE_COUNT = Math.floor((width * height) / 7000);
    const LINK_DIST = 120, MOUSE_DIST = 150;
    let particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      r: 1.5 + Math.random()
    }));

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#00bcd4';
      particles.forEach(p1 => {
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.r, 0, Math.PI * 2);
        ctx.fill();

        particles.forEach(p2 => {
          if (p1 === p2) return;
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            ctx.strokeStyle = 'rgba(0,188,212,0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });

        if (mouse.x && mouse.y) {
          const dx = p1.x - mouse.x;
          const dy = p1.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_DIST) {
            ctx.strokeStyle = 'rgba(0,188,212,0.3)';
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }

        p1.x += p1.vx;
        p1.y += p1.vy;
        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  function rippleEffect(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const rings = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      shape: Math.random() > 0.5 ? 'square' : 'triangle',
      size: 4 + Math.random() * 3
    }));

    function drawShape(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = '#00bcd4';
      if (p.shape === 'square') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else {
        ctx.beginPath();
        ctx.moveTo(0, -p.size / 2);
        ctx.lineTo(p.size / 2, p.size / 2);
        ctx.lineTo(-p.size / 2, p.size / 2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      rings.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        drawShape(p);
        if (mouse.x !== null && mouse.y !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            p.vx += dx / dist * 0.05;
            p.vy += dy / dist * 0.05;
          }
        }
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  function blobEffect(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 4 + Math.random() * 8,
      alpha: Math.random(),
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 0.3,
      vx: 0,
      vy: 0
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.phase += 0.02;
        p.alpha = 0.3 + Math.sin(p.phase) * 0.3;
        if (mouse.x && mouse.y) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const angle = Math.atan2(dy, dx);
            p.vx += Math.cos(angle) * 0.3;
            p.vy += Math.sin(angle) * 0.3;
          }
        }
        p.vy -= p.speed * 0.03;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        if (p.y < -10 || p.x < -10 || p.x > canvas.width + 10) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + 10;
          p.vx = p.vy = 0;
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(0, 188, 212, ${p.alpha})`;
        ctx.shadowColor = '#00bcd4';
        ctx.shadowBlur = 10;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  function starEffect(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const stars = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 1 + Math.random() * 1.5,
      speed: 0.5 + Math.random()
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00bcd4';
      stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        if (mouse.x && mouse.y) {
          const dx = s.x - mouse.x;
          const dy = s.y - mouse.y;
          if (Math.sqrt(dx * dx + dy * dy) < 100) {
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = 'rgba(0,188,212,0.3)';
            ctx.stroke();
          }
        }
        s.y += s.speed;
        if (s.y > canvas.height) {
          s.y = 0;
          s.x = Math.random() * canvas.width;
        }
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  if (document.getElementById("network-bg")) networkEffect("network-bg");
  if (document.getElementById("services-bg")) rippleEffect("services-bg");
  if (document.getElementById("about-bg")) blobEffect("about-bg");
  if (document.getElementById("contact-bg")) starEffect("contact-bg");

  // === DARK MODE TOGGLE ===
  const themeToggle = document.getElementById('theme-toggle');
  const logoImg = document.getElementById('logo-img');
  const footerLogo = document.getElementById('footer-logo');

  function applyTheme(isDark) {
    document.body.classList.toggle('dark', isDark);
    localStorage.setItem('darkMode', isDark);
    if (logoImg) logoImg.src = isDark ? 'logo-light.png' : 'logo.png';
    if (footerLogo) footerLogo.src = isDark ? 'logo-light.png' : 'logo.png';
    if (themeToggle) themeToggle.checked = isDark;
    console.log('Theme applied:', isDark ? 'Dark' : 'Light');
  }

  if (themeToggle) {
    themeToggle.addEventListener('change', () => {
      console.log('Theme toggle changed');
      applyTheme(themeToggle.checked);
    });

    const saved = localStorage.getItem('darkMode');
    const savedTheme = saved === null ? false : saved === 'true';
    console.log('Initial dark mode:', savedTheme);
    applyTheme(savedTheme);
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');

    if (mobileThemeToggle) {
      // Sync with stored value
      const saved = localStorage.getItem('darkMode');
      mobileThemeToggle.checked = saved === 'true';

      mobileThemeToggle.addEventListener('change', () => {
        const isDark = mobileThemeToggle.checked;
        applyTheme(isDark);
        if (themeToggle) themeToggle.checked = isDark; // Keep both toggles in sync
      });
    }
  } else {
    console.warn('Theme toggle element not found!');
  }
});

// Global logout function
window.logout = function () {
  firebase.auth().signOut().then(() => {
    localStorage.removeItem("softwork_logged_in");
    window.location.href = "join.html";
  }).catch(error => {
    alert("Logout failed: " + error.message);
  });
};


// === GSAP SECTION ANIMATIONS ===
gsap.registerPlugin(ScrollTrigger);

const typedTarget = document.querySelector("#typed-text");
if (typedTarget) {
  new Typed("#typed-text", {
    strings: ["Your Digital Vision", "Custom Software", "Smart Automation", "Cloud Infrastructure"],
    typeSpeed: 60,
    backSpeed: 30,
    backDelay: 2000,
    loop: true
  });
}


// Animate hero on page load
gsap.from(".hero h1", { opacity: 0, y: -50, duration: 1 });
gsap.from(".hero p", { opacity: 0, y: 30, delay: 0.3, duration: 1 });

// Animate each section on scroll
document.querySelectorAll("section").forEach((section) => {
  gsap.from(section, {
    scrollTrigger: {
      trigger: section,
      start: "top 80%",
    },
    opacity: 0,
    y: 40,
    duration: 1,
    ease: "power2.out"
  });
});

// Animate service cards with stagger
gsap.utils.toArray(".service-card").forEach((card, i) => {
  gsap.fromTo(card,
    { opacity: 0, y: 40 },
    {
      scrollTrigger: {
        trigger: card,
        start: "top 85%",
      },
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay: i * 0.1,
      ease: "power2.out"
    }
  );
});

// Animate value cards
gsap.utils.toArray(".value-card").forEach((card, i) => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: "top 85%",
    },
    opacity: 0,
    scale: 0.95,
    duration: 0.8,
    delay: i * 0.1,
    ease: "back.out(1.7)"
  });
});

// Animate testimonials
gsap.utils.toArray(".testimonial-card").forEach((card, i) => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: "top 85%",
    },
    opacity: 0,
    x: i % 2 === 0 ? -50 : 50,
    duration: 0.8,
    delay: i * 0.1,
    ease: "power2.out"
  });
});



// For log in service things to open
// === Onboarding Form Submission Handler ===
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".onboarding-form");

  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user || !form) return;

    form.addEventListener("submit", async function (e) {
      e.preventDefault(); // ✅ stop the default reload

      const formData = new FormData(form);
      const data = {};

      formData.forEach((value, key) => {
        if (data[key]) {
          if (Array.isArray(data[key])) {
            data[key].push(value);
          } else {
            data[key] = [data[key], value];
          }
        } else {
          data[key] = value;
        }
      });

      data.email = user.email;
      data.timestamp = firebase.firestore.FieldValue.serverTimestamp();

      try {
        await db.collection("onboarding_submissions").add(data);
        alert("✅ Your onboarding form has been submitted successfully!");
        form.reset();
      } catch (err) {
        console.error("❌ Submission failed:", err);
        alert("❌ Submission failed: " + err.message);
      }
    });
  });
});


// Global logout function
window.logout = function () {
  firebase.auth().signOut().then(() => {
    localStorage.removeItem("softwork_logged_in");
    window.location.href = "join.html";
  }).catch((error) => {
    alert("Logout failed: " + error.message);
  });
};

document.getElementById("no-website")?.addEventListener("change", function () {
  const websiteInput = document.querySelector('input[name="website"]');
  if (this.checked) {
    websiteInput.value = "No website";
    websiteInput.disabled = true;
  } else {
    websiteInput.value = "";
    websiteInput.disabled = false;
  }
});

