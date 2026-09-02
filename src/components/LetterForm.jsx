import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { db, isFirebaseConfigured, storage } from '../firebase'
import GlassCard from './GlassCard'

const MAX_IMAGE_MB = 5

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
        if (!storage) {
          throw new Error('Firebase Storage no está disponible.')
        }

        const safeName = imageFile.name.replace(/[^\w.\-]+/g, '_')
        const fileRef = ref(storage, `letters/${Date.now()}_${safeName}`)
        await uploadBytes(fileRef, imageFile)
        imageUrl = await getDownloadURL(fileRef)
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
      setError('No se pudo enviar la carta. Inténtalo de nuevo en un momento.')
    } finally {
      setSending(false)
    }
  }

  return (
    <GlassCard className="w-full max-w-xl">
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

        <div>
          <label className="mb-2 block text-sm font-semibold text-cyan-100" htmlFor="recipient">
            Destinatario
          </label>
          <select
            id="recipient"
            className="glass-input"
            value={recipientId}
            onChange={(event) => setRecipientId(event.target.value)}
            disabled={sending}
          >
            <option value="">Elige a un integrante del acuario…</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

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
          <AnimatePresence>
            {previewUrl ? (
              <motion.img
                key={previewUrl}
                src={previewUrl}
                alt="Vista previa"
                className="mt-3 max-h-40 rounded-2xl border border-cyan-100/20 object-cover"
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
          className="w-full rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 px-5 py-3 font-semibold text-white shadow-[0_10px_30px_rgba(8,145,178,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
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
