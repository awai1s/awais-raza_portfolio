(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;' }[char]));
  const slug = document.body.dataset.projectSlug;
  const root = $('#project-root');
  const projectAccent = (color) => document.documentElement.style.setProperty('--project-accent', color);

  const section = (index, title, body) => `<article class="case-section reveal"><span class="index">${index}</span><h2>${escapeHtml(title)}</h2>${body}</article>`;
  const paragraph = (text) => `<p>${escapeHtml(text)}</p>`;
  const list = (items) => `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;

  fetch('../../assets/data/projects.json')
    .then((response) => { if (!response.ok) throw new Error('Project data unavailable'); return response.json(); })
    .then((projects) => {
      const project = projects.find((item) => item.slug === slug);
      if (!project) throw new Error('Project not found');
      projectAccent(project.accent);
      const index = projects.findIndex((item) => item.slug === slug);
      const next = projects[(index + 1) % projects.length];
      const cover = `../../${project.cover}`;
      const metrics = project.metrics.map((metric) => `<article><b>${escapeHtml(metric.value)}</b><span>${escapeHtml(metric.label)}</span></article>`).join('');
      const stack = project.tools.map((tool) => `<span>${escapeHtml(tool)}</span>`).join('');
      const gallery = project.gallery?.length ? `<div class="gallery">${project.gallery.map((image, i) => `<img src="${image}" alt="${escapeHtml(project.title)} supporting visual ${i + 1}" loading="lazy" />`).join('')}</div>` : '';
      root.innerHTML = `
        <section class="project-hero">
          <div class="shell">
            <div class="project-breadcrumb"><a href="../../index.html#projects">Portfolio</a> / ${escapeHtml(project.category)} / ${escapeHtml(project.title)}</div>
            <div class="project-hero-grid">
              <div>
                <div class="project-status"><span class="pill">${escapeHtml(project.category)}</span><span class="pill">${escapeHtml(project.status)}</span><span class="pill">${escapeHtml(project.year)}</span></div>
                <h1>${escapeHtml(project.title)}<span>.</span></h1>
                <p class="project-subtitle">${escapeHtml(project.subtitle)}</p>
                <p class="project-summary">${escapeHtml(project.summary)}</p>
                <div class="project-actions"><a class="button button-primary" href="../../public/reports/${project.slug}.pdf" target="_blank" rel="noopener">Open PDF report <span>↗</span></a><a class="button button-ghost" href="https://github.com/awai1s" target="_blank" rel="noopener">GitHub profile <span>↗</span></a></div>
              </div>
              <figure class="project-art"><img src="${cover}" alt="${escapeHtml(project.title)} cover" /></figure>
            </div>
            <div class="metric-strip">${metrics}</div>
          </div>
        </section>
        <section class="case-study"><div class="shell case-grid"><div class="case-main">
          ${section('01','The problem',paragraph(project.problem))}
          ${section('02','Strategy and implementation',list(project.approach))}
          ${section('03','My contribution',paragraph(project.role))}
          ${section('04','Results and evidence',list(project.results))}
          ${section('05','What I learned',list(project.takeaways))}
          ${gallery ? section('06','Visual evidence',gallery) : ''}
          <div class="next-project"><span>Next case study</span><a href="../${next.slug}/">${escapeHtml(next.title)} ↗</a></div>
        </div><aside class="case-sidebar"><div class="sticky-card spotlight-card"><h3>Project snapshot</h3><p class="project-summary">${escapeHtml(project.status)} · ${escapeHtml(project.year)}</p><hr/><h3>Technology</h3><div class="stack-list">${stack}</div><hr/><div class="side-links"><a href="../../public/reports/${project.slug}.pdf" target="_blank" rel="noopener"><span>Download case-study PDF</span><b>↗</b></a><a href="../../index.html#contact"><span>Discuss this work</span><b>↗</b></a><a href="../../index.html#projects"><span>All projects</span><b>←</b></a></div></div></aside></div></section>`;

      // Reapply simple interaction after dynamic render.
      const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold:.1 });
      document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
      document.querySelectorAll('.spotlight-card').forEach((card) => card.addEventListener('pointermove', (event) => { const rect=card.getBoundingClientRect(); card.style.setProperty('--sx',`${event.clientX-rect.left}px`); card.style.setProperty('--sy',`${event.clientY-rect.top}px`); }));
    })
    .catch((error) => {
      console.error(error);
      root.innerHTML = `<div class="project-error"><h1>Project not found.</h1><p>The project data could not be loaded.</p><a class="button button-primary" href="../../index.html">Return home</a></div>`;
    });
})();
