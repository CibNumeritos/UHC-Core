export const diff = (value) => {
    return value.toString().length == 1 ? `0${value}` : `${value}`;
};

export function parseSeconds(seconds) {
    let days = Math.floor(seconds / 24 / 60 / 60);
    let hoursLeft = Math.floor((seconds) - (days * 86400));
    let hours = Math.floor(hoursLeft / 3600);
    let minutesLeft = Math.floor((hoursLeft) - (hours * 3600));
    let minutes = Math.floor(minutesLeft / 60);
    let remainingSeconds = seconds % 60;
    return `${diff(hours)}:${diff(minutes)}:${diff(remainingSeconds)}`;
};