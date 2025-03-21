import {
  CardThemed,
  ColorText,
  DropdownButton,
  NumberInputLazy,
} from '@genshin-optimizer/common/ui'
import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import type { StatKey } from '@genshin-optimizer/zzz/consts'
import { allAttributeKeys } from '@genshin-optimizer/zzz/consts'
import type { SpecificDmgTypeKey } from '@genshin-optimizer/zzz/db'
import {
  useCharOpt,
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import type { Attribute, Tag } from '@genshin-optimizer/zzz/formula'
import { TagDisplay } from '@genshin-optimizer/zzz/formula-ui'
import { AttributeName, StatDisplay } from '@genshin-optimizer/zzz/ui'
import { DeleteForever } from '@mui/icons-material'
import {
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'
import { useCallback } from 'react'
import {
  AfterShockToggleButton,
  SpecificDmgTypeDropdown,
} from './SpecificDmgTypeSelector'

export function BonusStatsSection() {
  const { database } = useDatabaseContext()
  const { key: characterKey } = useCharacterContext()!
  const { bonusStats } = useCharOpt(characterKey)!
  const setStat = useCallback(
    (tag: Tag, value: number | null, index?: number) =>
      database.charOpts.setBonusStat(characterKey, tag, value, index),
    [database, characterKey]
  )
  const newTarget = (q: InitialStats) =>
    database.charOpts.setBonusStat(characterKey, newTag(q), 0)

  return (
    <CardThemed>
      <CardHeader title="Bonus Stats" />
      <Divider />
      <CardContent>
        <Stack spacing={1}>
          {bonusStats.map(({ tag, value }, i) => (
            <BonusStatDisplay
              key={JSON.stringify(tag) + i}
              tag={tag}
              value={value}
              setValue={(value) => setStat(tag, value, i)}
              onDelete={() => setStat(tag, null, i)}
              setTag={(tag) => setStat(tag, value, i)}
            />
          ))}
          <InitialStatDropdown onSelect={newTarget} />
        </Stack>
      </CardContent>
    </CardThemed>
  )
}
function newTag(q: Tag['q']): Tag {
  return {
    et: 'own',
    q,
    qt: 'combat',
    sheet: 'agg',
  }
}
const initialStats: StatKey[] = [
  'hp',
  'hp_',
  'def',
  'def_',
  'atk',
  'atk_',
  'dmg_',
  'enerRegen_',
  'crit_',
  'crit_dmg_',
] as const
type InitialStats = (typeof initialStats)[number]
function InitialStatDropdown({
  tag,
  onSelect,
}: {
  tag?: Tag
  onSelect: (key: (typeof initialStats)[number]) => void
}) {
  return (
    <DropdownButton
      title={(tag && <TagDisplay tag={tag} />) ?? 'Add Bonus Stat'}
    >
      {initialStats.map((statKey) => (
        <MenuItem key={statKey} onClick={() => onSelect(statKey)}>
          <StatDisplay statKey={statKey} showPercent />
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
const specificDmgTypeIncStats = ['atk_', 'dmg_', 'crit_', 'crit_dmg_'] as const
function BonusStatDisplay({
  tag,
  setTag,
  value,
  setValue,
  onDelete,
}: {
  tag: Tag
  setTag: (tag: Tag) => void
  value: number
  setValue: (value: number) => void
  onDelete: () => void
}) {
  const isPercent = (tag.name || tag.q)?.endsWith('_')
  return (
    <CardThemed bgt="light">
      <CardContent
        sx={{
          display: 'flex',
          gap: 1,
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        <Typography>
          <TagDisplay tag={tag} />
        </Typography>
        {tag.q === 'dmg_' && (
          <AttributeDropdown
            tag={tag}
            setAttribute={(ele) => {
              const { attribute, ...rest } = tag
              setTag(ele ? { ...rest, attribute: ele } : rest)
            }}
          />
        )}
        {specificDmgTypeIncStats.includes(
          tag.q as (typeof specificDmgTypeIncStats)[number]
        ) && (
          <SpecificDmgTypeDropdown
            dmgType={tag.damageType1 as SpecificDmgTypeKey}
            setDmgType={(dmgType) => {
              const { damageType1, ...rest } = tag
              setTag(dmgType ? { ...rest, damageType1: dmgType } : rest)
            }}
          />
        )}
        {(['dmg_', 'crit_dmg_'] as const).includes(
          tag.q as 'dmg_' | 'crit_dmg_'
        ) && (
          <AfterShockToggleButton
            isAftershock={tag.damageType2 === 'aftershock'}
            setAftershock={(aftershock) => {
              const { damageType2, ...rest } = tag
              setTag(aftershock ? { ...rest, damageType2: 'aftershock' } : rest)
            }}
          />
        )}
        <NumberInputLazy
          float
          value={value}
          sx={{ flexBasis: 150, flexGrow: 1, height: '100%' }}
          onChange={setValue}
          placeholder="Stat Value"
          size="small"
          inputProps={{ sx: { textAlign: 'right' } }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" sx={{ ml: 0 }}>
                {isPercent ? '%' : undefined}{' '}
                <IconButton
                  aria-label="Delete Bonus Stat"
                  onClick={onDelete}
                  edge="end"
                >
                  <DeleteForever fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </CardContent>
      {shouldShowDevComponents && (
        <>
          <Divider />
          <CardContent>
            <Typography sx={{ fontFamily: 'monospace' }}>
              {JSON.stringify(tag)}
            </Typography>
          </CardContent>
        </>
      )}
    </CardThemed>
  )
}

function AttributeDropdown({
  tag,
  setAttribute,
}: {
  tag: Tag
  setAttribute: (ele: Attribute | null) => void
}) {
  return (
    <DropdownButton
      title={
        tag.attribute ? (
          <AttributeName attribute={tag.attribute} />
        ) : (
          'No Attribute'
        )
      }
      color={tag.attribute!}
    >
      <MenuItem onClick={() => setAttribute(null)}>No Attribute</MenuItem>
      {allAttributeKeys.map((attr) => (
        <MenuItem key={attr} onClick={() => setAttribute(attr)}>
          <ColorText color={attr}>
            <AttributeName attribute={attr} />
          </ColorText>
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
