import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ImageBackground,
    StyleSheet,
    Alert,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import auth from "@react-native-firebase/auth";

const Login = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [secure, setSecure] = useState(true);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }

        try {
            await auth().signInWithEmailAndPassword(email, password);
            navigation.replace("ChatList");
        } catch (error) {
            Alert.alert("Login Error", error.message);
        }
    };

    return (
        <ImageBackground
            source={{
                uri: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
            }}
            style={styles.background}
        >
            {/* DARK OVERLAY */}
            <View style={styles.overlay} />

            <View style={styles.container}>

                {/* TITLE */}
                <Text style={styles.title}>Welcome to ChatApp</Text>
                <Text style={styles.subtitle}>Connect with your friends</Text>

                {/* EMAIL */}
                <View style={styles.inputBox}>
                    <Icon name="email" size={20} color="#555" />
                    <TextInput
                        placeholder="Email"
                        placeholderTextColor="#999"
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                {/* PASSWORD */}
                <View style={styles.inputBox}>
                    <Icon name="lock" size={20} color="#555" />
                    <TextInput
                        placeholder="Password"
                        placeholderTextColor="#999"
                        secureTextEntry={secure}
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => setSecure(!secure)}>
                        <Icon name="visibility" size={20} color="#555" />
                    </TouchableOpacity>
                </View>

                {/* LOGIN BUTTON */}
                <TouchableOpacity onPress={handleLogin}>
                    <LinearGradient
                        colors={["#25D366", "#128C7E"]}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>Login</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* SIGNUP LINK */}
                <TouchableOpacity
                    onPress={() => navigation.navigate("SignUp")}
                >
                    <Text style={styles.signupText}>
                        Don't have an account? Sign Up
                    </Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
};

export default Login;

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: "center",
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    container: {
        padding: 20,
    },
    title: {
        fontSize: 28,
        color: "#fff",
        fontWeight: "bold",
        textAlign: "center",
    },
    subtitle: {
        color: "#ddd",
        textAlign: "center",
        marginBottom: 30,
    },
    inputBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    input: {
        flex: 1,
        padding: 10,
        color: "#000",
    },
    button: {
        padding: 15,
        borderRadius: 30,
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    signupText: {
        color: "#fff",
        textAlign: "center",
        marginTop: 20,
    },
});