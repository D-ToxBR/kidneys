import {
    Client,
    GatewayIntentBits,
    GuildChannel,
    GuildMember,
    type PartialGuildMember,
    TextChannel, VoiceChannel, type VoiceState
} from "discord.js"
import cfg from "../../cfg/discordCfg.ts"
import {getOrThrow} from "../helpers/typeHelper/typeHelper.ts"
import {mapStringLeafs} from "../helpers/generalMappers/generalMappers.ts"

const discord = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
})

discord.once('ready', () => {
    console.log(`Logged in as ${discord.user?.tag || '<unable to retrieve user>'}!`)
})

const on = discord.on.bind(discord)
const onLogin = (listener: () => void) => discord.login(cfg.token()).then(listener)

const guild = () => getOrThrow(
    discord.guilds.cache.get(cfg.guildId()),
    `Unable the get discord guild with id <${cfg.guildId}>`
)

const channels = () => ({
        text: mapStringLeafs(getTextChannelByName)(cfg.channels.text),
        voice: mapStringLeafs(getVoiceChannelByName)(cfg.channels.voice),
})



const getChannelByName = async (channelName: string): Promise<GuildChannel> => {

    const channelSources: Array<() => Promise<GuildChannel[]>> = [
        () => guild().channels.cache,
        guild().channels.fetch.bind(guild().channels)
    ]

    for (const channelSource of channelSources) {
        const channels = await channelSource();
        const genericChannel = channels.find(
            (channel) => channel.name === channelName
        );
        if (genericChannel) {
            return genericChannel;
        }
    }
    throw new Error(`Unable to find discord channel '${channelName}`)
}



const getTextChannelByName = async (channelName: string): Promise<TextChannel> => {
    const genericChannel = await getChannelByName(channelName)

    if (!genericChannel.isTextBased())
        throw new Error(`'${channelName}' is not a text channel.`)

    return genericChannel as TextChannel
}

const getVoiceChannelByName = async (channelName: string): Promise<VoiceChannel> => {
    const genericChannel = await getChannelByName(channelName)

    if (!genericChannel.isTextBased())
        throw new Error(`'${channelName}' is not a text channel.`)

    return genericChannel as VoiceChannel
}

const onNicknameChange = (listener: MemberUpdateListener) => {
    onGuildMemberUpdate(
        (memberOld, memberNew) => {
            if (memberOld.displayName === memberNew.displayName) {
                console.log(`Nickname ${memberOld.displayName} did not change`)
                return
            }

            console.log(`Nickname '${memberOld.displayName}' changed to '${memberNew.displayName}'...`)
            listener(memberOld, memberNew)
        }
    )
}

const onVoiceChannelGetsFull = (voiceChannel: VoiceChannel) => (listener: VoiceUpdateListener) => {
    onVoiceStateUpdate((oldVoiceState, newVoiceState) => {
        const channel = newVoiceState.channel
        if (voiceChannel !== channel) return
        if (channel.members.size < channel.userLimit) return

        console.log(`The voice channel <${channel.name}> got full`)
        listener(oldVoiceState, newVoiceState)
    })
}

const onVoiceStateUpdate = (listener: VoiceUpdateListener) => {
    console.log("Someone joined or left a voice room")
    discord.on('voiceStateUpdate', listener)
}

const onGuildMemberUpdate = (listener: MemberUpdateListener) => {
    console.log("A member was updated")
    on('guildMemberUpdate', listener)
}


const sendMessage = (getChannel: () => TextChannel|Promise<TextChannel>) =>
    async (getTextLines: () => string[]) => {
        const channel = await getChannel()
        const textLines = getTextLines()
        const msg = textLines.join('\n')
        console.log(`Sending to channel <${channel.name}> the following message:\n${msg}`)
        channel.send(msg)
    }


export type MemberUpdateListener = (memberOld: GuildMember | PartialGuildMember, memberNew: GuildMember) => void
export type VoiceUpdateListener =  (oldState: VoiceState, newState: VoiceState) => void
export type HasName = {name: string}


export default {
    guild,
    channels,
    getChannelByName,
    getTextChannelByName,
    getVoiceChannelByName,
    onLogin,
    onNicknameChange,
    onVoiceChannelGetsFull,
    onVoiceStateUpdate,
    onGuildMemberUpdate,
    sendMessage,
}
