import { system } from '@minecraft/server';
export async function delay(ticks) {
    return new Promise((resolve) => {
        const sleep = system.runSchedule(() => {
            resolve();
            system.clearRunSchedule(sleep);
        }, ticks);
    });
};