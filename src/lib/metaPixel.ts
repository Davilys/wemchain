/**
 * Meta Pixel (Facebook Ads) tracking utility
 * Provides type-safe event tracking for the marketing funnel
 */

// Declare fbq as a global function
declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

/**
 * Track a Meta Pixel event
 * @param eventName - The event name (standard or custom)
 * @param params - Optional event parameters
 */
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    if (params) {
      window.fbq('track', eventName, params);
    } else {
      window.fbq('track', eventName);
    }
    console.log(`[Meta Pixel] Event tracked: ${eventName}`, params || '');
  }
};

/**
 * Track ViewContent - When user views the R$49 plan section
 */
export const trackViewPlan = () => {
  trackEvent('ViewContent', {
    content_name: 'Plano Registro R$49',
    content_category: 'Registro Blockchain',
    value: 49.00,
    currency: 'BRL'
  });
};

/**
 * Track InitiateCheckout - When user clicks "Registrar por R$49" button
 */
export const trackInitiateCheckout = () => {
  trackEvent('InitiateCheckout');
};

/**
 * Track CompleteRegistration - After user signup is complete
 */
export const trackCompleteRegistration = () => {
  trackEvent('CompleteRegistration');
};

/**
 * Track AddToCart - When user starts the file registration process
 */
export const trackAddToCart = () => {
  trackEvent('AddToCart', {
    content_name: 'Registro Blockchain',
    value: 49.00,
    currency: 'BRL'
  });
};

/**
 * Track Purchase - When payment is confirmed (most important event!)
 * @param value - The purchase value
 * @param currency - Currency code (default: BRL)
 */
export const trackPurchase = (value: number = 49.00, currency: string = 'BRL') => {
  trackEvent('Purchase', {
    value,
    currency
  });
};

/**
 * Track Lead - When user shows interest (e.g., starts signup)
 */
export const trackLead = () => {
  trackEvent('Lead');
};
