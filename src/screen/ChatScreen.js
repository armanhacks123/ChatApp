import React, { useEffect, useState, useLayoutEffect } from "react";
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    Image,
    ImageBackground,
    StyleSheet,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

const ChatScreen = ({ route, navigation }) => {
    const currentUser = auth().currentUser;
    const otherUser = route?.params?.user;

    const [chatId, setChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [otherProfile, setOtherProfile] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [myProfile, setMyProfile] = useState(null);

    // 🚫 Prevent crash
    if (!otherUser) {
        return (
            <View style={styles.center}>
                <Text>User not found</Text>
            </View>
        );
    }

    // ✅ Chat ID
    useEffect(() => {
        const id =
            currentUser.uid > otherUser.id
                ? currentUser.uid + otherUser.id
                : otherUser.id + currentUser.uid;

        setChatId(id);
    }, []);

    // ✅ Get other user profile
    useEffect(() => {
        const sub = firestore()
            .collection("users")
            .doc(otherUser.id)
            .onSnapshot(doc => setOtherProfile(doc.data()));

        return sub;
    }, []);

    // ✅ Get my profile (for header right icon)
    useEffect(() => {
        const sub = firestore()
            .collection("users")
            .doc(currentUser.uid)
            .onSnapshot(doc => setMyProfile(doc.data()));

        return sub;
    }, []);

    // ✅ Typing listener
    useEffect(() => {
        if (!chatId) return;

        const sub = firestore()
            .collection("chats")
            .doc(chatId)
            .onSnapshot(doc => {
                setIsTyping(doc.data()?.typing === otherUser.id);
            });

        return sub;
    }, [chatId]);

    // ✅ Messages listener + seen
    useEffect(() => {
        if (!chatId) return;

        const sub = firestore()
            .collection("chats")
            .doc(chatId)
            .collection("messages")
            .orderBy("createdAt", "desc")
            .onSnapshot(snapshot => {
                const list = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setMessages(list);

                // mark seen
                snapshot.docs.forEach(doc => {
                    if (doc.data().senderId !== currentUser.uid) {
                        doc.ref.update({ seen: true });
                    }
                });
            });

        return sub;
    }, [chatId]);

    // 🔥 FIXED HEADER (VISIBLE + DARK)
    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: "#075E54", // WhatsApp color
            },
            headerTintColor: "#fff",

            headerTitle: () => (
                <View style={styles.headerContainer}>
                    <Image
                        source={{
                            uri:
                                otherProfile?.photoURL ||
                                "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                        }}
                        style={styles.headerImage}
                    />
                    <View>
                        <Text style={styles.headerName}>
                            {otherProfile?.name || "User"}
                        </Text>

                        <Text style={styles.headerStatus}>
                            {isTyping
                                ? "typing..."
                                : otherProfile?.isOnline
                                    ? "online"
                                    : otherProfile?.lastSeen
                                        ? "last seen " +
                                        new Date(
                                            otherProfile.lastSeen.toDate()
                                        ).toLocaleTimeString()
                                        : ""}
                        </Text>
                    </View>
                </View>
            ),

            // ✅ PROFILE ICON FIXED
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => navigation.navigate("ProfileScreen")}
                    style={{ marginRight: 15 }}
                >
                    <Image
                        source={{
                            uri:
                                myProfile?.photoURL ||
                                "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                        }}
                        style={styles.headerRightImage}
                    />
                </TouchableOpacity>
            ),
        });
    }, [otherProfile, isTyping, myProfile]);

    // ✅ Send message
    const sendMessage = async () => {
        if (!message.trim()) return;

        await firestore()
            .collection("chats")
            .doc(chatId)
            .collection("messages")
            .add({
                text: message,
                senderId: currentUser.uid,
                createdAt: firestore.FieldValue.serverTimestamp(),
                seen: false,
            });

        setMessage("");

        firestore().collection("chats").doc(chatId).update({
            typing: null,
        });
    };

    // ✅ Typing handler
    const handleTyping = (text) => {
        setMessage(text);

        firestore().collection("chats").doc(chatId).set(
            {
                typing: currentUser.uid,
            },
            { merge: true }
        );
    };

    // ✅ Message UI (ticks added)
    const renderMessage = ({ item }) => {
        const isMe = item.senderId === currentUser.uid;

        return (
            <View
                style={[
                    styles.messageBubble,
                    {
                        alignSelf: isMe ? "flex-end" : "flex-start",
                        backgroundColor: isMe ? "#DCF8C6" : "#fff",
                    },
                ]}
            >
                <Text>{item.text}</Text>

                {isMe && (
                    <Text style={styles.tick}>
                        {item.seen ? "✓✓" : "✓"}
                    </Text>
                )}
            </View>
        );
    };

    return (
        <ImageBackground
            source={{
                uri: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
            }}
            style={styles.background}
        >
            <View style={styles.chatContainer}>
                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    inverted
                />
            </View>

            {/* 🔥 FIXED INPUT SIZE */}
            <View style={styles.inputContainer}>
                <TextInput
                    value={message}
                    onChangeText={handleTyping}
                    placeholder="Type a message..."
                    style={styles.input}
                />

                <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
                    <Text style={{ color: "#fff" }}>➤</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
};

export default ChatScreen;

const styles = StyleSheet.create({
    background: { flex: 1 },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
    },

    headerImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },

    headerName: {
        color: "#fff",
        fontWeight: "bold",
    },

    headerStatus: {
        color: "#fff",
        fontSize: 12,
    },

    headerRightImage: {
        width: 35,
        height: 35,
        borderRadius: 17,
    },

    chatContainer: {
        flex: 1,
        margin: 10,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.6)",
        padding: 10,
    },

    messageBubble: {
        padding: 10,
        borderRadius: 10,
        marginVertical: 5,
        maxWidth: "75%",
    },

    tick: {
        fontSize: 10,
        alignSelf: "flex-end",
        color: "gray",
    },

    inputContainer: {
        flexDirection: "row",
        padding: 12,
        backgroundColor: "#fff",
        margin: 10,
        borderRadius: 30,
        alignItems: "center",
    },

    input: {
        flex: 1,
        fontSize: 16,
        paddingHorizontal: 10,
    },

    sendBtn: {
        backgroundColor: "#25D366",
        padding: 12,
        borderRadius: 25,
    },
});