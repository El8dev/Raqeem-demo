/**
 * RAQEEM Physics Platform - Global Drawer Navigation
 */
document.addEventListener('DOMContentLoaded', () => {
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const sideDrawer = document.getElementById('side-drawer');
    const drawerCloseBtn = document.getElementById('drawer-close-btn');

    if (menuToggleBtn && sideDrawer) {
        menuToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sideDrawer.classList.toggle('open');
        });
    }

    if (drawerCloseBtn && sideDrawer) {
        drawerCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sideDrawer.classList.remove('open');
        });
    }

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (sideDrawer && sideDrawer.classList.contains('open')) {
            if (!sideDrawer.contains(e.target) && (!menuToggleBtn || !menuToggleBtn.contains(e.target))) {
                sideDrawer.classList.remove('open');
            }
        }
    });

    // Accordion headers
    document.querySelectorAll('.chapter-header').forEach(header => {
        header.addEventListener('click', () => {
            const submenu = header.nextElementSibling;
            const arrow = header.querySelector('.arrow-icon');
            if (submenu) {
                if (submenu.style.maxHeight && submenu.style.maxHeight !== '0px') {
                    submenu.style.maxHeight = null;
                    if (arrow) arrow.style.transform = 'rotate(0deg)';
                } else {
                    submenu.style.maxHeight = '1000px';
                    if (arrow) arrow.style.transform = 'rotate(180deg)';
                }
            }
        });
    });
});
