/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { ActivityIndicator } from "react-native";
import * as S from "./styles";
import colors from "../../styles/colors";
import { GameButton } from "../../components/GameButton";
import { CompletedGameCard } from "../../components/CompletedGameCard";
import { CompletedGameProps, GameProps, IFetchGame } from "../Bet/types";
import api from "../../services/api";
import { IState } from "../../store";
import { IUser } from "../../store/modules/auth/types";
import { logOut } from "../../store/modules/auth/actions";
import { formatPrice } from "../../utils/formatPrice";

const Home: React.FC = () => {
  const { navigate } = useNavigation();
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);
  const [filteredPage, setFilteredPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const [games, setGames] = useState<GameProps[]>([]);
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [completedCart, setCompletedCart] = useState<CompletedGameProps[]>([]);
  const [filteredCart, setFilteredCart] = useState<CompletedGameProps[]>([]);
  const [totalBets, setTotalBets] = useState(0);
  const user = useSelector<IState, IUser>((state) => state.auth.user);

  const handleSelectFilter = async (type: number) => {
    setSelectedFilter((prevState) => (prevState === type ? 0 : type));
  };
  const handleLogOut = async () => {
    dispatch(logOut());
    navigate("SignIn");
  };
  const fetchSavedGames = async () => {
    const response = await api.get(`/bets/${user.id}/${page}`);
    const allBetsByUser = response.data.data;
    if (page > 1) {
      setCompletedCart((prevState) => [...prevState, ...allBetsByUser]);
    } else {
      setCompletedCart([...allBetsByUser]);
      setTotalBets(response.data.total);
    }
  };

  const fetchMore = async () => {
    if (filteredPage > 1) {
      const response = await api.get(
        `/bets?page=${filteredPage}&user=${user.id}&game=${selectedFilter}`
      );
      const filteredBetsByGameId = response.data.data;
      setFilteredCart((prevState) => [...prevState, ...filteredBetsByGameId]);
    }
  };

  useEffect(() => {
    async function loadGames() {
      const response = await api.get("games");
      const data = response.data.data.map((item: IFetchGame) => ({
        gameId: item.id,
        type: item.type,
        description: item.description,
        range: item.range,
        price: item.price,
        maxNumber: item["max-number"],
        color: item.color,
        minCartValue: item["min-cart-value"],
      }));
      setGames(data);
    }
    loadGames();
  }, []);

  useEffect(() => {
    async function fetchFilteredGames() {
      const response = await api.get(
        `/bets?page=1&user=${user.id}&game=${selectedFilter}`
      );
      const filteredBetsByGameId = response.data.data;
      setFilteredCart([...filteredBetsByGameId]);
      setTotalBets(response.data.total);
    }
    if (selectedFilter === 0) {
      setCompletedCart([]);
      setPage(1);
      fetchSavedGames();
    } else {
      setFilteredCart([]);
      fetchFilteredGames();
    }
  }, [selectedFilter]);

  useFocusEffect(
    useCallback(() => {
      fetchSavedGames();
    }, [])
  );

  return (
    <S.Container>
      <S.Header>
        <S.Logo>
          <S.LogoText>TGL</S.LogoText>
        </S.Logo>
        <MaterialCommunityIcons
          name="logout"
          size={28}
          color={colors.lightGray}
          onPress={() => handleLogOut()}
        />
      </S.Header>

      <S.Content>
        <S.Title>RECENT GAMES ({totalBets})</S.Title>
        <S.Subtitle>Filters</S.Subtitle>
        <S.Filters>
          {games.map((game) => (
            <GameButton
              onPress={() => handleSelectFilter(game.gameId)}
              key={game.gameId}
              color={game.color}
              gameType={game.type}
              isFocused={game.gameId === selectedFilter}
            />
          ))}
        </S.Filters>
      </S.Content>
      <S.RecentGamesList>
        {selectedFilter === 0 ? (
          <S.RecentGames
            data={completedCart}
            keyExtractor={(item: any) => String(item.id)}
            renderItem={({ item }) => (
              <CompletedGameCard
                key={item.id}
                listNumbers={item.choosenNumber}
                color={item.gameColor}
                type={item.gameType}
                date={item.created_at}
                price={formatPrice(item.gamePrice)}
              />
            )}
            showsVerticalScrollIndicator={false}
            onEndReachedThreshold={0.1}
            onEndReached={({ distanceFromEnd }) => {
              if (distanceFromEnd < 1) {
                return;
              }
              setPage((prevState) => prevState + 1);
              fetchSavedGames();
            }}
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator
                  color={colors.lightGreen}
                  size={22}
                  style={{ marginBottom: 20 }}
                />
              ) : (
                  <></>
                )
            }
          />
        ) : (
            <S.RecentGames
              data={filteredCart}
              keyExtractor={(item: any) => String(item.id)}
              renderItem={({ item }) => (
                <CompletedGameCard
                  key={item.id}
                  listNumbers={item.choosenNumber}
                  color={item.gameColor}
                  type={item.gameType}
                  date={item.created_at}
                  price={formatPrice(item.gamePrice)}
                />
              )}
              showsVerticalScrollIndicator={false}
              onEndReachedThreshold={0.1}
              onEndReached={({ distanceFromEnd }) => {
                if (distanceFromEnd < 1) {
                  return;
                }
                setFilteredPage((prevState) => prevState + 1);
                fetchMore();
              }}
              ListFooterComponent={
                loadingMore ? (
                  <ActivityIndicator
                    color={colors.lightGreen}
                    size={22}
                    style={{ marginBottom: 20 }}
                  />
                ) : (
                    <></>
                  )
              }
            />
          )}
      </S.RecentGamesList>
    </S.Container>
  );
};

export default Home;
