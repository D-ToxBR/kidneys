import {GuildMember, type PartialGuildMember, VoiceState} from 'discord.js'
import discord from './api/discord.ts'
import {type Player} from './modules/rankProcessing/rankProcessing.ts'
import {createRankingModule} from "./modules/rankProcessing/rankProcessing.ts"
import {getOrThrow} from "./helpers/typeHelper/typeHelper.ts"
import rankTitles from "../cfg/rankTitles.ts";
import { toxicityCfg, type ToxicityLevel } from "../cfg/toxicityLevels.ts";



const {buildRanking, taggedNicknameToPlayer, buildTeamsSuggestions, extractAssignedToxicity } = createRankingModule(rankTitles, toxicityCfg)

export async function setDefaultRankAndToxicityOnNickname(member: GuildMember) {
    const {is, playsWith} = toxicityCfg.defaultAssignedToxicity
    const defaultRank = "[?]"

    const originalNick = member.displayName
    const newNick = `${defaultRank} ${originalNick} ${is}${playsWith}`
    await discord.changeNickname(member, newNick)
}

export async function setToxicityRolesFromNickname(memberOld: GuildMember | PartialGuildMember, memberNew: GuildMember) {
    if (memberOld.displayName === memberNew.displayName) {
        return;
    }

    const newNickname = memberNew.displayName;
    console.log(`Nickname for ${memberNew.user.tag} changed to "${newNickname}". Processing toxicity roles.`);

    const assignedToxicity = extractAssignedToxicity(newNickname);

    console.log(`Cleaning up all existing toxicity roles for ${memberNew.user.tag}...`);
    const roleRemovalPromises: Promise<void>[] = [];
    for (const level of toxicityCfg.possibleToxicityLevels) {
        const typedLevel = level as ToxicityLevel;
        const isRoleIdToRemove = toxicityCfg.toxicityRoles.is[typedLevel];
        const playsWithRoleIdToRemove = toxicityCfg.toxicityRoles.playsWith[typedLevel];

        roleRemovalPromises.push(discord.removeRoleById(memberNew, isRoleIdToRemove));
        roleRemovalPromises.push(discord.removeRoleById(memberNew, playsWithRoleIdToRemove));
    }
    await Promise.all(roleRemovalPromises);
    console.log(`Cleanup complete. Now assigning new roles based on extracted toxicity.`);

    const isRoleIdToGive = toxicityCfg.toxicityRoles.is[assignedToxicity.is];
    const playsWithRoleIdToGive = toxicityCfg.toxicityRoles.playsWith[assignedToxicity.playsWith];

    console.log(`Assigning new roles by ID: [is: "${isRoleIdToGive}", playsWith: "${playsWithRoleIdToGive}"]`);
    const roleAssignmentPromises: Promise<void>[] = [
        discord.giveRoleById(memberNew, isRoleIdToGive),
        discord.giveRoleById(memberNew, playsWithRoleIdToGive)
    ];
    await Promise.all(roleAssignmentPromises);

    console.log(`Successfully updated toxicity roles for ${memberNew.user.tag}.`);
}


export async function updateRankings(memberOld: GuildMember | PartialGuildMember, memberNew: GuildMember) {
    const channel = discord.channels().text().rankings().cs2
    const members = await memberNew.guild.members.fetch()
    const nicknames = members.map((m) => m.displayName)
    const ranking = () => buildRanking(nicknames)
    discord.sendMessage(channel)(ranking)
}

export function suggestTeams(oldState: VoiceState, newState: VoiceState) {
    const voiceChannel = getOrThrow(newState.channel, "the new voice state is not related to a channel")
    if (voiceChannel.userLimit !== 10)
        throw `expected to have 2 teams of 5 players. So the user limit should be 10, but is <${newState.channel?.userLimit}> instead`

    const teamSuggestionChannel = discord.channels().text().mix().matchmakingTeams

    const nicknames  = (): string[] => voiceChannel.members.map((m: GuildMember) => m.displayName)
    const players = () => nicknames().map(taggedNicknameToPlayer)
    const dontHaveRank = (player: Player) => player.rank === undefined

    const msg = (): string[] => players().some(dontHaveRank)
        ? [`Impossível sugerir a divisão de times do mix, pois alguns jogadores possuem patente.`]
        : buildTeamsSuggestions(players)

    discord.sendMessage(teamSuggestionChannel)(msg)
}

discord.onLogin(async () => {
    discord.onMemberJoin(setDefaultRankAndToxicityOnNickname)
    discord.onNicknameChange(setToxicityRolesFromNickname)
    discord.onNicknameChange(updateRankings)
    discord.onVoiceChannelGetsFull(await discord.channels().voice().mix().matchmakingPlayers())(suggestTeams)
})
