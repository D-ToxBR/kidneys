import {GuildMember, type PartialGuildMember, VoiceState} from 'discord.js'
import discord from './api/discord.ts'
import {type Player} from './modules/rankProcessing/rankProcessing.ts'
import {createRankingModule} from "./modules/rankProcessing/rankProcessing.ts"
import {getOrThrow} from "./helpers/typeHelper/typeHelper.ts"
import rankTitles from "../cfg/rankTitles.ts";


const {buildRanking, taggedNicknameToPlayer, buildTeamsSuggestions} = createRankingModule(rankTitles)

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

discord.onLogin(() => {
    discord.onNicknameChange(updateRankings)
    discord.onVoiceChannelGetsFull(discord.channels().voice().mix().matchmakingPlayers())(suggestTeams)
})