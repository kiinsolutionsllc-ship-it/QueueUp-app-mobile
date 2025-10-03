import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import api from "../services/api";

export default function HomeScreen() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    api.get("/").then((res) => setMessage(res.data.message));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { fontSize: 20 }
});