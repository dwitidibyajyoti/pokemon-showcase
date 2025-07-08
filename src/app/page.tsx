"use client";
import React, { useEffect, useState } from "react";
import { Select, Input, Spin, Card, Row, Col, Typography, Form } from "antd";
import "antd/dist/reset.css";
import { useRouter } from "next/navigation";
// import { getPokemonTypes } from "./getTypes";
// import { getPokemonList } from "./getPokemonList";
import { filterPokemon } from "./actions/filterPokemon";
import { getPokemonTypes } from "./actions/getTypes";
import { getPokemonList } from "./actions/getPokemonList";
import { StarFilled, StarOutlined } from '@ant-design/icons';

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
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteDetails, setFavoriteDetails] = useState<PokemonCardData[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const favs = localStorage.getItem('favorites');
    if (favs) setFavorites(JSON.parse(favs));
  }, []);

  // Store favorites in localStorage when changed
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (name: string) => {
    setFavorites((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  // const favoritePokemon = filteredPokemon.filter((p) => favorites.includes(p.name));
  // const nonFavoritePokemon = filteredPokemon.filter((p) => !favorites.includes(p.name));
  const favoritePokemon = favoriteDetails;
  const nonFavoritePokemon = filteredPokemon.filter((p) => !favorites.includes(p.name));

  // Fetch types
  useEffect(() => {
    getPokemonTypes().then((data: PokemonType[]) => setTypes(data));
  }, []);
  // Fetch all Pokémon (first 151 for demo)
  useEffect(() => {
    setLoading(true);
    getPokemonList().then((data: PokemonListItem[]) => {
      setPokemonList(data);
      setLoading(false);
    });
  }, []);

  // Filter and fetch Pokémon details
  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const filtered: PokemonListItem[] = await filterPokemon(pokemonList, search, selectedType);
      fetchPokemonDetails(filtered);
      setLoading(false);
    };

    run();
    // eslint-disable-next-line
  }, [search, selectedType, pokemonList]);

  // Fetch details for all favorite Pokémon
  useEffect(() => {
    if (favorites.length === 0) {
      setFavoriteDetails([]);
      return;
    }
    setLoading(true);
    Promise.all(
      favorites.map((name) =>
        fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
          .then((res) => res.json())
          .then((data) => ({
            name: data.name,
            sprites: data.sprites,
            types: data.types,
          }))
      )
    ).then((results) => {
      setFavoriteDetails(results);
      setLoading(false);
    });
  }, [favorites]);

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
      {/* Favorites Section */}
      {favorites.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <Title level={4}>Favorites</Title>
          <Row gutter={[16, 16]} justify="center">
            {favoritePokemon.map((pokemon) => (
              <Col xs={12} sm={8} md={6} lg={4} key={pokemon.name}>
                <Card
                  hoverable
                  onClick={() => router.push(`/pokemon/${pokemon.name}`)}
                  style={{ borderRadius: 12, cursor: "pointer", border: '2px solid #faad14', width: 120, margin: '0 auto' }}
                  cover={
                    <img
                      alt={pokemon.name}
                      src={pokemon.sprites.front_default}
                      style={{ width: 60, height: 60, objectFit: "contain", margin: "0 auto", paddingTop: 8 }}
                    />
                  }
                  actions={[
                    favorites.includes(pokemon.name) ? (
                      <StarFilled key="star" style={{ color: '#faad14' }} onClick={e => { e.stopPropagation(); toggleFavorite(pokemon.name); }} />
                    ) : (
                      <StarOutlined key="star" onClick={e => { e.stopPropagation(); toggleFavorite(pokemon.name); }} />
                    )
                  ]}
                >
                  <Card.Meta
                    title={<span style={{ textTransform: "capitalize", fontSize: 14 }}>{pokemon.name}</span>}
                    description={
                      <div style={{ marginTop: 4 }}>
                        {pokemon.types.map((t, i) => (
                          <span
                            key={i}
                            style={{
                              background: "#e6f7ff",
                              color: "#1890ff",
                              borderRadius: 8,
                              padding: "1px 4px",
                              fontSize: 10,
                              marginRight: 2,
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
        </div>
      )}
      {/* Main Pokémon List (excluding favorites) */}
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
          {nonFavoritePokemon.map((pokemon) => (
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
                actions={[
                  favorites.includes(pokemon.name) ? (
                    <StarFilled key="star" style={{ color: '#faad14' }} onClick={e => { e.stopPropagation(); toggleFavorite(pokemon.name); }} />
                  ) : (
                    <StarOutlined key="star" onClick={e => { e.stopPropagation(); toggleFavorite(pokemon.name); }} />
                  )
                ]}
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
