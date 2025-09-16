import type {ToxicityCfg, AssignedToxicity} from "../src/modules/rankProcessing/rankProcessing";

export type ToxicityLevel = '🩵' | '✅' | '🟡' | '🔶' | '❌';

export const toxicityCfg: ToxicityCfg = {
  possibleToxicityLevels: '🩵✅🟡🔶❌',
  defaultAssignedToxicity: {is: '🟡', playsWith:  '🟡' },
  toxicityRoles: {
    is: {
      '🩵': '1417253017463427242',
      '✅': '1403603367170801685',
      '🟡': '1403609530008473682',
      '🔶': '1403610832851570799',
      '❌': '1403611883755274271',
    },
    playsWith: {
      '🩵': '1417253275748663306',
      '✅': '1403604906815783004',
      '🟡': '1403612329584889957',
      '🔶': '1403613137273622578',
      '❌': '1403613426500239462',
    }
  },
}
