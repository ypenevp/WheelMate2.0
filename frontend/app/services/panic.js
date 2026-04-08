import { API_URL } from '@env'
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function GetPanics() {
    try {
        const token = await AsyncStorage.getItem("access");

        if(!token){
            console.error("No token found")
            return [];
        }

        const response = await fetch(`${API_URL}/api/v2/panic/relative/my-tracked`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        });

        if (response.ok){
            const data = await response.json();
            console.log("Panic logs data fetched successfully");
            return data;
        } else {
            const errorText = await response.text();
            console.error("Server Error Status:", response.status);
            console.error("Server Error Body:", errorText);
            throw new Error(`Failed to fetch panic logs: ${response.status}`);
        }
    } catch (error) {
        console.error("Error fetching panic logs data:", error);
        throw error;
    }
}

export async function GetFakePanics() {
    try {
        const token = await AsyncStorage.getItem("access");

        if(!token){
            console.error("No token found")
            return [];
        }

        const response = await fetch(`${API_URL}/api/v2/fakepanic/relative/my-tracked`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        });

        if (response.ok){
            const data = await response.json();
            console.log("Fake panic logs data fetched successfully");
            return data;
        } else {
            const errorText = await response.text();
            console.error("Server Error Status:", response.status);
            console.error("Server Error Body:", errorText);
            throw new Error(`Failed to fetch fake panic logs: ${response.status}`);
        }
    } catch (error) {
        console.error("Error fetching fake panic logs data:", error);
        throw error;
    }
}