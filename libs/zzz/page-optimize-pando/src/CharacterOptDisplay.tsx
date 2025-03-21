import { CardThemed, useScrollRef } from '@genshin-optimizer/common/ui'
import { DebugListingsDisplay } from '@genshin-optimizer/game-opt/formula-ui'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import {
  OptConfigProvider,
  useCharOpt,
  useCharacterContext,
} from '@genshin-optimizer/zzz/db-ui'
import { own } from '@genshin-optimizer/zzz/formula'
import { CharacterCard, CharacterEditor } from '@genshin-optimizer/zzz/ui'
import {
  Box,
  CardActionArea,
  CardContent,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import type { ReactNode } from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { BonusStatsSection } from './BonusStats'
import { CharStatsDisplay } from './CharStatsDisplay'
import { DiscSheetsDisplay } from './DiscSheetsDisplay'
import { EnemyCard } from './EnemyCard'
import Optimize from './Optimize'
import { EquippedGrid } from './Optimize/EquippedGrid'
import GeneratedBuildsDisplay from './Optimize/GeneratedBuildsDisplay'
import { WengineSheetsDisplay } from './WengineSheetsDisplay'
import { TeamHeaderHeightContext } from './context/TeamHeaderHeightContext'

const BOT_PX = 0
const SECTION_SPACING_PX = 33
const SectionNumContext = createContext(0)
export function CharacterOptDisplay() {
  const sections: Array<[key: string, title: ReactNode, content: ReactNode]> =
    useMemo(() => {
      return [
        ['char', 'Character', <CharacterSection key="char" />],
        // ['talent', 'Talent', <CharacterTalentPane key="talent" />],
        ['discCond', 'Disc Conditionals', <DiscSheetsDisplay key="discCond" />],
        [
          'wengineCond',
          'Wengine Conditionals',
          <WengineSheetsDisplay key="wengineCond" />,
        ],
        ['opt', 'Optimize', <OptimizeSection key="opt" />],
        ['builds', 'Builds', <BuildsSection key="builds" />],
      ] as const
    }, [])

  return (
    <SectionNumContext.Provider value={sections.length}>
      <Stack gap={1}>
        {sections.map(([key, title, content], i) => (
          <Section key={key} title={title} index={i}>
            {content}
          </Section>
        ))}
      </Stack>
    </SectionNumContext.Provider>
  )
}
function Section({
  index,
  title,
  children,
}: {
  index: number
  title: React.ReactNode
  children: React.ReactNode
}) {
  const [charScrollRef, onScroll] = useScrollRef()
  const numSections = useContext(SectionNumContext)
  const headerHeight = useContext(TeamHeaderHeightContext)
  return (
    <>
      <CardThemed
        sx={(theme) => ({
          outline: `solid ${theme.palette.secondary.main}`,
          position: 'sticky',
          top: headerHeight + index * SECTION_SPACING_PX,
          bottom: BOT_PX + (numSections - 1 - index) * SECTION_SPACING_PX,
          zIndex: 100,
        })}
      >
        <CardActionArea onClick={onScroll} sx={{ px: 1 }}>
          <Typography variant="h6">{title}</Typography>
        </CardActionArea>
      </CardThemed>
      <Box
        ref={charScrollRef}
        sx={{
          scrollMarginTop: headerHeight + (index + 1) * SECTION_SPACING_PX,
        }}
      >
        {children}
      </Box>
    </>
  )
}
function CharacterSection() {
  const character = useCharacterContext()!
  const { key: characterKey } = character
  const [editorKey, setCharacterKey] = useState<CharacterKey | undefined>(
    undefined
  )
  const onClick = useCallback(() => {
    character?.key && setCharacterKey(character.key)
  }, [character])
  return (
    <>
      <CharacterEditor
        characterKey={editorKey}
        onClose={() => setCharacterKey(undefined)}
      />
      <Stack spacing={1}>
        <CardThemed>
          <CardContent
            sx={{
              display: 'flex',
              gap: 1,
              backgroundColor: '#1b263b',
            }}
          >
            <Grid container spacing={2} sx={{ flexWrap: 'wrap' }}>
              <Grid item xs={12} sm={7} md={5} lg={4} xl={3}>
                <Stack spacing={1}>
                  <CharacterCard
                    characterKey={characterKey}
                    onClick={onClick}
                  />
                  <EnemyCard />
                  <CharStatsDisplay />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={5} md={7} lg={8} xl={9}>
                <EquippedGrid onClick={onClick} />
              </Grid>
            </Grid>
          </CardContent>
        </CardThemed>
        <BonusStatsSection />
        <DebugListingsDisplay
          formulasRead={own.listing.formulas}
          buffsRead={own.listing.buffs}
        />
      </Stack>
    </>
  )
}

function OptimizeSection() {
  return <Optimize />
}
function BuildsSection() {
  const { key: characterKey } = useCharacterContext()!
  const { optConfigId } = useCharOpt(characterKey)!
  if (!optConfigId) return null
  return (
    <OptConfigProvider optConfigId={optConfigId}>
      <GeneratedBuildsDisplay />
    </OptConfigProvider>
  )
}
