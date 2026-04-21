import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

const UserListScreen = ({ navigation }) => {
    const [users, setUsers] = useState([]);
    const currentUser = auth().currentUser;

    useEffect(() => {
        if (!currentUser) return;

        const unsubscribe = firestore()
            .collection("users")
            .onSnapshot(snapshot => {
                const userList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                // ❌ remove current user
                const filteredUsers = userList.filter(
                    user => user.id !== currentUser.uid
                );

                setUsers(filteredUsers);
            });

        return () => unsubscribe();
    }, []);

    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity
                onPress={() =>
                    navigation.navigate("ChatScreen", { // ✅ FIXED NAME
                        user: {
                            id: item.id,
                            name: item.name,
                            photo: item.photo,
                        },
                    })
                }
                style={{
                    flexDirection: "row",
                    padding: 10,
                    borderBottomWidth: 1,
                }}
            >
                <Image
                    source={{
                        uri: item.photo || "https://i.pravatar.cc/150?img=3",
                    }}
                    style={{ width: 40, height: 40, borderRadius: 20 }}
                />

                <Text style={{ marginLeft: 10, fontSize: 16 }}>
                    {item.name || "User"}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={users}
                keyExtractor={item => item.id}
                renderItem={renderItem}
            />
        </View>
    );
};

export default UserListScreen;