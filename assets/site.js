(() => {
  'use strict';
  const ko = document.documentElement.lang === 'ko';
  const base = document.body.dataset.basePath || '';
  const legacy = location.hash.slice(1).split('/');
  if (!document.body.dataset.route && ['home', 'members', 'publications', 'projects', 'teaching', 'blog', 'album'].includes(legacy[0])) {
    const slugs = ['dsdl-tiny-object-detection', 'rag-construction-retrieval-optimization', 'frequency-aware-crack-segmentation', 'context-aware-lvlm-safety', 'auto-training-data-generation', 'vision-based-safety'];
    let route = base + '/ko/' + (legacy[0] === 'home' ? '' : legacy[0] + '/');
    if (legacy[0] === 'blog' && /^\d+$/.test(legacy[1] || '') && slugs[Number(legacy[1])]) route += slugs[Number(legacy[1])] + '/';
    location.replace(route);
    return;
  }
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');
  if (menu && nav) {
    menu.hidden = false;
    nav.classList.add('collapsible');
    const close = (focus = false) => {
      nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false');
      if (focus) menu.focus();
    };
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('is-open', open);
    });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('is-open')) close(true); });
    document.addEventListener('click', event => { if (!event.target.closest('.site-header')) close(); });
    nav.addEventListener('click', event => { if (event.target.closest('a')) close(); });
    matchMedia('(min-width: 1181px)').addEventListener('change', () => close());
  }
  const filters = document.querySelector('[data-publication-filters]');
  if (filters) {
    filters.hidden = false;
    const form = filters.querySelector('form');
    const search = form.elements.q, year = form.elements.year, topic = form.elements.topic;
    const buttons = [...form.querySelectorAll('button[data-type]')];
    const records = [...document.querySelectorAll('[data-publication]')];
    const groups = [...document.querySelectorAll('[data-year-group]')];
    const count = filters.querySelector('[data-result-count]'), empty = document.querySelector('[data-empty]');
    const normalize = value => value.toLocaleLowerCase().normalize('NFKC').replace(/\s+/g, ' ').trim();
    const haystacks = new Map(records.map(record => [record, normalize(record.dataset.search)]));
    let type = '';
    function readUrl() {
      const query = new URLSearchParams(location.search);
      search.value = query.get('q') || ''; year.value = query.get('year') || ''; topic.value = query.get('topic') || '';
      const requestedType = query.get('type') || location.hash.slice(1);
      type = buttons.some(button => button.dataset.type === requestedType) ? requestedType : '';
      if (topic.value) form.querySelector('details').open = true;
    }
    function update(historyMode) {
      const terms = normalize(search.value).split(' ').filter(Boolean);
      let total = 0;
      for (const record of records) {
        const match = (!year.value || record.dataset.year === year.value) && (!type || record.dataset.type === type) && (!topic.value || record.dataset.topics.split(',').includes(topic.value)) && terms.every(term => haystacks.get(record).includes(term));
        record.hidden = !match; if (match) total++;
      }
      for (const group of groups) {
        const shown = [...group.querySelectorAll('[data-publication]')].filter(record => !record.hidden).length;
        group.hidden = shown === 0; group.querySelector('[data-year-count]').textContent = shown;
      }
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.type === type)));
      count.textContent = ko ? `전체 ${records.length}건 중 ${total}건 표시` : `Showing ${total} of ${records.length} records`;
      empty.hidden = total !== 0;
      const query = new URLSearchParams();
      if (search.value.trim()) query.set('q', search.value.trim());
      if (year.value) query.set('year', year.value); if (type) query.set('type', type); if (topic.value) query.set('topic', topic.value);
      const suffix = query.size ? '?' + query.toString() : '';
      const legacyCategory = buttons.some(button => button.dataset.type && '#' + button.dataset.type === location.hash);
      const hash = legacyCategory ? '' : location.hash;
      if (historyMode && (location.search !== suffix || location.hash !== hash)) history[historyMode + 'State'](null, '', location.pathname + suffix + hash);
      const language = document.querySelector('.language-link');
      if (language) { const target = new URL(language.href); target.search = suffix; language.href = target.href; }
    }
    readUrl(); update();
    form.addEventListener('submit', event => event.preventDefault());
    search.addEventListener('input', () => update('replace'));
    year.addEventListener('change', () => update('push')); topic.addEventListener('change', () => update('push'));
    buttons.forEach(button => button.addEventListener('click', () => { type = button.dataset.type; update('push'); }));
    form.addEventListener('reset', event => {
      event.preventDefault(); search.value = ''; year.value = ''; topic.value = ''; type = ''; update('push'); search.focus();
    });
    window.addEventListener('popstate', () => { readUrl(); update(); });
  }
  let dialog, opener;
  const showImage = (image, source, trigger) => {
    if (!dialog) {
      dialog = document.createElement('dialog'); dialog.className = 'image-dialog';
      dialog.setAttribute('aria-labelledby', 'image-dialog-title');
      dialog.innerHTML = '<div class="image-toolbar"><h2 id="image-dialog-title"></h2><a target="_blank" rel="noopener noreferrer"></a><button type="button" autofocus></button></div><div class="image-stage"><img alt=""></div><p class="image-caption"></p>';
      dialog.querySelector('h2').textContent = ko ? '그림 확대' : 'Enlarged image';
      dialog.querySelector('button').textContent = ko ? '닫기 ×' : 'Close ×';
      dialog.querySelector('a').textContent = ko ? '원본 파일 열기 ↗' : 'Open original file ↗';
      document.body.append(dialog);
      dialog.querySelector('button').addEventListener('click', () => dialog.close());
      dialog.addEventListener('click', event => {
        if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); }
      });
      dialog.addEventListener('close', () => { document.documentElement.classList.remove('dialog-open'); opener?.focus({ preventScroll: true }); });
    }
    opener = trigger;
    const full = dialog.querySelector('img'); full.src = source; full.alt = image.alt;
    dialog.querySelector('a').href = source; dialog.querySelector('.image-caption').textContent = image.alt;
    dialog.showModal(); document.documentElement.classList.add('dialog-open');
  };
  document.querySelectorAll('.post-body img:not(.author-photo),.album-grid img').forEach(image => {
    const anchor = image.closest('a');
    if (anchor) {
      anchor.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault(); showImage(image, anchor.href, anchor);
      });
    } else {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'image-zoom';
      button.setAttribute('aria-label', (ko ? '그림 확대: ' : 'Enlarge image: ') + image.alt);
      image.replaceWith(button); button.append(image);
      button.addEventListener('click', () => showImage(image, image.dataset.original || image.currentSrc, button));
    }
  });
})();
