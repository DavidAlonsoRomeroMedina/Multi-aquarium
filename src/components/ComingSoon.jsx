import { Link } from 'react-router-dom'
import useMembers from '../hooks/useMembers'
import GlassCard from './GlassCard'

export default function ComingSoon({ title = 'esta actividad' }) {
  const { members } = useMembers()
  const count = members.length

  return (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-2xl items-center px-4 py-16">
      <GlassCard className="w-full text-center">
        <p className="text-xs font-semibold tracking-[0.32em] text-cyan-200/80 uppercase">
          Multi Aquarium
        </p>
        <h1 className="font-display mt-3 text-5xl text-cyan-50">Actualización próxima</h1>
        <p className="mt-4 text-sky-100/85">
          {title} está en mantenimiento o aún no abre sus puertas. El acuario sigue
          vivo: un grupo de rol de {count} {count === 1 ? 'integrante' : 'integrantes'} que
          comparte cartas, destinos y burbujas en este rincón mágico.
        </p>
        <p className="mt-3 text-sm text-sky-200/70">
          Vuelve más tarde. El team Multi Aquarium está preparando la siguiente
          marea.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-400 px-5 py-3 font-semibold text-slate-950"
        >
          Volver al acuario
        </Link>
      </GlassCard>
    </div>
  )
}
