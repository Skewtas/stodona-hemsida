// Centralized lead capture utility
// Currently sends to API endpoint, can be swapped to Timewave later

export interface LeadData {
  email: string;
  phone?: string;
  name?: string;
  source: 'welcome_popup' | 'exit_intent' | 'footer_newsletter' | 'blog_lead_magnet' | 'sticky_cta';
  page?: string;
}

const API_ENDPOINT = '/api/lead';

export async function submitLead(data: LeadData): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
        page: data.page || window.location.pathname,
      }),
    });

    if (response.ok) {
      return { success: true, message: 'Tack! Vi hör av oss snart.' };
    }
    return { success: false, message: 'Något gick fel. Försök igen.' };
  } catch {
    // Fallback: store in localStorage if API is down
    const existing = JSON.parse(localStorage.getItem('stodona-leads') || '[]');
    existing.push({ ...data, timestamp: new Date().toISOString() });
    localStorage.setItem('stodona-leads', JSON.stringify(existing));
    return { success: true, message: 'Tack! Vi hör av oss snart.' };
  }
}

export function hasSeenPopup(key: string): boolean {
  const seen = localStorage.getItem(`stodona-popup-${key}`);
  if (!seen) return false;
  // Show again after 7 days
  const seenDate = new Date(seen);
  const daysSince = (Date.now() - seenDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSince < 7;
}

export function markPopupSeen(key: string): void {
  localStorage.setItem(`stodona-popup-${key}`, new Date().toISOString());
}
