import { Card, Alert, Breadcrumb } from "antd";
import "antd/dist/reset.css";
import Image from "next/image";

type PokemonType = {
    name: string;
    sprites: { front_default: string };
    types: { type: { name: string } }[];
    height: number;
    weight: number;
    abilities: { ability: { name: string } }[];
    stats: { base_stat: number; stat: { name: string } }[];
    moves: { move: { name: string; url: string } }[];
};

async function getPokemon(name: string): Promise<PokemonType | null> {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!res.ok) return null;
    return res.json();
}

export default async function PokemonDetailPage({
    params,
}: {
    params: Promise<{ name: string }>;
}) {
    const { name } = await params; // ✅ await the async params
    const pokemon = await getPokemon(name);

    if (!pokemon) {
        return (
            <Alert
                message="Pokémon not found"
                type="error"
                showIcon
                style={{ marginTop: 48 }}
            />
        );
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f0f2f5",
                padding: 24,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <Breadcrumb
                style={{ marginBottom: 24 }}
                items={[
                    { title: "Home", href: "/" },
                    {
                        title: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
                    },
                ]}
            />
            <Card
                style={{ maxWidth: 400, width: "100%", borderRadius: 16 }}
                cover={
                    <Image
                        alt={pokemon.name}
                        src={pokemon.sprites.front_default}
                        width={180}
                        height={180}
                        style={{ objectFit: "contain", paddingTop: 24 }}
                    />
                }
            >
                <h2 style={{ fontSize: 24, marginBottom: 16 }}>{pokemon.name}</h2>
                <div style={{ marginBottom: 16, textAlign: "center" }}>
                    {pokemon.types.map((t, i) => (
                        <span
                            key={i}
                            style={{
                                background: "#e6f7ff",
                                color: "#1890ff",
                                borderRadius: 8,
                                padding: "2px 8px",
                                fontSize: 14,
                                marginRight: 6,
                                textTransform: "capitalize",
                            }}
                        >
                            {t.type.name}
                        </span>
                    ))}
                </div>
                <div>
                    <b>Height:</b> {pokemon.height / 10} m
                </div>
                <div>
                    <b>Weight:</b> {pokemon.weight / 10} kg
                </div>
                <div style={{ marginTop: 16 }}>
                    <b>Abilities:</b>{" "}
                    {pokemon.abilities.map((a) => a.ability.name).join(", ")}
                </div>
                <div style={{ marginTop: 16 }}>
                    <b>Base Stats:</b>
                    <ul style={{ paddingLeft: 20 }}>
                        {pokemon.stats.map((s) => (
                            <li key={s.stat.name} style={{ textTransform: "capitalize" }}>
                                {s.stat.name}: {s.base_stat}
                            </li>
                        ))}
                    </ul>
                </div>
                <div style={{ marginTop: 16 }}>
                    <b>Moves:</b>
                    <ul style={{ paddingLeft: 20, maxHeight: 200, overflowY: "auto" }}>
                        {pokemon.moves.map((m, i) => (
                            <li key={i}>
                                <a
                                    href={m.move.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {m.move.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </Card>
        </div>
    );
}
