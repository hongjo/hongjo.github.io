import fs from 'node:fs';
import { marked } from 'marked';
import { renderMemberProfile, normalizeName } from './member-profiles.mjs';
import { url, asset, absolute } from './config.mjs';

export const read = (language, name) => JSON.parse(fs.readFileSync(`data/${language}/${name}.json`, 'utf8'));
const shared = name => JSON.parse(fs.readFileSync(`data/${name}.json`, 'utf8'));
export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const md = value => marked.parse(Array.isArray(value) ? value.join('\n\n') : String(value ?? ''));
export const plain = value => String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const studies = shared('research');
const vision = shared('vision');
const presentation = shared('presentation');
const imagery = shared('imagery');
export const publications = read('ko', 'publications');
const aliases = shared('member-author-aliases');

const labels = {
  en: {
    home: 'Home', about: 'About the lab', news: 'Latest news', faculty: 'Hongjo Kim', members: 'People', publications: 'Publications', projects: 'Projects', teaching: 'Teaching', blog: 'Blog', album: 'Album', join: 'Join Us',
    menu: 'Menu', close: 'Close', all: 'All', more: 'Read more', allStories: 'View all stories', allNews: 'All news', allPubs: 'All publications', profile: 'Research & background', facultyMore: 'View full faculty profile',
    search: 'Search publications', searchHint: 'Title, author, venue, or year…', year: 'Year', allYears: 'All years', reset: 'Reset', additional: 'More filters', topic: 'Research topic', allTopics: 'All topics',
    empty: 'No matching publications. Try a different search or filter.', journal: 'Journal articles', international: 'International conferences', domestic: 'Domestic conferences', patents: 'Patents',
    categories: 'Publication types', current: 'Current semester', archives: 'Previous semesters', contents: 'On this page', albumIndex: 'Browse albums', memberIndex: 'Browse people', next: 'Next story', stories: 'All stories',
    summary: 'Research at a glance', problem: 'Problem', idea: 'Key idea', use: 'Application', paper: 'Paper', story: 'Research story', contact: 'Contact', back: 'Back to top',
    skip: 'Skip to content', original: 'Open original file', zoom: 'Enlarge image', table: 'Table — scroll horizontally if needed',
  },
  ko: {
    home: '홈', about: '연구실 소개', news: '연구실 소식', faculty: '김홍조 교수', members: '구성원', publications: '연구실적', projects: '연구과제', teaching: '강의', blog: '블로그', album: '앨범', join: '대학원 지원',
    menu: '메뉴', close: '닫기', all: '전체', more: '글 읽기', allStories: '모든 글 보기', allNews: '전체 소식', allPubs: '전체 연구실적', profile: '연구 및 상세 소개', facultyMore: '경력 및 연구활동 전체 보기',
    search: '연구실적 검색', searchHint: '제목, 저자, 학술지·학회명, 연도…', year: '연도', allYears: '전체 연도', reset: '초기화', additional: '추가 필터', topic: '연구주제', allTopics: '전체 주제',
    empty: '일치하는 연구실적이 없습니다. 검색어 또는 필터를 변경해 주세요.', journal: '저널 논문', international: '국제 학술대회', domestic: '국내 학술대회', patents: '특허',
    categories: '연구실적 분류', current: '이번 학기', archives: '지난 학기', contents: '목차', albumIndex: '앨범 찾아보기', memberIndex: '구성원 분류', next: '다음 글', stories: '글 목록',
    summary: '연구 한눈에 보기', problem: '문제', idea: '핵심 아이디어', use: '활용', paper: '논문', story: '연구 해설', contact: '연락처', back: '맨 위로',
    skip: '본문 바로가기', original: '원본 파일 열기', zoom: '그림 확대', table: '표 — 필요한 경우 가로로 스크롤하세요',
  },
};
export const words = language => labels[language];
export const hasTranslation = (language, route) => !route.startsWith('blog/') || read(language, 'blog').posts.some(post => 'blog/' + post.slug === route);
const link = (href, text, className = 'text-link') => `<a class="${className}" href="${esc(href)}">${esc(text)} <span aria-hidden="true">↗</span></a>`;
const button = (href, text, primary = false) => link(href, text, 'button' + (primary ? ' primary' : ''));
const photo = (source, alt, className = '', priority = false) => source && fs.existsSync(source)
  ? `<img class="${className}" src="${asset(source)}" alt="${esc(alt)}" loading="${priority ? 'eager' : 'lazy'}"${priority ? ' fetchpriority="high"' : ''}>` : '';

export function header(language, route) {
  const w = words(language);
  const active = route.split('/')[0] || 'home';
  const targetLanguage = language === 'ko' ? 'en' : 'ko';
  const translatedRoute = hasTranslation(targetLanguage, route) ? route : 'blog';
  return `<a class="skip-link" href="#main">${w.skip}</a>
    <header class="site-header" id="top"><div class="header-inner">
      <a class="brand" href="${url(language)}" aria-label="Smart Infrastructure Lab — ${w.home}"><span class="brand-mark" aria-hidden="true">SI<span>⌁</span></span><span class="brand-name">Smart Infrastructure Lab<small>YONSEI UNIVERSITY</small></span></a>
      <button class="menu-toggle" type="button" aria-controls="site-nav" aria-expanded="false" hidden><span>${w.menu}</span><span class="menu-icon" aria-hidden="true"></span></button>
      <nav id="site-nav" class="site-nav" aria-label="${language === 'ko' ? '주 메뉴' : 'Main navigation'}">${['home', 'members', 'publications', 'projects', 'teaching', 'blog', 'album', 'join'].map(key => `<a href="${url(language, key === 'home' ? '' : key)}"${active === key || key === 'members' && active === 'faculty' ? ' aria-current="page"' : ''}${key === 'join' ? ' class="join-nav"' : ''}>${w[key]}</a>`).join('')}<a class="language-link" lang="${targetLanguage}" hreflang="${targetLanguage}" href="${url(targetLanguage, translatedRoute)}" aria-label="${targetLanguage === 'ko' ? '한국어로 보기' : 'View in English'}">${targetLanguage === 'ko' ? '한국어' : 'EN'}</a></nav>
    </div></header>`;
}

export function footer(language) {
  const w = words(language), data = read(language, 'footer');
  return `<footer class="site-footer wrapper style1"><div class="footer-main"><div><a class="footer-brand" href="${url(language)}">Smart Infrastructure Lab</a><p class="footer-university">YONSEI UNIVERSITY</p><div class="footer-address">${data.address}<br>${data.contact}</div></div><nav aria-label="${language === 'ko' ? '하단 메뉴' : 'Footer navigation'}">${link(url(language, 'about'), w.about)}${link(url(language, 'faculty'), w.faculty)}${link(url(language, 'join'), w.join)}<a class="text-link" href="mailto:hongjo@yonsei.ac.kr">hongjo@yonsei.ac.kr <span aria-hidden="true">↗</span></a></nav></div><div class="footer-bottom"><p>Design: <a href="https://html5up.net/story">Story by HTML5 UP</a> · <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a> · ${language === 'ko' ? '연구실에 맞게 수정' : 'Adapted for the lab'}</p><a href="#top">${w.back} <span aria-hidden="true">↑</span></a></div></footer>`;
}

function pageHeading(language, route, subtitle = '', title = '', subtitleLanguage = language) {
  const w = words(language);
  return `<section class="page-heading wrapper style1"><div class="inner"><nav class="breadcrumb" aria-label="${language === 'ko' ? '현재 위치' : 'Breadcrumb'}"><a href="${url(language)}">${w.home}</a><span aria-hidden="true">/</span><span>${w[route] || title}</span></nav><p class="eyebrow">SMART INFRASTRUCTURE LAB</p><h1>${esc(title || w[route])}</h1>${subtitle ? `<p class="page-intro" lang="${subtitleLanguage}">${esc(subtitle)}</p>` : ''}</div></section>`;
}
const sectionHeader = (eyebrow, title, description = '', action = '') => `<div class="section-heading"><div><p class="eyebrow">${eyebrow}</p><h2>${title}</h2>${description ? `<p class="section-intro">${description}</p>` : ''}</div>${action}</div>`;
function paperFor(study) { return publications.journal_papers.find(paper => paper.title.toLowerCase().includes(study.match.toLowerCase())); }
function resources(language, study) {
  const w = words(language), paper = paperFor(study);
  return `<div class="resource-links">${paper?.doi ? link('https://doi.org/' + paper.doi, w.paper) : ''}${study.code ? link(study.code, 'Code') : ''}${link(url(language, 'blog/' + study.slug), w.story)}</div>`;
}
function peopleValues(language) {
  return `<section class="wrapper style1 people-values scroll-panel" id="people-we-seek"><div class="inner">${sectionHeader(esc(vision.peopleTitle), esc(vision.peopleMotto))}<div class="items style1 medium">${vision.values.map((value, index) => `<section><span class="section-number" aria-hidden="true">0${index + 1}</span><h3 lang="en">${esc(value.title)}</h3><p>${esc(value[language])}</p></section>`).join('')}</div></div></section>`;
}
function newsItems(language, items) {
  return `<div class="news-list">${items.map(item => `<article data-news><time>${esc(item.date)}</time><div><h3>${esc(item.title)}</h3><div class="prose">${md(item.description)}</div>${item.link ? link(url(language, item.link), words(language).more) : ''}</div></article>`).join('')}</div>`;
}
function blogCards(language, limit = Infinity) {
  const w = words(language);
  return `<div class="blog-grid">${read(language, 'blog').posts.slice(0, limit).map(post => `<article class="blog-card${post.cover ? '' : ' text-card'}" data-post><a class="blog-card-link" href="${url(language, 'blog/' + post.slug)}">${photo(post.cover, plain(post.title))}<div class="blog-card-content"><time datetime="${post.date}">${post.date}</time><h${limit === Infinity ? '2' : '3'}>${esc(post.title)}</h${limit === Infinity ? '2' : '3'}><p>${esc(plain(post.subtitle))}</p><span class="text-link">${w.more} <span aria-hidden="true">↗</span></span></div></a></article>`).join('')}</div>`;
}

function home(language) {
  const ko = language === 'ko', w = words(language), data = read(language, 'main'), p = presentation[language];
  const hero = `<section class="banner style1 orient-left content-align-left image-position-center home-hero scroll-panel" id="intro"><div class="content"><p class="eyebrow">CIVIL &amp; ENVIRONMENTAL ENGINEERING</p><h1 lang="en">${presentation.en.heroTitle}</h1><p class="major">${esc(p.heroIntro)}</p><div class="hero-actions">${button('#research', ko ? '연구분야 살펴보기' : 'Explore our research', true)}${link(url(language, 'join'), w.join)}</div><p class="hero-location">SEOUL, SOUTH KOREA</p><p class="hero-slogan" lang="en">Engineering insight. Computational intelligence.</p><a class="scroll-cue" href="#research" lang="en">Scroll to explore <span aria-hidden="true">↓</span></a></div><div class="image">${photo(imagery.hero.src, imagery.hero[language], '', true)}<span class="photo-note">YONSEI UNIVERSITY · SMART INFRASTRUCTURE LAB</span></div></section>`;

  const research = `<section class="wrapper style1 research-areas scroll-panel" id="research"><div class="inner">${sectionHeader('RESEARCH AREAS', `<span lang="en">${presentation.en.researchHeading}</span>`, esc(p.researchIntro))}<div class="research-grid">${p.researchAreas.map((area, index) => `<article>${photo(imagery.areas[index].src, imagery.areas[index][language], 'research-area-image')}<span class="section-number" aria-hidden="true">R.0${index + 1}</span><h3>${area.title}</h3><p>${esc(area.description)}</p><div class="tags">${area.tags.map(tag => `<span>${esc(tag)}</span>`).join('')}</div></article>`).join('')}</div></div></section>`;

  const stories = `<div class="home-stories" id="research-stories"><div class="stories-heading"><h3 lang="en">Research stories</h3>${link(url(language, 'blog'), w.allStories)}</div><div class="story-links">${read(language, 'blog').posts.slice(0, 3).map(post => `<a href="${url(language, 'blog/' + post.slug)}"><time datetime="${post.date}">${post.date}</time><h4>${esc(plain(post.title))}</h4></a>`).join('')}</div></div>`;
  const featured = `<section class="wrapper style1 featured-research scroll-panel" id="selected-research"><div class="inner">${sectionHeader('SELECTED PAPERS', '<span lang="en">From engineering problems to research contributions.</span>', '', link(url(language, 'publications'), w.allPubs))}<div class="featured-grid">${studies.map((study, index) => `<article class="featured-study" data-study>${photo(study.image, study[language].title, 'study-image')}<p class="eyebrow">${String(index + 1).padStart(2, '0')} / ${esc(paperFor(study)?.journal || 'RESEARCH')}</p><h3>${esc(study[language].title)}</h3><p>${esc(study[language].problem)}</p><p>${esc(study[language].idea)}</p>${resources(language, study)}</article>`).join('')}</div>${stories}</div></section>`;

  const approach = `<div class="vision-method" id="approach" lang="en"><div class="method-label"><h3>The Research Approach</h3><p>From real-world observations to informed engineering decisions.</p></div><div class="method-steps">${[['Observe', 'Images · 3D geometry · Sensor data'], ['Understand', 'Computer vision · Physics · AI'], ['Act', 'Safety · Inspection · Maintenance']].map(([name, text], index) => `<div class="approach-step"><span aria-hidden="true">0${index + 1}</span><div><h4>${name}</h4><p>${text}</p></div></div>`).join('')}</div></div>`;
  const values = `<div class="vision-values" id="people-we-seek"><div class="values-heading"><h3 lang="en">${esc(vision.peopleTitle)}</h3><p lang="en">${esc(vision.peopleMotto)}</p></div><div class="value-grid">${vision.values.map(value => `<article><h4 lang="en">${esc(value.title)}</h4><p>${esc(value[language])}</p></article>`).join('')}</div></div>`;
  const visionSection = `<section class="wrapper style1 vision-section home-vision scroll-panel" id="our-vision"><div class="inner">${sectionHeader('VISION &amp; APPROACH', '<span lang="en">Dream Big. Aim for the Best.<br><em>Build a Better World.</em></span>')}<div class="vision-overview"><div class="vision-copy"><p lang="en">${esc(vision.en)}</p><blockquote lang="ko">${esc(vision.ko)}</blockquote>${link(url(language, 'about'), w.about)}</div><div class="vision-photos">${photo(imagery.vision.src, imagery.vision[language], 'vision-thumb')}</div></div>${approach}${values}</div></section>`;

  const news = `<div class="home-news" id="latest-news"><div class="stories-heading"><h3>${w.news}</h3>${link(url(language, 'news'), w.allNews)}</div>${newsItems(language, data.news.items.slice(0, 3)).replace(/<h3>/g, '<h4>').replace(/<\/h3>/g, '</h4>')}</div>`;
  const groupPhoto = `<a class="community-photo" href="${url(language, 'members')}">${photo('img/album/251101/25가을1.jpg', ko ? '2025년 가을 연구실 단체사진' : 'Lab group photo, autumn 2025', 'wide-image')}<span>${w.members} <span aria-hidden="true">↗</span></span></a>`;
  const contact = `<div class="community-contact" id="contact"><div><p class="eyebrow" lang="en">CONTACT</p><h3 lang="en">Let’s connect ideas to infrastructure.</h3></div><div><p>${ko ? '공동연구 및 대학원 진학에 관한 문의는 김홍조 교수에게 연락해 주시기 바랍니다.' : 'For research collaboration and graduate research inquiries, contact Professor Hongjo Kim.'}</p><div class="contact-links"><a class="contact-email" href="mailto:hongjo@yonsei.ac.kr">hongjo@yonsei.ac.kr <span aria-hidden="true">↗</span></a>${link(url(language, 'join'), w.join)}</div><address>${ko ? '연세대학교 건설환경공학과 · 서울특별시 서대문구 연세로 50 · 제1공학관 N504호' : 'Department of Civil &amp; Environmental Engineering · Yonsei University · Seoul, South Korea'}</address></div></div>`;
  const community = `<section class="wrapper style1 community-section scroll-panel" id="community"><div class="inner">${sectionHeader('LIFE AT THE LAB', '<span lang="en">A shared curiosity. A collective effort.</span>')}<div class="community-grid">${groupPhoto}${news}</div>${contact}</div></section>`;

  const sections = [['intro', ko ? '홈' : 'Introduction'], ['research', ko ? '연구분야' : 'Research areas'], ['selected-research', ko ? '대표 논문 및 연구 이야기' : 'Selected papers & stories'], ['our-vision', ko ? '비전과 연구 방법' : 'Vision & approach'], ['community', ko ? '연구실 소식과 연락처' : 'Lab life & contact']];
  const progress = `<nav class="page-dots" data-scroll-nav hidden aria-label="${ko ? '홈 섹션 위치' : 'Home sections'}">${sections.map(([id, title], index) => `<a href="#${id}" aria-label="${esc(title)}"${index === 0 ? ' aria-current="location"' : ''}><span aria-hidden="true"></span></a>`).join('')}</nav>`;
  return progress + hero + research + featured + visionSection + community;
}


function members(language) {
  const ko = language === 'ko', w = words(language), data = read(language, 'members'), professor = data.professor;
  const faculty = `<section class="faculty-summary section-shell">${photo(professor.photo, professor.name, 'faculty-photo')}<div><p class="eyebrow">LAB DIRECTOR</p><h2>${esc(professor.name)}</h2><p>${ko ? '연세대학교 건설환경공학과 부교수' : 'Associate Professor, Civil and Environmental Engineering, Yonsei University'}</p><p>${ko ? '컴퓨터 비전 · 물리 기반 AI · 인프라 점검 · 공학 에이전트' : 'Computer vision · Physics-informed AI · Infrastructure inspection · Engineering agents'}</p>${link(url(language, 'faculty'), w.facultyMore)}</div></section>`;
  const index = `<nav class="category-nav section-shell" aria-label="${w.memberIndex}">${data.categories.map((category, index) => `<a href="#category-${index}">${esc(category.title)} <span>${category.members.length}</span></a>`).join('')}</nav>`;
  const categoryMarkup = (category, index) => `<section class="wrapper style1 member-section" id="category-${index}"><div class="inner"><div class="category-heading"><h2>${esc(category.title)}</h2><span>${String(category.members.length).padStart(2, '0')}</span></div><div class="member-grid">${category.members.map((member, memberIndex) => `<article class="member-card" data-member><div class="member-portrait">${photo(member.photo, member.name, 'member-photo') || `<div class="member-initial" aria-hidden="true">${esc(member.name.slice(0, 2))}</div>`}</div><div class="member-info"><h3>${esc(member.name)}</h3><p class="member-role">${esc(member.role)}</p>${!['행정 담당', 'Administrative Staff'].includes(category.title) ? `<details class="member-details" id="member-${index}-${memberIndex}"><summary aria-label="${esc(w.profile + ': ' + member.name)}">${w.profile}<span aria-hidden="true">+</span></summary><div class="prose member-profile">${renderMemberProfile(member, language, publications, aliases, { esc, md })}</div></details>` : `<div class="member-interests prose">${md(member.interests)}</div>`}</div></article>`).join('')}</div></div></section>`;
  const paired = data.categories.map((category, index) => ({ category, index })).filter(({ category }) => ['Part-time Graduate Students', 'Undergraduate Interns', '파트타임 연구원', '인턴'].includes(category.title));
  const categories = data.categories.map((category, index) => paired.some(item => item.index === index)
    ? (index === paired[0].index ? `<div class="member-pair section-shell">${paired.map(item => categoryMarkup(item.category, item.index)).join('')}</div>` : '')
    : categoryMarkup(category, index)).join('');
  return pageHeading(language, 'members', 'A research community connecting different perspectives.', '', 'en') + faculty + index + categories;
}

function topicTags(paper) {
  const title = paper.title.toLowerCase();
  return [/vision|image|crack|detection|segmentation|visual/.test(title) ? 'vision' : '', /3d|reconstruction|photogram|sonar|underwater/.test(title) ? 'sensing' : '', /physics|diffusion|levee|embankment|pore/.test(title) ? 'physics' : '', /language|retrieval|agent|document|rag|knowledge/.test(title) ? 'agents' : '', /economic|cost|financial|safety|risk/.test(title) ? 'safety' : ''].filter(Boolean).join(',');
}
const authorAliases = name => aliases.find(group => group.some(alias => normalizeName(alias) === normalizeName(name))) || [name];
const authorKey = name => {
  const group = authorAliases(name);
  return normalizeName(group.find(alias => /^[A-Za-z][A-Za-z .()\-]*$/.test(alias)) || group[0]);
};
export const publicationRecords = Object.entries(publications).flatMap(([type, records]) => records.map((record, index) => ({ ...record, type, id: `${type}-${index}`, topics: topicTags(record), people: [...new Set((record.authors || record.inventors || []).map(authorKey))] })));
const typeKeys = { journal_papers: 'journal', international_conference_papers: 'international', domestic_conference_papers: 'domestic', patents: 'patents' };
function publicationPage(language) {
  const ko = language === 'ko', w = words(language);
  const years = [...new Set(publicationRecords.map(p => p.year))].sort((a, b) => b - a);
  const topics = ko ? { vision: '영상 인식·균열', sensing: '3D·센싱', physics: '물리 기반 AI', agents: '언어모델·에이전트', safety: '안전·경제성' } : { vision: 'Vision & cracks', sensing: '3D & sensing', physics: 'Physics-informed AI', agents: 'Language models & agents', safety: 'Safety & economics' };
  const authors = new Map();
  for (const paper of publicationRecords) for (const name of paper.authors || paper.inventors || []) {
    const key = authorKey(name);
    if (!authors.has(key)) authors.set(key, { key, name, group: 'external', count: publicationRecords.filter(record => record.people.includes(key)).length });
  }
  const people = read(language, 'members');
  for (const category of people.categories) for (const member of category.members) {
    const author = authors.get(authorKey(member.name));
    const current = ['Graduate Students', 'Part-time Graduate Students', 'Undergraduate Interns', '풀타임 연구원', '파트타임 연구원', '인턴'].includes(category.title);
    if (author) { author.name = member.name; author.group = current ? 'current' : ['Alumni', '동문'].includes(category.title) ? 'alumni' : 'external'; }
  }
  const professor = authors.get(authorKey('Hongjo Kim'));
  if (professor) professor.group = 'faculty';
  const authorOptions = (professor ? `<option value="${professor.key}">${ko ? '김홍조 교수' : 'Prof. Hongjo Kim'} (${professor.count})</option>` : '') + [['current', ko ? '재학생' : 'Current students'], ['alumni', 'Alumni'], ['external', ko ? '외부인사' : 'External authors']].map(([group, label]) => `<optgroup label="${label}">${[...authors.values()].filter(author => author.group === group).sort((a, b) => a.name.localeCompare(b.name, language)).map(author => `<option value="${esc(author.key)}">${esc(author.name)} (${author.count})</option>`).join('')}</optgroup>`).join('');
  const controls = `<div class="publication-tools section-shell" data-publication-filters hidden><form role="search" aria-label="${w.search}"><div class="search-row"><div class="search-field"><label for="pub-search">${w.search}</label><input id="pub-search" name="q" type="search" placeholder="${w.searchHint}" autocomplete="off"></div><div class="year-field"><label for="pub-year">${w.year}</label><select id="pub-year" name="year"><option value="">${w.allYears}</option>${years.map(year => `<option value="${year}">${year}</option>`).join('')}</select></div><button type="reset" class="button reset-button">${w.reset}</button></div><div class="type-filters" role="group" aria-label="${w.categories}"><button type="button" data-type="" aria-pressed="true">${w.all}<span>${publicationRecords.length}</span></button>${Object.entries(typeKeys).map(([type, key]) => `<button type="button" id="${type}" data-type="${type}" aria-pressed="false">${w[key]}<span>${publications[type].length}</span></button>`).join('')}</div><div class="additional-filters filter-grid"><div><label for="pub-person">${ko ? '저자' : 'Author'}</label><select id="pub-person" name="person"><option value="">${ko ? '전체 저자' : 'All authors'}</option>${authorOptions}</select></div><div><label for="pub-topic">${w.topic}</label><select id="pub-topic" name="topic"><option value="">${w.allTopics}</option>${Object.entries(topics).map(([key, value]) => `<option value="${key}">${esc(value)}</option>`).join('')}</select></div></div></form><p class="result-count" data-result-count role="status" aria-live="polite" aria-atomic="true"></p></div>`;
  const results = `<div class="publication-results section-shell"><p class="empty-results" data-empty hidden>${w.empty}</p>${years.map(year => `<section class="publication-year" id="year-${year}" data-year-group><div class="year-heading"><h2>${year}</h2><span data-year-count>${publicationRecords.filter(p => p.year === year).length}</span><div aria-hidden="true"></div></div><div class="publication-list">${publicationRecords.filter(p => p.year === year).map(paper => {
    const target = paper.url || (paper.doi ? 'https://doi.org/' + paper.doi : '');
    const meta = [paper.journal || paper.conference || paper.patent_type, paper.volume, paper.pages, paper.location, paper.date_range, paper.publisher, paper.patent_number, paper.country, paper.status].filter(Boolean).join(' · ');
    const search = [paper.title, ...(paper.authors || paper.inventors || []).flatMap(authorAliases), meta, paper.year, paper.doi || ''].join(' ');
    return `<article class="publication" id="${paper.id}" data-publication data-year="${paper.year}" data-type="${paper.type}" data-topics="${paper.topics}" data-people="${esc(paper.people.join('|'))}" data-search="${esc(search)}"><div class="publication-kind">${w[typeKeys[paper.type]]}</div><div class="publication-content"><h3>${target ? `<a href="${esc(target)}" target="_blank" rel="noopener noreferrer">${esc(paper.title)} <span aria-hidden="true">↗</span></a>` : esc(paper.title)}</h3><p class="pub-authors">${esc((paper.authors || paper.inventors || []).join(', '))}</p><p class="pub-meta">${esc(meta)}</p>${studies.filter(study => paperFor(study)?.title === paper.title).map(study => resources(language, study)).join('')}</div></article>`;
  }).join('')}</div></section>`).join('')}</div>`;
  return pageHeading(language, 'publications', ko ? '저널 · 국제 및 국내 학술대회 · 특허' : 'Journals, conference proceedings, and patents.') + controls + results;
}

function projects(language) {
  const ko = language === 'ko';
  return pageHeading(language, 'projects', 'Connecting engineering questions with applied research.', '', 'en') + `<section class="wrapper style1"><div class="inner project-list">${read(language, 'projects').projects.map((project, index) => `<article data-project><div class="project-context"><span class="section-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><p class="project-period">${esc(project.period)}</p><p class="project-funding">${esc(project.funding)}</p></div><div><h2>${esc(project.title)}</h2><div class="prose">${md(project.description)}${project.image ? photo(project.image, project.title) : ''}${project.results?.length ? md(project.results) : ''}</div></div></article>`).join('')}</div></section>`;
}
function teaching(language) {
  const ko = language === 'ko', w = words(language), data = read(language, 'teaching');
  const courses = semester => `<div class="course-grid">${semester.courses.map(course => `<article class="course" data-course>${course.level || course.code ? `<p class="eyebrow">${esc(course.level || course.code)}</p>` : ''}<h3>${esc(course.title)}</h3>${course.time || course.location ? `<dl>${course.time ? `<dt>${esc(data.labels.classTime)}</dt><dd>${md(course.time)}</dd>` : ''}${course.location ? `<dt>${esc(data.labels.location)}</dt><dd>${md(course.location)}</dd>` : ''}</dl>` : ''}<div class="prose">${md(course.description)}</div>${course.materials?.map(material => link(material.link, material.title)).join('') || ''}</article>`).join('')}</div>`;
  return pageHeading(language, 'teaching', 'Developing engineering judgment and computational skills.', '', 'en') + `<section class="wrapper style1 current-semester"><div class="inner"><p class="eyebrow">${w.current}</p><h2>${esc(data.semesters[0].title)}</h2>${courses(data.semesters[0])}</div></section><section class="wrapper style1"><div class="inner semester-archive"><p class="eyebrow">${w.archives}</p>${data.semesters.slice(1).map(semester => `<details class="semester"><summary><h2>${esc(semester.title)}</h2><span aria-hidden="true">+</span></summary>${courses(semester)}</details>`).join('')}</div></section>`;
}
function join(language) {
  const data = read(language, 'admissions');
  return pageHeading(language, 'join', data.subtitle, data.title) + `<section class="wrapper style1"><div class="inner admissions"><div class="application-panel"><p class="eyebrow">GRADUATE APPLICATIONS</p><h2>${esc(data.apply)}</h2><p>${esc(data.intro)}</p><ol>${data.docs.map(doc => `<li>${esc(doc)}</li>`).join('')}</ol>${button('mailto:hongjo@yonsei.ac.kr', data.email, true)}<p class="application-email">hongjo@yonsei.ac.kr</p></div><div class="international-panel"><h2>${esc(data.international)}</h2><article><h3>${esc(data.masters)}</h3><p>${esc(data.masters_text)}</p></article><article><h3>${esc(data.phd)}</h3><p>${esc(data.phd_text)}</p><div class="funding-note"><h4>${esc(data.program)}</h4><p>${esc(data.program_text)}</p></div></article><article><h3>${esc(data.letter)}</h3><p>${esc(data.letter_text)}</p></article><p class="policy-date">${esc(data.date)}</p></div></div></section>` + peopleValues(language);
}

function tableOfContents(entries) {
  const groups = [];
  for (const entry of entries) {
    if (entry.level === 3 && groups.length) groups.at(-1).children.push(entry);
    else groups.push({ ...entry, children: [] });
  }
  const anchor = entry => `<a href="#${entry.id}">${esc(entry.text)}</a>`;
  return `<ul>${groups.map(entry => `<li>${anchor(entry)}${entry.children.length ? `<ul>${entry.children.map(child => `<li>${anchor(child)}</li>`).join('')}</ul>` : ''}</li>`).join('')}</ul>`;
}
function blogPost(language, post, index, posts) {
  const ko = language === 'ko', w = words(language), study = studies.find(study => study.slug === post.slug), toc = [];
  const content = md(fs.readFileSync(post.md, 'utf8')).replace(/<h1>([\s\S]*?)<\/h1>/g, '<h2>$1</h2>').replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_, level, text) => {
    const id = 'section-' + (toc.length + 1); toc.push({ id, level: Number(level), text: plain(text) }); return `<h${level} id="${id}">${text}</h${level}>`;
  });
  const summary = study ? `<section class="post-summary"><h2>${w.summary}</h2><dl>${['problem', 'idea', 'use'].map(key => `<dt>${w[key]}</dt><dd>${esc(study[language][key])}</dd>`).join('')}</dl>${resources(language, study)}</section>` : '';
  const contents = toc.length ? `<nav class="post-toc" aria-label="${w.contents}"><h2>${w.contents}</h2>${tableOfContents(toc)}</nav>` : '';
  return `<div class="post-header section-shell">${link(url(language, 'blog'), w.blog)}<time datetime="${post.date}">${post.date}</time><h1>${esc(post.title)}</h1><div class="post-subtitle prose">${md(post.subtitle)}</div></div><article class="prose post-body">${summary}${contents}<div data-post-content>${content}</div></article><nav class="post-navigation section-shell" aria-label="${ko ? '글 탐색' : 'Story navigation'}">${link(url(language, 'blog'), w.stories)}${index + 1 < posts.length ? `<a href="${url(language, 'blog/' + posts[index + 1].slug)}"><span>${w.next} <span aria-hidden="true">→</span></span><strong>${esc(posts[index + 1].title)}</strong></a>` : ''}</nav>`;
}
function album(language) {
  const ko = language === 'ko', w = words(language), albums = read(language, 'album').albums;
  const navigation = `<aside class="album-sidebar"><p class="eyebrow">${w.albumIndex}</p><nav aria-label="${w.albumIndex}">${albums.map((album, index) => `<a href="#album-${index}" aria-controls="album-${index}" data-album-link><span>${esc(album.title)}</span><small>${album.images.length}</small></a>`).join('')}</nav><div class="album-selector" hidden><label for="album-choice">${w.albumIndex}</label><select id="album-choice">${albums.map((album, index) => `<option value="album-${index}">${esc(album.title)} (${album.images.length})</option>`).join('')}</select></div></aside>`;
  const panels = albums.map((album, index) => `<section class="album-panel" id="album-${index}" aria-labelledby="album-title-${index}" data-album-panel><div class="album-heading"><div><h2 id="album-title-${index}">${esc(album.title)}</h2><p>${esc(album.description)}</p></div><span>${album.images.length} ${ko ? '장' : 'photos'}</span></div><div class="gallery style1 album-grid">${album.images.map(image => `<figure><a class="image" data-zoom href="${asset(image.fullSize || image.src)}" aria-label="${esc(w.zoom + ': ' + (image.caption || album.title))}">${photo(image.src, image.caption || album.title)}</a><figcaption title="${esc(image.caption)}">${esc(image.caption)}</figcaption></figure>`).join('')}</div></section>`).join('');
  return pageHeading(language, 'album', 'Moments beyond the research.', '', 'en') + `<div class="section-shell album-browser" data-album-browser>${navigation}<div class="album-panels">${panels}</div></div>`;
}

export function allPages() {
  const pages = [];
  for (const language of ['en', 'ko']) {
    const w = words(language), ko = language === 'ko', data = read(language, 'main');
    const save = (route, title, body, description = '') => pages.push({ language, route, title, body, description });
    save('', 'Smart Infrastructure Lab', home(language), ko ? '연세대학교 건설환경공학과 스마트인프라연구실. 컴퓨터 비전, 물리 기반 AI, 공학 에이전트로 건설 안전과 인프라 점검의 문제를 해결합니다.' : 'Smart Infrastructure Lab at Yonsei University. Computer vision, physics-informed AI, and engineering agents for construction safety and infrastructure inspection.');
    save('about', w.about, pageHeading(language, 'about') + `<div class="section-shell about-visual">${photo(imagery.about.src, imagery.about[language], 'about-image')}</div><section class="wrapper style1"><div class="inner prose about-body">${data.labIntro.paragraphs.map(md).join('')}</div></section>`);
    save('news', w.news, pageHeading(language, 'news') + `<section class="wrapper style1"><div class="inner">${newsItems(language, data.news.items).replace(/<h3>/g, '<h2>').replace(/<\/h3>/g, '</h2>')}</div></section>`);
    const professor = read(language, 'members').professor;
    save('faculty', w.faculty, pageHeading(language, 'faculty') + `<section class="wrapper style1"><div class="inner faculty-layout"><aside>${photo(professor.photo, professor.name, 'faculty-photo')}<p class="eyebrow">LAB DIRECTOR</p><h2>${esc(professor.name)}</h2><a class="text-link" href="mailto:${esc(professor.email)}">${esc(professor.email)}</a></aside><div class="prose faculty-body">${md(professor.description).replace(/<h1>/g, '<h2>').replace(/<\/h1>/g, '</h2>')}</div></div></section>`);
    save('members', w.members, members(language));
    save('publications', w.publications, publicationPage(language));
    save('projects', w.projects, projects(language));
    save('teaching', w.teaching, teaching(language));
    save('join', read(language, 'admissions').title, join(language));
    save('blog', w.blog, pageHeading(language, 'blog', 'The ideas behind our papers. Stories from the lab.', '', 'en') + `<section class="wrapper style1"><div class="inner">${blogCards(language)}</div></section>`);
    const posts = read(language, 'blog').posts;
    posts.forEach((post, index) => save('blog/' + post.slug, post.title, blogPost(language, post, index, posts), plain(post.subtitle || post.title)));
    save('album', w.album, album(language));
  }
  return pages;
}
