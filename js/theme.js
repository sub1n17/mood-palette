// 페이지 로드 시 다크모드 적용
window.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelectorAll('.dark_toggle');
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        toggle.forEach((toggle) => (toggle.checked = true));
    }
});

// 다크모드 토글
const dark = (event) => {
    const toggle = document.querySelectorAll('.dark_toggle');
    const isDark = event.target.checked;

    if (isDark) {
        document.body.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }

    toggle.forEach((t) => (t.checked = isDark));
};
