/**
 * Accessible searchable combobox (WAI-ARIA 1.2 "combobox with listbox popup",
 * list autocomplete). The value is only ever a canonical locality from the
 * approved list — free text is never accepted as a selection.
 *
 * Keyboard:
 *   ArrowDown / ArrowUp  open the list and move through options
 *   Alt+ArrowDown        open the list without moving
 *   Enter                choose the highlighted option
 *   Tab                  choose the highlighted option (when filtering) and move on
 *   Escape               close the list; press again to clear the field
 */
import { filterLocalities, findExactLocality } from '../data/localities.js';

const MOBILE_QUERY = '(max-width: 640px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

function appendHighlighted(target, text, query) {
  const label = el('span', 'combobox__option-label');
  const q = query.trim().toLowerCase();
  const idx = q ? text.toLowerCase().indexOf(q) : -1;
  if (idx < 0) {
    label.textContent = text;
    target.append(label);
    return;
  }
  if (idx > 0) {
    label.append(text.slice(0, idx));
  }
  const mark = el('mark');
  mark.textContent = text.slice(idx, idx + q.length);
  label.append(mark);
  if (idx + q.length < text.length) {
    label.append(text.slice(idx + q.length));
  }
  target.append(label);
}

/**
 * @param {HTMLElement} root
 * @param {{onChange?: (value: string | null) => void}} [options]
 */
export function createCombobox(root, { onChange } = {}) {
  const input = root.querySelector('[data-combobox-input]');
  const listbox = root.querySelector('[data-combobox-listbox]');
  const toggle = root.querySelector('[data-combobox-toggle]');
  const clearBtn = root.querySelector('[data-combobox-clear]');
  const live = root.querySelector('[data-combobox-live]');
  const baseId = listbox.id;

  /** @type {{name: string, el: HTMLElement}[]} */
  let options = [];
  let activeIndex = -1;
  let selected = null;
  let isOpen = false;
  let liveTimer = 0;

  const currentQuery = () => (selected && input.value === selected ? '' : input.value);

  function announce(count) {
    clearTimeout(liveTimer);
    liveTimer = setTimeout(() => {
      live.textContent = count === 0
        ? 'No matching localities.'
        : `${count} ${count === 1 ? 'locality' : 'localities'} available. Use up and down arrows to choose.`;
    }, 450);
  }

  function render(query) {
    const groups = filterLocalities(query);
    listbox.replaceChildren();
    options = [];
    activeIndex = -1;
    input.removeAttribute('aria-activedescendant');

    if (groups.length === 0) {
      const empty = el('div', 'combobox__empty');
      empty.setAttribute('role', 'presentation');
      empty.textContent = 'No matching locality. Try a nearby area or check the spelling.';
      listbox.append(empty);
    }

    groups.forEach((group, gi) => {
      const groupEl = el('div', 'combobox__group');
      groupEl.setAttribute('role', 'group');
      const label = el('div', 'combobox__group-label');
      label.id = `${baseId}-group-${gi}`;
      label.setAttribute('role', 'presentation');
      label.textContent = group.region;
      groupEl.setAttribute('aria-labelledby', label.id);
      groupEl.append(label);

      group.localities.forEach((name) => {
        const opt = el('div', 'combobox__option');
        opt.id = `${baseId}-opt-${options.length}`;
        opt.setAttribute('role', 'option');
        opt.setAttribute('aria-selected', 'false');
        opt.dataset.value = name;
        if (name === selected) opt.classList.add('is-chosen');
        appendHighlighted(opt, name, query);
        groupEl.append(opt);
        options.push({ name, el: opt });
      });
      listbox.append(groupEl);
    });

    announce(options.length);
  }

  function setActive(index) {
    if (activeIndex >= 0 && options[activeIndex]) {
      options[activeIndex].el.classList.remove('is-active');
      options[activeIndex].el.setAttribute('aria-selected', 'false');
    }
    activeIndex = index;
    const current = options[index];
    if (!current) {
      input.removeAttribute('aria-activedescendant');
      return;
    }
    current.el.classList.add('is-active');
    current.el.setAttribute('aria-selected', 'true');
    input.setAttribute('aria-activedescendant', current.el.id);
    current.el.scrollIntoView({ block: 'nearest' });
  }

  function setExpanded(value) {
    isOpen = value;
    listbox.hidden = !value;
    root.classList.toggle('is-open', value);
    input.setAttribute('aria-expanded', String(value));
    toggle?.setAttribute('aria-expanded', String(value));
    toggle?.setAttribute('aria-label', value ? 'Hide localities' : 'Show all localities');
  }

  function openList() {
    if (!isOpen) {
      render(currentQuery());
      setExpanded(true);
    }
  }

  function closeList() {
    if (!isOpen) return;
    setExpanded(false);
    input.removeAttribute('aria-activedescendant');
    activeIndex = -1;
  }

  function updateClear() {
    if (clearBtn) clearBtn.hidden = input.value.length === 0;
  }

  function select(name) {
    selected = name;
    input.value = name;
    input.removeAttribute('aria-invalid');
    closeList();
    updateClear();
    live.textContent = `${name} selected.`;
    onChange?.(name);
  }

  function clear() {
    const had = selected !== null;
    selected = null;
    input.value = '';
    updateClear();
    if (had) onChange?.(null);
  }

  // --- Events -------------------------------------------------------------

  input.addEventListener('input', () => {
    if (selected !== null && input.value !== selected) {
      selected = null;
      onChange?.(null);
    }
    render(input.value);
    setExpanded(true);
    if (input.value.trim() && options.length) setActive(0);
    updateClear();
  });

  input.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        const wasOpen = isOpen;
        openList();
        if (event.altKey || !options.length) return;
        setActive(!wasOpen && activeIndex < 0 ? 0 : (activeIndex + 1) % options.length);
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        openList();
        if (!options.length) return;
        setActive(activeIndex <= 0 ? options.length - 1 : activeIndex - 1);
        break;
      }
      case 'Enter': {
        if (isOpen) {
          event.preventDefault();
          if (activeIndex >= 0) {
            select(options[activeIndex].name);
          } else {
            const exact = findExactLocality(input.value);
            if (exact) select(exact);
          }
        } else if (!selected) {
          // Allow submit-on-Enter when the typed text is an exact locality.
          const exact = findExactLocality(input.value);
          if (exact) select(exact);
        }
        break;
      }
      case 'Escape': {
        if (isOpen) {
          event.preventDefault();
          closeList();
        } else if (input.value) {
          event.preventDefault();
          clear();
        }
        break;
      }
      case 'Tab': {
        if (isOpen && activeIndex >= 0 && input.value.trim() && input.value !== selected) {
          select(options[activeIndex].name);
        }
        closeList();
        break;
      }
      default:
        break;
    }
  });

  input.addEventListener('click', () => {
    if (!isOpen) openList();
  });

  // On phones, lift the field to the top so the list isn't hidden by the keyboard.
  input.addEventListener('focus', () => {
    if (!window.matchMedia(MOBILE_QUERY).matches) return;
    const smooth = !window.matchMedia(REDUCED_MOTION_QUERY).matches;
    setTimeout(() => root.scrollIntoView({ block: 'start', behavior: smooth ? 'smooth' : 'auto' }), 280);
  });

  root.addEventListener('focusout', (event) => {
    if (root.contains(event.relatedTarget)) return;
    closeList();
    if (!selected) {
      const exact = findExactLocality(input.value);
      if (exact) select(exact);
    }
  });

  // Keep focus in the input while interacting with the popup with a pointer.
  listbox.addEventListener('mousedown', (event) => event.preventDefault());
  listbox.addEventListener('click', (event) => {
    const opt = event.target.closest('[role="option"]');
    if (opt) select(opt.dataset.value);
  });

  toggle?.addEventListener('mousedown', (event) => event.preventDefault());
  toggle?.addEventListener('click', () => {
    if (isOpen) {
      closeList();
    } else {
      openList();
    }
    input.focus({ preventScroll: true });
  });

  clearBtn?.addEventListener('mousedown', (event) => event.preventDefault());
  clearBtn?.addEventListener('click', () => {
    clear();
    input.focus({ preventScroll: true });
    openList();
  });

  updateClear();

  return {
    get value() {
      return selected;
    },
    setInvalid(invalid) {
      if (invalid) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    },
    focus() {
      input.focus();
    },
    reset() {
      closeList();
      clear();
    },
    setDisabled(disabled) {
      input.disabled = disabled;
      if (toggle) toggle.disabled = disabled;
      if (clearBtn) clearBtn.disabled = disabled;
      if (disabled) closeList();
    },
  };
}
