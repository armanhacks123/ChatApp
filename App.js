import React, { useEffect } from "react";
import { AppState } from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

import Navigation from "./src/screen/Navigation";

const App = () => {

  useEffect(() => {
    const user = auth().currentUser;

    if (!user) return;

    const updateStatus = (state) => {
      if (state === "active") {
        firestore().collection("users").doc(user.uid).update({
          isOnline: true,
        });
      } else {
        firestore().collection("users").doc(user.uid).update({
          isOnline: false,
          lastSeen: firestore.FieldValue.serverTimestamp(),
        });
      }
    };

    // 🔥 Set initial online status
    updateStatus("active");

    const subscription = AppState.addEventListener("change", updateStatus);

    return () => {
      subscription.remove();
    };
  }, []);

  return <Navigation />;
};

export default App;