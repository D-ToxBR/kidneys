import {
    Client,
    GatewayIntentBits,
    GuildChannel,
    GuildMember,
    type PartialGuildMember,
    TextChannel, VoiceChannel, type VoiceState,
    Role
} from "discord.js"
import cfg from "../../cfg/discordCfg.ts"
import {getOrThrow} from "../helpers/typeHelper/typeHelper.ts"
import {mapStringLeafs} from "../helpers/generalMappers/generalMappers.ts"

const discord = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates]
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


const getRoleByName = async (roleName: string): Promise<Role | undefined> => {
    const activeGuild = guild();

    console.log(`Searching for role '${roleName}' in cache...`);
    const roleFromCache = activeGuild.roles.cache.find(role => role.name === roleName);

    if (roleFromCache) {
        console.log(`Found role '${roleName}' in cache.`);
        return roleFromCache;
    }

    try {
        console.log(`Role '${roleName}' not in cache, fetching all roles from Discord API...`);
        const allRolesFromApi = await activeGuild.roles.fetch();
        const roleFromApi = allRolesFromApi.find(role => role.name === roleName);

        if (roleFromApi) {
            console.log(`Found role '${roleName}' after fetching from API.`);
            return roleFromApi;
        }

        console.error(`Unable to find role '${roleName}' after searching cache and fetching from API.`);
        return undefined;

    } catch (error) {
        console.error(`An API error occurred while fetching roles to find '${roleName}':`, error);
        return undefined;
    }
};

const giveRole = async (member: GuildMember, roleName: string): Promise<void> => {
    const roleToGive = await getRoleByName(roleName);

    if (!roleToGive) {
        // The error is already logged by getRoleByName, so we can simply exit.
        return;
    }

    try {
        await member.roles.add(roleToGive);
        console.log(`Successfully gave role "${roleToGive.name}" to ${member.user.tag}.`);
    } catch (error) {
        console.error(`Error giving role "${roleToGive.name}" to ${member.user.tag}:`, error);
    }
};

const removeRole = async (member: GuildMember, roleName: string): Promise<void> => {
    const roleToRemove = await getRoleByName(roleName);

    if (!roleToRemove) {
        // The error is already logged by getRoleByName, so we can simply exit.
        return;
    }

    try {
        await member.roles.remove(roleToRemove);
        console.log(`Successfully removed role "${roleToRemove.name}" from ${member.user.tag}.`);
    } catch (error) {
        console.error(`Error removing role "${roleToRemove.name}" from ${member.user.tag}:`, error);
    }
};


const changeNickname = async (member: GuildMember, newNickname: string): Promise<void> => {
    try {
        await member.setNickname(newNickname);
        console.log(`Successfully changed nickname for ${member.user.tag} to "${newNickname}".`);
    } catch (error) {
        console.error(`Error changing nickname for ${member.user.tag}:`, error);
    }
};

const onMemberJoin = (listener: MemberJoinListener) => {
    on('guildMemberAdd', withLogMsg("A new member joined the server")(listener))
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
    discord.on('voiceStateUpdate',
        withLogMsg("Someone joined or left a voice room")(listener))
}

const onGuildMemberUpdate = (listener: MemberUpdateListener) => {
    on('guildMemberUpdate',
        withLogMsg("A member was updated")(listener))
}


const sendMessage = (getChannel: () => TextChannel|Promise<TextChannel>) =>
    async (getTextLines: () => string[]) => {
        const channel = await getChannel()
        const textLines = getTextLines()
        const msg = textLines.join('\n')
        console.log(`Sending to channel <${channel.name}> the following message:\n${msg}`)
        channel.send(msg)
    }

const withLogMsg = (logMsg: string) => (listener: DiscordListener) =>
    (...args: any[]) => {
        console.log(logMsg)
        // @ts-ignore
        listener(...args)
    }


export type MemberJoinListener = (member: GuildMember) => void
export type MemberUpdateListener = (memberOld: GuildMember | PartialGuildMember, memberNew: GuildMember) => void
export type VoiceUpdateListener =  (oldState: VoiceState, newState: VoiceState) => void
export type DiscordListener = MemberUpdateListener | VoiceUpdateListener | MemberJoinListener


export default {
    guild,
    channels,
    getChannelByName,
    getTextChannelByName,
    getVoiceChannelByName,
    getRoleByName,
    giveRole,
    removeRole,
    changeNickname,
    onMemberJoin,
    onLogin,
    onNicknameChange,
    onVoiceChannelGetsFull,
    onVoiceStateUpdate,
    onGuildMemberUpdate,
    sendMessage,
    on
}
