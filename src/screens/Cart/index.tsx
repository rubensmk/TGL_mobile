import React, { useCallback, useEffect, useState } from 'react';
import * as S from './styles';
import { useNavigation } from '@react-navigation/native';
import { Text } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import colors from '../../styles/colors'
import { SelectedGameCard } from '../../components/SelectedGameCard';
import { useDispatch, useSelector } from 'react-redux';
import { IState } from '../../store';
import { ICartItem, ICartState } from '../../store/modules/cart/types';
import { formatPrice } from '../../utils/formatPrice';
import { removeFromCart } from '../../store/modules/cart/actions';
import api from '../../services/api';
import { IUser } from '../../store/modules/auth/types';
import Toast from 'react-native-toast-message';


const Cart: React.FC = ({ navigation }: any) => {
    const { navigate } = useNavigation();
    const dispatch = useDispatch();
    const { items } = useSelector<IState, ICartState>(state => state.cart);
    const user = useSelector<IState, IUser>(state => state.auth.user);
    const [total, setTotal] = useState(0);

    const handleRemoveFromCart = useCallback(async (game: any) => {
        let totalPrice = 0;
        dispatch(removeFromCart(game));
    }, [])

    const handleSave = useCallback(async () => {
        console.log('aqui')
        if (total >= 30) {
            try {
                items.map(item => {
                    api.post('bets', {
                        choosenNumber: item.choosenNumbers,
                        gameType: item.gameType,
                        gamePrice: item.gamePrice,
                        gameColor: item.gameColor,
                        user_id: user.id,
                        game_id: item.id
                    })
                });
                Toast.show({
                    type: 'success',
                    position: 'top',
                    text1: 'Apostas finalizadas! ',
                    text2: `Suas apostas foram salvas com sucesso!, Boa sorte.`,
                });
                navigate('Home');
            } catch (error) {
                Toast.show({
                    type: 'error',
                    position: 'top',
                    text1: 'Error ao salvar! ',
                    text2: `Erro ao salvar suas apostas, tente novamente.`,
                });
            }
        } else {
            Toast.show({
                type: 'info',
                position: 'top',
                text1: 'Atenção! ',
                text2: `Você precisa completar o valor mínimo de R$30,00 para salvar.`,
            });
        }
    }, [user.id, total]);

    useEffect(() => {
        items.map(game => {
            let prices = total
            prices += game.gamePrice
            setTotal(prices)
        })
    }, [items])

    return (
        <>
            <S.Container>
                <S.Header>
                    <MaterialCommunityIcons name="cart-outline" size={32} color={colors.lightGreen} />
                    <S.Title>CART</S.Title>
                </S.Header>
                <S.SelectedGames>
                    {items.map((game, index) => (
                        <SelectedGameCard onPress={() => console.log('remover')} key={index} listNumbers={game.choosenNumbers} color={game.gameColor} type={game.gameType} price={formatPrice(game.gamePrice)} />
                    ))}
                </S.SelectedGames>
                <S.TotalSection>
                    <S.TotalText> CART <Text style={{ fontWeight: "normal" }}>TOTAL</Text></S.TotalText>
                    <S.TotalPrice>{formatPrice(total)}</S.TotalPrice>
                </S.TotalSection>
                <S.SaveButton onPress={() => handleSave()}>
                    <S.SaveButtonText >Save</S.SaveButtonText>
                    <Feather name="arrow-right" size={38} color={colors.lightGreen} />
                </S.SaveButton>
            </S.Container>
            <Toast ref={(ref) => Toast.setRef(ref)} />
        </>
    )
}

export default Cart;
