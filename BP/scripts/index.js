import { world } from '@minecraft/server';
import { parseCommand } from './functions/commandParser';
const prefix = "!";
world.events.beforeChat.subscribe((beforeChatEvent) => {
    chatEvent.targets = [];
    chatEvent.sendToTargets = true;
});
world.events.chat.subscribe((chatEvent) => {
    if (!chatEvent.message.startsWith(prefix)) {
        return;
    };
    const commandData = parseCommand()
});