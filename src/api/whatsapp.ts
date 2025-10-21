import { Client, LocalAuth, type Chat } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import cfg from "../../cfg/whatsappCfg.ts";
import { getOrThrow } from "../helpers/typeHelper/typeHelper.ts";
import {mapStringLeafs, getStringLeafs} from "../helpers/generalMappers/generalMappers.ts"


const groups = () => ({
    dtox: mapStringLeafs(getGroupById)(cfg.groups.dtox),
})


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

const sendMessage = (getGroup: () => Chat | Promise<Chat>) => 
    async (getTextLines: () => string[]) => {
        const group = await getGroup();
        const textLines = getTextLines();
        const msg = textLines.join('\n');
        
        if (!msg.length) {
            console.log(`Not sending message to group <${group.name}> because it is empty.`);
        } else {
            console.log(`Sending to Whatsapp group <${group.name}> the following message:\n${msg}`);
            await group.sendMessage(msg);
        }
    };

export default {
    onLogin,
    getGroupById,
    sendMessage,
    groups
};

