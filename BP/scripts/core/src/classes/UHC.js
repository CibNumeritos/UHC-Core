import { world, system } from '@minecraft/server';
import { parseSeconds } from '../functions/parseSeconds'
export const statusCodes = {
    "-1": 'uhc.statuscode.time_finished',
    "-2": 'uhc.statuscode.time_not_set'
};
export const displayConfig = {
    "currentTime": 6,
    "remainingTime": 3,
    "space1": 2,
    "space2": 5,
    "space3": 8,
    "space4": 11,
};
class UHC {
    constructor() {
        this.handleUndef();
        this.handleTime();
        this.finished = world.scoreboard.getObjective('UHCConfig').getScore(world.scoreboard.getObjective('UHCConfig').getParticipants().find((identity) => identity.displayName == 'finished')) == 1 ? true : false;
        this.started = world.scoreboard.getObjective('UHCConfig').getScore(world.scoreboard.getObjective('UHCConfig').getParticipants().find((identity) => identity.displayName == 'started')) == 1 ? true : false;

        if (!this.finished && this.started) {
            world.say(`§bReiniciando el plugin de UHC...`);
        };

        this.remainingTime = parseSeconds(this.seconds <= 0 ? 0 : this.seconds);
        this.currentTime = parseSeconds(this.seconds <= 0 ? this.gameDuration : (this.gameDuration - this.seconds));
        this.alivePlayers = Array.from(world.getPlayers({ excludeTags: ["spec"], gameMode: ["survival"] })).filter(player => { return player.getComponent('minecraft:health').current > 0 }).map(p => { return p.name })
        this.players = Array.from(world.getPlayers({ excludeTags: ["spec"], gameMode: ["survival"] }));

        this.gameDuration = world.scoreboard.getObjective('UHCConfig').getScore(world.scoreboard.getObjective('UHCConfig').getParticipants().find((identity) => identity.displayName == 'duration')) ?? -2;
        this.seconds = world.scoreboard.getObjective('UHCConfig').getScore(world.scoreboard.getObjective('UHCConfig').getParticipants().find((identity) => identity.displayName == 'seconds')) ?? -2;
        // world.getDimension('overworld').runCommandAsync(`scoreboard players set started UHCConfig 0`);
    };
    start() {
        if (this.seconds <= 0 && this.finished) {
            return;
        }
        if (this.seconds <= 0 && !this.finished) {
            this.setTime(this.gameDuration)
            // world.getDimension('overworld').runCommandAsync(`scoreboard players set started UHCConfig 1`);
        };
        world.getDimension('overworld').runCommandAsync(`scoreboard players set started UHCConfig 1`);
    }
    stop() {
        world.getDimension('overworld').runCommandAsync(`scoreboard players set started UHCConfig 0`);
    }
    pause() {
        world.getDimension('overworld').runCommandAsync(`scoreboard players set started UHCConfig -1`);
    }
    handleUndef() {
        system.runSchedule(() => {
            if (!world.scoreboard.getObjective('UHCConfig')) world.scoreboard.addObjective('UHCConfig', 'UHCConfig');
            if (!world.scoreboard.getObjective('UHCDisplay')) world.scoreboard.addObjective('UHCDisplay', '====UHC====');
            if (!world.scoreboard.getObjective('UHCStats')) world.scoreboard.addObjective('UHCStats', 'UHCStats');
            if (!world.scoreboard.getObjective('UHCKills')) world.scoreboard.addObjective('UHCKills', 'UHCKills');
            try {
                world.scoreboard.getObjective('UHCConfig').getScore(world.scoreboard.getObjective('UHCConfig').getParticipants().find((identity) => identity.displayName == 'seconds')) == 1 ? true : false;
            } catch (error) {
                world.getDimension('overworld').runCommandAsync(`scoreboard players set seconds UHCConfig 5400`);
            };
            try {
                world.scoreboard.getObjective('UHCConfig').getScore(world.scoreboard.getObjective('UHCConfig').getParticipants().find((identity) => identity.displayName == 'started')) == 1 ? true : false;
            } catch (error) {
                world.getDimension('overworld').runCommandAsync(`scoreboard players set started UHCConfig 0`);
            };
            try {
                world.scoreboard.getObjective('UHCConfig').getScore(world.scoreboard.getObjective('UHCConfig').getParticipants().find((identity) => identity.displayName == 'finished')) == 1 ? true : false;
            } catch (error) {
                world.getDimension('overworld').runCommandAsync(`scoreboard players set finished UHCConfig 0`);
            };
            try {
                world.scoreboard.getObjective('UHCConfig').getScore(world.scoreboard.getObjective('UHCConfig').getParticipants().find((identity) => identity.displayName == 'duration')) == 1 ? true : false;
            } catch (error) {
                world.getDimension('overworld').runCommandAsync(`scoreboard players set duration UHCConfig 5400`);
            };

        }, 1);
    };
    handleTime() {
        const loop = system.runSchedule(() => {

            // console.warn(this.started, this.seconds)

            this.finished = world.scoreboard.getObjective('UHCConfig').getScore(world.scoreboard.getObjective('UHCConfig').getParticipants().find((identity) => identity.displayName == 'finished')) == 1 ? true : false;
            this.started = world.scoreboard.getObjective('UHCConfig').getScore(world.scoreboard.getObjective('UHCConfig').getParticipants().find((identity) => identity.displayName == 'started')) == 1 ? true : false;

            if (!this.started) {
                return;
            };

            this.remainingTime = parseSeconds(this.seconds <= 0 ? 0 : this.seconds);
            this.currentTime = parseSeconds(this.seconds <= 0 ? this.gameDuration : (this.gameDuration - this.seconds));
            this.alivePlayers = Array.from(world.getPlayers({ excludeTags: ["spec"], gameMode: ["survival"] })).filter(player => { return player.getComponent('minecraft:health').current > 0 }).map(p => { return p.name })
            this.players = Array.from(world.getPlayers({ excludeTags: ["spec"], gameMode: ["survival"] }));

            if (this.alivePlayers.length == 1) {
                const winner = Array.from(world.getPlayers()).find(p => p.name == this.alivePlayers);
                for (const player of world.getPlayers()) {
                    player.onScreenDisplay.setTitle(`¡${winner.name} ha ganado!`)
                    player.onScreenDisplay.updateSubtitle('¡Mejor suerte la proxima, gracias por jugar!')
                    this.stop()
                };
            };

            for (const player of world.getPlayers()) {
                try {
                    world.scoreboard.getObjective('UHCKills').getScore(player?.scoreboard)
                } catch (error) {
                    player.runCommandAsync(`scoreboard players set @s UHCKills 0`)
                }
                player.runCommandAsync(`title @s actionbar §l§6 UltraHardCore§r\n\n§a Tiempo Acumulado:§r \n ${this.currentTime}\n\n §bTiempo restante: §r\n ${this.remainingTime}\n\n §cAsesinatos: §r${world.scoreboard.getObjective('UHCKills').getScore(player?.scoreboard) ?? 0}\n\n §dJugadores: \n §r${typeof this.alivePlayers == "string" ? 1 : this.alivePlayers?.length ?? 0} / ${typeof this.players == "string" ? 1 : this.players?.length ?? 0}\n\n§eby @CibNumeritos`);
            };

            this.gameDuration = world.scoreboard.getObjective('UHCConfig').getScore(world.scoreboard.getObjective('UHCConfig').getParticipants().find((identity) => identity.displayName == 'duration')) ?? -2;
            this.seconds = world.scoreboard.getObjective('UHCConfig').getScore(world.scoreboard.getObjective('UHCConfig').getParticipants().find((identity) => identity.displayName == 'seconds')) ?? -2;

            if (this.seconds <= 0) {
                return;
            };

            this.removeTime(1);

            // world.getDimension('overworld').runCommandAsync(`scoreboard players set "${this.remainingTime}" UHCDisplay ${displayConfig['currentTime'] - 1}`);
            // world.getDimension('overworld').runCommandAsync(`scoreboard players reset "${parseSeconds(this.gameDuration (this.seconds - 1))}" UHCDisplay`);
            // world.getDimension('overworld').runCommandAsync(`scoreboard players set "${this.currentTime}" UHCDisplay ${displayConfig['remainingTime'] - 1}`);

        }, 20);
    };
    seconds = 0;
    currentTime = "00:00:00";
    remainingTime = "00:00:00";
    gameDuration = 0;
    started = false;
    finished = false;
    alivePlayers;
    setDuration(seconds) {
        world.getDimension('overworld').runCommandAsync(`scoreboard players set duration UHCConfig ${seconds}`);
    };
    addTime(seconds) {
        world.getDimension('overworld').runCommandAsync(`scoreboard players add seconds UHCConfig ${seconds}`);
    };
    setTime(seconds) {
        world.getDimension('overworld').runCommandAsync(`scoreboard players set seconds UHCConfig ${seconds}`);
    };
    removeTime(seconds) {
        world.getDimension('overworld').runCommandAsync(`scoreboard players remove seconds UHCConfig ${seconds}`);
    };
};

export const uhc = new UHC();