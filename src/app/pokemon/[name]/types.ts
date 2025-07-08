export type PokemonType = {
    name: string;
    sprites: { front_default: string };
    types: { type: { name: string } }[];
    height: number;
    weight: number;
    abilities: { ability: { name: string } }[];
    stats: { base_stat: number; stat: { name: string } }[];
    moves: { move: { name: string; url: string } }[];
}; 