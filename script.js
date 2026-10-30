(() => {
  'use strict';
  const doc = document.documentElement;
  const themeButton = document.querySelector('.theme-toggle');
  try { if (localStorage.getItem('fulin-theme') === 'dark') doc.dataset.theme = 'dark'; } catch (_) {}
  const syncTheme = () => themeButton?.setAttribute('aria-label', doc.dataset.theme === 'dark' ? '切换日间配色' : '切换夜读配色');
  syncTheme();
  themeButton?.addEventListener('click', () => {
    const dark = doc.dataset.theme !== 'dark';
    doc.dataset.theme = dark ? 'dark' : 'light';
    try { localStorage.setItem('fulin-theme', dark ? 'dark' : 'light'); } catch (_) {}
    syncTheme();
  });
  const menu = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('#mobile-nav');
  const closeMenu = () => { if (!mobileNav) return; mobileNav.hidden = true; menu.setAttribute('aria-expanded', 'false'); };
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    mobileNav.hidden = !open;
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  window.matchMedia('(min-width: 601px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
  const search = document.querySelector('#article-search');
  if (search) {
    const rows = [...document.querySelectorAll('.archive-list .article-row')];
    const filters = [...document.querySelectorAll('[data-filter]')];
    let selected = 'all';
    const categories = ['研究札记','助人实践','组织与制度','数字工具','创作与日常'];
    const fromUrl = () => {
      const params = new URLSearchParams(location.search);
      const category = params.get('category');
      selected = /^[0-4]$/.test(category || '') ? category : 'all';
      search.value = params.get('q') || '';
    };
    const filter = (updateUrl = true) => {
      const terms = search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
      let count = 0;
      rows.forEach(row => {
        const haystack = ((row.dataset.search || '') + ' ' + categories[Number(row.dataset.category)]).toLocaleLowerCase();
        const visible = (selected === 'all' || row.dataset.category === selected) && terms.every(term => haystack.includes(term));
        row.hidden = !visible;
        count += Number(visible);
      });
      filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === selected)));
      document.querySelector('#result-count').textContent = count + ' 篇文字';
      document.querySelector('#empty-state').hidden = count > 0;
      if (updateUrl) {
        const params = new URLSearchParams();
        if (selected !== 'all') params.set('category', selected);
        if (search.value.trim()) params.set('q', search.value.trim());
        const url = location.pathname + (params.size ? '?' + params : '');
        try { history.replaceState(null, '', url); } catch (_) {}
      }
    };
    filters.forEach(button => button.addEventListener('click', () => { selected = button.dataset.filter; filter(); }));
    search.addEventListener('input', () => filter());
    document.querySelector('.search-form').addEventListener('submit', event => { event.preventDefault(); filter(); });
    document.querySelector('#reset-search').addEventListener('click', () => { selected = 'all'; search.value = ''; filter(); search.focus(); });
    document.addEventListener('keydown', event => {
      if (event.key === '/' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName) && !document.activeElement?.isContentEditable) { event.preventDefault(); search.focus(); }
    });
    window.addEventListener('popstate', () => { fromUrl(); filter(false); });
    fromUrl(); filter(false);
  }
  document.querySelector('.print-article')?.addEventListener('click', () => window.print());
  const progress = document.querySelector('.reading-progress');
  if (progress) {
    let queued = false;
    const update = () => {
      const article = document.querySelector('.article-prose');
      const end = article.getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
      const percent = end <= 0 ? 100 : Math.max(0, Math.min(100, window.scrollY / end * 100));
      progress.style.width = percent + '%'; queued = false;
    };
    window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }
})();
