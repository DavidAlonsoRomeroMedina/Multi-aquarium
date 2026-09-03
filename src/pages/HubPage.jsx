import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import GlassCard from '../components/GlassCard'
import SiteHeader from '../components/SiteHeader'
import useActivities from '../hooks/useActivities'

export default function HubPage() {
  const { activities, loading } = useActivities()

  return (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center px-4 pb-16">
      <SiteHeader subtitle="Elige una actividad del acuario mágico." />

      <motion.div
        className="mt-10 grid w-full gap-5 md:grid-cols-2"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {loading ? (
          <p className="col-span-full text-center text-cyan-100/75">Cargando módulos…</p>
        ) : null}

        {activities.map((activity) => (
          <Link key={activity.id} to={activity.path} className="block">
            <GlassCard className="h-full transition hover:bg-white/10">
              <p className="text-xs tracking-[0.28em] text-cyan-200/75 uppercase">
                {activity.enabled ? 'Disponible' : 'En pausa'}
              </p>
              <h2 className="font-display mt-2 text-3xl text-cyan-50">{activity.title}</h2>
              <p className="mt-2 text-sm text-sky-100/80">{activity.description}</p>
            </GlassCard>
          </Link>
        ))}
      </motion.div>
    </div>
  )
}
