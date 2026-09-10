// Google Drive storage provider (server-side only).
//
// Uses OAuth2 with a refresh token (a "Desktop app"-type OAuth client in
// Google Cloud Console). The refresh token never expires and lets the server
// mint short-lived access tokens on demand — no user interaction needed once
// it is issued.
//
// Required environment variables (NOT NEXT_PUBLIC_*):
//   GOOGLE_CLIENT_ID       — OAuth 2.0 Client ID
//   GOOGLE_CLIENT_SECRET   — OAuth 2.0 Client Secret
//   GOOGLE_REFRESH_TOKEN   — OAuth 2.0 Refresh Token
//   GOOGLE_DRIVE_FOLDER_ID — ID of the Drive folder that stores study files
//
// Where to create them: Google Cloud Console → project → APIs & Services →
//   Credentials → Create Credentials → OAuth client ID → Desktop app.
//   Then enable the Drive API (APIs & Services → Library → "Google Drive API").
//   To get a refresh token, run the OAuth "device" or "out-of-band" flow once
//   with the client ID/secret and capture the refresh_token.
//
// All credentials stay server-side; nothing here is ever bundled to the client.

import type { FileMetadata, StorageProvider, StoredFile } from '@/lib/storage'

const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files'
const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'

type DriveFile = {
  id: string
  name?: string
  mimeType?: string
  size?: string
  webViewLink?: string
  webContentLink?: string
}

export class GoogleDriveProvider implements StorageProvider {
  readonly name = 'google_drive' as const

  private clientId = process.env.GOOGLE_CLIENT_ID?.trim() || ''
  private clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() || ''
  private refreshToken = process.env.GOOGLE_REFRESH_TOKEN?.trim() || ''
  private folderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim() || ''

  isConfigured(): boolean {
    return Boolean(
      this.clientId && this.clientSecret && this.refreshToken && this.folderId
    )
  }

  static missingConfigReason(): string {
    const missing: string[] = []
    if (!process.env.GOOGLE_CLIENT_ID?.trim()) missing.push('GOOGLE_CLIENT_ID')
    if (!process.env.GOOGLE_CLIENT_SECRET?.trim()) missing.push('GOOGLE_CLIENT_SECRET')
    if (!process.env.GOOGLE_REFRESH_TOKEN?.trim()) missing.push('GOOGLE_REFRESH_TOKEN')
    if (!process.env.GOOGLE_DRIVE_FOLDER_ID?.trim()) missing.push('GOOGLE_DRIVE_FOLDER_ID')
    return `Google Drive is not connected (missing: ${missing.join(', ')}).`
  }

  private async getAccessToken(): Promise<string> {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`Google OAuth failed (${res.status}): ${body.slice(0, 200)}`)
    }

    const data = (await res.json()) as { access_token?: string }
    if (!data.access_token) throw new Error('Google OAuth returned no access token')
    return data.access_token
  }

  async uploadFile(input: {
    name: string
    mimeType: string
    data: ArrayBuffer
  }): Promise<StoredFile> {
    if (!this.isConfigured()) throw new Error('Google Drive is not configured')

    const token = await this.getAccessToken()
    const form = new FormData()
    form.append(
      'metadata',
      new Blob([JSON.stringify({ name: input.name, parents: [this.folderId] })], {
        type: 'application/json',
      })
    )
    form.append('file', new Blob([input.data], { type: input.mimeType }), input.name)

    const res = await fetch(
      `${DRIVE_UPLOAD_URL}?uploadType=multipart&fields=id,name,mimeType,size,webViewLink,webContentLink`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      }
    )

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`Google Drive upload failed (${res.status}): ${body.slice(0, 200)}`)
    }

    const file = (await res.json()) as DriveFile
    return {
      id: file.id,
      name: file.name || input.name,
      mimeType: file.mimeType || input.mimeType,
      size: Number(file.size ?? 0),
      webViewLink: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
      webContentLink: file.webContentLink || '',
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    if (!this.isConfigured()) throw new Error('Google Drive is not configured')
    const token = await this.getAccessToken()
    const res = await fetch(`${DRIVE_API_URL}/${encodeURIComponent(fileId)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok && res.status !== 404) {
      const body = await res.text().catch(() => '')
      throw new Error(`Google Drive delete failed (${res.status}): ${body.slice(0, 200)}`)
    }
  }

  async getFileUrl(fileId: string): Promise<string> {
    if (!this.isConfigured()) throw new Error('Google Drive is not configured')
    const token = await this.getAccessToken()
    const res = await fetch(
      `${DRIVE_API_URL}/${encodeURIComponent(fileId)}?fields=webViewLink`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`Google Drive fetch failed (${res.status}): ${body.slice(0, 200)}`)
    }
    const file = (await res.json()) as DriveFile
    return file.webViewLink || `https://drive.google.com/file/d/${fileId}/view`
  }

  async getFileMetadata(fileId: string): Promise<FileMetadata> {
    if (!this.isConfigured()) throw new Error('Google Drive is not configured')
    const token = await this.getAccessToken()
    const res = await fetch(
      `${DRIVE_API_URL}/${encodeURIComponent(fileId)}?fields=id,name,mimeType,size`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`Google Drive metadata failed (${res.status}): ${body.slice(0, 200)}`)
    }
    const file = (await res.json()) as DriveFile
    return {
      id: file.id,
      name: file.name || fileId,
      mimeType: file.mimeType || 'application/octet-stream',
      size: Number(file.size ?? 0),
    }
  }
}
