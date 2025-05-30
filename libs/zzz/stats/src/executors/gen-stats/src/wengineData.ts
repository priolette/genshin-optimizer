import { objMap } from '@genshin-optimizer/common/util'
import type {
  SpecialityKey,
  WengineKey,
  WengineRarityKey,
  WengineSubStatKey,
} from '@genshin-optimizer/zzz/consts'
import { wengineDetailedJSONData } from '@genshin-optimizer/zzz/dm'
import { extractParamsFromString } from './util'

export type WengineDatum = {
  rarity: WengineRarityKey
  type: SpecialityKey
  atk_base: number
  second_statkey: WengineSubStatKey
  second_statvalue: number
  phase: PhaseData[]
}
type PhaseData = {
  params: number[]
}

export type WenginesData = Record<WengineKey, WengineDatum>
export function getWenginesData(): WenginesData {
  return objMap(
    wengineDetailedJSONData,
    ({ rarity, type, atk_base, second_statkey, second_statvalue, phase }) => ({
      rarity,
      type,
      atk_base,
      second_statkey,
      second_statvalue,
      phase: phase.map(({ desc }) => ({
        params: extractParamsFromString(desc),
      })),
    })
  )
}
