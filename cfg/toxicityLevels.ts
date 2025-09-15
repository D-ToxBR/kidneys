import type {ToxicityCfg, AssignedToxicity} from "../src/modules/rankProcessing/rankProcessing";

export type ToxicityLevel = '🩵' | '✅' | '🟡' | '🔶' | '❌';

export const toxicityCfg: ToxicityCfg = {
  possibleToxicityLevels: '🩵✅🟡🔶❌',
  defaultAssignedToxicity: {is: '🟡', playsWith:  '🟡' },
  toxicityRoles: {
    is: {
      '🩵': '🩵 Guia novatos nos jogos',
      '✅': '✅️ é Gentil (costuma não cobrar)',
      '🟡': '🟡 é Amigável (pode cobrar as vezes)',
      '🔶️': '🔶️ está Em avaliação após problemas',
      '❌️': '❌️ tem Histórico Tóxico',
    },
    playsWith: {
      '🩵': 'joga c/ quem Guia novatos nos jogos 🩵',
      '✅️': 'joga c/ Gentis (que não cobram) ✅️',
      '🟡': 'joga c/ Amigáveis (que cobram as vezes)🟡',
      '🔶️': 'joga c/ quem está Em avaliação após problemas 🔶️',
      '❌️': 'joga c/ quem tem Histórico Tóxico ❌️',
    }
  },
}
