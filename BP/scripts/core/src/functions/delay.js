import { system } from '@minecraft/server';
export async function delay(ticks) {
    return new Promise((resolve, reject) => {
        const sleep = system.runSchedule(() => {
            resolve(true);
            system.clearRunSchedule(sleep);
        }, ticks);
    });
};