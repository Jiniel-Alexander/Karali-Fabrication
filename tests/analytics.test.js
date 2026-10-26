import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initContactClickTracking, trackEvent } from '../src/lib/analytics.js';

describe('Analytics & Conversion Tracking (`src/lib/analytics.js`)', () => {
  let mockWindow;

  beforeEach(() => {
    const listeners = new Map();
    mockWindow = {
      location: { pathname: '/test-page' },
      dataLayer: [],
      addEventListener: (type, handler) => {
        if (!listeners.has(type)) listeners.set(type, []);
        listeners.get(type).push(handler);
      },
      removeEventListener: (type, handler) => {
        const arr = listeners.get(type) || [];
        listeners.set(type, arr.filter((h) => h !== handler));
      },
      dispatchEvent: (event) => {
        const arr = listeners.get(event.type) || [];
        arr.forEach((h) => h(event));
        return true;
      },
    };
    globalThis.window = mockWindow;
  });

  afterEach(() => {
    delete globalThis.window;
  });

  it('dispatches custom event and strips sensitive PII fields from payload', () => {
    const listener = vi.fn();
    mockWindow.addEventListener('karali:analytics', listener);

    trackEvent('quote_form_submit', {
      service: 'structural-steel-fabrication',
      locality: 'Powai',
      full_name: 'John Doe',
      phone: '9876543210',
      email: 'john@example.com',
      project_details: 'Heavy 50-ton shed structure',
    });

    expect(listener).toHaveBeenCalledOnce();
    const event = listener.mock.calls[0][0];
    expect(event.detail.event).toBe('quote_form_submit');
    expect(event.detail.service).toBe('structural-steel-fabrication');
    expect(event.detail.locality).toBe('Powai');
    expect(event.detail.path).toBe('/test-page');

    // Sensitive keys must NOT be present in telemetry payload
    expect(event.detail.full_name).toBeUndefined();
    expect(event.detail.phone).toBeUndefined();
    expect(event.detail.email).toBeUndefined();
    expect(event.detail.project_details).toBeUndefined();
  });

  it('pushes clean payload to window.dataLayer if available', () => {
    trackEvent('contact_call_click', {
      cta_id: 'header-call-link',
      destination: 'tel',
    });

    expect(mockWindow.dataLayer).toHaveLength(1);
    expect(mockWindow.dataLayer[0].event).toBe('contact_call_click');
    expect(mockWindow.dataLayer[0].destination).toBe('tel');
  });

  it('tracks direct call and WhatsApp clicks safely', () => {
    const listeners = [];
    globalThis.document = {
      addEventListener: (type, fn) => {
        listeners.push(fn);
      },
    };

    initContactClickTracking();
    expect(listeners).toHaveLength(1);

    const callTarget = {
      closest: (sel) => ({
        getAttribute: (attr) => (attr === 'href' ? 'tel:+917977591792' : ''),
        id: 'header-call-link',
      }),
    };

    listeners[0]({ target: callTarget });

    expect(mockWindow.dataLayer).toHaveLength(1);
    expect(mockWindow.dataLayer[0].event).toBe('contact_call_click');

    delete globalThis.document;
  });
});
