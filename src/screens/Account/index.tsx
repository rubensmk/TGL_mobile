import React, { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import { useForm, Controller } from "react-hook-form";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TextInput, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import * as S from "./styles";
import colors from "../../styles/colors";
import { styles } from "./styles";
import { IState } from "../../store";
import { IUser } from "../../store/modules/auth/types";
import api from "../../services/api";
import { logOut } from "../../store/modules/auth/actions";

interface AccountUpdateFormData {
  name: string;
}

const Account: React.FC = () => {
  const { navigate } = useNavigation();
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const user = useSelector<IState, IUser>((state) => state.auth.user);

  const handleUpdate = useCallback(
    async (data: AccountUpdateFormData) => {
      try {
        await api.put(`users/${user.id}`, { username: data.name });
        Toast.show({
          type: "success",
          position: "top",
          text1: "Nome de usuário alterado!",
          text2: "Alterações realizadas com sucesso.",
        });
      } catch (error) {
        Toast.show({
          type: "error",
          position: "top",
          text1: "Erro na alteração!",
          text2: "Ocorreu um erro na alteração, tente novamente.",
        });
      }
    },
    [user.id]
  );

  const sendResetPasswordMail = useCallback(async () => {
    try {
      await api.post("passwords", {
        email: user.email,
        redirect_url: "http://localhost:3000/resetpassword",
      });
      Toast.show({
        type: "success",
        position: "top",
        text1: "E-mail para troca de senha!",
        text2: "E-mail para alterar senha foi enviado para o seu email.",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Erro no processo.",
        text2: "Occoreu um erro no envio, tente novamente.",
      });
    }
  }, [user.email]);

  const handleLogOut = useCallback(async () => {
    dispatch(logOut());
    navigate("SignIn");
  }, [dispatch, navigate]);

  return (
    <>
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
          <S.Title>MY PROFILE</S.Title>
          <S.Info>
            Email:
            {user.email}
          </S.Info>
          <S.Form>
            <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder={user.username}
                />
              )}
              name="name"
              defaultValue=""
            />
            {errors.name && <S.ErrorText>Nome não pode ser vazio.</S.ErrorText>}
          </S.Form>
          <S.ApplyButton onPress={handleSubmit(handleUpdate)}>
            <S.ApplyButtonText>Apply Changes</S.ApplyButtonText>
          </S.ApplyButton>
          <View style={{ alignItems: "center", marginBottom: 10 }}>
            <S.Info>Created at: {user.created_at.split(" ", 1)}</S.Info>
            <S.Info>Last Update: {user.updated_at.split(" ", 1)}</S.Info>
          </View>
          <S.Title>RESET PASSWORD</S.Title>
          <S.ResetButton onPress={() => sendResetPasswordMail()}>
            <S.ResetText>Send Email to Reset Password</S.ResetText>
          </S.ResetButton>
        </S.Content>
      </S.Container>
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </>
  );
};

export default Account;
