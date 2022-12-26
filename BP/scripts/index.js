import { Player, world, system } from '@minecraft/server';
import { uhc } from './core/src/classes/UHC';
import { parseCommand } from './core/src/functions/commandParser';
import { delay } from './core/src/functions/delay';
import { onPlayerDeath } from './core/src/functions/onPlayerDeath';
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
        case "start": {
            uhc.start()
        } break;
        case "uhcconfig": {
            switch (commandData[1]) {
                case "duration": {
                    if (!commandData[2]) return chatEvent.sender.tell(`Especifica una duracion para la partida.`);
                    uhc.setDuration(commandData[2])
                } break;
            };
        } break;

        default:
            break;
    };
});
world.events.entityHurt.subscribe(({ hurtEntity, damagingEntity }) => {
    if (!uhc.started) return;
    if (hurtEntity.getComponent('health').current > 0) return;
    // hurtEntity.runCommandAsync('scoreboard players add @s deaths 1');
    if (!(damagingEntity.typeId == 'minecraft:player')) return;
    damagingEntity.runCommandAsync('scoreboard players add @s UHCKills 1');
}, { entityTypes: ['minecraft:player'] });
world.events.entityHurt.subscribe((entityHurt) => {
    if (entityHurt.hurtEntity.typeId != 'minecraft:player') {
        return;
    };
    const player = entityHurt.hurtEntity;
    if (!player.hasTag('CantBeIronMan') && !player.hasTag('IronMan')) {
        world.say(`§c${player.name} ya no puede ser ironman!`);
        player.addTag('CantBeIronMan');
    };
});
system.runSchedule(() => {
    if (!uhc.started) return;
    const ironMans = Array.from(world.getPlayers()).filter((plr => !plr.hasTag('CantBeIronMan')));
    if (ironMans.length == 1) {
        const player = ironMans[0]
        if (player.hasTag('IronMan')) return;
        world.say(`§a${player.name} es el ironman de la partida.`);
        player.addTag('IronMan');
    };
}, 1);
onPlayerDeath((arg) => {
    const player = arg.player;
    player.runCommandAsync(`setblock ~ ~-1 ~ bedrock`)
    player.runCommandAsync(`setblock ~ ~ ~ nether_brick_fence`)
    player.runCommandAsync(`setblock ~ ~1 ~ skull 1`)
    player.addTag('spec')
    for (const plr of world.getPlayers()) {
        plr.playSound('item.trident.thunder')
    }
    const id = system.runSchedule(async () => {
        if (player.getComponent('health').current > 0) {
            player.playSound('item.trident.thunder')
            player.runCommandAsync(`gamerule sendcommandfeedback false`)
            player.runCommandAsync(`gamemode spectator @s`)
            player.runCommandAsync(`gamerule sendcommandfeedback true`)
            player.runCommandAsync(`effect @s blindness 5 1 true`)
            player.runCommandAsync(`playsound conduit.deactivate @s`)
            player.runCommandAsync(`title @s title L saccy`)
            system.clearRunSchedule(id)
            await delay(60)
            world.say(`§4§lUHC §8> §r§c${player.name} ha sido eliminad@!`);
            for (const plr of world.getPlayers()) {
                plr.playSound('random.orb', {pitch:0.4,volume:1})
            }
        }
    }, 1)
});