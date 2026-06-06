/**
 * MyBlog — 主脚本
 * 功能：夜间模式切换、移动端菜单、分享功能、导航栏滚动效果
 */

(function () {
    'use strict';

    // ==================== DOM 元素引用 ====================
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon   = document.getElementById('themeIcon');
    const menuToggle  = document.getElementById('menuToggle');
    const navLinks    = document.getElementById('navLinks');
    const navbar      = document.getElementById('navbar');
    const btnShare    = document.getElementById('btnShare');
    const shareToast  = document.getElementById('shareToast');
    const htmlElement = document.documentElement;

    // ==================== 1. 夜间模式切换 ====================
    const DARK_THEME_KEY = 'myblog-theme';

    /**
     * 获取用户之前的主题偏好
     * 优先级：localStorage > 系统偏好 > 默认浅色
     */
    function getSavedTheme() {
        const saved = localStorage.getItem(DARK_THEME_KEY);
        if (saved === 'dark' || saved === 'light') {
            return saved;
        }
        // 检测系统是否开启了深色模式
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    /**
     * 应用主题到页面
     * @param {'light'|'dark'} theme
     */
    function applyTheme(theme) {
        if (theme === 'dark') {
            htmlElement.setAttribute('data-theme', 'dark');
            if (themeIcon) {
                themeIcon.className = 'fa-solid fa-sun';
            }
        } else {
            htmlElement.removeAttribute('data-theme');
            if (themeIcon) {
                themeIcon.className = 'fa-solid fa-moon';
            }
        }
    }

    /**
     * 切换主题
     */
    function toggleTheme() {
        const current = htmlElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem(DARK_THEME_KEY, next);
    }

    // 初始化主题
    const initialTheme = getSavedTheme();
    applyTheme(initialTheme);

    // 绑定切换事件
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // 监听系统主题变化（当用户没有手动设置时生效）
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
            // 只有当用户没有在 localStorage 中手动保存过偏好时，才跟随系统
            if (!localStorage.getItem(DARK_THEME_KEY)) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    // ==================== 2. 移动端汉堡菜单 ====================
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function () {
            navLinks.classList.toggle('open');
        });

        // 点击导航链接后自动关闭菜单
        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navLinks.classList.remove('open');
            });
        });

        // 点击页面其他区域关闭菜单
        document.addEventListener('click', function (e) {
            if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
                navLinks.classList.remove('open');
            }
        });
    }

    // ==================== 3. 导航栏滚动阴影 ====================
    if (navbar) {
        function updateNavbarShadow() {
            if (window.scrollY > 10) {
                navbar.style.boxShadow = 'var(--shadow-md)';
            } else {
                navbar.style.boxShadow = 'none';
            }
        }

        window.addEventListener('scroll', updateNavbarShadow, { passive: true });
        // 初始检查
        updateNavbarShadow();
    }

    // ==================== 4. 分享功能（文章详情页） ====================
    if (btnShare && shareToast) {
        btnShare.addEventListener('click', function () {
            const url = window.location.href;
            const title = document.title;

            // 优先使用 Web Share API（移动端体验更好）
            if (navigator.share) {
                navigator.share({ title: title, url: url }).catch(function () {
                    // 用户取消分享，不显示 Toast
                });
            } else {
                // 桌面端：复制链接到剪贴板
                copyToClipboard(url);
            }
        });
    }

    /**
     * 复制文本到剪贴板并显示 Toast 提示
     * @param {string} text
     */
    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () {
                showToast();
            }).catch(function () {
                // 降级方案
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    }

    /**
     * 降级复制方案（使用 textarea）
     */
    function fallbackCopy(text) {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            showToast();
        } catch (err) {
            // 复制失败，静默处理
        }
        document.body.removeChild(textarea);
    }

    /**
     * 显示 Toast 提示
     */
    function showToast() {
        if (!shareToast) return;
        shareToast.classList.add('show');
        clearTimeout(shareToast._timeout);
        shareToast._timeout = setTimeout(function () {
            shareToast.classList.remove('show');
        }, 2000);
    }

    // ==================== 5. 页面加载动画（可选） ====================
    // 页面加载完成后添加一个简短的淡入效果
    document.addEventListener('DOMContentLoaded', function () {
        document.body.style.opacity = '0';
        // 强制回流
        document.body.offsetHeight;
        document.body.style.transition = 'opacity 0.4s ease';
        document.body.style.opacity = '1';
    });

})();
