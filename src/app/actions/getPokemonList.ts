'use server';

export async function getPokemonList() {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
    const data = await res.json();
    return data.results;
}
