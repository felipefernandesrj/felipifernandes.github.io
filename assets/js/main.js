/**
 * Felipi Fernandes - Personal Portfolio
 * Main JavaScript File
 * 
 * Handles:
 * - Dynamic project loading from JSON
 * - Card rendering
 * - Animations initialization
 * - Navbar scroll behavior
 */

(function() {
    'use strict';

    // ================================================
    // Configuration
    // ================================================
    
    const CONFIG = {
        projectsJsonPath: './projects.json',
        animationDuration: 800,
        animationDelay: 100
    };

    // ================================================
    // DOM Elements
    // ================================================
    
    const elements = {
        projectsGrid: document.getElementById('projects-grid'),
        loadingState: document.getElementById('loading-state'),
        emptyState: document.getElementById('empty-state'),
        cardTemplate: document.getElementById('project-card-template'),
        navbar: document.querySelector('nav'),
        currentYear: document.getElementById('current-year')
    };

    // ================================================
    // Tag Configuration
    // ================================================
    
    const tagConfig = {
        'javascript': { class: 'tag-javascript', icon: 'file-code' },
        'js': { class: 'tag-javascript', icon: 'file-code' },
        'html': { class: 'tag-html', icon: 'file-code-2' },
        'css': { class: 'tag-css', icon: 'palette' },
        'frontend': { class: 'tag-frontend', icon: 'layout' },
        'backend': { class: 'tag-backend', icon: 'server' },
        'bootstrap': { class: 'tag-bootstrap', icon: 'layout' },
        'standalone': { class: 'tag-standalone', icon: 'package' },
        'ia': { class: 'tag-ia', icon: 'brain' },
        'ai': { class: 'tag-ai', icon: 'brain' },
        'api': { class: 'tag-api', icon: 'plug' },
        'tool': { class: 'tag-tool', icon: 'wrench' },
        'ferramenta': { class: 'tag-ferramenta', icon: 'wrench' }
    };

    // ================================================
    // Initialize
    // ================================================
    
    function init() {
        // Set current year in footer
        if (elements.currentYear) {
            elements.currentYear.textContent = new Date().getFullYear();
        }

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Initialize AOS animations
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: CONFIG.animationDuration,
                once: true,
                offset: 50
            });
        }

        // Setup navbar scroll behavior
        setupNavbarScroll();

        // Load projects
        loadProjects();
    }

    // ================================================
    // Navbar Scroll Behavior
    // ================================================
    
    function setupNavbarScroll() {
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                elements.navbar?.classList.add('scrolled');
            } else {
                elements.navbar?.classList.remove('scrolled');
            }
            lastScrollY = window.scrollY;
        });
    }

    // ================================================
    // Load Projects from JSON
    // ================================================
    
    // Fallback projects data
    const FALLBACK_PROJECTS = [
        {
            "id": "qrcode-generator",
            "name": "Gerador de QR Code",
            "description": "Gerador completo de QR Codes permanentes: URLs, Texto, Telefone, E-mail, SMS, WhatsApp, WiFi e vCard. Sem expiração, sem cadastro.",
            "demo": "/projects/qrcode/index.html",
            "download": "/projects/qrcode/index.html",
            "source": "https://github.com/felipefernandesrj/felipifernandes.github.io/tree/main/projects/qrcode",
            "icon": "qr-code",
            "tags": ["JavaScript", "Bootstrap", "Ferramenta", "Standalone"]
        }
    ];
    
    async function loadProjects() {
        try {
            const response = await fetch(CONFIG.projectsJsonPath);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const projects = data.projects || data;
            
            if (Array.isArray(projects) && projects.length > 0) {
                renderProjects(projects);
            } else {
                // Use fallback if JSON is empty
                renderProjects(FALLBACK_PROJECTS);
            }
        } catch (error) {
            console.error('Error loading projects, using fallback:', error);
            // Use fallback projects on error
            renderProjects(FALLBACK_PROJECTS);
        }
    }

    // ================================================
    // Render Projects
    // ================================================
    
    function renderProjects(projects) {
        // Hide loading state
        if (elements.loadingState) {
            elements.loadingState.remove();
        }

        // Render each project
        projects.forEach((project, index) => {
            const card = createProjectCard(project, index);
            elements.projectsGrid?.appendChild(card);
        });

        // Reinitialize Lucide icons for new elements
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Refresh AOS animations
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }

    // ================================================
    // Create Project Card
    // ================================================
    
    function createProjectCard(project, index) {
        // Clone template
        const template = elements.cardTemplate?.content.cloneNode(true);
        const card = template.querySelector('.project-card');

        if (!card) {
            console.error('Card template not found');
            return document.createElement('div');
        }

        // Set animation delay
        card.setAttribute('data-aos-delay', (index * CONFIG.animationDelay).toString());

        // Set project name
        const nameEl = card.querySelector('.project-name');
        if (nameEl) nameEl.textContent = project.name || 'Projeto sem nome';

        // Set project description
        const descEl = card.querySelector('.project-description');
        if (descEl) descEl.textContent = project.description || '';

        // Set tags
        const tagsContainer = card.querySelector('.project-tags');
        if (tagsContainer && project.tags) {
            project.tags.forEach(tag => {
                const tagEl = createTagElement(tag);
                tagsContainer.appendChild(tagEl);
            });
        }

        // Set demo link
        const demoLink = card.querySelector('.project-demo');
        if (demoLink) {
            if (project.demo) {
                demoLink.href = project.demo;
            } else {
                demoLink.style.display = 'none';
            }
        }

        // Set download link
        const downloadLink = card.querySelector('.project-download');
        if (downloadLink) {
            if (project.download) {
                downloadLink.href = project.download;
                downloadLink.setAttribute('download', '');
            } else {
                downloadLink.style.display = 'none';
            }
        }

        // Set source link
        const sourceLink = card.querySelector('.project-source');
        if (sourceLink) {
            if (project.source) {
                sourceLink.href = project.source;
            } else {
                sourceLink.style.display = 'none';
            }
        }

        // Set icon if specified
        const iconEl = card.querySelector('.project-icon');
        if (iconEl && project.icon) {
            iconEl.setAttribute('data-lucide', project.icon);
        }

        return card;
    }

    // ================================================
    // Create Tag Element
    // ================================================
    
    function createTagElement(tag) {
        const tagEl = document.createElement('span');
        const tagLower = tag.toLowerCase();
        const config = tagConfig[tagLower] || { class: 'tag-default', icon: null };
        
        tagEl.className = `project-tag ${config.class}`;
        tagEl.textContent = tag;
        
        return tagEl;
    }

    // ================================================
    // Show Empty State
    // ================================================
    
    function showEmptyState() {
        // Hide loading state
        if (elements.loadingState) {
            elements.loadingState.remove();
        }

        // Show empty state
        if (elements.emptyState) {
            elements.emptyState.classList.remove('hidden');
        }

        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // ================================================
    // Smooth Scroll for Anchor Links
    // ================================================
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ================================================
    // Run on DOM Ready
    // ================================================
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
