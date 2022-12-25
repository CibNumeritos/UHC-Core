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
        world.getDimension('overworld').runCommandAsync(`scoreboard players set started UHCConfig 0`);
    };
    start() {
        world.getDimension('overworld').runCommandAsync(`scoreboard players set started UHCConfig 1`);
    }
    stop() {
        world.getDimension('overworld').runCommandAsync(`scoreboard players set started UHCConfig 0`);
    }
    pause() {
        world.getDimension('overworld').runCommandAsync(`scoreboard players set started UHCConfig -1`);
    }
    handleUndef() {
        if (!world.scoreboard.getObjective('UHCConfig')) world.scoreboard.addObjective('UHCConfig', 'UHCConfig');
        if (!world.scoreboard.getObjective('UHCDisplay')) world.scoreboard.addObjective('UHCDisplay', '====UHC====');
    };
    handleTime() {
        const loop = system.runSchedule(() => {

            console.warn(this.started, this.seconds)

            this.started = world.scoreboard.getObjective('UHCConfig').getScore(world.scoreboard.getObjective('UHCConfig').getParticipants().find((identity) => identity.displayName == 'started')) == 1 ? true : false;

            if (!this.started) {
                return;
            };

            this.alivePlayers = Array.from(world.getPlayers()).map(player => { return player.getComponent('minecraft:health').current > 0 ? player.name : undefined }).filter(alive => { return alive != undefined });
            this.seconds = world.scoreboard.getObjective('UHCConfig').getScore(world.scoreboard.getObjective('UHCConfig').getParticipants().find((identity) => identity.displayName == 'seconds')) ?? -2;

            if (this.seconds <= 0) {
                return;
            };

            this.removeTime(1);
            this.currentTime = parseSeconds(this.seconds);
            this.remainingTime = parseSeconds(this.gameDuration - this.currentTime);

            world.getDimension('overworld').runCommandAsync(`scoreboard players reset "${parseSeconds(this.seconds - 1)}" UHCDisplay`);
            world.getDimension('overworld').runCommandAsync(`scoreboard players set "${this.currentTime}" UHCDisplay ${displayConfig['currentTime'] - 1}`);
            world.getDimension('overworld').runCommandAsync(`scoreboard players reset "${parseSeconds(this.gameDuration (this.seconds - 1))}" UHCDisplay`);
            world.getDimension('overworld').runCommandAsync(`scoreboard players set "${this.remainingTime}" UHCDisplay ${displayConfig['remainingTime'] - 1}`);
            world.getDimension('overworld').runCommandAsync(`scoreboard players reset " " UHCDisplay`);
            world.getDimension('overworld').runCommandAsync(`scoreboard players set " " UHCDisplay ${displayConfig['space1'] - 1}`);
            world.getDimension('overworld').runCommandAsync(`scoreboard players reset "  " UHCDisplay`);
            world.getDimension('overworld').runCommandAsync(`scoreboard players set "  " UHCDisplay ${displayConfig['space2'] - 1}`);
            world.getDimension('overworld').runCommandAsync(`scoreboard players reset "   " UHCDisplay`);
            world.getDimension('overworld').runCommandAsync(`scoreboard players set "   " UHCDisplay ${displayConfig['space3'] - 1}`);
            world.getDimension('overworld').runCommandAsync(`scoreboard players reset "    " UHCDisplay`);
            world.getDimension('overworld').runCommandAsync(`scoreboard players set "    " UHCDisplay ${displayConfig['space3'] - 1}`);
            world.getDimension('overworld').runCommandAsync(`scoreboard players reset "     " UHCDisplay`);
            world.getDimension('overworld').runCommandAsync(`scoreboard players set "     " UHCDisplay ${displayConfig['space4'] - 1}`);

        }, 20);
    };
    seconds = 0;
    currentTime = "00:00:00";
    remainingTime = 0;
    gameDuration = 0;
    started = false;
    alivePlayers;
    setDuration(seconds) { };
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