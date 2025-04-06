import { CardThemed } from '@genshin-optimizer/common/ui'
import {
  getUnitStr,
  shouldShowDevComponents,
  valueString,
} from '@genshin-optimizer/common/util'
import type { Read } from '@genshin-optimizer/game-opt/engine'
import { DebugReadContext } from '@genshin-optimizer/game-opt/formula-ui'
import { FormulaHelpIcon } from '@genshin-optimizer/game-opt/sheet-ui'
import type { StatKey } from '@genshin-optimizer/sr/consts'
import { applyDamageTypeToTag } from '@genshin-optimizer/sr/db'
import { useCharOpt, useCharacterContext } from '@genshin-optimizer/sr/db-ui'
import type { Tag } from '@genshin-optimizer/sr/formula'
import { own } from '@genshin-optimizer/sr/formula'
import { TagDisplay } from '@genshin-optimizer/sr/formula-ui'
import {
  StatHighlightContext,
  getHighlightRGBA,
  isHighlight,
  useSrCalcContext,
} from '@genshin-optimizer/sr/ui'
import { Box, CardContent } from '@mui/material'
import { useContext, useMemo } from 'react'

export function CharStatsDisplay() {
  const calc = useSrCalcContext()
  return (
    <CardThemed>
      <CardContent>
        {calc?.listFormulas(own.listing.formulas).map((read, index) => (
          <StatLine key={index} read={read} />
        ))}
      </CardContent>
    </CardThemed>
  )
}
/**
 * @deprecated need to be merged with TagFieldDisplay in `libs\game-opt\sheet-ui\src\components\FieldDisplay.tsx`, but need game-opt `formulaText`
 */
function StatLine({ read }: { read: Read<Tag> }) {
  const calc = useSrCalcContext()
  const { setRead } = useContext(DebugReadContext)

  const character = useCharacterContext()
  const charOpt = useCharOpt(character?.key)

  const emphasize =
    (read.tag.sheet === charOpt?.target.sheet &&
      read.tag.name === charOpt?.target.name &&
      charOpt?.target.name !== undefined) ||
    charOpt?.target.q === read.tag.q

  const tag = useMemo(() => {
    if (
      read.tag.sheet === charOpt?.target.sheet &&
      read.tag.name === charOpt?.target.name
    )
      return applyDamageTypeToTag(
        read.tag,
        charOpt?.target.damageType1,
        charOpt?.target.damageType2
      )
    return read.tag
  }, [
    charOpt?.target.damageType1,
    charOpt?.target.damageType2,
    charOpt?.target.name,
    charOpt?.target.sheet,
    read.tag,
  ])
  const newRead = useMemo(() => ({ ...read, tag }), [read, tag])
  const computed = calc?.compute(newRead)
  const name = read.tag.name || read.tag.q

  const { statHighlight, setStatHighlight } = useContext(StatHighlightContext)
  const tagQStatKqy = tag.name
    ? ''
    : tag.elementalType
      ? `${tag.elementalType}_${tag.q}`
      : tag.q === 'cappedCrit_'
        ? 'crit_'
        : tag.q
  const isHL = tagQStatKqy
    ? isHighlight(statHighlight, tagQStatKqy as StatKey)
    : false

  if (!computed) return null
  const valDisplay = valueString(computed.val, getUnitStr(name ?? ''))

  return (
    <Box
      onMouseEnter={() => tagQStatKqy && setStatHighlight(tagQStatKqy)}
      onMouseLeave={() => setStatHighlight('')}
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        p: 0.5,
        borderRadius: 0.5,
        backgroundColor: emphasize ? 'rgba(0,200,0,0.2)' : undefined,
        position: 'relative',
        '::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: 0.5,
          backgroundColor: getHighlightRGBA(isHL),
          transition: 'background-color 0.3s ease-in-out',
          pointerEvents: 'none',
        },
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <TagDisplay tag={tag} />
      </Box>
      {valDisplay}
      <FormulaHelpIcon
        tag={tag}
        onClick={() => {
          shouldShowDevComponents && setRead(newRead)
        }}
      />
    </Box>
  )
}
