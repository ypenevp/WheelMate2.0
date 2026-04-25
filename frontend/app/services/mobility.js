import { API_URL } from '@env'
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function GetMobilityData() {
    try {
        const token = await AsyncStorage.getItem("access");

        if(!token){
            console.error("No token found")
            return [];
        }

        const response = await fetch(`${API_URL}/api/v2/mobility/relative/my-tracked`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        });

        if (response.ok){
            const data = await response.json();
            console.log("Mobility data fetched successfully");
            return data;
        } else {
            const errorText = await response.text();
            console.error("Server Error Status:", response.status);
            console.error("Server Error Body:", errorText);
            throw new Error(`Failed to fetch mobility data: ${response.status}`);
        }
    } catch (error) {
        console.error("Error fetching mobility data:", error);
        throw error;
    }
}