// 현재 선택된 언어와 페이지
let currentLang = 'ko';
let currentPage = 'home';

// 데이터 캐시
const dataCache = {};

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// 앱 초기화 함수 수정
async function initApp() {
    try {
        // 헤더 로드
        await loadAndRenderHeader();
        
        // 기본 페이지 콘텐츠 로드 (히어로 섹션은 loadPage에서 처리)
        await loadPage('home');
        
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

// 데이터 로드 함수 수정 - 대체 언어 로직 추가
async function loadData(path) {
    // 캐시 확인
    const cacheKey = `${currentLang}_${path}`;
    if (dataCache[cacheKey]) {
        return dataCache[cacheKey];
    }
    
    try {
        const response = await fetch(`data/${currentLang}/${path}.json`);
        if (!response.ok) {
            throw new Error(`HTTP 오류: ${response.status}`);
        }
        const data = await response.json();
        
        // 캐시에 저장
        dataCache[cacheKey] = data;
        return data;
    } catch (error) {
        console.warn(`${currentLang} 언어의 ${path}.json 로드 실패, 기본 언어(ko)로 시도합니다.`);
        
        // 현재 언어가 이미 한국어인 경우 또는 기본 언어 데이터도 로드 실패한 경우
        if (currentLang === 'ko') {
            console.error(`데이터 로드 오류 (${path}):`, error);
            throw error;
        }
        
        // 기본 언어(한국어) 데이터 로드 시도
        try {
            const response = await fetch(`data/ko/${path}.json`);
            if (!response.ok) {
                throw new Error(`HTTP 오류: ${response.status}`);
            }
            const data = await response.json();
            
            // 다른 언어용으로 캐시에 저장 (다음 요청 시 바로 사용)
            dataCache[cacheKey] = data;
            return data;
        } catch (fallbackError) {
            console.error(`기본 언어 데이터 로드 실패 (${path}):`, fallbackError);
            throw fallbackError;
        }
    }
}

// 헤더 로드 함수 수정 - 로고 클릭 이벤트 추가
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
        
        // 로고 클릭 시 홈페이지로 이동
        document.querySelector('.logo').addEventListener('click', async () => {
            if (currentPage !== 'home') {
                currentPage = 'home';
                
                // 내비게이션 활성 상태 제거
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                
                // 모바일 메뉴 닫기
                const mainNav = document.querySelector('.main-nav');
                mainNav.classList.remove('show-mobile');
                
                // 모바일 메뉴 버튼 아이콘 변경
                const menuBtn = document.querySelector('.mobile-menu-toggle');
                if (menuBtn) {
                    menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                    menuBtn.setAttribute('aria-label', '메뉴 열기');
                }
                
                await loadPage('home');
            }
        });
        
        // 언어 변경 이벤트 리스너 수정
        document.querySelectorAll('.dropdown-content a').forEach(option => {
            option.addEventListener('click', async (e) => {
                e.preventDefault();
                const newLang = e.target.getAttribute('data-lang');
                if (newLang !== currentLang) {
                    // 개선된 언어 변경 함수 호출
                    await changeLanguage(newLang);
                }
            });
        });
        
        // 내비게이션 이벤트 리스너
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', async () => {
                const pageName = item.getAttribute('data-page');
                if (pageName !== currentPage) {
                    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                    item.classList.add('active');
                    
                    // 모바일 메뉴 닫기
                    const mainNav = document.querySelector('.main-nav');
                    mainNav.classList.remove('show-mobile');
                    
                    // 모바일 메뉴 버튼 아이콘 변경
                    const menuBtn = document.querySelector('.mobile-menu-toggle');
                    if (menuBtn) {
                        menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                        menuBtn.setAttribute('aria-label', '메뉴 열기');
                    }
                    
                    await loadPage(pageName);
                }
            });
        });
        
        // 모바일 메뉴 설정
        setupMobileMenu();
    } catch (error) {
        console.error('헤더 로드 중 오류:', error);
        document.getElementById('main-header').innerHTML = '<p>헤더를 불러올 수 없습니다</p>';
    }
}

// 히어로 섹션 로드 및 렌더링 수정 - CTA 버튼 제거
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

// 연구실 소개 섹션으로 스크롤하는 함수
function scrollToLabIntro() {
    const sections = document.querySelectorAll('.content-section');
    // 두 번째 섹션이 연구실 소개 섹션
    if (sections.length >= 2) {
        sections[1].scrollIntoView({ behavior: 'smooth' });
    }
}

// 푸터 렌더링 함수 수정 - 마크다운 적용
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

// 페이지 로드 및 렌더링 함수 수정 - 히어로 섹션 조건부 표시
async function loadPage(pageName) {
    currentPage = pageName;
    const mainContent = document.getElementById('main-content');
    const heroSection = document.getElementById('hero-section');
    
    // 히어로 섹션 표시 여부 설정
    if (pageName === 'home') {
        await loadAndRenderHero(); // 홈 페이지일 때 히어로 섹션 로드
        heroSection.style.display = 'block';
    } else {
        heroSection.style.display = 'none'; // 다른 페이지일 때 히어로 섹션 숨김
    }
    
    // 로딩 표시
    mainContent.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>${currentLang === 'ko' ? '콘텐츠를 불러오는 중입니다...' : 'Loading ...'}</p>
        </div>
    `;
    
    try {
        // 페이지 데이터 로드
        let pageData;
        
        switch(pageName) {
            case 'home':
                pageData = await loadData('main');
                renderHomePage(pageData, mainContent);
                break;
            case 'members':
                pageData = await loadData('members');
                renderMembersPage(pageData, mainContent);
                // setupMemberCardEvents는 renderMembersPage 내에서 호출하므로 여기서는 호출하지 않음
                break;
            case 'publications':
                pageData = await loadData('publications');
                renderPublicationsPage(pageData, mainContent);
                break;
            case 'projects':
                pageData = await loadData('projects');
                renderProjectsPage(pageData, mainContent);
                break;
            case 'teaching':
                pageData = await loadData('teaching');
                renderTeachingPage(pageData, mainContent);
                break;
            case 'album':
                pageData = await loadData('album');
                renderAlbumPage(pageData, mainContent);
                break;
            default:
                throw new Error('알 수 없는 페이지');
        }
        
        // 애니메이션 적용
        setTimeout(() => {
            const sections = document.querySelectorAll('.content-section');
            sections.forEach((section, index) => {
                setTimeout(() => {
                    section.style.opacity = '1';
                    section.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }, 100);
        
    } catch (error) {
        console.error(`페이지 로드 중 오류 (${pageName}):`, error);
        mainContent.innerHTML = `
            <div class="error-message">
                <h2>콘텐츠를 불러올 수 없습니다</h2>
                <p>다시 시도해주세요: ${error.message}</p>
            </div>
        `;
    }
}

// 언어 변경 처리 개선
async function changeLanguage(newLang) {
    try {
        // 언어 변경 전 현재 페이지 기억
        const prevPage = currentPage;
        
        // 언어 변경
        currentLang = newLang;
        
        // 헤더 다시 로드 (언어 UI 업데이트)
        await loadAndRenderHeader();
        
        // 현재 페이지 다시 로드
        await loadPage(prevPage);
        
        // 푸터 다시 로드
        await loadAndRenderFooter();
        
        console.log(`언어가 ${newLang}로 변경되었습니다.`);
    } catch (error) {
        console.error('언어 변경 중 오류:', error);
        // 오류가 발생해도 UI는 변경된 언어로 유지
    }
}

// 홈페이지 렌더링 함수 수정 - 조건부 섹션 렌더링
function renderHomePage(data, container) {
    let htmlContent = `<div class="main-content-area full-width">`;
    
    // 연구 영역 섹션 (조건부 렌더링)
    if (data.research) {
        htmlContent += `
            <div class="content-section">
                <div class="section-header">${renderMarkdown(data.research.title)}</div>
                <div class="section-content">
                    <div class="research-grid">
                        ${data.research.areas.map(area => `
                            <div class="research-item">
                                <div class="research-icon">
                                    <i class="${area.icon}"></i>
                                </div>
                                <div class="research-title">${renderMarkdown(area.title)}</div>
                                <div class="research-desc">${renderMarkdown(area.description)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    // 연구실 소개 섹션 (조건부 렌더링)
    if (data.labIntro) {
        htmlContent += `
            <div class="content-section">
                <div class="section-header">${renderMarkdown(data.labIntro.title)}</div>
                <div class="section-content">
                    <div class="lab-intro-content">
                        ${data.labIntro.paragraphs.map(p => 
                            `<div class="lab-intro-text">${renderMarkdown(p)}</div>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    // 최근 소식 섹션 (조건부 렌더링)
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
            </div>
        `;
    }
    
    // 협력 기관 섹션 (조건부 렌더링)
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
            </div>
        `;
    }
    
    htmlContent += `</div>`;
    container.innerHTML = htmlContent;
}

// Markdown 변환 유틸리티 함수 추가
function renderMarkdown(text) {
    if (!text) return '';
    return marked.parse(text);
}

// 멤버 페이지 렌더링 함수 수정 - 기본 이미지 추가
function renderMembersPage(data, container) {
    // description이 배열인지 문자열인지 확인 부분 유지
    const isDescriptionArray = Array.isArray(data.professor.description);
    
    // 문자열 형태일 경우 첫 줄과 나머지 분리 부분 유지
    let firstLine = '';
    let restDescription = '';
    
    if (isDescriptionArray) {
        // 배열인 경우 첫 항목을 첫 줄로, 나머지를 결합
        firstLine = data.professor.description[0] || '';
        restDescription = data.professor.description.slice(1).join('\n\n');
    } else {
        // 문자열인 경우 기존 방식대로 처리
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
                        <!-- 나머지 설명 부분을 분리하여 전체 너비로 표시 -->
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
                                                member.details.map(detail => `
                                                    <div class="member-details-item">${renderMarkdown(detail)}</div>
                                                `).join('') 
                                                : 
                                                `<div class="member-details-item">${renderMarkdown(member.details)}</div>`
                                            }
                                        </div>
                                    </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // 멤버 카드 클릭 이벤트 추가
    setupMemberCardEvents();
}

// 멤버 카드 클릭 이벤트 설정 함수 추가
function setupMemberCardEvents() {
    // 모든 멤버 카드에 클릭 이벤트 리스너 추가
    document.querySelectorAll('.member-card').forEach(card => {
        // details 필드가 있는 카드만 클릭 이벤트 추가
        const detailContainer = card.querySelector('.member-detail-container');
        if (!detailContainer) return;
        
        const toggleBtn = card.querySelector('.detail-toggle');
        if (!toggleBtn) return;
        
        toggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // 카드 토글 상태 확인
            const isExpanded = card.classList.contains('expanded');
            
            // 모든 카드를 접기
            document.querySelectorAll('.member-card.expanded').forEach(expandedCard => {
                if (expandedCard !== card) {
                    expandedCard.classList.remove('expanded');
                    expandedCard.querySelector('.member-detail-container').classList.remove('active');
                    const otherToggle = expandedCard.querySelector('.detail-toggle i');
                    if (otherToggle) {
                        otherToggle.classList.remove('rotate');
                        otherToggle.classList.replace('fa-minus', 'fa-plus');
                    }
                }
            });
            
            // 현재 카드 토글
            card.classList.toggle('expanded');
            detailContainer.classList.toggle('active');
            
            // 아이콘 회전 효과 및 변경
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('rotate');
                if (isExpanded) {
                    icon.classList.replace('fa-minus', 'fa-plus');
                } else {
                    icon.classList.replace('fa-plus', 'fa-minus');
                }
            }
            
            // 카드가 확장되면 해당 카드로 스크롤
            if (!isExpanded) {
                setTimeout(() => {
                    detailContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 300);
            }
        });
    });
}

// 출판물 페이지 렌더링 함수 - 새로운 JSON 구조 지원
function renderPublicationsPage(data, container) {
    // 저자 목록을 포맷팅하는 헬퍼 함수
    function formatAuthorsList(authors) {
        if (!authors || authors.length === 0) return '';
        
        // 연구실 구성원 이름 강조 (김홍조 교수님과 연구실 구성원 이름을 볼드체로)
        const highlightedAuthors = authors.map(author => {
            if (author === "Hongjo Kim" || 
                author === "김홍조") {
                return `<strong>${author}</strong>`;
            }
            return author;
        });
        
        if (highlightedAuthors.length === 1) return highlightedAuthors[0];
        if (highlightedAuthors.length === 2) return highlightedAuthors.join(' and ');
        
        // 마지막 저자 앞에 'and' 추가
        const lastAuthor = highlightedAuthors.pop();
        return highlightedAuthors.join(', ') + ', and ' + lastAuthor;
    }
    
    let html = '<div class="main-content-area">';
    
    // 1. 저널 논문 섹션
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
                                    </a>` : ''
                                }
                            </div>
                            ${index < data.journal_papers.length - 1 ? '<hr class="publication-divider">' : ''}

                        `).join('')}

                    </div>
                </div>
            </div>
        `;
    }
    
    // 2. 국제 학회 논문 섹션
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
            </div>
        `;
    }
    
    // 3. 국내 학회 논문 섹션
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
            </div>
        `;
    }
    
    // 4. 특허 섹션
    if (data.patents && data.patents.length > 0) {
        html += `
            <div class="content-section">
                <div class="section-header">Patents</div>
                <div class="section-content">
                    <div class="publications-list">
                        ${data.patents.map((patent, index) => `
                            <div class="publication-item">
                                <h3 class="publication-title">${renderMarkdown(patent.title)}</h3>
                                <div class="publication-authors">
                                    <strong>Inventors:</strong> ${formatAuthorsList(patent.inventors)}
                                </div>
                                <div class="publication-venue">
                                    ${patent.country} ${patent.patent_type} Patent No. ${patent.patent_number}, ${patent.year}
                                </div>
                            </div>
                            ${index < data.patents.length - 1 ? '<hr class="publication-divider">' : ''}

                        `).join('')}

                    </div>
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
    
    // 카테고리별 섹션을 펼치기/접기 기능 추가 (선택 사항)
    document.querySelectorAll('.section-header').forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
        });
    });
}

// 앨범 페이지 렌더링 수정 - 마크다운 적용
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
    
    // 이미지 클릭 시 모달 표시
    document.querySelectorAll('.gallery-item img').forEach(img => {
        img.addEventListener('click', () => {
            const fullSizeUrl = img.getAttribute('data-full') || img.src;
            const caption = img.getAttribute('alt');
            showImageModal(fullSizeUrl, caption);
        });
    });
}

// 이미지 모달 표시 함수 수정 - 마크다운 지원
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
    
    // 모달 닫기 이벤트
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// 교육 페이지 렌더링 함수 수정
function renderTeachingPage(data, container) {
    // labels이 없는 경우를 대비한 기본값 설정
    const labels = data.labels || {
        courseCode: "교과목 코드",
        classTime: "강의 시간",
        location: "강의실",
        courseMaterials: "강의 자료",
        teachingPhilosophy: "교육 철학"
    };
    
    // 줄바꿈 처리 함수 추가
    function formatNewlines(text) {
        if (!text) return '';
        // Replace multiple newlines with a single newline
        text = text.replace(/\n{2,}/g, '\n');
        // Convert single newline to <br> for HTML rendering
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
                                                ${course.materials.map(material => `
                                                    <li><a href="${material.link}" target="_blank">${renderMarkdown(material.title)}</a></li>
                                                `).join('')}
                                            </ul>
                                        </div>
                                    ` : ''}
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
                        <div class="teaching-philosophy">
                            ${renderMarkdown(data.teachingPhilosophy)}
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// 프로젝트 페이지 렌더링 함수 추가
function renderProjectsPage(data, container) {
    if (!data || !data.projects || !Array.isArray(data.projects)) {
        container.innerHTML = '<div class="error-message"><h2>오류</h2><p>프로젝트 데이터를 불러올 수 없습니다.</p></div>';
        return;
    }

    let html = '<div class="main-content-area">';
    
    data.projects.forEach(project => {
        if (!project.title) return; // 제목이 없는 프로젝트는 건너뜀
        
        html += `
            <div class="content-section">
                <div class="section-header">${renderMarkdown(project.title)}</div>
                <div class="section-content">
                    <div class="project-details">
                        <div class="project-info">
                            ${project.period ? `<div class="project-period"><strong>${currentLang === 'ko' ? '기간:' : 'Period: '}</strong> ${project.period}</div>` : ''}
                            ${project.funding ? `<div class="project-funding"><strong>${currentLang === 'ko' ? '지원:' : 'Agency: '}</strong> ${project.funding}</div>` : ''}
                            ${project.description ? `<div class="project-description">${renderMarkdown(project.description)}</div>` : ''}
                            
                            ${project.results && project.results.length > 0 ? `
                                <div class="project-results">
                                    <h3>연구 결과</h3>
                                    <ul>
                                        ${project.results.map(result => `<li>${renderMarkdown(result)}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                        ${project.image ? `
                            <div class="project-image">
                                <img src="${project.image}" alt="${project.title}" class="project-thumbnail">
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}