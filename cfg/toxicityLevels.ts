import type {ToxicityCfg, AssignedToxicity} from "../src/modules/rankProcessing/rankProcessing";

export type ToxicityLevel = '🩵' | '✅' | '🟡' | '🔶' | '❌';

export const toxicityCfg: ToxicityCfg = {
  possibleToxicityLevels: '🩵✅🟡🔶❌',
  defaultAssignedToxicity: {is: '🟡', playsWith:  '🟡' }
}
