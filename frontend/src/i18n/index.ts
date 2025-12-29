import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      title: '🀄 Mahjong Tracker',
      standings: 'Standings',
      recordRound: 'Record Round',
      roundHistory: 'Round History',
      statistics: 'Statistics',
      players: 'Players',
      diceRoller: 'Dice Roller',
      submit: 'Submit',
      balance: 'Balance',
      add: 'Add',
      roll: '🎲 Roll',
      total: 'Total',
      sum: 'Sum',
      rounds: 'Rounds',
      winRate: 'Win%',
      avg: 'Avg',
      best: 'Best',
      worst: 'Worst',
      newPlayer: 'New player name',
      breakFrom: 'Break from',
      dirSelf: 'Self',
      dirRight: 'Right',
      dirAcross: 'Across',
      dirLeft: 'Left',
      table: 'Table',
    },
  },
  zh: {
    translation: {
      title: '🀄 麻将记分器',
      standings: '排名',
      recordRound: '记录回合',
      roundHistory: '历史记录',
      statistics: '统计',
      players: '玩家',
      diceRoller: '骰子',
      submit: '提交',
      balance: '平衡',
      add: '添加',
      roll: '🎲 掷骰子',
      total: '总计',
      sum: '总和',
      rounds: '回合',
      winRate: '胜率',
      avg: '平均',
      best: '最高',
      worst: '最低',
      newPlayer: '新玩家名称',
      breakFrom: '开牌方向',
      dirSelf: '自己',
      dirRight: '下家',
      dirAcross: '对家',
      dirLeft: '上家',
      table: '牌桌',
    },
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
