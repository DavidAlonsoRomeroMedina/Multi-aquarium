export const ACTIVITIES = [
  {
    id: 'admirador-secreto',
    title: 'Admirador Secreto',
    path: '/admirador-secreto',
    description: 'Envía una carta anónima o firmada a alguien del acuario.',
    enabled: true,
  },
  {
    id: 'enamora2',
    title: 'Enamora2',
    path: '/enamora2',
    description: 'Mide el destino de dos integrantes en la balanza del amor.',
    enabled: true,
  },
]

export function getActivityById(id) {
  return ACTIVITIES.find((activity) => activity.id === id) || null
}
