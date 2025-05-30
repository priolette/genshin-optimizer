import { writeFileSync } from 'fs'
import { formatText } from '@genshin-optimizer/common/pipeline'
import {
  allCharacterKeys,
  allDiscSetKeys,
  allWengineKeys,
} from '@genshin-optimizer/zzz/consts'
import type { Tree } from '@nx/devkit'
import { workspaceRoot } from '@nx/devkit'

export default async function genIndex(_tree: Tree, sheet_type: string) {
  const file_location = `${workspaceRoot}/libs/zzz/formula/src/data/${sheet_type}/index.ts`
  switch (sheet_type) {
    case 'char':
      await writeCharIndex(file_location)
      break
    case 'disc':
      await writeDiscIndex(file_location)
      break
    case 'wengine':
      await writeWengineIndex(file_location)
      break
  }
}

async function writeCharIndex(path: string) {
  const index = `
// WARNING: Generated file, do not modify
import { type TagMapNodeEntries } from '../util'
${allCharacterKeys
  .map((charKey) => `import ${charKey} from './sheets/${charKey}'`)
  .join('\n')}

const data: TagMapNodeEntries[] = [
  ${allCharacterKeys.join('\n,  ')}
]
export default data.flat()
  `
  const formatted = await formatText(path, index)
  writeFileSync(path, formatted)
}

async function writeDiscIndex(path: string) {
  const index = `
// WARNING: Generated file, do not modify
import type { TagMapNodeEntries } from '../util'
${allDiscSetKeys
  .map((setKey) => `import ${setKey} from './sheets/${setKey}'`)
  .join('\n')}

const data: TagMapNodeEntries[] = [
  ${allDiscSetKeys.join('\n,  ')}
]
export default data.flat()

  `
  const formatted = await formatText(path, index)
  writeFileSync(path, formatted)
}

async function writeWengineIndex(path: string) {
  const index = `
// WARNING: Generated file, do not modify
import type { TagMapNodeEntries } from '../util'
${allWengineKeys
  .map((wKey) => `import ${wKey} from './sheets/${wKey}'`)
  .join('\n')}

const data: TagMapNodeEntries[] = [
  ${allWengineKeys.join(',\n  ')}
]

export default data.flat()

  `
  const formatted = await formatText(path, index)
  writeFileSync(path, formatted)
}
