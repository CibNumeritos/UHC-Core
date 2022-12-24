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
    };
    handleUndef() {
        if (!world.scoreboard.getObjective('UHCConfig')) world.scoreboard.addObjective('UHCConfig', 'UHCConfig');
        if (!world.scoreboard.getObjective('UHCDisplay')) world.scoreboard.addObjective('UHCDisplay', '====UHC====');
    };
    handleTime() {
        const loop = system.runSchedule(() => {

            if (!this.started) {
                return;
            };

            this.alivePlayers = Array.from(world.getPlayers()).map(player => { return player.getComponent('minecraft:health').current > 0 ? player.name : undefined }).filter(alive => { return alive != undefined });
            this.seconds = world.scoreboard.getObjective('UHCConfig').getScore(world.scoreboard.getObjective('UHCConfig').find((identity) => identity.displayName == 'seconds')) ?? -2;

            if (this.seconds <= 0) {
                return;
            };

            this.removeTime(1);
            this.currentTime = parseSeconds(this.seconds);
            this.remainingTime = parseSeconds(this.gameDuration - this.currentTime);

            world.getDimension('overworld').runCommandAsync(`scoreboard players reset "${this.currentTime}" UHCDisplay`);
            world.getDimension('overworld').runCommandAsync(`scoreboard players set "${this.currentTime}" UHCDisplay ${displayConfig['currentTime'] - 1}`);
            world.getDimension('overworld').runCommandAsync(`scoreboard players reset "${this.remainingTime}" UHCDisplay`);
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