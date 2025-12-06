/**
 * Felipi Fernandes - Personal Portfolio
 * Main JavaScript File
 * 
 * Handles:
 * - Dynamic project loading from projects-meta.json
 * - Card rendering with unified metadata
 * - Placeholder cards for "coming soon"
 * - Animations initialization
 * - Navbar scroll behavior
 */

(function() {
    'use strict';

    // ================================================
    // Console Signature
    // ================================================
    
    console.log(`
╔═══════════════════════════════════════╗
║                                       ║
║         Silence is Golden ✨          ║
║                                       ║
║       felipifernandes.com.br          ║
║                                       ║
╚═══════════════════════════════════════╝
    `);

    // ================================================
    // Configuration
    // ================================================
    
    const CONFIG = {
        projectsMetaPath: './projects/projects-meta.json',
        placeholderCount: 2,
        animationDuration: 800,
        animationDelay: 100,
        // URL do Cloudflare Worker - SUBSTITUA PELA SUA URL
        counterApiUrl: 'https://download-counter.YOUR_SUBDOMAIN.workers.dev'
    };

    // ================================================
    // Download Counter Functions (Cloudflare Worker)
    // ================================================

    function formatDownloadCount(count) {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'M';
        } else if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'K';
        }
        return count.toString();
    }

    async function getDownloadCount(projectId) {
        try {
            const response = await fetch(`${CONFIG.counterApiUrl}/count/${projectId}`);
            if (!response.ok) return 0;
            const data = await response.json();
            return data.count || 0;
        } catch (error) {
            console.warn('[Counter] Error getting count:', error);
            return 0;
        }
    }

    async function incrementDownloadCount(projectId) {
        try {
            const response = await fetch(`${CONFIG.counterApiUrl}/count/${projectId}/up`, {
                method: 'POST'
            });
            if (!response.ok) return 0;
            const data = await response.json();
            return data.count || 0;
        } catch (error) {
            console.warn('[Counter] Error incrementing count:', error);
            return 0;
        }
    }

    // ================================================
    // DOM Elements
    // ================================================
    
    const elements = {
        projectsGrid: document.getElementById('projects-grid'),
        loadingState: document.getElementById('loading-state'),
        emptyState: document.getElementById('empty-state'),
        cardTemplate: document.getElementById('project-card-template'),
        placeholderTemplate: document.getElementById('placeholder-card-template'),
        navbar: document.querySelector('nav'),
        currentYear: document.getElementById('current-year')
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
    // Load Projects from Meta JSON
    // ================================================
    
    // Fallback project data
    const FALLBACK_PROJECT = {
        id: "qrcode",
        name: "Gerador de QR Code",
        description: "Crie QR Codes permanentes para links, contatos, WiFi e muito mais. Sem expiração, 100% gratuito.",
        stack: ["JavaScript", "Bootstrap 5", "HTML5", "CSS3"],
        standalone: true,
        icon: "qr-code"
    };
    
    async function loadProjects() {
        try {
            const response = await fetch(CONFIG.projectsMetaPath);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const projectsMeta = await response.json();
            const projects = Object.values(projectsMeta);
            
            if (projects.length > 0) {
                renderProjects(projects);
            } else {
                renderProjects([FALLBACK_PROJECT]);
            }
        } catch (error) {
            console.error('Error loading projects, using fallback:', error);
            renderProjects([FALLBACK_PROJECT]);
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

        // Add placeholder cards
        for (let i = 0; i < CONFIG.placeholderCount; i++) {
            const placeholder = createPlaceholderCard(projects.length + i);
            elements.projectsGrid?.appendChild(placeholder);
        }

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

        // Set standalone badge
        const standaloneBadge = card.querySelector('.project-standalone-badge');
        if (standaloneBadge && project.standalone) {
            standaloneBadge.classList.remove('hidden');
        }

        // Set tags from stack array
        const tagsContainer = card.querySelector('.project-tags');
        if (tagsContainer && project.stack) {
            project.stack.forEach(tech => {
                const tagEl = createTagElement(tech);
                tagsContainer.appendChild(tagEl);
            });
        }

        // Set demo link (opens viewer)
        const demoLink = card.querySelector('.project-demo');
        if (demoLink) {
            demoLink.href = `/projects/viewer.html?project=${project.id}`;
        }

        // Set icon if specified
        const iconEl = card.querySelector('.project-icon');
        if (iconEl && project.icon) {
            iconEl.setAttribute('data-lucide', project.icon);
        }

        // Load and display download count (async)
        const downloadsCountEl = card.querySelector('.downloads-count');
        if (downloadsCountEl && project.id) {
            loadProjectDownloadCount(project.id, downloadsCountEl);
        }

        return card;
    }

    async function loadProjectDownloadCount(projectId, element) {
        const count = await getDownloadCount(projectId);
        element.textContent = formatDownloadCount(count);
    }

    // ================================================
    // Create Placeholder Card
    // ================================================
    
    function createPlaceholderCard(index) {
        const template = elements.placeholderTemplate?.content.cloneNode(true);
        const card = template.querySelector('.placeholder-card');

        if (!card) {
            // Fallback if template not found
            const div = document.createElement('div');
            div.className = 'placeholder-card bg-warm-100/50 rounded-2xl border-2 border-dashed border-warm-300 p-6 flex flex-col items-center justify-center min-h-[280px]';
            div.setAttribute('data-aos', 'fade-up');
            div.setAttribute('data-aos-delay', (index * CONFIG.animationDelay).toString());
            div.innerHTML = `
                <div class="w-12 h-12 bg-warm-200/50 rounded-xl flex items-center justify-center mb-4">
                    <i data-lucide="wrench" class="w-6 h-6 text-warm-400"></i>
                </div>
                <p class="text-warm-500 font-medium text-sm mb-1">Em breve...</p>
                <p class="text-warm-400 text-xs text-center">Novo projeto em desenvolvimento</p>
            `;
            return div;
        }

        // Set animation delay
        card.setAttribute('data-aos-delay', (index * CONFIG.animationDelay).toString());

        return card;
    }

    // ================================================
    // Create Tag Element
    // ================================================
    
    function createTagElement(tech) {
        const tagEl = document.createElement('span');
        tagEl.className = 'inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-warm-200 text-warm-700';
        tagEl.textContent = tech;
        return tagEl;
    }

    // ================================================
    // Show Empty State
    // ================================================
    
    function showEmptyState() {
        if (elements.loadingState) {
            elements.loadingState.remove();
        }

        if (elements.emptyState) {
            elements.emptyState.classList.remove('hidden');
        }

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
