import React, { useCallback } from 'react';
import * as S from './styles';
import { styles } from './styles';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from "react-hook-form";
import { Text, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import colors from '../../styles/colors';
import api from '../../services/api';
import { useDispatch } from 'react-redux';
import { logIn } from '../../store/modules/auth/actions';
import Toast from 'react-native-toast-message';

interface SignInFormData {
    email: string;
    password: string;
}
const SignIn: React.FC = () => {
    const dispatch = useDispatch();
    const { navigate } = useNavigation();
    const { control, handleSubmit, formState: { errors } } = useForm<SignInFormData>();

    const handleLogin = useCallback(
        async (data: SignInFormData) => {
            const userData = {
                email: data.email,
                password: data.password,
            };
            try {

                const response = await api.post('sessions', userData);

                const { token, user } = response.data;

                dispatch(logIn({ token, user }));
                Toast.show({
                    type: 'success',
                    position: 'top',
                    text1: 'Sessão iniciada com sucesso!',
                    text2: 'Seja Bem-Vindo!',
                    onShow: () => { navigate('Dashboard') }
                });
            } catch (err) {

                alert('Erro ao efetuar login, verifique seu email ou senha.');
            }
        },
        [dispatch],
    );
    return (
        <>
            <S.Container>
                <S.Logo>
                    <S.LogoText>TGL</S.LogoText>
                </S.Logo>
                <S.Title>Authentication</S.Title>
                <S.Form>
                    <Controller
                        control={control}
                        rules={{
                            required: true,
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={styles.firstInput}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                placeholder="Email"
                            />
                        )}
                        name="email"
                        defaultValue=""
                    />
                    <Controller
                        control={control}
                        rules={{
                            required: true,
                            minLength: 6,
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={styles.input}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                placeholder="Password"
                            />
                        )}
                        name="password"
                        defaultValue=""
                    />
                    {errors.email && <S.ErrorText>Email is required.</S.ErrorText>}
                    {errors.password && <S.ErrorText>Password is required.</S.ErrorText>}
                    <S.ForgotPasswordButton onPress={() => navigate('ForgotPassword')}>
                        <S.ForgotPasswordText>I forgot my password</S.ForgotPasswordText>
                    </S.ForgotPasswordButton>
                    <S.LogInButton onPress={handleSubmit(handleLogin)}>
                        <S.LogInText>Log In</S.LogInText>
                        <Feather name="arrow-right" size={35} color={colors.lightGreen} />
                    </S.LogInButton>
                </S.Form>
                <S.SignUpButton onPress={() => navigate('SignUp')}>
                    <S.SignUpText>Sign Up</S.SignUpText>
                    <Feather name="arrow-right" size={35} color={colors.gray} />
                </S.SignUpButton>
                <S.Footer>Copyright 2020 Luby Software</S.Footer>
            </S.Container >
            <Toast ref={(ref) => Toast.setRef(ref)} />
        </>

    )
}

export default SignIn;
