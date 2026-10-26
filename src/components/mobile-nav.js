/**
 * Accessible mobile navigation drawer toggle.
 *
 * Features:
 *   - Updates aria-expanded on the toggle button and toggles [hidden] on the drawer
 *   - Closes automatically when a navigation link inside the drawer is activated
 *   - Closes on Escape key and restores focus to the toggle button
 *   - Closes on outside click or when viewport expands past mobile breakpoint
 */

const DESKTOP_MEDIA_QUERY = '(min-width: 960px)';

/**
 * @param {HTMLElement | null} headerRoot
 */
export function initMobileNav(headerRoot) {
  if (!headerRoot) return null;

  const toggleBtn = headerRoot.querySelector('[data-nav-toggle]');
  const navPanel = headerRoot.querySelector('[data-nav-panel]');
  if (!toggleBtn || !navPanel) return null;

  let isOpen = false;

  function setOpen(nextState) {
    isOpen = Boolean(nextState);
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
    toggleBtn.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    headerRoot.classList.toggle('is-nav-open', isOpen);
    navPanel.hidden = !isOpen;
  }

  function close({ restoreFocus = false } = {}) {
    if (!isOpen) return;
    setOpen(false);
    if (restoreFocus) {
      toggleBtn.focus();
    }
  }

  toggleBtn.addEventListener('click', () => {
    setOpen(!isOpen);
  });

  navPanel.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (link) {
      close();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      close({ restoreFocus: true });
    }
  });

  document.addEventListener('click', (event) => {
    if (!isOpen) return;
    if (!headerRoot.contains(event.target)) {
      close();
    }
  });

  const desktopMq = window.matchMedia(DESKTOP_MEDIA_QUERY);
  const handleViewportChange = (event) => {
    if (event.matches && isOpen) {
      close();
    }
  };

  if (typeof desktopMq.addEventListener === 'function') {
    desktopMq.addEventListener('change', handleViewportChange);
  }

  return {
    get isOpen() {
      return isOpen;
    },
    open: () => setOpen(true),
    close,
  };
}
