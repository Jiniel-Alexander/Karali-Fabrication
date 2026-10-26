/**
 * Accessible client-side filtering controller for the Product & Fabrication
 * Catalogue (`/catalogue/`).
 *
 * Security & Accessibility:
 *   - Uses `textContent` exclusively when rendering dynamic user search queries
 *     or status summaries — never `innerHTML` with user input.
 *   - Updates `aria-pressed="true|false"` on category filter buttons.
 *   - Announces updated result counts via an `aria-live="polite"` status region.
 *   - Preserves combined category + keyword state until reset.
 */
import { filterCatalogueItems, isValidCatalogueCategory } from '../data/catalogue.js';

/**
 * @param {HTMLElement | null} root
 */
export function initCatalogueFilter(root) {
  if (!root) return null;

  const searchInput = root.querySelector('[data-catalogue-search]');
  const clearSearchBtn = root.querySelector('[data-catalogue-clear-search]');
  const resetButtons = Array.from(root.querySelectorAll('[data-catalogue-reset]'));
  const chipButtons = Array.from(root.querySelectorAll('[data-catalogue-category]'));
  const cards = Array.from(root.querySelectorAll('[data-catalogue-item]'));
  const countEl = root.querySelector('[data-catalogue-count]');
  const emptyEl = root.querySelector('[data-catalogue-empty]');
  const emptySummaryEl = root.querySelector('[data-catalogue-empty-summary]');

  if (!searchInput || !chipButtons.length || !cards.length) return null;

  let activeCategory = 'all';
  let activeQuery = '';

  function applyFilters() {
    const matchedItems = filterCatalogueItems({
      category: activeCategory,
      query: activeQuery,
    });
    const matchedIds = new Set(matchedItems.map((item) => item.id));

    for (const card of cards) {
      const id = card.getAttribute('data-catalogue-item');
      card.hidden = !matchedIds.has(id);
    }

    for (const chip of chipButtons) {
      const cat = chip.getAttribute('data-catalogue-category');
      const isPressed = cat === activeCategory;
      chip.setAttribute('aria-pressed', String(isPressed));
      chip.classList.toggle('is-active', isPressed);
    }

    const trimmedQuery = activeQuery.trim();
    if (clearSearchBtn) {
      clearSearchBtn.hidden = trimmedQuery.length === 0;
    }

    const total = cards.length;
    const shown = matchedItems.length;

    if (countEl) {
      if (activeCategory === 'all' && !trimmedQuery) {
        countEl.textContent = `Showing all ${total} fabrication items`;
      } else {
        countEl.textContent = `Showing ${shown} of ${total} ${total === 1 ? 'item' : 'items'}`;
      }
    }

    if (emptyEl) {
      const isEmpty = shown === 0;
      emptyEl.hidden = !isEmpty;
      if (isEmpty && emptySummaryEl) {
        emptySummaryEl.textContent = trimmedQuery
          ? `No catalogue items matched “${trimmedQuery}”. Try another keyword or reset the filters.`
          : 'No catalogue items matched the selected category.';
      }
    }
  }

  function setCategory(nextCategory) {
    activeCategory = isValidCatalogueCategory(nextCategory) ? nextCategory : 'all';
    applyFilters();
  }

  function setQuery(nextQuery) {
    activeQuery = String(nextQuery ?? '');
    if (searchInput.value !== activeQuery) {
      searchInput.value = activeQuery;
    }
    applyFilters();
  }

  function resetAll({ focusSearch = false } = {}) {
    activeCategory = 'all';
    activeQuery = '';
    searchInput.value = '';
    applyFilters();
    if (focusSearch) {
      searchInput.focus();
    }
  }

  searchInput.addEventListener('input', () => {
    activeQuery = searchInput.value;
    applyFilters();
  });

  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && searchInput.value) {
      event.preventDefault();
      setQuery('');
    }
  });

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      setQuery('');
      searchInput.focus();
    });
  }

  for (const chip of chipButtons) {
    chip.addEventListener('click', () => {
      const cat = chip.getAttribute('data-catalogue-category') || 'all';
      setCategory(cat);
    });
  }

  for (const btn of resetButtons) {
    btn.addEventListener('click', () => {
      resetAll({ focusSearch: true });
    });
  }

  // Apply initial state (and support optional ?category=<slug> URL param)
  try {
    const params = new URLSearchParams(window.location.search);
    const paramCat = params.get('category');
    if (paramCat && isValidCatalogueCategory(paramCat)) {
      activeCategory = paramCat;
    }
    const paramQuery = params.get('q');
    if (paramQuery) {
      activeQuery = paramQuery;
      searchInput.value = paramQuery;
    }
  } catch {
    // Ignore URL parsing issues in non-standard environments
  }

  applyFilters();

  return {
    get category() {
      return activeCategory;
    },
    get query() {
      return activeQuery;
    },
    setCategory,
    setQuery,
    resetAll,
  };
}
