// Full-name aliases are reviewed explicitly; never infer authorship from initials.
export const normalizeName = name => String(name).normalize('NFKC').toLowerCase().replace(/[\s-]/g, '');

export function memberRecords(name, publications, aliasGroups) {
  const key = normalizeName(name);
  const group = aliasGroups.find(names => names.some(n => normalizeName(n) === key)) || [name];
  const aliases = new Set(group.map(normalizeName));
  const matches = names => (names || []).some(n => aliases.has(normalizeName(n)));
  return Object.fromEntries(Object.entries(publications).map(([type, records]) => [type,
    records.filter(p => matches(p.authors || p.inventors)).sort((a, b) => b.year - a.year)
  ]));
}

export function renderMemberProfile(member, language, publications, aliasGroups, {esc, md}) {
  const ko = language === 'ko';
  const records = memberRecords(member.name, publications, aliasGroups);
  const labels = ko
    ? ['저널 논문', '국제 학회 논문', '국내 학회 논문']
    : ['Journal articles', 'International conference papers', 'Domestic conference papers'];
  const keys = ['journal_papers', 'international_conference_papers', 'domestic_conference_papers'];
  const safeMarkdown = value => md(value).replace(/<h[12]>/g, '<h4>').replace(/<\/h[12]>/g, '</h4>');
  const link = p => p.doi ? 'https://doi.org/' + p.doi : /^https?:\/\//.test(p.url || '') ? p.url : '';
  const title = p => link(p) ? `<a href="${esc(link(p))}">${esc(p.title)}</a>` : esc(p.title);
  const citation = p => `<li><span class="profile-citation-authors">${esc((p.authors || p.inventors || []).join(', '))} (${esc(p.year)})</span><br>${title(p)}<br><span class="profile-citation-meta">${esc([p.journal || p.conference, p.volume, p.pages, p.status, p.location, p.date_range].filter(Boolean).join(' · '))}</span></li>`;
  let body = `<h3>${ko ? '연구 및 배경' : 'Research & background'}</h3><p>${esc(member.role)}</p>${safeMarkdown(member.interests)}${safeMarkdown(member.details || [])}`;
  body += `<h3>${ko ? '논문 · Publications' : 'Publications'}</h3>`;
  let count = 0;
  keys.forEach((key, i) => {
    const papers = records[key] || [];
    count += papers.length;
    if (papers.length) body += `<h4>${labels[i]}</h4><ol class="profile-publications">${papers.map(citation).join('')}</ol>`;
  });
  if (member.additionalPublications?.length) {
    count += member.additionalPublications.length;
    body += `<h4>${ko ? '기타 논문 및 발표' : 'Additional publications & presentations'}</h4>${safeMarkdown(member.additionalPublications)}`;
  }
  if (!count) body += `<p class="profile-empty">${ko ? '홈페이지에 등록된 논문이 없습니다.' : 'No publications listed on this website yet.'}</p>`;
  body += `<h3>${ko ? '특허 · Patents' : 'Patents'}</h3>`;
  const patents = records.patents || [];
  body += patents.length ? `<ol class="profile-patents">${patents.map(p => `<li>${esc((p.inventors || []).join(', '))} (${esc(p.year)})<br>${title(p)}<br><span class="profile-citation-meta">${esc([p.country, ko ? p.patent_type : ({'특허 출원':'Patent application','특허 등록':'Registered patent'}[p.patent_type] || p.patent_type), p.patent_number].filter(Boolean).join(' · '))}</span></li>`).join('')}</ol>` : `<p class="profile-empty">${ko ? '홈페이지에 등록된 특허가 없습니다.' : 'No patents listed on this website yet.'}</p>`;
  if (member.softwareCopyrights?.length) {
    body += `<h3>${ko ? '소프트웨어 저작권 · Software Copyrights' : 'Software Copyrights'}</h3><ol class="profile-publications">${member.softwareCopyrights.map(p => `<li>${esc(p.authors.join(', '))} (${esc(p.year)})<br>${title(p)}<br><span class="profile-citation-meta">${esc([ko ? '한국저작권위원회' : 'Korea Copyright Commission', ko ? '소프트웨어 저작권 등록' : 'Software Copyright Registration', p.registration_number, p.date].join(' · '))}</span></li>`).join('')}</ol>`;
  }
  return body;
}
