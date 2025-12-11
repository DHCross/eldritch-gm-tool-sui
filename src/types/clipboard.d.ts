/**
 * Extended Clipboard API types for HTML MIME support.
 * These extend the base Navigator interface to support ClipboardItem.
 */

interface ClipboardItemOptions {
  presentationStyle?: 'unspecified' | 'inline' | 'attachment';
}

interface ClipboardItemData {
  [mimeType: string]: Blob | string | Promise<Blob | string>;
}

declare class ClipboardItem {
  constructor(items: ClipboardItemData, options?: ClipboardItemOptions);
  readonly types: ReadonlyArray<string>;
  getType(type: string): Promise<Blob>;
}

interface Clipboard {
  write(items: ClipboardItem[]): Promise<void>;
}

interface Window {
  ClipboardItem: typeof ClipboardItem;
}
