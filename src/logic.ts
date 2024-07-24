import type { DuskClient, PlayerId } from 'dusk-games-sdk/multiplayer'

export type View = 'worldMap' | 'cashShop'

export type PlayerState = {
  id: PlayerId
  viewing: View
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

export type CashShopItem = {
  face: DieFace
  bought?: boolean
}

export type CashShop = {
  itemsByPrice: { [price: number]: CashShopItem[] }
}

export interface GameState {
  playerIds: PlayerId[]
  whoseTurn: PlayerId
  playerStateById: { [id in PlayerId]: PlayerState }
  cashShop: CashShop
}

type GameActions = {
  switchView: ({ view }: { view: View }) => void
  buyCashShopItem: ({ price, priceIndex }: { price: number; priceIndex: number }) => void
}

declare global {
  const Dusk: DuskClient<GameState, GameActions>
}

const csItems = (...dieFaces: DieFace[]): CashShopItem[] => {
  return dieFaces.map(face => ({ face }))
}

Dusk.initLogic({
  minPlayers: 2,
  maxPlayers: 4,
  setup: allPlayerIds => ({
    playerIds: allPlayerIds,
    playerStateById: allPlayerIds.reduce<GameState['playerStateById']>((acc, id) => {
      acc[id] = {
        id,
        viewing: 'worldMap',
      }
      return acc
    }, {}),
    whoseTurn: allPlayerIds[0],
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
    switchView({ view }, { game, playerId }) {
      game.playerStateById[playerId].viewing = view
    },

    buyCashShopItem: ({ price, priceIndex }, { game }) => {
      game.cashShop.itemsByPrice[price][priceIndex].bought = true
      //   if (game.cells[cellIndex] !== null || playerId === game.lastMovePlayerId) {
      //     throw Dusk.invalidAction()
      //   }
      //   game.cells[cellIndex] = playerId
      //   game.lastMovePlayerId = playerId
      //   game.winCombo = findWinningCombo(game.cells)
      //   if (game.winCombo) {
      //     const [player1, player2] = allPlayerIds
      //     Dusk.gameOver({
      //       players: {
      //         [player1]: game.lastMovePlayerId === player1 ? 'WON' : 'LOST',
      //         [player2]: game.lastMovePlayerId === player2 ? 'WON' : 'LOST',
      //       },
      //     })
      //   }
      //   game.freeCells = game.cells.findIndex(cell => cell === null) !== -1
      //   if (!game.freeCells) {
      //     Dusk.gameOver({
      //       players: {
      //         [game.playerIds[0]]: 'LOST',
      //         [game.playerIds[1]]: 'LOST',
      //       },
      //     })
      //   }
    },
  },
})
