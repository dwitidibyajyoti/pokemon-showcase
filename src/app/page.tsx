"use client";
import React, { useEffect, useState } from "react";
import { Select, Input, Spin, Card, Row, Col, Typography, Form } from "antd";
import "antd/dist/reset.css";
import { useRouter } from "next/navigation";

const { Option } = Select;
const { Title } = Typography;

interface PokemonType {
  name: string;
  url: string;
}

interface PokemonListItem {
  name: string;
  url: string;
}

interface PokemonCardData {
  name: string;
  sprites: { front_default: string };
  types: { type: { name: string } }[];
}

export default function Home() {
  const [types, setTypes] = useState<PokemonType[]>([]);
  const [selectedType, setSelectedType] = useState("");
  const [search, setSearch] = useState("");
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<PokemonCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch types
  useEffect(() => {
    fetch("https://pokeapi.co/api/v2/type")
      .then((res) => res.json())
      .then((data) => setTypes(data.results));
  }, []);

  // Fetch all Pokémon (first 151 for demo)
  useEffect(() => {
    setLoading(true);
    fetch("https://pokeapi.co/api/v2/pokemon?limit=151")
      .then((res) => res.json())
      .then((data) => {
        setPokemonList(data.results);
        setLoading(false);
      });
  }, []);

  // Filter and fetch Pokémon details
  useEffect(() => {
    let filtered = pokemonList;
    if (search) {
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (selectedType) {
      setLoading(true);
      fetch(`https://pokeapi.co/api/v2/type/${selectedType}`)
        .then((res) => res.json())
        .then((data) => {
          const names = new Set(data.pokemon.map((p: { pokemon: { name: string } }) => p.pokemon.name));
          filtered = filtered.filter((p) => names.has(p.name));
          fetchPokemonDetails(filtered);
        });
    } else {
      fetchPokemonDetails(filtered);
    }
    // eslint-disable-next-line
  }, [search, selectedType, pokemonList]);

  function fetchPokemonDetails(list: PokemonListItem[]) {
    setLoading(true);
    Promise.all(
      list.slice(0, 20).map((p) =>
        fetch(p.url)
          .then((res) => res.json())
          .then((data) => ({
            name: data.name,
            sprites: data.sprites,
            types: data.types,
          }))
      )
    ).then((results) => {
      setFilteredPokemon(results);
      setLoading(false);
    });
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", padding: 24 }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: 32 }}>Pokémon Search</Title>
      <Form layout="inline" style={{ justifyContent: "center", marginBottom: 32, display: "flex", gap: 16 }}>
        <Form.Item label="Type">
          <Select
            allowClear
            showSearch
            placeholder="Select type"
            style={{ minWidth: 160 }}
            value={selectedType || undefined}
            onChange={(value: string | undefined) => setSelectedType(value || "")}
            optionFilterProp="children"
          >
            {types.map((type) => (
              <Option key={type.name} value={type.name}>
                {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Name">
          <Input
            placeholder="Search by name"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            style={{ minWidth: 200 }}
          />
        </Form.Item>
      </Form>
      {loading ? (
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[24, 24]} justify="center">
          {filteredPokemon.map((pokemon) => (
            <Col xs={24} sm={12} md={8} lg={6} key={pokemon.name}>
              <Card
                hoverable
                onClick={() => router.push(`/pokemon/${pokemon.name}`)}
                style={{ borderRadius: 12, cursor: "pointer" }}
                cover={
                  <img
                    alt={pokemon.name}
                    src={pokemon.sprites.front_default}
                    style={{ width: 120, height: 120, objectFit: "contain", margin: "0 auto", paddingTop: 16 }}
                  />
                }
              >
                <Card.Meta
                  title={<span style={{ textTransform: "capitalize" }}>{pokemon.name}</span>}
                  description={
                    <div style={{ marginTop: 8 }}>
                      {pokemon.types.map((t, i) => (
                        <span
                          key={i}
                          style={{
                            background: "#e6f7ff",
                            color: "#1890ff",
                            borderRadius: 8,
                            padding: "2px 8px",
                            fontSize: 12,
                            marginRight: 4,
                            textTransform: "capitalize",
                          }}
                        >
                          {t.type.name}
                        </span>
                      ))}
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
