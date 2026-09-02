import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { db, isFirebaseConfigured } from '../firebase'
import { resolveLetterImage } from '../lib/imageUpload'
import GlassCard from './GlassCard'
import MemberPicker from './MemberPicker'

const MAX_IMAGE_MB = 10

export default function LetterForm({ members, onSent }) {
  const [sender, setSender] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [recipientId, setRecipientId] = useState('')
  const [message, setMessage] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const previewUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : ''),
    [imageFile],
  )

  const selectedMember = members.find((member) => member.id === recipientId)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!isFirebaseConfigured || !db) {
      setError('Firebase aún no está configurado. Revisa tu archivo .env')
      return
    }

    if (!anonymous && !sender.trim()) {
      setError('Escribe tu nombre o marca la casilla de anónimo.')
      return
    }

    if (!recipientId || !selectedMember) {
      setError('Elige a quién va dirigida la carta.')
      return
    }

    if (!message.trim()) {
      setError('La carta necesita un mensaje.')
      return
    }

    if (imageFile && imageFile.size > MAX_IMAGE_MB * 1024 * 1024) {
      setError(`La imagen no puede pesar más de ${MAX_IMAGE_MB} MB.`)
      return
    }

    setSending(true)

    try {
      let imageUrl = null

      if (imageFile) {
        imageUrl = await resolveLetterImage(imageFile)
      }

      await addDoc(collection(db, 'letters'), {
        sender: anonymous ? 'Anónimo' : sender.trim(),
        isAnonymous: anonymous,
        recipientId,
        recipientName: selectedMember.name,
        message: message.trim(),
        imageUrl,
        createdAt: serverTimestamp(),
      })

      setSender('')
      setAnonymous(false)
      setRecipientId('')
      setMessage('')
      setImageFile(null)
      onSent?.()
    } catch (err) {
      console.error(err)
      setError(err.message || 'No se pudo enviar la carta. Inténtalo de nuevo en un momento.')
    } finally {
      setSending(false)
    }
  }

  return (
    <GlassCard className="w-full max-w-4xl">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-semibold text-cyan-100" htmlFor="sender">
            Tu nombre o apodo
          </label>
          <input
            id="sender"
            className="glass-input disabled:opacity-50"
            placeholder="¿Quién envía esta carta?"
            value={sender}
            onChange={(event) => setSender(event.target.value)}
            disabled={anonymous || sending}
            maxLength={60}
          />
          <label className="mt-3 flex cursor-pointer items-center gap-3 text-sm text-sky-100/85">
            <input
              type="checkbox"
              className="h-4 w-4 accent-cyan-300"
              checked={anonymous}
              onChange={(event) => setAnonymous(event.target.checked)}
              disabled={sending}
            />
            Enviar como Anónimo
          </label>
        </div>

        <MemberPicker
          members={members}
          selectedId={recipientId}
          onSelect={setRecipientId}
          disabled={sending}
        />

        {selectedMember ? (
          <p className="rounded-xl border border-cyan-200/25 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-50">
            Carta para <span className="font-semibold">{selectedMember.name}</span>
          </p>
        ) : null}

        <div>
          <label className="mb-2 block text-sm font-semibold text-cyan-100" htmlFor="message">
            Mensaje
          </label>
          <textarea
            id="message"
            className="glass-input min-h-36 resize-y"
            placeholder="Escribe tu carta aquí…"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={sending}
            maxLength={4000}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-cyan-100" htmlFor="image">
            Imagen <span className="font-normal text-sky-200/70">(opcional)</span>
          </label>
          <input
            id="image"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="block w-full text-sm text-sky-100 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-300/20 file:px-4 file:py-2 file:font-semibold file:text-cyan-50 hover:file:bg-cyan-300/30"
            onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
            disabled={sending}
          />
          <p className="mt-2 text-xs text-sky-200/65">
            Menos de 1&nbsp;MB se guarda en Base64. Imágenes más grandes se suben a Imgur (gratis).
          </p>
          <AnimatePresence>
            {previewUrl ? (
              <motion.img
                key={previewUrl}
                src={previewUrl}
                alt="Vista previa"
                className="mt-3 max-h-40 w-full rounded-2xl border border-cyan-100/20 object-cover"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              />
            ) : null}
          </AnimatePresence>
        </div>

        {error ? (
          <p className="rounded-xl border border-rose-300/30 bg-rose-500/15 px-4 py-3 text-sm text-rose-100">
            {error}
          </p>
        ) : null}

        <motion.button
          type="submit"
          className="w-full rounded-2xl bg-gradient-to-r from-blue-700 via-sky-500 to-cyan-300 px-5 py-3 font-semibold text-slate-950 shadow-[0_10px_30px_rgba(56,189,248,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
          whileHover={{ scale: sending ? 1 : 1.015 }}
          whileTap={{ scale: sending ? 1 : 0.98 }}
          disabled={sending}
        >
          {sending ? 'La carta está viajando…' : 'Enviar carta'}
        </motion.button>
      </form>
    </GlassCard>
  )
}
