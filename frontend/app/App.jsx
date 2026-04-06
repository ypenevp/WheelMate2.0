import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import "./global.css";
import { DATA } from "@env"

export default function App() {
  return (
    <View style={styles.container}>
      <Text className="text-lg font-bold text-blue-500">Welcome to Legendss Team!</Text>
      <Text className="text-lg font-bold text-blue-500">{DATA}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
