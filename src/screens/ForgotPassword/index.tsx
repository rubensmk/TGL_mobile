/* eslint-disable import/no-extraneous-dependencies */
import React, { useCallback } from "react";
import { TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useForm, Controller } from "react-hook-form";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "../../services/api";
import colors from "../../styles/colors";
import { styles } from "./styles";
import * as S from "./styles";

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const fieldsValidationSchema = Yup.object().shape({
    email: Yup.string()
      .required("E-mail obrigatório.")
      .email("Digite um email válido"),
  });
  const { navigate, goBack } = useNavigation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(fieldsValidationSchema) });

  const handleResetPassword = useCallback(
    async (data: ForgotPasswordFormData) => {
      try {
        await api.post("passwords", {
          email: data.email,
          redirect_url: "http://localhost:3000/resetpassword",
        });

        Toast.show({
          type: "success",
          position: "top",
          text1: "E-mail válido!",
          text2: "Foi enviado para o seu email o link de reset da senha!",
          onShow: () => {
            navigate("SignIn");
          },
        });
      } catch (err) {
        Toast.show({
          type: "error",
          position: "top",
          text1: "E-mail inválido!",
          text2: "Não identificado, tente novamente.",
        });
      }
    },
    [navigate]
  );
  return (
    <>
      <S.Container>
        <S.Logo>
          <S.LogoText>TGL</S.LogoText>
        </S.Logo>
        <S.Title>Reset Password</S.Title>
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
                placeholder="Email"
                keyboardType="email-address"
              />
            )}
            name="email"
            defaultValue=""
          />
          <S.ErrorText>{errors.email?.message}</S.ErrorText>
          <S.SendLinkButton onPress={handleSubmit(handleResetPassword)}>
            <S.SendLinkText>Send Link</S.SendLinkText>
            <Feather name="arrow-right" size={35} color={colors.lightGreen} />
          </S.SendLinkButton>
        </S.Form>
        <S.goBackButton onPress={() => goBack()}>
          <Feather name="arrow-left" size={35} color={colors.gray} />
          <S.goBackText>Back</S.goBackText>
        </S.goBackButton>
      </S.Container>
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </>
  );
};

export default ForgotPassword;
