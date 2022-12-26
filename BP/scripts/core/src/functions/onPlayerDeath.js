import { world, Player } from '@minecraft/server';
import { delay } from './delay';
const callbacks = [];
/**
 * Subscribes a new player death callback.
 * @param {(arg) => void} callback 
 */
export function onPlayerDeath(callback) {
    try {
        callbacks.push(callback);
    } catch (error) {
        console.warn(error);
    };
};
world.events.entityHurt.subscribe(async (entityHurt) => {
    if (entityHurt.hurtEntity.typeId != 'minecraft:player') {
        return;
    };
    const player = entityHurt.hurtEntity;
    const health = player.getComponent('minecraft:health');
    if (health.current <= 0) {
        const location = player.location;
        const killer = entityHurt.damagingEntity;
        const projectile = entityHurt.projectile;
        const damage = entityHurt.damage;
        const cause = entityHurt.cause;
        await delay(1);
        if (health.current <= 0) {
            const data = {
                player: player,
                location: location,
                killer: killer,
                projectile: projectile,
                damage: damage,
                cause: cause
            };
            for (const callback of callbacks) {
                callback(data);
            };
        };
    };
});