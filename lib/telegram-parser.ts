/**
 * Telegram channel parser using Telegram Bot API
 * Docs: https://core.telegram.org/bots/api
 */

export interface TelegramMessage {
  id: number;
  text: string;
  date: Date;
  channel: string;
  mediaGroupId?: string;
  photoUrl?: string;
  entities?: MessageEntity[];
}

export interface MessageEntity {
  type: string;
  offset: number;
  length: number;
  url?: string;
  user?: TelegramUser;
}

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface TelegramUpdate {
  update_id: number;
  channel_post?: TelegramChannelPost;
  message?: TelegramChannelPost;
}

export interface TelegramChannelPost {
  message_id: number;
  chat: {
    id: number;
    title: string;
    username?: string;
    type: 'channel' | 'group' | 'supergroup' | 'private';
  };
  date: number;
  text?: string;
  caption?: string;
  media_group_id?: string;
  photo?: TelegramPhotoSize[];
  entities?: MessageEntity[];
  caption_entities?: MessageEntity[];
}

export interface TelegramPhotoSize {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  file_size?: number;
}

const TELEGRAM_API_URL = 'https://api.telegram.org/bot';

/**
 * Fetches messages from a Telegram channel using Bot API
 * Note: Bot must be an admin in the channel to access messages
 * 
 * @param channelId - Channel ID or username (e.g., '@ml_digest_daily')
 * @param limit - Maximum number of messages to fetch (default: 10)
 * @returns Array of parsed Telegram messages
 */
export async function fetchChannelMessages(
  channelId: string = '@ml_digest_daily',
  limit: number = 10
): Promise<TelegramMessage[]> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN environment variable is not set');
  }

  // Normalize channel ID
  const normalizedChannelId = channelId.startsWith('@') 
    ? channelId 
    : `@${channelId}`;

  try {
    // Get updates from Telegram
    // Note: In production, you should use webhooks or long polling
    const response = await fetch(
      `${TELEGRAM_API_URL}${botToken}/getUpdates`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit: Math.min(limit * 2, 100), // Request more to filter by channel
          allowed_updates: ['channel_post', 'message'],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Telegram API error: ${response.status} ${response.statusText}` +
        (errorData.description ? ` - ${errorData.description}` : '')
      );
    }

    const data = await response.json();

    if (!data.ok) {
      throw new Error(`Telegram API error: ${data.description || 'Unknown error'}`);
    }

    const updates: TelegramUpdate[] = data.result || [];

    // Filter and parse messages from the specified channel
    const messages: TelegramMessage[] = updates
      .filter((update) => {
        const post = update.channel_post || update.message;
        if (!post) return false;
        
        // Match by username or channel ID
        const chatUsername = post.chat.username 
          ? `@${post.chat.username}` 
          : null;
        const chatId = post.chat.id.toString();
        
        return (
          chatUsername === normalizedChannelId ||
          chatId === normalizedChannelId.replace('@', '')
        );
      })
      .slice(-limit) // Get the most recent messages
      .map((update) => parseTelegramMessage(update, normalizedChannelId));

    return messages;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error while fetching Telegram messages');
  }
}

/**
 * Parses a Telegram update into a simplified message format
 */
function parseTelegramMessage(
  update: TelegramUpdate,
  channel: string
): TelegramMessage {
  const post = update.channel_post || update.message!;
  
  // Get the best quality photo URL if available
  let photoUrl: string | undefined;
  if (post.photo && post.photo.length > 0) {
    // Get the largest photo (last in array)
    const largestPhoto = post.photo[post.photo.length - 1];
    // Note: To get actual URL, you'd need to call getFile
    photoUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${largestPhoto.file_id}`;
  }

  return {
    id: post.message_id,
    text: post.text || post.caption || '',
    date: new Date(post.date * 1000), // Convert Unix timestamp to Date
    channel,
    mediaGroupId: post.media_group_id,
    photoUrl,
    entities: post.entities || post.caption_entities,
  };
}

/**
 * Gets file URL from Telegram file_id
 * Requires additional API call
 */
export async function getFileUrl(fileId: string): Promise<string | null> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN environment variable is not set');
  }

  try {
    const response = await fetch(
      `${TELEGRAM_API_URL}${botToken}/getFile`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file_id: fileId }),
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.ok || !data.result?.file_path) {
      return null;
    }

    return `https://api.telegram.org/file/bot${botToken}/${data.result.file_path}`;
  } catch {
    return null;
  }
}

/**
 * Sends a test message to verify bot connectivity
 */
export async function testBotConnection(): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return false;
  }

  try {
    const response = await fetch(
      `${TELEGRAM_API_URL}${botToken}/getMe`
    );

    const data = await response.json();
    return data.ok === true;
  } catch {
    return false;
  }
}

/**
 * Checks if Telegram Bot API is configured
 */
export function isTelegramConfigured(): boolean {
  return !!process.env.TELEGRAM_BOT_TOKEN;
}

/**
 * Gets bot information
 */
export async function getBotInfo(): Promise<{
  id: number;
  first_name: string;
  username: string;
} | null> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return null;
  }

  try {
    const response = await fetch(
      `${TELEGRAM_API_URL}${botToken}/getMe`
    );

    const data = await response.json();
    
    if (data.ok) {
      return {
        id: data.result.id,
        first_name: data.result.first_name,
        username: data.result.username,
      };
    }
    return null;
  } catch {
    return null;
  }
}
