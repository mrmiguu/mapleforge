import type { DuskClient, PlayerId as DuskPlayerId } from 'dusk-games-sdk/multiplayer'

export type PlayerId = DuskPlayerId

export type View = 'worldMap' | 'cashShop'

export type Die = [DieFace, DieFace, DieFace, DieFace, DieFace, DieFace]

export type DieFaceNum = 1 | 2 | 3 | 4 | 5 | 6
export type WhichDie = 1 | 2

export type PlayerState = {
  id: PlayerId
  viewing: View | null
  showDiceRoll: boolean
  dice: [Die, Die]
  rolledNums: [DieFaceNum | undefined, DieFaceNum | undefined]
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

export type CashShopItem = {
  face: DieFace
  bought?: boolean
}

export type CashShop = {
  itemsByPrice: { [price: number]: CashShopItem[] }
}

export type GameState = {
  whoseTurn?: PlayerId
  playerOrder: { [id in PlayerId]: number }
  firstPlayerDecidedAt?: number
  playerStateById: { [id in PlayerId]: PlayerState }
  cashShop: CashShop
}

type GameActions = {
  rollDie: ({ which }: { which: WhichDie }) => void
  // rollToDecideOrder: ({ rolled }: { rolled: [DieFace, DieFace] }) => void
  switchView: ({ view }: { view: View }) => void
  showDiceRoll: ({ show }: { show: boolean }) => void
  buyCashShopItem: ({ price, priceIndex }: { price: number; priceIndex: number }) => void
}

declare global {
  const Dusk: DuskClient<GameState, GameActions>
}

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

export const DIE_ROLL_DURATION_MS = 1600

export const totalOnline = (game: GameState): number => {
  return Object.keys(game.playerStateById).length
}

const _firstPlayer = (game: GameState): PlayerId | undefined => {
  const playersOnline = new Set(Object.keys(game.playerStateById))
  const playersWhoRolled = new Set(Object.keys(game.playerOrder))
  if (playersOnline.difference(playersWhoRolled).size > 0) {
    return undefined
  }
  return Object.entries(game.playerOrder).sort(([, a], [, b]) => b - a)[0]?.[0]
}

export const currentPlayerTurn = (game: GameState): PlayerId | undefined => {
  return _firstPlayer(game) && game.whoseTurn
}

export const decidingRollSum = (rolled: [DieFace, DieFace]): number => {
  if ('op' in rolled[0] || 'op' in rolled[1]) {
    throw new Error('Dice rolled when deciding who goes first must not contain any or/and faces')
    // throw Dusk.invalidAction()
  }

  const [, a] = rolled[0].gain
  const [, b] = rolled[1].gain

  return a + b
}

const getDefaultPlayerState = (id: PlayerId): PlayerState => {
  return {
    id,
    dice: [
      [M1, M1, M1, M1, W1, P1],
      [M1, M1, M1, M1, M2, L1],
    ],
    rolledNums: [undefined, undefined],
    viewing: 'worldMap',
    showDiceRoll: false,
    level: 1,
  }
}

const csItems = (...dieFaces: DieFace[]): CashShopItem[] => {
  return dieFaces.map(face => ({ face }))
}

Dusk.initLogic({
  minPlayers: 1,
  maxPlayers: 4,

  setup: allPlayerIds => ({
    playerOrder: {},
    playerStateById: allPlayerIds.reduce<GameState['playerStateById']>((acc, id) => {
      acc[id] = getDefaultPlayerState(id)
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
    rollDie({ which }, { game, playerId }) {
      const { rolledNums } = game.playerStateById[playerId]!
      const faceNum = ((Math.floor(Math.random() * 6) % 6) + 1) as DieFaceNum

      rolledNums[which - 1] = faceNum
      game.playerOrder[playerId] = 1

      if (!(playerId in game.playerOrder)) {
        const rolled1 = rolledNums[0]
        const rolled2 = rolledNums[1]

        if (rolled1 && rolled2) {
          game.playerOrder[playerId] = rolled1 + rolled2
        }
      }

      if (_firstPlayer(game)) {
        game.firstPlayerDecidedAt = Dusk.gameTime() + 3000
      }
    },

    // rollToDecideOrder({ rolled }, { game, playerId }) {
    //   game.playerOrder[playerId] = decidingRollSum(rolled)
    // },

    switchView({ view }, { game, playerId }) {
      game.playerStateById[playerId]!.viewing = view
    },

    showDiceRoll({ show }, { game, playerId }) {
      game.playerStateById[playerId]!.showDiceRoll = show
    },

    buyCashShopItem: ({ price, priceIndex }, { game }) => {
      game.cashShop.itemsByPrice[price]![priceIndex]!.bought = true
    },
  },

  update({ game }) {
    if (game.firstPlayerDecidedAt && Dusk.gameTime() > game.firstPlayerDecidedAt) {
      game.whoseTurn = _firstPlayer(game)
    }
  },

  events: {
    playerJoined(playerId, eventContext) {
      eventContext.game.playerStateById[playerId] = getDefaultPlayerState(playerId)
    },
  },
})
