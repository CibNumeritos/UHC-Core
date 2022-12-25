import { world } from '@minecraft/server';
import { uhc } from './core/src/classes/UHC';
import { parseCommand } from './core/src/functions/commandParser';
const prefix = "!";
world.events.beforeChat.subscribe((beforeChatEvent) => {
    beforeChatEvent.targets = [];
    beforeChatEvent.sendToTargets = true;
});
world.events.chat.subscribe((chatEvent) => {
    if (!chatEvent.message.startsWith(prefix)) {
        return;
    };
    const commandData = parseCommand(chatEvent.message, prefix);
    switch (commandData[0]) {
        case "start":
            uhc.start()
            break;
    
        default:
            break;
    }
});