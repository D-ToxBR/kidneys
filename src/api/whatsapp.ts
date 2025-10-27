import { Client, LocalAuth, type Chat, type Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import cfg from "../../cfg/whatsappCfg.ts";
import { getOrThrow } from "../helpers/typeHelper/typeHelper.ts";
import {mapStringLeafs, getStringLeafs} from "../helpers/generalMappers/generalMappers.ts"


const groups = () => ({
    dtox: mapStringLeafs(getGroupById)(cfg.groups.dtox),
})

const cache: {lastBotMsgByChat: Map<string, Message>} = {
  lastBotMsgByChat: new Map()
}

const whatsapp = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

whatsapp.on('qr', (qr) => {
    console.log('QR Code received. Scan it with WhatsApp:');
    qrcode.generate(qr, { small: true });
});

whatsapp.once('ready', () => {
    console.log(`WhatsApp client is ready!`);
});

whatsapp.on('authenticated', () => {
    console.log('WhatsApp authenticated successfully');
});

whatsapp.on('auth_failure', (msg) => {
    console.error('WhatsApp authentication failed:', msg);
});

whatsapp.once('ready', async () => {
    // list all whatsapp groups on console
    // remove the return line bellow, if you need to check this info
    return
    const chats = await whatsapp.getChats();
    chats.forEach(chat => {
        if (chat.isGroup) {
            console.log(`Group: ${chat.name} - ID: ${chat.id._serialized}`);
        }
    });
});

const onLogin = (listener: () => void) => 
    whatsapp.initialize().then(listener);

const getGroupById = async (groupId: string): Promise<Chat> => {
    const chats = await whatsapp.getChats();
    const group = chats.find(chat => chat.id._serialized === groupId && chat.isGroup);

    return getOrThrow(
        group,
        `Unable to find WhatsApp group with id <${groupId}>`
    );
};


const upsertMsg = (getGroup: () => Chat | Promise<Chat>) =>
    // edits last message
    // if can't edit, try deleting it and sends again.
    async (getTextLines: () => string[]) => {
        const group = await getGroup();
        const textLines = getTextLines();
        const msg = textLines.join('\n');
        
        if (!msg.length) {
            console.log(`Not upserting message to group <${group.name}> because it is empty.`);
            return;
        }

        const maybeLastBotMsg = cache.lastBotMsgByChat.get(group.id._serialized);

        if (maybeLastBotMsg === undefined || !maybeLastBotMsg)
          return await sendMsg(getGroup)(getTextLines);

        const lastBotMsg = maybeLastBotMsg as Message;

        try {
            console.log(`Attempting to edit last message in group <${group.name}>...`);
            const editResult = await lastBotMsg.edit(msg);
            
            if (editResult) {
                console.log(`Successfully edited message in group <${group.name}>`);
                return;
            } 
        } catch (editError) { console.error(`Edit error:`, editError) }
        console.log(`Could not edit message in group <${group.name}>. Attempting to delete...`);
        
        try {
            await lastBotMsg.delete(true);
            console.log(`Successfully deleted last message in group <${group.name}>`);
        } catch (deleteError) {
            console.log(`Could not delete message in group <${group.name}>. Will send new message anyway.`);
        }
        return await sendMsg(getGroup)(getTextLines);
    };


const sendMsg = (getGroup: () => Chat | Promise<Chat>) => 
    async (getTextLines: () => string[]) => {
        const group = await getGroup();
        const textLines = getTextLines();
        const msg = textLines.join('\n');
        
        if (!msg.length) {
            console.log(`Not sending message to group <${group.name}> because it is empty.`);
        } else {
            console.log(`Sending to Whatsapp group <${group.name}> the following message:\n${msg}`);
            const sentMessage = await group.sendMessage(msg);
            cache.lastBotMsgByChat.set(group.id._serialized, sentMessage);

        }
    };

export default {
    onLogin,
    getGroupById,
    upsertMsg,
    sendMsg,
    groups
};

