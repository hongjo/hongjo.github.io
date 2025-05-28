document.addEventListener('DOMContentLoaded', () => {
    // 스크롤 이벤트 리스너
    window.addEventListener('scroll', () => {
        handleScrollAnimation();
        toggleBackToTopButton();
    });
    
    // 페이지 상단으로 이동 버튼 이벤트
    const backToTopBtn = document.getElementById('back-to-top');
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // 모바일 메뉴 개선
    setupMobileMenu();
});

// 모바일 메뉴 설정
function setupMobileMenu() {
    const header = document.getElementById('main-header');
    
    // 이미 존재하는 토글 버튼 제거 (중복 방지)
    const existingBtn = header.querySelector('.mobile-menu-toggle');
    if (existingBtn) {
        existingBtn.remove();
    }
    
    // 새 토글 버튼 추가
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.classList.add('mobile-menu-toggle');
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    mobileMenuBtn.setAttribute('aria-label', '메뉴 열기');
    header.appendChild(mobileMenuBtn);
    
    // 토글 이벤트
    mobileMenuBtn.addEventListener('click', () => {
        const mainNav = document.querySelector('.main-nav');
        const isOpen = mainNav.classList.toggle('show-mobile');
        
        // 아이콘 및 라벨 변경
        if (isOpen) {
            mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
            mobileMenuBtn.setAttribute('aria-label', '메뉴 닫기');
        } else {
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            mobileMenuBtn.setAttribute('aria-label', '메뉴 열기');
        }
    });
    
    // 창 크기 변경 이벤트 - 데스크톱 크기로 전환 시 모바일 메뉴 숨김
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            const mainNav = document.querySelector('.main-nav');
            mainNav.classList.remove('show-mobile');
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            mobileMenuBtn.setAttribute('aria-label', '메뉴 열기');
        }
    });
}

// 스크롤 애니메이션 처리
function handleScrollAnimation() {
    const sections = document.querySelectorAll('.content-section');
    
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        // 섹션이 뷰포트에 진입하면 애니메이션 적용
        if (sectionTop < window.innerHeight - 100) {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }
    });
}

// 페이지 상단으로 이동 버튼 토글
function toggleBackToTopButton() {
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (window.pageYOffset > 300) {
        backToTopBtn.style.display = 'flex';
    } else {
        backToTopBtn.style.display = 'none';
    }
}

// 이미지 지연 로딩 처리
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// 접근성 개선
function improveAccessibility() {
    // 탭 인덱스 추가
    document.querySelectorAll('button, a').forEach((el, index) => {
        if (!el.hasAttribute('tabindex')) {
            el.setAttribute('tabindex', '0');
        }
    });
    
    // ARIA 속성 추가
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        const button = dropdown.querySelector('button');
        const content = dropdown.querySelector('.dropdown-content');
        
        const id = `dropdown-${Math.random().toString(36).substring(2, 9)}`;
        content.id = id;
        
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-controls', id);
        
        button.addEventListener('click', () => {
            const expanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', !expanded);
        });
    });
}