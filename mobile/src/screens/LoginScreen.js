import React, { useEffect, useRef } from "react";
import { Alert, Button, Animated } from "react-native";
import { useForm, Controller } from "react-hook-form";
import styled, { useTheme } from "styled-components/native";
import { api } from "../api/client";
import useAuthStore from "../store/authStore";
import { API_ROUTES } from "focura-shared";

const Container = styled.View`
	flex: 1;
	justify-content: center;
	padding: ${(props) => props.theme.spacing.large}px;
	background-color: ${(props) => props.theme.colors.background};
`;

const Title = styled(Animated.Text)`
	font-size: ${(props) => props.theme.fontSizes.xlarge}px;
	color: ${(props) => props.theme.colors.primary};
	font-weight: bold;
	text-align: center;
	margin-bottom: ${(props) => props.theme.spacing.large}px;
`;

const Input = styled.TextInput`
	background-color: ${(props) => props.theme.colors.white};
	border-radius: ${(props) => props.theme.borderRadius}px;
	padding: ${(props) => props.theme.spacing.medium}px;
	margin-bottom: ${(props) => props.theme.spacing.medium}px;
	font-size: ${(props) => props.theme.fontSizes.medium}px;
	border: 1px solid ${(props) => props.theme.colors.lightGray};
`;

const SwitchText = styled.Text`
	color: ${(props) => props.theme.colors.primary};
	text-align: center;
	margin-top: ${(props) => props.theme.spacing.medium}px;
`;

function LoginScreenContent({ navigation }) {
	const { control, handleSubmit } = useForm({ defaultValues: { email: "", password: "" } });
	const setAuth = useAuthStore((s) => s.setAuth);
	const token = useAuthStore((s) => s.token);
	const theme = useTheme();

	// entrance animation
	const intro = useRef(new Animated.Value(0)).current;
	useEffect(() => {
		Animated.timing(intro, { toValue: 1, duration: 600, useNativeDriver: true }).start();
	}, [intro]);

	useEffect(() => {
		if (token) {
			navigation.reset({ index: 0, routes: [{ name: "Home" }] });
		}
	}, [token, navigation]);

	const onSubmit = async (data) => {
		try {
			const res = await api.post(API_ROUTES.auth.login, data);
			setAuth({ token: res.data.token, user: res.data.user });
			navigation.replace("Home");
		} catch (err) {
			Alert.alert("Login failed", err?.response?.data?.error || "Please try again");
		}
	};

	return (
		<Container>
			<Title style={{ opacity: intro, transform: [{ translateY: intro.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>
				Login
			</Title>
			<Controller
				control={control}
				name="email"
				rules={{ required: true }}
				render={({ field: { onChange, value } }) => (
					<Input
						placeholder="Email"
						keyboardType="email-address"
						value={value}
						onChangeText={onChange}
						placeholderTextColor={theme.colors.gray}
					/>
				)}
			/>
			<Controller
				control={control}
				name="password"
				rules={{ required: true, minLength: 6 }}
				render={({ field: { onChange, value } }) => (
					<Input
						placeholder="Password"
						secureTextEntry
						value={value}
						onChangeText={onChange}
						placeholderTextColor={theme.colors.gray}
					/>
				)}
			/>
			<Button title="Login" onPress={handleSubmit(onSubmit)} color={theme.colors.primary} />
			<SwitchText onPress={() => navigation.navigate("Register")}>
				Don't have an account? Register
			</SwitchText>
		</Container>
	);
}

export default function LoginScreen({ navigation }) {
	return <LoginScreenContent navigation={navigation} />;
}
