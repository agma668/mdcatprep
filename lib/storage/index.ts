// Storage abstraction for study files (notes, PDFs, etc.).
//
// Architecture:
//   Google Drive = actual file storage (source of truth for large files)
//   Supabase    = metadata / database (the `notes` table)
//   Vercel      = application
//
// The provider interface keeps the rest of the app storage-agnostic so a
// different provider (Supabase Storage, S3, etc.) can be dropped in later
// without touching the pages or actions.
//
// NEVER put provider secrets (OAuth tokens) in NEXT_PUBLIC_* variables or in
// client code — everything here runs server-side only.

export type StoredFile = {
  id: string
  name: string
  mimeType: string
  size: number
  /** View/open link (drive.google.com/...) */
  webViewLink: string
  /** Direct download link (requires the file to be shared) */
  webContentLink: string
}

export type FileMetadata = {
  id: string
  name: string
  mimeType: string
  size: number
}

export interface StorageProvider {
  /** Stable identifier stored in notes.storage_provider */
  readonly name: 'google_drive' | 'external'
  /**
   * Whether the provider has valid credentials configured. When false the UI
   * must not offer file uploads — it should degrade gracefully (e.g. allow
   * saving a note with an external link only).
   */
  isConfigured(): boolean
  uploadFile(input: {
    name: string
    mimeType: string
    data: ArrayBuffer
  }): Promise<StoredFile>
  deleteFile(fileId: string): Promise<void>
  getFileUrl(fileId: string): Promise<string>
  getFileMetadata(fileId: string): Promise<FileMetadata>
}

/** Placeholder provider used when no storage credentials are configured. */
const unavailableProvider: StorageProvider = {
  name: 'external',
  isConfigured: () => false,
  async uploadFile() {
    throw new Error('File storage is not configured. Set up Google Drive credentials first.')
  },
  async deleteFile() {
    throw new Error('File storage is not configured.')
  },
  async getFileUrl() {
    throw new Error('File storage is not configured.')
  },
  async getFileMetadata() {
    throw new Error('File storage is not configured.')
  },
}

// Lazy import keeps the Google provider's fetch calls out of the module
// registry until actually used.
let googleDriveProvider: StorageProvider | null = null

export async function getStorageProvider(): Promise<StorageProvider> {
  if (!googleDriveProvider) {
    const { GoogleDriveProvider } = await import('@/lib/storage/google-drive')
    googleDriveProvider = new GoogleDriveProvider()
  }
  return googleDriveProvider.isConfigured() ? googleDriveProvider : unavailableProvider
}

/** Human-readable description of why uploads are unavailable (if they are). */
export async function getStorageStatus(): Promise<{ configured: boolean; reason?: string }> {
  const { GoogleDriveProvider } = await import('@/lib/storage/google-drive')
  const provider = new GoogleDriveProvider()
  if (provider.isConfigured()) return { configured: true }
  return { configured: false, reason: GoogleDriveProvider.missingConfigReason() }
}
