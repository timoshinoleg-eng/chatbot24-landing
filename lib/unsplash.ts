/**
 * Unsplash image search client
 * Docs: https://unsplash.com/documentation
 */

const UNSPLASH_API_URL = 'https://api.unsplash.com';

export interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  description: string | null;
}

export interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

/**
 * Finds an image on Unsplash based on keywords
 * @param keywords - Array of search keywords
 * @param orientation - Optional image orientation filter
 * @returns URL of the image or null if not found
 */
export async function findImage(
  keywords: string[],
  orientation?: 'landscape' | 'portrait' | 'squarish'
): Promise<string | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    console.warn('UNSPLASH_ACCESS_KEY environment variable is not set');
    return null;
  }

  if (!keywords.length) {
    console.warn('No keywords provided for image search');
    return null;
  }

  const query = keywords.join(' ');
  const params = new URLSearchParams({
    query,
    per_page: '10',
    order_by: 'relevant',
  });

  if (orientation) {
    params.append('orientation', orientation);
  }

  try {
    const response = await fetch(
      `${UNSPLASH_API_URL}/search/photos?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Client-ID ${accessKey}`,
          'Accept-Version': 'v1',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(
        `Unsplash API error: ${response.status} ${response.statusText}`,
        errorData
      );
      return null;
    }

    const data: UnsplashSearchResponse = await response.json();

    if (!data.results || data.results.length === 0) {
      console.log(`No images found for query: "${query}"`);
      return null;
    }

    // Return the regular size URL of the first result
    // Using 'regular' as a good balance between quality and loading speed
    const imageUrl = data.results[0].urls.regular;

    // Track download for Unsplash API requirements (optional but recommended)
    trackDownload(data.results[0].id).catch(console.error);

    return imageUrl;
  } catch (error) {
    console.error('Error fetching image from Unsplash:', error);
    return null;
  }
}

/**
 * Gets a random image from Unsplash based on keywords
 * @param keywords - Array of search keywords
 * @param orientation - Optional image orientation filter
 * @returns URL of the image or null if not found
 */
export async function getRandomImage(
  keywords: string[],
  orientation?: 'landscape' | 'portrait' | 'squarish'
): Promise<string | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    console.warn('UNSPLASH_ACCESS_KEY environment variable is not set');
    return null;
  }

  const query = keywords.join(' ');
  const params = new URLSearchParams({
    query,
    count: '1',
  });

  if (orientation) {
    params.append('orientation', orientation);
  }

  try {
    const response = await fetch(
      `${UNSPLASH_API_URL}/photos/random?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Client-ID ${accessKey}`,
          'Accept-Version': 'v1',
        },
      }
    );

    if (!response.ok) {
      console.error(
        `Unsplash API error: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data: UnsplashPhoto | UnsplashPhoto[] = await response.json();
    const photo = Array.isArray(data) ? data[0] : data;

    if (!photo) {
      console.log(`No random image found for query: "${query}"`);
      return null;
    }

    trackDownload(photo.id).catch(console.error);

    return photo.urls.regular;
  } catch (error) {
    console.error('Error fetching random image from Unsplash:', error);
    return null;
  }
}

/**
 * Tracks image download as required by Unsplash API guidelines
 * @param photoId - Unsplash photo ID
 */
async function trackDownload(photoId: string): Promise<void> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) return;

  try {
    await fetch(
      `${UNSPLASH_API_URL}/photos/${photoId}/download`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Client-ID ${accessKey}`,
        },
      }
    );
  } catch {
    // Silently fail - tracking is not critical
  }
}

/**
 * Checks if Unsplash API is configured
 */
export function isUnsplashConfigured(): boolean {
  return !!process.env.UNSPLASH_ACCESS_KEY;
}
