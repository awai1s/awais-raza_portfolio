(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header, navigation and scroll progress.
  const header = $('.site-header');
  const progress = $('.scroll-progress span');
  const navToggle = $('.nav-toggle');
  const setScrollState = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 20);
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
  };
  addEventListener('scroll', setScrollState, { passive: true });
  setScrollState();

  navToggle?.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  $$('.primary-nav a').forEach((link) => link.addEventListener('click', () => {
    document.body.classList.remove('nav-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }));

  // Reveal-on-scroll.
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const delay = Number(entry.target.dataset.delay || 0);
      setTimeout(() => entry.target.classList.add('is-visible'), delay);
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  const observeReveals = (scope = document) => $$('.reveal', scope).forEach((el) => revealObserver.observe(el));
  observeReveals();

  // Custom cursor and magnetic buttons.
  const cursorDot = $('.cursor-dot');
  const cursorHalo = $('.cursor-halo');
  let pointerX = innerWidth / 2, pointerY = innerHeight / 2, haloX = pointerX, haloY = pointerY;
  const finePointer = matchMedia('(pointer:fine)').matches;
  if (finePointer && cursorDot && cursorHalo) {
    addEventListener('mousemove', (event) => {
      pointerX = event.clientX; pointerY = event.clientY;
      cursorDot.style.opacity = cursorHalo.style.opacity = '1';
      cursorDot.style.transform = `translate(${pointerX}px,${pointerY}px) translate(-50%,-50%)`;
    }, { passive: true });
    const cursorFrame = () => {
      haloX += (pointerX - haloX) * .15; haloY += (pointerY - haloY) * .15;
      cursorHalo.style.transform = `translate(${haloX}px,${haloY}px) translate(-50%,-50%)`;
      requestAnimationFrame(cursorFrame);
    };
    cursorFrame();
    document.addEventListener('mouseover', (event) => {
      cursorHalo.classList.toggle('is-active', Boolean(event.target.closest('a,button,input,textarea,.spotlight-card')));
    });
  }

  $$('.magnetic').forEach((element) => {
    if (!finePointer || reduceMotion) return;
    element.addEventListener('mousemove', (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      element.style.transform = `translate(${x * .08}px,${y * .08}px)`;
    });
    element.addEventListener('mouseleave', () => element.style.transform = '');
  });

  const bindSpotlights = (scope = document) => {
    $$('.spotlight-card', scope).forEach((card) => {
      if (card.dataset.spotlightBound) return;
      card.dataset.spotlightBound = 'true';
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--sx', `${event.clientX - rect.left}px`);
        card.style.setProperty('--sy', `${event.clientY - rect.top}px`);
      });
    });
  };
  bindSpotlights();

  // Subtle hero tilt.
  $$('.tilt-card').forEach((card) => {
    if (!finePointer || reduceMotion) return;
    card.addEventListener('mousemove', (event) => {
      const rect = card.getBoundingClientRect();
      const rx = ((event.clientY - rect.top) / rect.height - .5) * -8;
      const ry = ((event.clientX - rect.left) / rect.width - .5) * 8;
      card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener('mouseleave', () => card.style.transform = '');
  });

  // Rotating hero role.
  const role = $('#rotating-role');
  const roles = ['production AI systems', 'computer vision pipelines', 'full-stack AI products', 'research prototypes'];
  if (role && !reduceMotion) {
    let index = 0;
    setInterval(() => {
      role.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-8px)' }], { duration: 230 }).onfinish = () => {
        index = (index + 1) % roles.length;
        role.textContent = roles[index];
        role.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 300 });
      };
    }, 2600);
  }

  // Counters.
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const node = entry.target;
      const target = Number(node.dataset.count || 0);
      if (reduceMotion) node.textContent = String(target);
      else {
        const start = performance.now();
        const duration = 1100;
        const step = (now) => {
          const t = Math.min(1, (now - start) / duration);
          node.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
      counterObserver.unobserve(node);
    });
  }, { threshold: .6 });
  $$('[data-count]').forEach((node) => counterObserver.observe(node));

  // Project rendering.
  const featuredContainer = $('#featured-projects');
  const projectGrid = $('#project-grid');
  const filtersNode = $('#project-filters');
  const searchNode = $('#project-search');
  const researchList = $('#research-list');
  const emptyNode = $('#project-empty');
  let allProjects = [];
  let activeCategory = 'All';

  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;' }[char]));
  const projectHref = (project) => `projects/${project.slug}/`;

  function featuredTemplate(project) {
    return `<a class="featured-card reveal" style="--card-accent:${project.accent}" href="${projectHref(project)}">
      <img src="${project.featuredCover || project.cover}" alt="${escapeHtml(project.title)} abstract project artwork" loading="lazy" />
      <div class="featured-content">
        <div class="featured-meta"><span class="pill">${escapeHtml(project.category)}</span><span class="pill">${escapeHtml(project.status)}</span></div>
        <h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.summary)}</p>
        <span class="inline-link">Read case study <b>↗</b></span>
      </div>
    </a>`;
  }

  function projectTemplate(project, index) {
    const tools = project.tools.slice(0, 4).map((tool) => `<span>${escapeHtml(tool)}</span>`).join('');
    return `<a class="project-card spotlight-card reveal" style="--card-accent:${project.accent}" href="${projectHref(project)}" data-category="${escapeHtml(project.category)}" data-search="${escapeHtml(`${project.title} ${project.subtitle} ${project.tools.join(' ')}`.toLowerCase())}">
      <div class="project-cover"><img src="${project.cover}" alt="${escapeHtml(project.title)} cover" loading="lazy" /><span class="project-number">${String(index + 1).padStart(2, '0')}</span></div>
      <div class="project-body"><div class="project-topline"><span>${escapeHtml(project.category)}</span><span>${project.year}</span></div><h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.summary)}</p><div class="project-tools">${tools}</div><div class="project-footer"><b>Case study</b><span>Explore ↗</span></div></div>
    </a>`;
  }

  function researchTemplate(project) {
    const metrics = project.metrics.slice(0, 2).map((metric) => `<span><b>${escapeHtml(metric.value)}</b><small>${escapeHtml(metric.label)}</small></span>`).join('');
    return `<a class="research-card reveal" style="--card-accent:${project.accent}" href="${projectHref(project)}"><div class="research-symbol">${escapeHtml(project.symbol)}</div><div class="research-copy"><small>${escapeHtml(project.status)}</small><h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.summary)}</p></div><div class="research-metrics">${metrics}</div></a>`;
  }

  function renderFilters() {
    const categories = ['All', ...new Set(allProjects.map((project) => project.category))];
    filtersNode.innerHTML = categories.map((category) => `<button class="filter-button ${category === activeCategory ? 'is-active' : ''}" data-filter="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join('');
    $$('.filter-button', filtersNode).forEach((button) => button.addEventListener('click', () => {
      activeCategory = button.dataset.filter;
      renderFilters(); renderProjects();
    }));
  }

  function renderProjects() {
    const query = (searchNode?.value || '').trim().toLowerCase();
    const filtered = allProjects.filter((project) => (activeCategory === 'All' || project.category === activeCategory) && (!query || `${project.title} ${project.subtitle} ${project.tools.join(' ')}`.toLowerCase().includes(query)));
    projectGrid.innerHTML = filtered.map(projectTemplate).join('');
    emptyNode.hidden = filtered.length !== 0;
    observeReveals(projectGrid); bindSpotlights(projectGrid);
  }

  fetch('assets/data/projects.json')
    .then((response) => { if (!response.ok) throw new Error('Unable to load project data'); return response.json(); })
    .then((projects) => {
      allProjects = projects;
      const featureOrder = ['brain-stimulation-response','weighted-yolo','hexaquote'];
      featuredContainer.innerHTML = featureOrder.map((slug) => projects.find((project) => project.slug === slug)).filter(Boolean).map(featuredTemplate).join('');
      const researchOrder = ['weighted-yolo','brain-stimulation-response','fg-kvq'];
      researchList.innerHTML = researchOrder.map((slug) => projects.find((project) => project.slug === slug)).filter(Boolean).map(researchTemplate).join('');
      renderFilters(); renderProjects(); observeReveals(featuredContainer); observeReveals(researchList);
    })
    .catch((error) => {
      console.error(error);
      if (projectGrid) projectGrid.innerHTML = '<p class="empty-state">Project data could not be loaded. Run the site through a local server rather than opening index.html directly.</p>';
    });
  searchNode?.addEventListener('input', renderProjects);

  // Certificates are data-driven: add files, then edit assets/data/certificates.json.
  const modal = $('#certificate-modal');
  const modalImage = modal?.querySelector('img');
  const modalPdf = modal?.querySelector('.modal-pdf');
  const certificateGrid = $('#certificate-grid');

  function bindCertificateCards() {
    $$('.certificate-card', certificateGrid).forEach((card) => card.addEventListener('click', () => {
      if (!card.dataset.image) return;
      modalImage.src = card.dataset.image;
      modalImage.alt = card.querySelector('img')?.alt || 'Certificate';
      if (card.dataset.pdf) { modalPdf.href = card.dataset.pdf; modalPdf.hidden = false; }
      else modalPdf.hidden = true;
      modal.showModal();
    }));
  }

  fetch('assets/data/certificates.json')
    .then((response) => { if (!response.ok) throw new Error('Unable to load certificate data'); return response.json(); })
    .then((certificates) => {
      const cards = certificates.filter((item) => item.image);
      const credentials = certificates.filter((item) => !item.image);
      certificateGrid.innerHTML = cards.map((item) => `
        <button class="certificate-card spotlight-card reveal" data-image="${escapeHtml(item.image)}" ${item.pdf ? `data-pdf="${escapeHtml(item.pdf)}"` : ''}>
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)} certificate" loading="lazy" />
          <span><b>${escapeHtml(item.title)}</b><small>${escapeHtml([item.issuer, item.date].filter(Boolean).join(' - '))}</small></span>
        </button>`).join('') + (credentials.length ? `
        <article class="certificate-list reveal"><h3>Additional credentials</h3><ul>${credentials.map((item) => `<li><b>${escapeHtml(item.title)}</b>${item.issuer ? `<span>${escapeHtml(item.issuer)}</span>` : ''}</li>`).join('')}</ul></article>` : '');
      bindCertificateCards(); bindSpotlights(certificateGrid); observeReveals(certificateGrid);
    })
    .catch((error) => { console.error(error); certificateGrid.innerHTML = '<p class="empty-state">Certificates could not be loaded.</p>'; });

  modal?.querySelector('.modal-close')?.addEventListener('click', () => modal.close());
  modal?.addEventListener('click', (event) => { if (event.target === modal) modal.close(); });

  // Contact form: Vercel function when configured, mailto fallback otherwise.
  const form = $('#contact-form');
  const formStatus = $('#form-status');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const button = form.querySelector('button[type="submit"]');
    const data = Object.fromEntries(new FormData(form));
    button.disabled = true; button.textContent = 'Sending...';
    formStatus.className = ''; formStatus.textContent = '';
    try {
      const response = await fetch('/api/contact', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(data) });
      if (!response.ok) throw new Error('API not configured');
      form.reset(); formStatus.className = 'success'; formStatus.textContent = 'Message sent. Thank you.';
    } catch (_) {
      const subject = encodeURIComponent(data.subject || 'Portfolio inquiry');
      const body = encodeURIComponent(`${data.message}\n\nFrom: ${data.name} <${data.email}>`);
      formStatus.textContent = 'Opening your email client...';
      location.href = `mailto:awaisraza5424@gmail.com?subject=${subject}&body=${body}`;
    } finally {
      button.disabled = false; button.innerHTML = 'Send message <span>↗</span>';
    }
  });

  // Live neural-particle background.
  const canvas = $('#neural-field');
  if (canvas && !reduceMotion) {
    const context = canvas.getContext('2d');
    let particles = [], width = 0, height = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2); width = innerWidth; height = innerHeight;
      canvas.width = width * dpr; canvas.height = height * dpr; canvas.style.width = `${width}px`; canvas.style.height = `${height}px`; context.setTransform(dpr,0,0,dpr,0,0);
      const count = Math.min(75, Math.max(32, Math.floor(width / 18)));
      particles = Array.from({ length: count }, () => ({ x:Math.random()*width,y:Math.random()*height,vx:(Math.random()-.5)*.18,vy:(Math.random()-.5)*.18,r:Math.random()*1.3+.4 }));
    };
    const draw = () => {
      context.clearRect(0,0,width,height);
      particles.forEach((particle, index) => {
        particle.x += particle.vx; particle.y += particle.vy;
        if (particle.x < -20) particle.x = width + 20; if (particle.x > width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = height + 20; if (particle.y > height + 20) particle.y = -20;
        const mouseDistance = Math.hypot(particle.x - pointerX, particle.y - pointerY);
        if (mouseDistance < 160) { particle.x += (particle.x - pointerX) * .0009; particle.y += (particle.y - pointerY) * .0009; }
        context.beginPath(); context.fillStyle = index % 4 === 0 ? 'rgba(138,99,255,.48)' : 'rgba(41,243,208,.38)'; context.arc(particle.x,particle.y,particle.r,0,Math.PI*2); context.fill();
        for (let j=index+1;j<particles.length;j++) {
          const other=particles[j], distance=Math.hypot(particle.x-other.x,particle.y-other.y);
          if (distance < 115) { context.beginPath(); context.strokeStyle=`rgba(80,220,220,${(1-distance/115)*.08})`; context.lineWidth=.6; context.moveTo(particle.x,particle.y); context.lineTo(other.x,other.y); context.stroke(); }
        }
      });
      requestAnimationFrame(draw);
    };
    resize(); addEventListener('resize', resize); draw();
  }

  $('#year').textContent = String(new Date().getFullYear());
})();
