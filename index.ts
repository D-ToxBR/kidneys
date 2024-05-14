import {
    type Collection,
    Guild,
    type GuildMember,
    type Snowflake,
    TextChannel
} from 'discord.js'
import RankTitles from "./cfg/rankTitles.ts"
import discord from "./api/discord.ts";
import discordCfg from "./cfg/discordCfg.ts";
// import * as dotenv from 'dotenv'
// dotenv.config()
//

discord.on('guildMemberUpdate', async (memberOld, memberNew) => {
    console.log("a member was updated")
    if (memberOld.displayName !== memberNew.displayName) {
        console.log(`nickname '${memberOld.displayName}' changed to '${memberNew.displayName}'...`)
        await updateRankings(memberNew.guild)
    }
})

async function updateRankings(guild: Guild) {
    console.log('updating rankings...')
    const members: Collection<Snowflake, GuildMember> = await guild.members.fetch()


    const rankedMembers = members
        .map(member => member.displayName)
        .map(extractRank)
        .filter(member => member.rank != null && member.rank in RankTitles)



    const channel = discord.getTextChannel(guild, discordCfg.channels.rankings.cs2)
    // clearChannelMessages(channel)

    const textLines = Object.keys(RankTitles)
        .map(key => parseInt(key))
        .sort(sort.numbers.descending)
        .flatMap(rank => getTextLinesForRank(rankedMembers, rank))

   // Send the compiled message
    await discord.sendMessage(channel, textLines)
}

function extractRank(nickname: string): RankedMember{
    const match = nickname.match(/\[(\d+)\??\]/)
    const rank = match ? parseInt(match[1]) : undefined;

    return {rank, nickname}
}

function getTextLinesForRank(allRankedPlayers: RankedMember[], rank: number): string[]{
    if (!(rank in RankTitles)) {
        throw new Error(`Invalid rank ${rank}`);
    }

    const nicknames = allRankedPlayers
        .filter(member => member.rank === rank)
        .map(member => member.nickname)
        .sort(sort.strings.ascending)


    return [
        '',
        `--[ **${RankTitles[rank]}** ]--`,
        ...nicknames,
        ]
}


const sort = {
    strings: {
        ascending: (a: string, b: string) => a.localeCompare(b),
    },

    numbers: {
        descending: (a: number, b: number) => b - a,
    }
}


type RankedMember = {
    rank?: number;
    nickname: string;
};
