import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
} from "react-native";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { launchImageLibrary } from "react-native-image-picker";
import axios from "axios";

const SignUp = ({ navigation }) => {

   
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    //  PICK IMAGE AND UPLOAD USERS IMAGE 
    const pickImage = async () => {
        const result = await launchImageLibrary({ mediaType: "photo" });

        if (!result.didCancel && result.assets?.length > 0) {
            setImage(result.assets[0]);
        }
    };

    //  UPLOAD IMAGE 
    const uploadImage = async () => {
        if (!image) return null;

        try {
            const data = new FormData();
            data.append("file", {
                uri: image.uri,
                type: image.type,
                name: image.fileName || "profile.jpg",
            });
            data.append("upload_preset", "YOUR_PRESET");

            const res = await axios.post(
                "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload",
                data,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            return res.data.secure_url;

        } catch (error) {
            console.log("Image upload error:", error);
            return null;
        }
    };

    // ✅ SIGN UP
    const handleSignup = async () => {
        if (!name || !email || !password) {
            Alert.alert("Error", "All fields are required");
            return;
        }

        try {
            setLoading(true);

            // create user
            const userCredential = await auth().createUserWithEmailAndPassword(
                email,
                password
            );

            const uid = userCredential.user.uid;

            // upload profile image
            const photoUrl = await uploadImage();

            // save user to firestore
            await firestore().collection("users").doc(uid).set({
                name,
                email,
                photo: photoUrl || "",
                createdAt: firestore.FieldValue.serverTimestamp(),
            });

            Alert.alert("Success", "Account created!");

            navigation.replace("ChatList");

        } catch (error) {
            console.log(error);
            Alert.alert("Signup Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>

            {/* PROFILE IMAGE */}
            <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                <Image
                    source={{
                        uri:
                            image?.uri ||
                            "https://i.pravatar.cc/150?img=12",
                    }}
                    style={styles.image}
                />
                <Text style={styles.uploadText}>Upload Photo</Text>
            </TouchableOpacity>

            {/* TITLE */}
            <Text style={styles.title}>Create Account</Text>

            {/* INPUTS */}
            <TextInput
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                style={styles.input}
            />

            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
            />

            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry
            />

            {/* BUTTON */}
            <TouchableOpacity
                style={styles.button}
                onPress={handleSignup}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? "Creating..." : "Sign Up"}
                </Text>
            </TouchableOpacity>

            {/* LOGIN LINK */}
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginText}>
                    Already have an account? Login
                </Text>
            </TouchableOpacity>

        </View>
    );
};

export default SignUp;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#E5DDD5",
        justifyContent: "center",
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: "#075E54",
    },
    input: {
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    button: {
        backgroundColor: "#25D366",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    loginText: {
        marginTop: 15,
        textAlign: "center",
        color: "blue",
    },
    imageContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 5,
    },
    uploadText: {
        color: "#075E54",
    },
});