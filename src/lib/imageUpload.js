const ONE_MB = 1024 * 1024
/** Firestore documents max ~1MB; leave room for message and metadata. */
const SAFE_BASE64_CHARS = 900_000

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'))
    reader.readAsDataURL(file)
  })
}

async function uploadToImgur(file) {
  const clientId = import.meta.env.VITE_IMGUR_CLIENT_ID
  if (!clientId) {
    throw new Error(
      'La imagen supera el límite gratuito de Base64. Agrega VITE_IMGUR_CLIENT_ID en tu .env (Cliente Imgur gratuito).',
    )
  }

  const formData = new FormData()
  formData.append('image', file)
  formData.append('type', 'file')

  const response = await fetch('https://api.imgur.com/3/image', {
    method: 'POST',
    headers: {
      Authorization: `Client-ID ${clientId}`,
    },
    body: formData,
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || !payload?.success || !payload?.data?.link) {
    const detail = payload?.data?.error || payload?.error || response.statusText
    throw new Error(`No se pudo subir la imagen a Imgur: ${detail}`)
  }

  return payload.data.link
}

/**
 * Free image hosting for letter attachments:
 * - under 1MB → Base64 data URL (if it still fits in a Firestore doc)
 * - otherwise → Imgur public API
 */
export async function resolveLetterImage(file) {
  if (!file) return null

  if (file.size < ONE_MB) {
    const dataUrl = await fileToBase64(file)
    if (dataUrl.length < SAFE_BASE64_CHARS) {
      return dataUrl
    }
  }

  return uploadToImgur(file)
}
