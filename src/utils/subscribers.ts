import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export interface Subscriber {
  email: string;
  token: string; // Unique token for unsubscribe
  subscribedAt: string;
  confirmed: boolean;
  confirmToken?: string;
  lastEmailSent?: string;
}

const SUBSCRIBERS_FILE = path.join(process.cwd(), 'data', 'subscribers.json');

/**
 * Ensure data directory exists
 */
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

/**
 * Generate unique token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Load all subscribers from JSON file
 */
export async function loadSubscribers(): Promise<Subscriber[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(SUBSCRIBERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist yet, return empty array
    return [];
  }
}

/**
 * Save subscribers to JSON file
 */
async function saveSubscribers(subscribers: Subscriber[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2), 'utf-8');
}

/**
 * Add new subscriber
 */
export async function addSubscriber(email: string): Promise<{ success: boolean; subscriber?: Subscriber; error?: string }> {
  try {
    const subscribers = await loadSubscribers();

    // Check if already subscribed
    const existing = subscribers.find(s => s.email === email);
    if (existing) {
      if (existing.confirmed) {
        return {
          success: false,
          error: 'This email is already subscribed',
        };
      } else {
        // Re-send confirmation
        return {
          success: true,
          subscriber: existing,
        };
      }
    }

    // Create new subscriber
    const subscriber: Subscriber = {
      email,
      token: generateToken(),
      subscribedAt: new Date().toISOString(),
      confirmed: false,
      confirmToken: generateToken(),
    };

    subscribers.push(subscriber);
    await saveSubscribers(subscribers);

    return {
      success: true,
      subscriber,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to add subscriber',
    };
  }
}

/**
 * Confirm subscriber email
 */
export async function confirmSubscriber(confirmToken: string): Promise<{ success: boolean; error?: string }> {
  try {
    const subscribers = await loadSubscribers();
    const subscriber = subscribers.find(s => s.confirmToken === confirmToken);

    if (!subscriber) {
      return {
        success: false,
        error: 'Invalid confirmation token',
      };
    }

    if (subscriber.confirmed) {
      return {
        success: true, // Already confirmed, no error
      };
    }

    subscriber.confirmed = true;
    subscriber.confirmToken = undefined; // Remove token after confirmation

    await saveSubscribers(subscribers);

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to confirm subscription',
    };
  }
}

/**
 * Unsubscribe by token
 */
export async function unsubscribe(token: string): Promise<{ success: boolean; error?: string }> {
  try {
    const subscribers = await loadSubscribers();
    const index = subscribers.findIndex(s => s.token === token);

    if (index === -1) {
      return {
        success: false,
        error: 'Invalid unsubscribe token',
      };
    }

    subscribers.splice(index, 1);
    await saveSubscribers(subscribers);

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to unsubscribe',
    };
  }
}

/**
 * Get confirmed subscribers only
 */
export async function getConfirmedSubscribers(): Promise<Subscriber[]> {
  const subscribers = await loadSubscribers();
  return subscribers.filter(s => s.confirmed);
}

/**
 * Update last email sent timestamp
 */
export async function updateLastEmailSent(email: string): Promise<void> {
  const subscribers = await loadSubscribers();
  const subscriber = subscribers.find(s => s.email === email);
  
  if (subscriber) {
    subscriber.lastEmailSent = new Date().toISOString();
    await saveSubscribers(subscribers);
  }
}

/**
 * Get subscriber count
 */
export async function getSubscriberCount(): Promise<{ total: number; confirmed: number }> {
  const subscribers = await loadSubscribers();
  return {
    total: subscribers.length,
    confirmed: subscribers.filter(s => s.confirmed).length,
  };
}
