export function phraseForLovePercent(percent) {
  const value = Math.round(Number(percent) || 0)

  if (value <= 0) return 'La peor pareja de la historia'
  if (value <= 10) return 'Tal vez es tiempo de dejarlo ir'
  if (value <= 20) return 'Creo que lo mejor es que lo intenten con otras personas'
  if (value <= 30) return 'Uh... esto no terminará bien'
  if (value <= 40) return 'Mejor quédense como buenos amigos'
  if (value <= 50) return 'Así no es como debería sentirse estar enamorado'
  if (value <= 60) return 'Bueno... he visto peores'
  if (value <= 70) return 'Tal vez puedan hacer que esto funcione'
  if (value <= 80) return 'Ustedes sí que son compatibles'
  if (value <= 90) return 'Que pareja tan linda, los apoyo completamente'
  if (value <= 99) return 'WOW, mi sueño es tener algo como lo que tienen ustedes'
  return 'Son almas gemelas'
}

export function isExtremeLoveScore(percent) {
  const value = Math.round(Number(percent) || 0)
  return value <= 10 || value >= 90
}
