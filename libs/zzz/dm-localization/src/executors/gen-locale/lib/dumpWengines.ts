import { dumpFile } from '@genshin-optimizer/common/pipeline'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { wengineDetailedJSONData } from '@genshin-optimizer/zzz/dm'
import { processText } from './util'
export function dumpWengines(fileDir: string) {
  const wengineNames = {} as Record<WengineKey, string>

  Object.entries(wengineDetailedJSONData).forEach(([wKey, wengineData]) => {
    wengineNames[wKey] = wengineData.name

    dumpFile(`${fileDir}/wengine_${wKey}_gen.json`, {
      name: wengineData.name,
      desc: processText(wengineData.desc),
      desc2: processText(wengineData.desc2),
      desc3: processText(wengineData.desc3),
      phase: wengineData.phase[0].name,
      phaseDescs: wengineData.phase.map((phase) => processText(phase.desc)),
    })
  })
  dumpFile(`${fileDir}/wengineNames_gen.json`, wengineNames)
}
