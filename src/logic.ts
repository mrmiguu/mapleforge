import type { DuskClient, PlayerId as DuskPlayerId } from 'dusk-games-sdk/multiplayer'

export type PlayerId = DuskPlayerId

export type View = 'worldMap' | 'cashShop'

export type Die = [DieFace, DieFace, DieFace, DieFace, DieFace, DieFace]

export type PlayerState = {
  id: PlayerId
  viewing: View | null
  showDiceRoll: boolean
  dice: [Die, Die]
  level: number
}

export type GainType = 'meso' | 'power' | 'wisdom' | 'level'

export type DieFaceGainOrOp = '?'
export type DieFaceGainAndOp = '+'
export type DieFaceGainOp = DieFaceGainOrOp | DieFaceGainAndOp

export type DieFaceSingle = {
  gain: [GainType, number]
}
export type DieFaceOr = {
  gain: [GainType, number][]
  op: DieFaceGainOrOp
}
export type DieFaceAnd = {
  gain: [GainType, number][]
  op: DieFaceGainAndOp
}
export type DieFace = DieFaceSingle | DieFaceOr | DieFaceAnd

// Uniquely default
const M1: DieFace = { gain: ['meso', 1] }
const M2: DieFace = { gain: ['meso', 2] }
const L1: DieFace = { gain: ['level', 1] }
// Only for the starting dice
const M5: DieFace = { gain: ['meso', 5] }
// Cash Shop only
const M3: DieFace = { gain: ['meso', 3] }
const M4: DieFace = { gain: ['meso', 4] }
const M6: DieFace = { gain: ['meso', 6] }
const W1: DieFace = { gain: ['wisdom', 1] }
const W2: DieFace = { gain: ['wisdom', 2] }
const P1: DieFace = { gain: ['power', 1] }
const P2: DieFace = { gain: ['power', 2] }
const L3: DieFace = { gain: ['level', 3] }
const L4: DieFace = { gain: ['level', 4] }
const MWoP1: DieFaceOr = {
  gain: [
    ['meso', 1],
    ['wisdom', 1],
    ['power', 1],
  ],
  op: '?',
}
const M3oL2: DieFaceOr = {
  gain: [
    ['meso', 3],
    ['level', 2],
  ],
  op: '?',
}
const MWoP2: DieFaceOr = {
  gain: [
    ['meso', 2],
    ['wisdom', 1],
    ['power', 1],
  ],
  op: '?',
}
const M2aW1: DieFaceAnd = {
  gain: [
    ['meso', 2],
    ['wisdom', 1],
  ],
  op: '+',
}
const PaL1: DieFaceAnd = {
  gain: [
    ['power', 1],
    ['level', 1],
  ],
  op: '+',
}
const MWPaL1: DieFaceAnd = {
  gain: [
    ['meso', 1],
    ['wisdom', 1],
    ['power', 1],
    ['level', 1],
  ],
  op: '+',
}
const WaL2: DieFaceAnd = {
  gain: [
    ['wisdom', 2],
    ['level', 2],
  ],
  op: '+',
}

const StartingDie: Die = [M1, M2, M3, M4, M5, M6]
export const StartingDice: [Die, Die] = [StartingDie, StartingDie]

export type CashShopItem = {
  face: DieFace
  bought?: boolean
}

export type CashShop = {
  itemsByPrice: { [price: number]: CashShopItem[] }
}

export type GameState = {
  playerIds: PlayerId[]
  whoseTurn?: PlayerId
  playerOrder: { [id in PlayerId]: number }
  playerStateById: { [id in PlayerId]: PlayerState }
  cashShop: CashShop
}

type GameActions = {
  rollToDecideOrder: ({ faces }: { faces: [number, number] }) => void
  switchView: ({ view }: { view: View }) => void
  showDiceRoll: ({ show }: { show: boolean }) => void
  buyCashShopItem: ({ price, priceIndex }: { price: number; priceIndex: number }) => void
}

declare global {
  const Dusk: DuskClient<GameState, GameActions>
}

export type Phase = 'rollToDecideOrder' | 'gameplay'

// const getGamePhase = (game: GameState): Phase => {

// }

const csItems = (...dieFaces: DieFace[]): CashShopItem[] => {
  return dieFaces.map(face => ({ face }))
}

Dusk.initLogic({
  minPlayers: 2,
  maxPlayers: 4,

  setup: allPlayerIds => ({
    playerIds: allPlayerIds,
    playerOrder: {},
    playerStateById: allPlayerIds.reduce<GameState['playerStateById']>((acc, id) => {
      acc[id] = {
        id,
        dice: [
          [M1, M1, M1, M1, W1, P1],
          [M1, M1, M1, M1, M2, L1],
        ],
        viewing: null,
        showDiceRoll: false,
        level: 1,
      }
      return acc
    }, {}),
    cashShop: {
      itemsByPrice: {
        2: csItems(W1, W1, W1, W1, M3, M3, M3, M3),
        3: csItems(P1, P1, P1, P1, M4, M4, M4, M4),
        4: csItems(PaL1, M6, MWoP1, M2aW1),
        5: csItems(M3oL2, M3oL2, M3oL2, M3oL2),
        6: csItems(W2, W2, W2, W2),
        8: csItems(P2, P2, P2, P2, L3, L3, L3, L3),
        12: csItems(MWoP2, MWPaL1, WaL2, L4),
      },
    },
  }),
  actions: {
    rollToDecideOrder({ faces: [face1, face2] }, { game, playerId }) {
      const dieFace1 = game.playerStateById[playerId].dice[0][face1]
      const dieFace2 = game.playerStateById[playerId].dice[0][face2]
      if ('op' in dieFace1 || 'op' in dieFace2) {
        throw new Error('Die face must not be an or/and face')
      }

      const [, a] = dieFace1.gain
      const [, b] = dieFace2.gain

      game.playerOrder[playerId] = a + b
    },

    switchView({ view }, { game, playerId }) {
      game.playerStateById[playerId].viewing = view
    },

    showDiceRoll({ show }, { game, playerId }) {
      game.playerStateById[playerId].showDiceRoll = show
    },

    buyCashShopItem: ({ price, priceIndex }, { game }) => {
      game.cashShop.itemsByPrice[price][priceIndex].bought = true
    },
  },
})
