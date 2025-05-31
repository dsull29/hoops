// --- FILE: src/utils/index.ts ---
export const getRandomName = (): string => {
    const firstNames = ['Alex', 'Jordan', 'Chris', 'Taylor', 'Morgan', 'Casey', 'Jamie', 'Devon'];
    const lastNames = ['Smith', 'Jones', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${
    lastNames[Math.floor(Math.random() * lastNames.length)]
    }`;
};

export const getRandomPosition = (): string => {
    const positions = ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'];
    return positions[Math.floor(Math.random() * positions.length)];
};

export const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(value, max));

