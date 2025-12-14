import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export interface Subscriber {
  email: string;
  token: string;
  subscribedAt: string;
  confirmed: boolean;
  confirmToken?: string;
  lastEmailSent?: string;
}

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Generate unique token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Load all subscribers from Supabase
 */
export async function loadSubscribers(): Promise<Subscriber[]> {
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*');

    if (error) {
      console.error('Error loading subscribers:', error);
      return [];
    }

    return (data || []).map(row => ({
      email: row.email,
      token: row.token,
      subscribedAt: row.subscribed_at,
      confirmed: row.confirmed,
      confirmToken: row.confirm_token,
      lastEmailSent: row.last_email_sent,
    }));
  } catch (error) {
    console.error('Error loading subscribers:', error);
    return [];
  }
}

/**
 * Add new subscriber
 */
export async function addSubscriber(email: string): Promise<{ success: boolean; subscriber?: Subscriber; error?: string }> {
  try {
    // Check if already subscribed
    const { data: existing } = await supabase
      .from('subscribers')
      .select('*')
      .eq('email', email)
      .single();

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
          subscriber: {
            email: existing.email,
            token: existing.token,
            subscribedAt: existing.subscribed_at,
            confirmed: existing.confirmed,
            confirmToken: existing.confirm_token,
            lastEmailSent: existing.last_email_sent,
          },
        };
      }
    }

    // Create new subscriber
    const newSubscriber = {
      email,
      token: generateToken(),
      subscribed_at: new Date().toISOString(),
      confirmed: false,
      confirm_token: generateToken(),
    };

    const { data, error } = await supabase
      .from('subscribers')
      .insert([newSubscriber])
      .select()
      .single();

    if (error) {
      console.error('Error adding subscriber:', error);
      return {
        success: false,
        error: error.message || 'Failed to add subscriber',
      };
    }

    console.log('✅ Subscriber added to Supabase:', email);

    return {
      success: true,
      subscriber: {
        email: data.email,
        token: data.token,
        subscribedAt: data.subscribed_at,
        confirmed: data.confirmed,
        confirmToken: data.confirm_token,
        lastEmailSent: data.last_email_sent,
      },
    };
  } catch (error: any) {
    console.error('❌ Error adding subscriber:', error);
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
    // Find subscriber with this confirm token
    const { data: subscriber, error: findError } = await supabase
      .from('subscribers')
      .select('*')
      .eq('confirm_token', confirmToken)
      .single();

    if (findError || !subscriber) {
      console.error('Invalid confirmation token:', confirmToken);
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

    // Update to confirmed
    const { error: updateError } = await supabase
      .from('subscribers')
      .update({ 
        confirmed: true,
        confirm_token: null 
      })
      .eq('email', subscriber.email);

    if (updateError) {
      console.error('Error confirming subscriber:', updateError);
      return {
        success: false,
        error: updateError.message || 'Failed to confirm subscription',
      };
    }

    console.log('✅ Subscriber confirmed:', subscriber.email);

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('❌ Error confirming subscriber:', error);
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
    const { error } = await supabase
      .from('subscribers')
      .delete()
      .eq('token', token);

    if (error) {
      console.error('Error unsubscribing:', error);
      return {
        success: false,
        error: error.message || 'Invalid unsubscribe token',
      };
    }

    console.log('✅ Subscriber removed');

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('❌ Error unsubscribing:', error);
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
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .eq('confirmed', true);

    if (error) {
      console.error('Error getting confirmed subscribers:', error);
      return [];
    }

    return (data || []).map(row => ({
      email: row.email,
      token: row.token,
      subscribedAt: row.subscribed_at,
      confirmed: row.confirmed,
      confirmToken: row.confirm_token,
      lastEmailSent: row.last_email_sent,
    }));
  } catch (error) {
    console.error('Error getting confirmed subscribers:', error);
    return [];
  }
}

/**
 * Update last email sent timestamp
 */
export async function updateLastEmailSent(email: string): Promise<void> {
  try {
    await supabase
      .from('subscribers')
      .update({ last_email_sent: new Date().toISOString() })
      .eq('email', email);
  } catch (error) {
    console.error('Error updating last email sent:', error);
  }
}

/**
 * Get subscriber count
 */
export async function getSubscriberCount(): Promise<{ total: number; confirmed: number }> {
  try {
    const { count: total } = await supabase
      .from('subscribers')
      .select('*', { count: 'exact', head: true });

    const { count: confirmed } = await supabase
      .from('subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('confirmed', true);

    return {
      total: total || 0,
      confirmed: confirmed || 0,
    };
  } catch (error) {
    console.error('Error getting subscriber count:', error);
    return { total: 0, confirmed: 0 };
  }
}
