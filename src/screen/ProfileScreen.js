import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    Image,
    TouchableOpacity,
    StyleSheet,
    Alert
} from "react-native";

import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { launchImageLibrary } from "react-native-image-picker";
import Navigation from "./Navigation";

const CLOUD_NAME = "dqcorq4ie";
const UPLOAD_PRESET = "ChatImage";

const ProfileScreen = ({ navigation }) => {
    const user = auth().currentUser;

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // 🔹 Fetch user data
    useEffect(() => {
        const subscriber = firestore()
            .collection("users")
            .doc(user.uid)
            .onSnapshot(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    setName(data?.name || "");
                    setEmail(data?.email || "");
                    setImage(data?.photoURL || null);
                }
            });

        return () => subscriber();
    }, []);

    // 🔹 Pick Image
    const chooseImage = async () => {
        const result = await launchImageLibrary({
            mediaType: "photo",
            quality: 0.5,
            includeBase64: true // ✅ IMPORTANT
        });

        if (result.didCancel) return;

        const base64 = result.assets[0].base64;

        const imageUri = `data:image/jpeg;base64,${base64}`;

        setImage(imageUri);
    };

    // 🔹 Upload to Cloudinary
    const uploadImageToCloudinary = async () => {
        if (!image) return null;

        const formData = new FormData();

        formData.append("file", {
            uri: image,
            type: "image/jpeg",
            name: "profile.jpg",
        });

        // ✅ VERY IMPORTANT
        formData.append("upload_preset", "ChatImage");

        try {
            const res = await fetch(
                "https://api.cloudinary.com/v1_1/dqcorq4ie/image/upload",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await res.json();

            console.log("RESPONSE:", data);

            if (data.secure_url) {
                return data.secure_url;
            } else {
                Alert.alert("Error", JSON.stringify(data));
                return null;
            }

        } catch (error) {
            console.log("ERROR:", error);
            Alert.alert("Upload failed");
            return null;
        }
    };

    // 🔹 Update Profile
    const handleUpdate = async () => {
        await firestore().collection("users").doc(user.uid).update({
            name: name || "",
            photoURL: image || ""
        });

        setIsEditing(false);
        Alert.alert("Success", "Profile Updated!");
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={isEditing ? chooseImage : null}
            >
                <Image
                    source={{
                        uri:
                            image ||
                            "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }}
                    style={styles.profileImage}
                />
                {isEditing && (
                    <Text style={styles.changePhoto}>Change Photo</Text>
                )}
            </TouchableOpacity>

            {/* NAME */}
            <Text style={styles.label}>Name</Text>

            {isEditing ? (
                <TextInput
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                />
            ) : (
                <Text style={styles.value}>{name}</Text>
            )}

            {/* EMAIL */}
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{email}</Text>

            {/* BUTTON */}
            {isEditing ? (
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleUpdate}
                >
                    <Text style={styles.buttonText}>
                        {uploading ? "Updating..." : "Save"}
                    </Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => setIsEditing(true)}
                >
                    <Text style={styles.buttonText}>Edit Profile</Text>
                </TouchableOpacity>

            )}
            <Text style={styles.Logout}>LogOut here ..</Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Login")}>
                <Text style={styles.buttonText}> LogOut</Text>
            </TouchableOpacity>
        </View>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff"
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 10
    },
    changePhoto: {
        color: "blue",
        marginBottom: 20,
        textAlign: "center"
    },
    label: {
        alignSelf: "flex-start",
        marginLeft: 10,
        marginTop: 10,
        fontWeight: "bold"
    },
    value: {
        fontSize: 16,
        marginTop: 5,
        marginBottom: 10
    },
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 8,
        marginTop: 5
    },
    button: {
        backgroundColor: "#4CAF50",
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
        width: "100%",
        alignItems: "center"
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold"
    },
    Logout: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 50,

    }
});