export const INITIAL_MEMBERS = [
  { name: 'Bachira', image: '/imagenes/Bachira.png' },
  { name: 'Deku', image: '/imagenes/Deku.png' },
  { name: 'Diane', image: '/imagenes/Diane.png' },
  { name: 'Drago', image: '/imagenes/Drago.png' },
  { name: 'Ivan', image: '/imagenes/Ivan.png' },
  { name: 'Lucifer', image: '/imagenes/Lucifer.png' },
  { name: 'Luka', image: '/imagenes/Luka.png' },
  { name: 'Monika', image: '/imagenes/Monika.png' },
  { name: 'N', image: '/imagenes/N.png' },
  { name: 'Nezuko', image: '/imagenes/Nezuko.png' },
  { name: 'Nick', image: '/imagenes/Nick.png' },
  { name: 'Ragatha', image: '/imagenes/Ragatha.png' },
  { name: 'Ribbit', image: '/imagenes/Ribbit.png' },
  { name: 'Sayori', image: '/imagenes/Sayori.png' },
  { name: 'Sua', image: '/imagenes/Sua.png' },
  { name: 'Toon Link', image: '/imagenes/Toon-Link.png' },
  { name: 'Uzi', image: '/imagenes/Uzi.png' },
  { name: 'Venti', image: '/imagenes/Venti.png' },
  { name: 'Zooble', image: '/imagenes/Zooble.png' },
]

const IMAGE_BY_NAME = Object.fromEntries(
  INITIAL_MEMBERS.map((member) => [member.name.toLowerCase(), member.image]),
)

export function getMemberImage(name, fallbackImage) {
  if (fallbackImage) return fallbackImage
  if (!name) return ''
  return IMAGE_BY_NAME[name.toLowerCase()] || ''
}

export function withMemberImages(members) {
  return members.map((member) => ({
    ...member,
    image: getMemberImage(member.name, member.image),
  }))
}
