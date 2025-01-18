// Generate a unique visitor ID if one doesn't exist
export function getVisitorId(): string {
  const storageKey = 'visitorId';
  let visitorId = localStorage.getItem(storageKey);
  
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(storageKey, visitorId);
  }
  
  return visitorId;
}

// Track a view for a job posting
export async function trackJobView(jobId: string): Promise<void> {
  try {
    const visitorId = getVisitorId();
    
    await fetch(`/api/jobs/${jobId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ visitorId }),
    });
  } catch (error) {
    console.error('Failed to track job view:', error);
  }
} 