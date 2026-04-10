class TraineeLayout extends HTMLElement {
    async connectedCallback() {
        // Wait for the browser to finish parsing the inner HTML children of this element
        setTimeout(async () => {
            const children = Array.from(this.childNodes);

            // Show a temporary loading state
            this.className = "flex h-screen w-full items-center justify-center bg-gray-50";
            this.innerHTML = '<div class="text-xl font-bold text-[var(--color-primary)]">جاري التحميل...</div>';

            try {
                // Fetch component HTMLs
                const [navbarRes, sidebarRes] = await Promise.all([
                    fetch('../../components/trainee-navbar.html'),
                    fetch('../../components/side-bar.html')
                ]);

                if (!navbarRes.ok || !sidebarRes.ok) {
                    throw new Error("Failed to load components");
                }

                const navbarText = await navbarRes.text();
                const sidebarText = await sidebarRes.text();

                // Extract specific components safely using DOMParser
                // This prevents nested <html> or <body> tags if the components are full HTML files
                const parser = new DOMParser();
                const navbarDoc = parser.parseFromString(navbarText, 'text/html');
                const sidebarDoc = parser.parseFromString(sidebarText, 'text/html');

                const navEl = navbarDoc.querySelector('nav') || navbarDoc.body.children[0];
                const mobileDrawer = navbarDoc.querySelector('#mobileDrawer') || sidebarDoc.querySelector('#mobileDrawer');

                const sidebarEl = sidebarDoc.querySelector('#sidebar');
                const overlayEl = sidebarDoc.querySelector('#overlay') || navbarDoc.querySelector('#overlay');

                const navHTML = navEl ? navEl.outerHTML : '';
                const drawerHTML = mobileDrawer ? mobileDrawer.outerHTML : '';
                const sideHTML = sidebarEl ? sidebarEl.outerHTML : '';
                const overHTML = overlayEl ? overlayEl.outerHTML : '';

                // Set final layout styling
                this.className = "h-screen flex flex-col overflow-hidden w-full relative p-0 m-0";

                // Inject the fetched HTMLs
                this.innerHTML = `
                    ${navHTML}
                    ${drawerHTML}
                    ${overHTML}
                    <div class="flex flex-1 overflow-hidden w-full relative">
                        ${sideHTML}
                        <div class="w-full lg:w-[75%] h-full overflow-y-auto bg-[#f8f9fa] lg:bg-transparent custom-scrollbar relative" id="layout-outlet">
                        </div>
                    </div>
                `;

                // Re-inject original page children into the layout outlet
                const outlet = this.querySelector('#layout-outlet');
                children.forEach(child => {
                    if (child.textContent && child.textContent.trim() === 'جاري التحميل...') return;
                    outlet.appendChild(child);
                });

                // Wait to attach listeners until DOM recognizes the new elements
                setTimeout(() => this.setupScripts(), 50);

            } catch (error) {
                console.error('Error loading layout components:', error);
                this.innerHTML = '<div class="p-10 text-xl font-bold text-red-500 text-center">حدث خطأ في تحميل قوالب التخطيط. تأكد من تشغيل المشروع عبر سيرفر محلي (Live Server).</div>';
            }
            
            // Handle Active Tab State
            const activeTabId = this.getAttribute('active-tab');
            if (activeTabId) {
                const activateLink = (link) => {
                    if (!link) return;
                    link.classList.remove('text-[var(--color-fifth)]', 'border-[var(--color-fifth)]', 'border-[#4772AB]');
                    link.classList.add('text-white', 'border-white', 'active');
                    
                    // Specific logic for SVGs inside the active link to maintain white strokes/fills
                    const svgPaths = link.querySelectorAll('path');
                    svgPaths.forEach(path => {
                        if (path.getAttribute('stroke') && path.getAttribute('stroke') !== 'none') path.setAttribute('stroke', 'white');
                        if (path.getAttribute('fill') && path.getAttribute('fill') !== 'none') path.setAttribute('fill', 'white');
                    });
                };

                const activeLink = this.querySelector(`#${activeTabId}`);
                if (activeLink) {
                    activateLink(activeLink);

                    // If it's a sub-item, find its parent main item and activate it too
                    const parentSideItem = activeLink.closest('.side-item');
                    if (parentSideItem) {
                        // The parent could be an 'a' (no submenu) or a 'div' (has submenu)
                        const mainLink = parentSideItem.firstElementChild;
                        if (mainLink && mainLink !== activeLink) {
                            activateLink(mainLink);
                            
                            // Keep the accordion open if a sub-item is active
                            parentSideItem.classList.add('is-open');
                        }
                    }
                }
            }
        }, 0);
    }

    setupScripts() {
        // Submenu accordion click functionality
        const submenuTriggers = this.querySelectorAll('.submenu-trigger');
        submenuTriggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                const parentItem = trigger.closest('.side-item');
                if (parentItem) {
                    // Optional: Close other open submenus (accordion mode)
                    // const openItems = this.querySelectorAll('.side-item.is-open');
                    // openItems.forEach(item => { if (item !== parentItem) item.classList.remove('is-open') });
                    
                    parentItem.classList.toggle('is-open');
                }
            });
        });

        const menuToggle = this.querySelector('#menuToggle');
        const closeMenu = this.querySelector('#closeMenu');
        const sidebar = this.querySelector('#sidebar');
        const overlay = this.querySelector('#overlay');

        function openMenu() {
            if (sidebar) {
                sidebar.classList.remove('translate-x-full');
                sidebar.classList.add('translate-x-0');
            }
            if (overlay) overlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        function closeSidebar() {
            if (sidebar) {
                sidebar.classList.add('translate-x-full');
                sidebar.classList.remove('translate-x-0');
            }
            if (overlay) overlay.classList.add('hidden');
            document.body.style.overflow = '';
        }

        // Sometimes menu toggle is in the navbar, sometimes inside the page content
        // We select all #menuToggle buttons to be safe
        const allMenuToggles = this.querySelectorAll('#menuToggle');
        allMenuToggles.forEach(btn => btn.addEventListener('click', openMenu));

        if (closeMenu) closeMenu.addEventListener('click', closeSidebar);
        if (overlay) overlay.addEventListener('click', closeSidebar);

        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024) closeSidebar();
        });

        // Mobile Drawer functionality
        const menuBtn = this.querySelector("#menuBtn");
        const closeBtn = this.querySelector("#closeBtn");
        const mobileDrawer = this.querySelector("#mobileDrawer");
        const drawerBackdrop = this.querySelector("#drawerBackdrop");
        const drawerContent = this.querySelector("#drawerContent");

        function openDrawer() {
            if (mobileDrawer) mobileDrawer.classList.remove("hidden");
            setTimeout(() => {
                if (drawerBackdrop) drawerBackdrop.classList.remove("opacity-0");
                if (drawerContent) drawerContent.classList.remove("translate-x-full");
            }, 10);
        }

        function closeDrawer() {
            if (drawerBackdrop) drawerBackdrop.classList.add("opacity-0");
            if (drawerContent) drawerContent.classList.add("translate-x-full");
            setTimeout(() => {
                if (mobileDrawer) mobileDrawer.classList.add("hidden");
            }, 300);
        }

        if (menuBtn) menuBtn.addEventListener("click", openDrawer);
        if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
        if (drawerBackdrop) drawerBackdrop.addEventListener("click", closeDrawer);

        // Mobile Search Toggle
        const mobileSearchBtn = this.querySelector("#mobileSearchBtn");
        const mobileSearchField = this.querySelector("#mobileSearchField");
        const closeMobileSearch = this.querySelector("#closeMobileSearch");

        if (mobileSearchBtn) {
            mobileSearchBtn.addEventListener("click", () => {
                if (mobileSearchField) {
                    mobileSearchField.classList.remove("hidden");
                    const input = mobileSearchField.querySelector("input");
                    if (input) input.focus();
                }
            });
        }

        if (closeMobileSearch) {
            closeMobileSearch.addEventListener("click", () => {
                if (mobileSearchField) mobileSearchField.classList.add("hidden");
            });
        }
    }
}

customElements.define('trainee-layout', TraineeLayout);
