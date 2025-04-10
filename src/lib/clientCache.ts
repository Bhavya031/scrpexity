export function quary(pageid: string) {
    // Check if we're running in a browser environment
    if (typeof window !== 'undefined') {
      // Only access localStorage in a browser environment
      return localStorage.getItem(pageid);
    }
    
    // Return null on the server-side
    return null;
  }