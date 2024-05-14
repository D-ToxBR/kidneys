import {Client, GatewayIntentBits, Guild, TextChannel} from "discord.js";

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
})

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
})


client.login(process.env.DISCORD_TOKEN)


export default {
    on: client.on.bind(client),

    getTextChannel(guild: Guild, channelName: string): TextChannel {
        const genericChannel = guild.channels.cache.find(
            (channel) => channel.name === channelName)

        if (!genericChannel)
            throw new Error(`unable to find discord channel '${channelName}'`)
        if (!genericChannel.isTextBased())
            throw new Error(`'${channelName}' is not a text channel.`)

        return genericChannel as TextChannel
    },

    async sendMessage(channel: TextChannel, textLines: string[]){
        const msg = textLines.join('\n')
        console.log(`sending to channel <${channel.name}> the following message:\n${msg}`)
        await channel.send(msg)
    },

}

