import { getActivityById } from '../constants/activities'
import useActivities from '../hooks/useActivities'
import ComingSoon from './ComingSoon'

export default function ActivityGate({ activityId, children }) {
  const { activities, loading } = useActivities()
  const catalog = getActivityById(activityId)
  const activity = activities.find((item) => item.id === activityId) || catalog

  if (loading) {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 text-cyan-100/80">
        Abriendo el módulo…
      </div>
    )
  }

  if (!activity?.enabled) {
    return <ComingSoon title={activity?.title || catalog?.title || 'Esta actividad'} />
  }

  return children
}
