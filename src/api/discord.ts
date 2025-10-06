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

const getAllRoles = async (): Promise<Role[]> => {
    const activeGuild = guild();
    
    console.log('Fetching all roles...');
    
    const rolesFromCache = Array.from(activeGuild.roles.cache.values());
    if (rolesFromCache.length > 0) {
        console.log(`Found ${rolesFromCache.length} roles in cache.`);
        return rolesFromCache as Role[];
    }
    
    // If cache is empty, fetch from API
    try {
        console.log('Cache empty, fetching roles from Discord API...');
        const rolesCollection = await activeGuild.roles.fetch();
        const rolesArray = Array.from(rolesCollection.values());
        console.log(`Fetched ${rolesArray.length} roles from API.`);
        return rolesArray as Role[];
    } catch (error) {
        console.error('Failed to fetch roles:', error);
        return [];
    }
};

const getMembersWithRoleId = async (roleId: string): Promise<GuildMember[]> => {
    const role = await getRoleById(roleId);
    
    if (!role) {
        console.warn(`Cannot get members: role with ID '${roleId}' not found.`);
        return [];
    }
    
    console.log(`Getting members with role '${role.name}'...`);
    const members  = Array.from(role.members.values());
    console.log(`Found ${members.length} members with role '${role.name}'.`);
    
    return members;
};


const getRoleById = async (roleId: string): Promise<Role | undefined> => {
    const activeGuild = guild();

    console.log(`Searching for role with ID '${roleId}' in cache...`);
    const roleFromCache = activeGuild.roles.cache.get(roleId);
    if (roleFromCache) {
        console.log(`Found role '${roleFromCache.name}' in cache.`);
        return roleFromCache;
    }

    try {
        console.log(`Role ID '${roleId}' not in cache, fetching from Discord API...`);
        const roleFromApi = await activeGuild.roles.fetch(roleId);
        if (roleFromApi) {
            console.log(`Found role '${roleFromApi.name}' after fetching from API.`);
            return roleFromApi;
        }
        // This part is unlikely to be reached if fetch succeeds, but is good for safety
        return undefined;
    } catch (error) {
        console.error(`Failed to fetch role with ID '${roleId}':`, error);
        return undefined;
    }
};

const giveRoleById = async (member: GuildMember, roleId: string): Promise<void> => {
    const roleToGive = await getRoleById(roleId);

    if (!roleToGive) {
        // The error is already logged by getRoleById.
        return;
    }

    try {
        await member.roles.add(roleToGive);
        console.log(`Successfully gave role "${roleToGive.name}" to ${member.user.tag}.`);
    } catch (error) {
        console.error(`Error giving role "${roleToGive.name}" (ID: ${roleId}) to ${member.user.tag}:`, error);
    }
};

const removeRoleById = async (member: GuildMember, roleId: string): Promise<void> => {
    const roleToRemove = await getRoleById(roleId);

    if (!roleToRemove) {
        // The error is already logged by getRoleById.
        return;
    }

    try {
        await member.roles.remove(roleToRemove);
        console.log(`Successfully removed role "${roleToRemove.name}" from ${member.user.tag}.`);
    } catch (error) {
        console.error(`Error removing role "${roleToRemove.name}" (ID: ${roleId}) from ${member.user.tag}:`, error);
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

const onRoleChange = (listener: MemberUpdateListener) => {
    onGuildMemberUpdate((memberOld, memberNew) => {
        const oldRoles = memberOld.roles.cache;
        const newRoles = memberNew.roles.cache;
        
        // Check if roles changed
        if (oldRoles.size === newRoles.size && 
            oldRoles.every(role => newRoles.has(role.id))) {
            console.log(`Roles for ${memberNew.user.tag} did not change`);
            return;
        }
        
        // Find added roles
        const addedRoles = newRoles.filter(role => !oldRoles.has(role.id));
        if (addedRoles.size > 0) {
            const roleNames = addedRoles.map(r => r.name).join(', ');
            console.log(`Roles added to ${memberNew.user.tag}: ${roleNames}`);
        }
        
        // Find removed roles
        const removedRoles = oldRoles.filter(role => !newRoles.has(role.id));
        if (removedRoles.size > 0) {
            const roleNames = removedRoles.map(r => r.name).join(', ');
            console.log(`Roles removed from ${memberNew.user.tag}: ${roleNames}`);
        }
        
        listener(memberOld, memberNew);
    });
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
        if (!msg.length){
          console.log(`Not Sending message to channel <${channel.name}> because it is empty.`)
        } else {
          console.log(`Sending to channel <${channel.name}> the following message:\n${msg}`)
          channel.send(msg)
        }
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
    getAllRoles,
    getMembersWithRoleId,
    getRoleById,
    giveRoleById,
    removeRoleById,
    changeNickname,
    onRoleChange,
    onMemberJoin,
    onLogin,
    onNicknameChange,
    onVoiceChannelGetsFull,
    onVoiceStateUpdate,
    onGuildMemberUpdate,
    sendMessage,
    on
}
