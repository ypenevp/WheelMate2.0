import { API_URL } from "@env";
console.log("IP from env:", API_URL);
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function GetUserDetails() {
    try {
        const token = await AsyncStorage.getItem("access");

        const response = await fetch(`${API_URL}/api/v2/auth/get`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        });

        if (response.ok) {
            
            const data = await response.json();
            console.log("data from GetUserDetails:", data);
            return data;
            
        } else {
            throw new Error("Failed to fetch user data");
        }

    } catch(error) {
        console.error("Error fetching user data:", error);
        throw error;
    }
}