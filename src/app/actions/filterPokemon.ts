'use server';

export async function filterPokemon(
    pokemonList: { name: string; url: string }[],
    search: string,
    selectedType: string | null
) {
    let filtered = [...pokemonList];

    if (search) {
        filtered = filtered.filter((p) =>
            p.name.toLowerCase().includes(search.toLowerCase())
        );
    }

    if (selectedType) {
        const res = await fetch(`https://pokeapi.co/api/v2/type/${selectedType}`);
        const data = await res.json();
        const names = new Set(
            data.pokemon.map((p: { pokemon: { name: string } }) => p.pokemon.name)
        );
        filtered = filtered.filter((p) => names.has(p.name));
    }

    return filtered;
}
