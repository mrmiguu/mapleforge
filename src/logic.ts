import type { DuskClient, PlayerId as DuskPlayerId } from 'dusk-games-sdk/multiplayer'
import {
  L1,
  L3,
  L4,
  M1,
  M2,
  M2aW1,
  M3,
  M3oL2,
  M4,
  M5,
  M6,
  MWoP1,
  MWoP2,
  MWPaL1,
  P1,
  P2,
  PaL1,
  W1,
  W2,
  WaL2,
} from './logic.dice'

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
  afk?: boolean
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
  playerStateById: { [id in PlayerId]: PlayerState }
  decidedRollSumByPlayerId: { [id in PlayerId]: number }
  whoseTurn?: PlayerId
  cashShop: CashShop
}

type GameActions = {
  rollDie: ({ which }: { which: WhichDie }) => void
  switchView: ({ view }: { view: View }) => void
  showDiceRoll: ({ show }: { show: boolean }) => void
  buyCashShopItem: ({ price, priceIndex }: { price: number; priceIndex: number }) => void
}

declare global {
  const Dusk: DuskClient<GameState, GameActions>
}

const StartingDie: Die = [M1, M2, M3, M4, M5, M6]
export const StartingDice: [Die, Die] = [StartingDie, StartingDie]

export const totalOnline = (game: GameState): number => {
  return Object.values(game.playerStateById).filter(p => !p.afk).length
}

export const findFirstPlayer = (game: GameState) => {
  const playersRegistered = new Set(Object.keys(game.playerStateById))
  const playersWhoRolled = new Set(Object.keys(game.decidedRollSumByPlayerId))

  if (playersRegistered.difference(playersWhoRolled).size > 0) {
    return
  }

  const firstPlayer = Object.entries(game.decidedRollSumByPlayerId).sort(([, a], [, b]) => b - a)[0]?.[0]
  return firstPlayer
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

export const decidedRollSum = (game: GameState, playerId: PlayerId) => {
  return game.decidedRollSumByPlayerId[playerId]
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

const checkDecidedFirstPlayer = (game: GameState) => {
  const firstPlayer = findFirstPlayer(game)
  if (firstPlayer && !game.whoseTurn) {
    game.whoseTurn = firstPlayer
  }
}

const checkToCalculateDecidedRollSum = (
  game: GameState,
  playerId: PlayerId,
  rolledNums: [DieFaceNum | undefined, DieFaceNum | undefined],
) => {
  const rolled1 = rolledNums[0]
  const rolled2 = rolledNums[1]

  if (rolled1 && rolled2 && !(playerId in game.decidedRollSumByPlayerId)) {
    game.decidedRollSumByPlayerId[playerId] = rolled1 + rolled2

    checkDecidedFirstPlayer(game)
  }
}

const csItems = (...dieFaces: DieFace[]): CashShopItem[] => {
  return dieFaces.map(face => ({ face }))
}

Dusk.initLogic({
  minPlayers: 1,
  maxPlayers: 4,
  inputDelay: 250,

  setup: allPlayerIds => ({
    playerStateById: allPlayerIds.reduce<GameState['playerStateById']>((acc, id) => {
      acc[id] = getDefaultPlayerState(id)
      return acc
    }, {}),
    decidedRollSumByPlayerId: {},
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

      checkToCalculateDecidedRollSum(game, playerId, rolledNums)
    },

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

  events: {
    playerJoined(playerId, { game }) {
      if (playerId in game.playerStateById) {
        game.playerStateById[playerId]!.afk = false
      } else {
        game.playerStateById[playerId] = getDefaultPlayerState(playerId)
      }
    },
    playerLeft(playerId, { game }) {
      game.playerStateById[playerId]!.afk = true
      checkDecidedFirstPlayer(game)
    },
  },
})

export const actions = Dusk.actions
