import { motion } from 'framer-motion'
import { getMemberImage } from '../constants/members'

export default function MemberPicker({ members, selectedId, onSelect, disabled }) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-cyan-100">Destinatario</p>
      <div className="custom-scroll grid max-h-[22rem] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 md:grid-cols-4">
        {members.map((member, index) => {
          const selected = member.id === selectedId
          const image = getMemberImage(member.name, member.image)

          return (
            <motion.button
              key={member.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(member.id)}
              className={`glass member-card relative flex flex-col items-center gap-2.5 rounded-2xl px-2 py-3 text-center transition ${
                selected
                  ? 'member-card-selected ring-2 ring-cyan-300/80'
                  : 'hover:bg-white/10'
              } disabled:cursor-not-allowed disabled:opacity-60`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.02, 0.3) }}
              whileHover={{ y: disabled ? 0 : -2 }}
              whileTap={{ scale: disabled ? 1 : 0.97 }}
              aria-pressed={selected}
            >
              <span className="avatar-ring relative aspect-square h-16 w-16 shrink-0 overflow-hidden rounded-full sm:h-20 sm:w-20">
                {image ? (
                  <img
                    src={image}
                    alt={member.name}
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    loading="lazy"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-cyan-900/50 text-lg text-cyan-100">
                    {member.name.slice(0, 1)}
                  </span>
                )}
              </span>
              <span className="w-full truncate text-xs font-semibold text-cyan-50 sm:text-sm">
                {member.name}
              </span>
              {selected ? (
                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.9)]" />
              ) : null}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
