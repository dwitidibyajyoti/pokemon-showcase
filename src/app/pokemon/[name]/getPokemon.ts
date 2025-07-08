'use server'
import type { PokemonType } from "./types";

export default async function getPokemon(name: string): Promise<PokemonType | null> {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!res.ok) return null;
    return res.json();
} 