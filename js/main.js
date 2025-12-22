// 현재 선택된 언어와 페이지, 그리고 블로그 상태
let currentLang = 'ko';
let currentPage = 'home';
let currentBlogIndex = null; // 블로그 글 인덱스 (null이면 목록 보기)

// 데이터 캐시
const dataCache = {};

// JSON 파싱 오류 시 라인 번호를 찾는 함수
function findJSONErrorLine(jsonString, errorMessage) {
    try {
        const positionMatch = errorMessage.match(/position (\d+)/);
        if (positionMatch) {
            const position = parseInt(positionMatch[1]);
            const beforeError = jsonString.substring(0, position);
            const lines = beforeError.split('\n');
            const line = lines.length;
            const column = lines[lines.length - 1].length + 1;
            
            const allLines = jsonString.split('\n');
            const contextLines = [];
            const start = Math.max(0, line - 3);
            const end = Math.min(allLines.length, line + 2);
            
            for (let i = start; i < end; i++) {
                const lineNum = i + 1;
                const isErrorLine = lineNum === line;
                const prefix = isErrorLine ? '>>> ' : '    ';
                contextLines.push(`${prefix}${lineNum.toString().padStart(3)}: ${allLines[i]}`);
            }
            
            return {
                line: line,
                column: column,
                context: contextLines.join('\n')
            };
        }
        return null;
    } catch (e) {
        return null;
    }
}

// 향상된 JSON 파싱 함수
function parseJSONWithErrorInfo(jsonString, url) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        const errorInfo = findJSONErrorLine(jsonString, error.message);
        let detailedError = `JSON 파싱 오류 in ${url}:\n`;
        detailedError += `원본 오류: ${error.message}\n`;
        if (errorInfo) {
            detailedError += `\n위치: 라인 ${errorInfo.line}, 컬럼 ${errorInfo.column}\n`;
            detailedError += `\n오류 주변 코드:\n${errorInfo.context}\n`;
        }
        throw new Error(detailedError);
    }
}

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// 앱 초기화 함수 수정 (초기 URL 해시 처리 추가)
async function initApp() {
    try {
        // 헤더 로드
        await loadAndRenderHeader();
        
        // 초기 로드 시 URL 해시(#) 확인
        const hash = window.location.hash; // 예: #blog 또는 #blog/2
        
        if (hash) {
            const hashParts = hash.replace('#', '').split('/');
            const initialPage = hashParts[0]; // 'blog', 'home' 등
            
            // 유효한 페이지라면 해당 페이지 로드
            if (['home', 'members', 'publications', 'projects', 'teaching', 'album', 'blog'].includes(initialPage)) {
                currentPage = initialPage;
                
                // 블로그 특정 글인 경우
                if (initialPage === 'blog' && hashParts[1]) {
                    currentBlogIndex = parseInt(hashParts[1], 10);
                } else {
                    currentBlogIndex = null;
                }
                
                // 네비게이션 UI 업데이트
                updateNavigationUI(currentPage);
            }
        }
        
        // 페이지 콘텐츠 로드
        await loadPage(currentPage);
        
        // 현재 상태를 히스토리에 교체(저장)
        let stateUrl = '#' + currentPage;
        if (currentPage === 'blog' && currentBlogIndex !== null) {
            stateUrl += '/' + currentBlogIndex;
        }
        history.replaceState({ page: currentPage, index: currentBlogIndex }, '', stateUrl);

        // 푸터 로드
        await loadAndRenderFooter();

    } catch (error) {
        console.error('앱 초기화 중 오류:', error);
        document.getElementById('main-content').innerHTML = `
            <div class="error-message">
                <h2>${currentLang === 'ko' ? '콘텐츠를 불러올 수 없습니다' : 'Loading Failed'}</h2>
                <p>${currentLang === 'ko' ? '다시 시도해 주세요' : 'Please, try again.'} ${error.message}</p>
            </div>
        `;
    }
}

// 네비게이션 UI 업데이트 헬퍼 함수
function updateNavigationUI(targetPage) {
    document.querySelectorAll('.nav-item').forEach(nav => {
        if (nav.getAttribute('data-page') === targetPage) {
            nav.classList.add('active');
        } else {
            nav.classList.remove('active');
        }
    });
}

// 데이터 로드 함수
async function loadData(path) {
    const cacheKey = `${currentLang}_${path}`;
    if (dataCache[cacheKey]) {
        return dataCache[cacheKey];
    }
    
    const url = `data/${currentLang}/${path}.json`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP 오류: ${response.status} - ${url}`);
        }
        
        const jsonText = await response.text();
        const data = parseJSONWithErrorInfo(jsonText, url);
        dataCache[cacheKey] = data;
        return data;
    } catch (error) {
        console.error(`데이터 로드 실패 (${url}):`, error.message);
        
        if (currentLang === 'ko') {
            throw error;
        }
        
        console.warn(`${currentLang} 언어의 ${path}.json 로드 실패, 기본 언어(ko)로 시도합니다.`);
        
        try {
            const fallbackUrl = `data/ko/${path}.json`;
            const response = await fetch(fallbackUrl);
            if (!response.ok) {
                throw new Error(`HTTP 오류: ${response.status} - ${fallbackUrl}`);
            }
            
            const jsonText = await response.text();
            const data = parseJSONWithErrorInfo(jsonText, fallbackUrl);
            
            const koKey = `ko_${path}`;
            if (!dataCache[koKey]) {
                dataCache[koKey] = data;
            }
            
            return data;
        } catch (fallbackError) {
            console.error(`기본 언어 데이터 로드도 실패 (${path}):`, fallbackError.message);
            throw fallbackError;
        }
    }
}

// 헤더 로드 함수 (네비게이션 클릭 로직 개선)
async function loadAndRenderHeader() {
    try {
        const data = await loadData('header');
        const headerElement = document.getElementById('main-header');
        
        headerElement.innerHTML = `
            <div class="logo">
                <div class="logo-text">${data.logoText}</div>
            </div>
            <div class="header-right">
                <div class="language-selector">
                    <div class="dropdown">
                        <button class="language-btn">${data.languages.current} <i class="fas fa-chevron-down"></i></button>
                        <div class="dropdown-content">
                            ${Object.entries(data.languages.options).map(([code, name]) => 
                                `<a href="#" data-lang="${code}">${name}</a>`
                            ).join('')}
                        </div>
                    </div>
                </div>
                <nav class="main-nav">
                    ${data.navigation.map(item => 
                        `<button class="nav-item${item.id === currentPage ? ' active' : ''}" data-page="${item.id}">${item.label}</button>`
                    ).join('')}
                </nav>
            </div>
        `;
        
        // 로고 클릭 이벤트
        document.querySelector('.logo').addEventListener('click', async () => {
            if (currentPage !== 'home') {
                currentPage = 'home';
                currentBlogIndex = null; // 초기화
                updateNavigationUI('home');
                
                // 모바일 메뉴 닫기
                const mainNav = document.querySelector('.main-nav');
                mainNav.classList.remove('show-mobile');
                
                // URL 업데이트
                history.pushState({ page: 'home', index: null }, '', '#home');

                await loadPage('home');
            }
        });
        
        // 언어 변경 이벤트
        document.querySelectorAll('.dropdown-content a').forEach(option => {
            option.addEventListener('click', async (e) => {
                e.preventDefault();
                const newLang = e.target.getAttribute('data-lang');
                if (newLang !== currentLang) {
                    await changeLanguage(newLang);
                }
            });
        });
        
        // 내비게이션 아이템 클릭 이벤트 (수정됨)
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', async () => {
                const pageName = item.getAttribute('data-page');
                
                // 1. 블로그 메뉴를 다시 눌렀을 때 (글 읽던 중 -> 목록으로)
                if (pageName === 'blog' && currentPage === 'blog') {
                    // 이미 목록이면 새로고침 안 함 (선택사항)
                    if (currentBlogIndex === null) return; 

                    currentBlogIndex = null; // 목록 보기로 리셋
                    history.pushState({ page: 'blog', index: null }, '', '#blog'); // 주소창 업데이트
                    await loadPage('blog');
                    return;
                }

                // 2. 다른 페이지로 이동할 때
                if (pageName !== currentPage) {
                    updateNavigationUI(pageName);
                    
                    // 모바일 메뉴 닫기
                    const mainNav = document.querySelector('.main-nav');
                    mainNav.classList.remove('show-mobile');
                    
                    const menuBtn = document.querySelector('.mobile-menu-toggle');
                    if (menuBtn) {
                        menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                        menuBtn.setAttribute('aria-label', '메뉴 열기');
                    }
                    
                    // 상태 업데이트 및 히스토리 저장
                    currentPage = pageName;
                    currentBlogIndex = null; // 페이지 이동 시 글 인덱스 초기화
                    
                    history.pushState({ page: pageName, index: null }, '', `#${pageName}`);
                    
                    await loadPage(pageName);
                }
            });
        });
        
        setupMobileMenu();
    } catch (error) {
        console.error('헤더 로드 중 오류:', error);
        document.getElementById('main-header').innerHTML = '<p>헤더를 불러올 수 없습니다</p>';
    }
}

// 히어로 섹션 로드
async function loadAndRenderHero() {
    try {
        const data = await loadData('main');
        const heroElement = document.getElementById('hero-section');
        
        heroElement.innerHTML = `
            <div class="hero-section" style="background-image: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${data.hero.bgImage}');">
                <div class="hero-content">
                    <h1>${renderMarkdown(data.hero.title)}</h1>
                    <p>${renderMarkdown(data.hero.subtitle)}</p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('히어로 섹션 로드 중 오류:', error);
        document.getElementById('hero-section').innerHTML = '';
    }
}

// 푸터 로드
async function loadAndRenderFooter() {
    try {
        const data = await loadData('footer');
        const footerElement = document.getElementById('main-footer');
        
        footerElement.innerHTML = `
            <footer>
                ${renderMarkdown(data.copyright)} | ${renderMarkdown(data.address)} | ${renderMarkdown(data.contact)}
            </footer>
        `;
    } catch (error) {
        console.error('푸터 로드 중 오류:', error);
        document.getElementById('main-footer').innerHTML = '<footer>© 2025 연구실</footer>';
    }
}

// 페이지 로드 및 렌더링
async function loadPage(pageName) {
    currentPage = pageName;

    const mainContent = document.getElementById('main-content');
    const heroSection = document.getElementById('hero-section');
    
    // 히어로 섹션은 home에서만 표시
    heroSection.style.display = pageName === 'home' ? 'block' : 'none';
    if (pageName === 'home') await loadAndRenderHero();

    // 로딩 인디케이터
    mainContent.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>${currentLang === 'ko' ? '콘텐츠를 불러오는 중입니다...' : 'Loading ...'}</p>
        </div>
    `;

    try {
        switch (pageName) {
            case 'home': {
                const data = await loadData('main');
                renderHomePage(data, mainContent);
                break;
            }
            case 'members': {
                const data = await loadData('members');
                renderMembersPage(data, mainContent);
                break;
            }
            case 'publications': {
                const data = await loadData('publications');
                renderPublicationsPage(data, mainContent);
                break;
            }
            case 'projects': {
                const data = await loadData('projects');
                renderProjectsPage(data, mainContent);
                break;
            }
            case 'teaching': {
                const data = await loadData('teaching');
                renderTeachingPage(data, mainContent);
                break;
            }
            case 'album': {
                const data = await loadData('album');
                renderAlbumPage(data, mainContent);
                break;
            }
            case 'blog': {
                const blogData = await loadData('blog');
                const posts = blogData.posts || [];

                // 인덱스 유효성 검사
                if (typeof currentBlogIndex === 'number' &&
                    (currentBlogIndex < 0 || currentBlogIndex >= posts.length)) {
                    currentBlogIndex = null;
                }

                if (typeof currentBlogIndex === 'number') { // 글 뷰
                    await renderBlogPostPage(posts[currentBlogIndex], posts, mainContent);
                } else { // 목록 뷰
                    await renderBlogListPage(posts, mainContent);
                }
                break;
            }
            default:
                throw new Error('알 수 없는 페이지');
        }

        // 애니메이션
        setTimeout(() => {
            document.querySelectorAll('.content-section').forEach((s, i) => {
                setTimeout(() => {
                    s.style.opacity   = '1';
                    s.style.transform = 'translateY(0)';
                }, i * 100);
            });
        }, 100);

    } catch (err) {
        console.error(`페이지 로드 중 오류 (${pageName}):`, err);
        // 에러 처리 로직
        let errorTitle = '콘텐츠를 불러올 수 없습니다';
        let errorMessage = err.message;
        
        mainContent.innerHTML = `
            <div class="error-message">
                <h2 class="error-title">${errorTitle}</h2>
                <p class="error-description">${errorMessage}</p>
                <div class="error-actions">
                    <button onclick="location.reload()" class="btn btn-primary">새로고침</button>
                    <button onclick="loadPage('home')" class="btn btn-secondary">홈으로</button>
                </div>
            </div>
        `;
    }
}

// 블로그 목록 렌더링 (히스토리 추가 로직 적용)
async function renderBlogListPage(posts, container) {
    const listHTML = posts.map((p, i) => `
      <article class="blog-card" data-index="${i}">
        <img src="${p.cover}" alt="${p.title}" class="blog-cover">
        <div class="blog-info">
          <h2>${renderMarkdown(p.title)}</h2>
          <p class="blog-date">${p.date}</p>
          <p>${renderMarkdown(p.subtitle)}</p>
        </div>
      </article>
    `).join('');
    container.innerHTML = `<div class="blog-list">${listHTML}</div>`;

    container.querySelectorAll('.blog-card').forEach(card => {
        card.addEventListener('click', () => {
            currentBlogIndex = Number(card.dataset.index);
            
            // [중요] 글을 클릭하면 히스토리에 추가하여 뒤로가기 가능하게 함
            history.pushState({ page: 'blog', index: currentBlogIndex }, '', `#blog/${currentBlogIndex}`);
            
            loadPage('blog');
            window.scrollTo({ top: 0, behavior: 'auto' });
        });
    });
}

// 블로그 상세 글 렌더링
async function renderBlogPostPage(meta, allPosts, container) {
    if (!meta) {
        container.innerHTML = '<p class="error-message">글을 찾을 수 없습니다.</p>';
        return;
    }

    const mdText = await fetch(meta.md).then(r => r.text());
    const html = marked.parse(mdText);

    const listItems = allPosts
        .map((p, i) => `
            <li class="post-title-item${i === currentBlogIndex ? ' current' : ''}"
                data-index="${i}">
                ${renderMarkdown(p.title)}
            </li>
        `).join('');

    container.innerHTML = `
      <div class="main-content-area">
        <div class="content-section">
          <article class="blog-post">
            <h1>${renderMarkdown(meta.title)}</h1>
            <p class="blog-date">${meta.date}</p>
            <img src="${meta.cover}" alt="${meta.title}" class="blog-cover-lg">
            <div class="blog-content">${html}</div>
          </article>
        </div>

        <div class="content-section">
          <h2 class="post-list-header">${currentLang==='ko' ? '글 목록' : 'Posts'}</h2>
          <ul class="post-title-list">
            ${listItems}
          </ul>
        </div>
      </div>
    `;

    // 사이드바 목록 클릭 시
    container.querySelectorAll('.post-title-item').forEach(item => {
        item.addEventListener('click', () => {
            const idx = Number(item.dataset.index);
            if (idx === currentBlogIndex) return;
            
            currentBlogIndex = idx;
            // 히스토리 추가
            history.pushState({ page: 'blog', index: currentBlogIndex }, '', `#blog/${currentBlogIndex}`);
            
            loadPage('blog');
            window.scrollTo({ top: 0, behavior: 'auto' });
        });
    });
}

// 언어 변경 함수
async function changeLanguage(newLang) {
    if (newLang === currentLang) return;

    Object.keys(dataCache)
          .filter(k => k.endsWith('_blog'))
          .forEach(k => delete dataCache[k]);

    currentLang = newLang;
    
    // 블로그 상세 글을 보고 있었다면, 언어 변경 시 목록으로 나가는 것이 안전할 수 있음
    // 혹은 그대로 유지하고 싶다면 currentBlogIndex를 유지
    if (currentPage === 'blog') currentBlogIndex = null;

    await loadAndRenderHeader();
    await loadPage(currentPage);
    await loadAndRenderFooter();
}

// 홈 페이지 렌더링
function renderHomePage(data, container) {
    let htmlContent = `<div class="main-content-area full-width">`;
    
    if (data.research) {
        htmlContent += `
            <div class="content-section">
                <div class="section-header">${renderMarkdown(data.research.title)}</div>
                <div class="section-content">
                    <div class="research-grid">
                        ${data.research.areas.map(area => `
                            <div class="research-item">
                                <div class="research-icon"><i class="${area.icon}"></i></div>
                                <div class="research-title">${renderMarkdown(area.title)}</div>
                                <div class="research-desc">${renderMarkdown(area.description)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>`;
    }
    
    if (data.labIntro) {
        htmlContent += `
            <div class="content-section">
                <div class="section-header">${renderMarkdown(data.labIntro.title)}</div>
                <div class="section-content">
                    <div class="lab-intro-content">
                        ${data.labIntro.paragraphs.map(p => `<div class="lab-intro-text">${renderMarkdown(p)}</div>`).join('')}
                    </div>
                </div>
            </div>`;
    }
    
    if (data.news) {
        htmlContent += `
            <div class="content-section">
                <div class="section-header">${renderMarkdown(data.news.title)}</div>
                <div class="section-content">
                    <div class="news-timeline">
                        ${data.news.items.map(item => `
                            <div class="news-item">
                                <div class="news-date">${renderMarkdown(item.date)}</div>
                                <div class="news-content">
                                    <h3>${renderMarkdown(item.title)}</h3>
                                    <p>${renderMarkdown(item.description)}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>`;
    }
    
    if (data.partners) {
        htmlContent += `
            <div class="content-section">
                <div class="section-header">${renderMarkdown(data.partners.title)}</div>
                <div class="section-content">
                    <div class="partners">
                        ${data.partners.logos.map(partner => `
                            <img src="${partner.image}" alt="${renderMarkdown(partner.name)}" class="partner-logo" title="${renderMarkdown(partner.name)}" onerror="this.src='img/default-partner.png'; this.onerror=null;">
                        `).join('')}
                    </div>
                </div>
            </div>`;
    }
    
    htmlContent += `</div>`;
    container.innerHTML = htmlContent;
}

// Markdown 유틸
function renderMarkdown(text) {
    if (!text) return '';
    return marked.parse(text);
}

// 멤버 페이지 렌더링
function renderMembersPage(data, container) {
    const isDescriptionArray = Array.isArray(data.professor.description);
    let firstLine = '';
    let restDescription = '';
    
    if (isDescriptionArray) {
        firstLine = data.professor.description[0] || '';
        restDescription = data.professor.description.slice(1).join('\n\n');
    } else {
        firstLine = data.professor.description.split('\n\n')[0];
        restDescription = data.professor.description.substring(firstLine.length).trim();
    }
    
    container.innerHTML = `
        <div class="main-content-area">
            <div class="content-section">
                <div class="section-header">${renderMarkdown(data.professor.title)}</div>
                <div class="section-content">
                    <div class="professor-profile">
                        <div class="professor-card">
                            <div class="professor-photo-container">
                                <img src="${data.professor.photo || 'img/member/default.png'}" alt="${renderMarkdown(data.professor.name)}" class="professor-photo">
                            </div>
                            <div class="professor-info">
                                <h2 class="professor-name">${renderMarkdown(data.professor.name)}</h2>
                                <p class="professor-email">${renderMarkdown(data.professor.email)}</p>
                                <div class="professor-short-desc">${renderMarkdown(firstLine)}</div>
                            </div>
                        </div>
                        <div class="professor-full-description">
                            ${renderMarkdown(restDescription)}
                        </div>
                    </div>
                </div>
            </div>
            
            ${data.categories.map(category => `
                <div class="content-section">
                    <div class="section-header">${renderMarkdown(category.title)}</div>
                    <div class="section-content">
                        <div class="members-grid">
                            ${category.members.map(member => `
                                <div class="member-card" data-member-id="${member.name.replace(/\s+/g, '-').toLowerCase()}">
                                    <div class="member-photo-container">
                                        <img src="${member.photo || 'img/member/default.png'}" alt="${renderMarkdown(member.name)}" class="member-photo">
                                    </div>
                                    <div class="member-info">
                                        <div class="member-name">${renderMarkdown(member.name)}</div>
                                        <div class="member-role">${renderMarkdown(member.role)}</div>
                                        <div class="member-interests">${renderMarkdown(member.interests || '')}</div>
                                        ${member.details ? `<div class="detail-toggle"><i class="fas fa-plus"></i></div>` : ''}
                                    </div>
                                    ${member.details ? `
                                    <div class="member-detail-container">
                                        <div class="member-details">
                                            ${Array.isArray(member.details) ? 
                                                member.details.map(detail => `<div class="member-details-item">${renderMarkdown(detail)}</div>`).join('') 
                                                : 
                                                `<div class="member-details-item">${renderMarkdown(member.details)}</div>`
                                            }
                                        </div>
                                    </div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    setupMemberCardEvents();
}

// 멤버 카드 이벤트
function setupMemberCardEvents() {
  document.querySelectorAll('.member-card').forEach(card => {
    const detailContainer = card.querySelector('.member-detail-container');
    if (!detailContainer) return;

    card.classList.add('has-details');

    const toggleCard = () => {
      const isExpanded = card.classList.contains('expanded');
      document.querySelectorAll('.member-card.expanded').forEach(openCard => {
        if (openCard === card) return;
        openCard.classList.remove('expanded');
        openCard.querySelector('.member-detail-container').classList.remove('active');
        const ico = openCard.querySelector('.detail-toggle i');
        if (ico) { ico.classList.remove('rotate'); ico.classList.replace('fa-minus','fa-plus'); }
      });

      card.classList.toggle('expanded');
      detailContainer.classList.toggle('active');

      const icon = card.querySelector('.detail-toggle i');
      if (icon) {
        icon.classList.toggle('rotate');
        icon.classList.toggle('fa-plus');
        icon.classList.toggle('fa-minus');
      }

      if (!isExpanded) {
        setTimeout(() => detailContainer.scrollIntoView({behavior:'smooth', block:'nearest'}), 300);
      }
    };

    card.addEventListener('click', e => {
      if (e.target.closest('.detail-toggle')) return;
      if (card.classList.contains('expanded') && e.target.closest('.member-detail-container')) return;
      toggleCard();
    });

    const toggleBtn = card.querySelector('.detail-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', e => {
        e.stopPropagation();
        toggleCard();
      });
    }
  });
}

// 출판물 페이지 렌더링
function renderPublicationsPage(data, container) {
    function formatAuthorsList(authors) {
        if (!authors || authors.length === 0) return '';
        const highlightedAuthors = authors.map(author => {
            if (author === "Hongjo Kim" || author === "김홍조") return `<strong>${author}</strong>`;
            return author;
        });
        if (highlightedAuthors.length === 1) return highlightedAuthors[0];
        if (highlightedAuthors.length === 2) return highlightedAuthors.join(' and ');
        const lastAuthor = highlightedAuthors.pop();
        return highlightedAuthors.join(', ') + ', and ' + lastAuthor;
    }
    
    let html = '<div class="main-content-area">';
    
    if (data.journal_papers && data.journal_papers.length > 0) {
        html += `
            <div class="content-section">
                <div class="section-header">Journal Papers</div>
                <div class="section-content">
                    <div class="publications-list">
                        ${data.journal_papers.map((paper, index) => `
                            <div class="publication-item">
                                <h3 class="publication-title">${renderMarkdown(paper.title)}</h3>
                                <div class="publication-authors">${formatAuthorsList(paper.authors)}</div>
                                <div class="publication-venue">
                                    ${renderMarkdown(paper.journal)}
                                    ${paper.year}
                                    ${paper.volume ? `, Volume ${paper.volume}` : ''}
                                    ${paper.issue ? `, Issue ${paper.issue}` : ''}
                                    ${paper.pages ? `, pp. ${paper.pages}` : ''}
                                    ${paper.status !== 'Published' ? ` <span class="publication-status">(${paper.status})</span>` : ''}
                                </div>
                                ${(paper.doi || paper.url) ? 
                                    `<a href="${paper.doi ? 'https://doi.org/'+paper.doi : paper.url}" 
                                        target="_blank" class="publication-link">
                                        ${currentLang === 'ko' ? '논문 링크' : 'Paper Link'} 
                                        <i class="fas fa-external-link-alt"></i>
                                    </a>` : ''}
                            </div>
                            ${index < data.journal_papers.length - 1 ? '<hr class="publication-divider">' : ''}
                        `).join('')}
                    </div>
                </div>
            </div>`;
    }
    
    if (data.international_conference_papers && data.international_conference_papers.length > 0) {
        html += `
            <div class="content-section">
                <div class="section-header">International Conference Papers</div>
                <div class="section-content">
                    <div class="publications-list">
                        ${data.international_conference_papers.map((paper, index) => `
                            <div class="publication-item">
                                <h3 class="publication-title">${renderMarkdown(paper.title)}</h3>
                                <div class="publication-authors">${formatAuthorsList(paper.authors)}</div>
                                <div class="publication-venue">
                                    <em>${renderMarkdown(paper.conference)}</em> ${paper.location ? `${paper.location}` : ''} ${paper.year ? `, ${paper.year}` : ''}
                                    ${paper.date_range ? ` (${paper.date_range})` : ''}
                                    ${paper.pages ? `, pp. ${paper.pages}` : ''}
                                </div>
                            </div>
                            ${index < data.international_conference_papers.length - 1 ? '<hr class="publication-divider">' : ''}
                        `).join('')}
                    </div>
                </div>
            </div>`;
    }

    if (data.domestic_conference_papers && data.domestic_conference_papers.length > 0) {
        html += `
            <div class="content-section">
                <div class="section-header">Domestic Conference Papers</div>
                <div class="section-content">
                    <div class="publications-list">
                        ${data.domestic_conference_papers.map((paper, index) => `
                            <div class="publication-item">
                                <h3 class="publication-title">${renderMarkdown(paper.title)}</h3>
                                <div class="publication-authors">${formatAuthorsList(paper.authors)}</div>
                                <div class="publication-venue">
                                    <em>${renderMarkdown(paper.conference)}</em>${paper.location ? `${paper.location}` : ''} ${paper.year ? `, (${paper.year})` : ''}
                                    ${paper.date_range ? ` (${paper.date_range})` : ''}
                                    ${paper.pages ? `, pp. ${paper.pages}` : ''}
                                </div>
                            </div>
                            ${index < data.domestic_conference_papers.length - 1 ? '<hr class="publication-divider">' : ''}
                        `).join('')}
                    </div>
                </div>
            </div>`;
    }

    if (data.patents && data.patents.length > 0) {
        html += `
            <div class="content-section">
                <div class="section-header">Patents</div>
                <div class="section-content">
                    <div class="publications-list">
                        ${data.patents.map((patent, index) => `
                            <div class="publication-item">
                                <h3 class="publication-title">${renderMarkdown(patent.title)}</h3>
                                <div class="publication-authors"><strong>Inventors:</strong> ${formatAuthorsList(patent.inventors)}</div>
                                <div class="publication-venue">${patent.country} ${patent.patent_type} Patent No. ${patent.patent_number}, ${patent.year}</div>
                            </div>
                            ${index < data.patents.length - 1 ? '<hr class="publication-divider">' : ''}
                        `).join('')}
                    </div>
                </div>
            </div>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
    
    document.querySelectorAll('.section-header').forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
        });
    });
}

// 앨범 페이지 렌더링
function renderAlbumPage(data, container) {
    container.innerHTML = `
        <div class="main-content-area">
            ${data.albums.map(album => `
                <div class="content-section">
                    <div class="section-header">${renderMarkdown(album.title)}</div>
                    <div class="section-content">
                        <p>${renderMarkdown(album.description)}</p>
                        <div class="gallery">
                            ${album.images.map(img => `
                                <div class="gallery-item">
                                    <img src="${img.src}" alt="${renderMarkdown(img.caption)}" data-full="${img.fullSize}">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    document.querySelectorAll('.gallery-item img').forEach(img => {
        img.addEventListener('click', () => {
            const fullSizeUrl = img.getAttribute('data-full') || img.src;
            const caption = img.getAttribute('alt');
            showImageModal(fullSizeUrl, caption);
        });
    });
}

// 이미지 모달
function showImageModal(imageUrl, caption) {
    const modal = document.createElement('div');
    modal.classList.add('image-modal');
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <img src="${imageUrl}" alt="${caption}">
            <p>${caption}</p>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.close-modal').addEventListener('click', () => document.body.removeChild(modal));
    modal.addEventListener('click', (e) => { if (e.target === modal) document.body.removeChild(modal); });
}

// 교육 페이지 렌더링
function renderTeachingPage(data, container) {
    const labels = data.labels || {
        courseCode: "교과목 코드",
        classTime: "강의 시간",
        location: "강의실",
        courseMaterials: "강의 자료",
        teachingPhilosophy: "교육 철학"
    };
    
    function formatNewlines(text) {
        if (!text) return '';
        text = text.replace(/\n{2,}/g, '\n');
        return text.split('\n').map(line => line.trim()).join('<br>');
    }
    
    container.innerHTML = `
        <div class="main-content-area">
            ${data.semesters.map(semester => `
                <div class="content-section">
                    <div class="section-header">${renderMarkdown(semester.title)}</div>
                    <div class="section-content">
                        ${semester.description ? `<p class="semester-description">${renderMarkdown(semester.description)}</p>` : ''}
                        <div class="courses-list">
                            ${semester.courses.map(course => `
                                <div class="course-item">
                                    <h3 class="course-title">${renderMarkdown(course.title)}</h3>
                                    <div class="course-details-inline">
                                        <span class="course-detail-item"><strong>${labels.courseCode}:</strong> ${renderMarkdown(course.code)}</span>
                                        <span class="course-detail-item"><strong>${labels.classTime}:</strong> ${formatNewlines(course.time)}</span>
                                        <span class="course-detail-item"><strong>${labels.location}:</strong> ${renderMarkdown(course.location)}</span>
                                    </div>
                                    <div class="course-description">${renderMarkdown(course.description)}</div>
                                    ${course.materials ? `
                                        <div class="course-materials">
                                            <h4>${labels.courseMaterials}</h4>
                                            <ul>
                                                ${course.materials.map(material => `<li><a href="${material.link}" target="_blank">${renderMarkdown(material.title)}</a></li>`).join('')}
                                            </ul>
                                        </div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `).join('')}
            ${data.teachingPhilosophy ? `
                <div class="content-section">
                    <div class="section-header">${labels.teachingPhilosophy}</div>
                    <div class="section-content">
                        <div class="teaching-philosophy">${renderMarkdown(data.teachingPhilosophy)}</div>
                    </div>
                </div>` : ''}
        </div>
    `;
}

// 프로젝트 페이지 렌더링
function renderProjectsPage(data, container) {
    if (!data || !data.projects || !Array.isArray(data.projects)) {
        container.innerHTML = '<div class="error-message"><h2>오류</h2><p>프로젝트 데이터를 불러올 수 없습니다.</p></div>';
        return;
    }

    let html = '<div class="main-content-area">';
    data.projects.forEach(project => {
        if (!project.title) return;
        html += `
            <div class="content-section">
                <div class="section-header">${renderMarkdown(project.title)}</div>
                <div class="section-content">
                    <div class="project-details">
                        <div class="project-info">
                            ${project.period ? `<div class="project-period"><strong>${currentLang === 'ko' ? '기간:' : 'Period: ' }</strong> ${project.period}</div>` : ''}
                            ${project.funding ? `<div class="project-funding"><strong>${currentLang === 'ko' ? '지원:' : 'Agency: ' }</strong> ${project.funding}</div>` : ''}
                            ${project.description ? `<div class="project-description">${renderMarkdown(project.description)}</div>` : ''}
                            ${project.results && project.results.length > 0 ? `
                                <div class="project-results">
                                    <h3>연구 결과</h3>
                                    <ul>${project.results.map(result => `<li>${renderMarkdown(result)}</li>`).join('')}</ul>
                                </div>` : ''}
                        </div>
                        ${project.image ? `<div class="project-image"><img src="${project.image}" alt="${project.title}" class="project-thumbnail"></div>` : ''}
                    </div>
                </div>
            </div>`;
    });
    html += '</div>';
    container.innerHTML = html;
}

// 브라우저 뒤로가기/앞으로가기 처리 (popstate 이벤트)
window.addEventListener('popstate', async (event) => {
    const state = event.state;
    
    // 상태가 없으면(외부 링크 등) 홈이나 기본 페이지로
    if (!state) {
        currentPage = 'home';
        currentBlogIndex = null;
        updateNavigationUI('home');
        await loadPage('home');
        return;
    }

    // 상태 복원
    currentPage = state.page || 'home';
    
    if (currentPage === 'blog') {
        currentBlogIndex = (state.index !== undefined && state.index !== null) ? state.index : null;
    } else {
        currentBlogIndex = null;
    }

    // UI 동기화
    updateNavigationUI(currentPage);
    
    // 페이지 로드
    await loadPage(currentPage);
});