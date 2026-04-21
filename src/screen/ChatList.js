import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    ImageBackground,
    StyleSheet,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

const ChatListScreen = ({ navigation }) => {
    const [users, setUsers] = useState([]);
    const currentUser = auth().currentUser;

    // ✅ Fetch users
    useEffect(() => {
        const unsubscribe = firestore()
            .collection("users")
            .onSnapshot((snapshot) => {
                const list = [];

                snapshot.forEach((doc) => {
                    if (doc.id !== currentUser?.uid) {
                        list.push({
                            id: doc.id,
                            ...doc.data(),
                        });
                    }
                });

                setUsers(list);
            });

        return unsubscribe;
    }, []);

    // ✅ Render user item
    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={styles.chatItem}
                onPress={() =>
                    navigation.navigate("ChatScreen", {
                        user: {
                            id: item.id,
                            name: item.name,
                            photo: item.photoURL, // ✅ FIXED
                        },
                    })
                }
            >
                {/* PROFILE IMAGE */}
                <View>
                    <Image
                        source={
                            item.photoURL
                                ? { uri: item.photoURL }
                                : {
                                    uri: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                                }
                        }
                        style={styles.avatar}
                    />

                    {/* ONLINE DOT */}
                    <View style={styles.onlineDot} />
                </View>

                {/* TEXT */}
                <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.name}>
                        {item.name || "User"}
                    </Text>
                    <Text style={styles.lastMessage}>
                        Tap to chat...
                    </Text>
                </View>

                {/* TIME */}
                <Text style={styles.time}>2 min</Text>
            </TouchableOpacity>
        );
    };

    return (
        <ImageBackground
            source={{
                uri: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
            }}
            style={styles.background}
        >
            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.title}>ChatApp</Text>
            </View>

            {/* CONTAINER */}
            <View style={styles.container}>
                <FlatList
                    data={users}
                    keyExtractor={(item) => item.id}
                    extraData={users} // ✅ IMPORTANT
                    renderItem={renderItem}
                />
            </View>

            {/* FLOAT BUTTON */}
            <TouchableOpacity style={styles.fab}>
                <Text style={{ color: "#fff", fontSize: 20 }}>💬</Text>
            </TouchableOpacity>
        </ImageBackground>
    );
};

export default ChatListScreen;

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },

    header: {
        marginTop: 50,
        paddingHorizontal: 20,
        marginBottom: 10,
    },

    title: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "bold",
    },

    container: {
        flex: 1,
        margin: 10,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.6)",
        padding: 10,
    },

    chatItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderBottomWidth: 0.5,
        borderColor: "#ddd",
    },

    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },

    onlineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#25D366",
        position: "absolute",
        bottom: 0,
        right: 0,
        borderWidth: 2,
        borderColor: "#fff",
    },

    name: {
        fontSize: 16,
        fontWeight: "bold",
    },

    lastMessage: {
        color: "gray",
        fontSize: 13,
        marginTop: 2,
    },

    time: {
        fontSize: 12,
        color: "gray",
    },

    fab: {
        position: "absolute",
        bottom: 20,
        right: 20,
        backgroundColor: "#25D366",
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
    },
});