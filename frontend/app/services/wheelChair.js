import { API_URL } from '@env'
import AsyncStorage from "@react-native-async-storage/async-storage";

export const postWheelChair = async (wheelchairName) => {
    try {
        const token = await AsyncStorage.getItem("access");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_URL}/api/v2/wheelchair/add`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: wheelchairName })
        });

        console.log("POST status:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("POST error:", errorText);
            throw new Error(errorText);
        }
        alert("Wheelchair added successfully!");

        const data = await response.json();
        console.log("Created wheelchair:", data);

        return data;

    } catch (error) {
        console.error("POST wheelchair error:", error);
        throw error;
    }
};

export const getWheelChair = async () => {
    try {
        const token = await AsyncStorage.getItem("access");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_URL}/api/v2/wheelchair/my`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        });
        
        console.log("GET status:", response.status);
        if (response.ok) {
            const data = await response.json();
            console.log("Fetched wheelchair data:", data);
            return data;
        } else {
            const errorText = await response.text();
            console.error("GET error:", errorText);
            throw new Error(errorText);
        }
    } catch (error) {
        console.error("GET wheelchair error:", error);
        throw error;
    }
};

export const updateWheelChair = async (newName) => {
    try {
        const token = await AsyncStorage.getItem("access");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_URL}/api/v2/wheelchair/update`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: newName })
        });
        
        console.log("PATCH status:", response.status);
        if (response.ok) {
            const data = await response.json();
            console.log("Updated wheelchair data:", data);
            return data;
        } else {
            const errorText = await response.text();
            console.error("PATCH error:", errorText);
            throw new Error(errorText);
        }
    } catch (error) {
        console.error("PATCH wheelchair error:", error);
        throw error;
    }
};

export const deleteWheelChair = async () => {
    try {
        const token = await AsyncStorage.getItem("access");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_URL}/api/v2/wheelchair/delete`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        });
        
        console.log("DELETE status:", response.status);
        if (!response.ok) {
            const errorText = await response.text();
            console.error("DELETE error:", errorText);
            throw new Error(errorText);
        }
        alert("Wheelchair deleted successfully!");
        return true;
        
    } catch (error) {
        console.error("DELETE wheelchair error:", error);
        throw error;
    }
};

export const getAllWheelChair = async() => {
    try {
        const token = await AsyncStorage.getItem("access");

        if(!token){
            console.error("No token found")
            return [];
        }

        const response = await fetch(`${API_URL}/api/v2/wheelchair/relative/my-tracked`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        });

        if (response.ok){
            const data = await response.json();
            console.log("Wheelchairs data fetched successfully");
            return data;
        } else {
            const errorText = await response.text();
            console.error("Server Error Status:", response.status);
            console.error("Server Error Body:", errorText);
            throw new Error(`Failed to fetch wheelchairs: ${response.status}`);
        }
    } catch (error) {
        console.error("Error fetching wheelchairs data:", error);
        throw error;
    }
}

export async function AddRelative(email){
    try {
        const token = await AsyncStorage.getItem("access");

        const response = await fetch(`${API_URL}/api/v2/wheelchair/add-relative`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                relativeEmail: email
            })
        });

        if (response.ok){
            const data = await response.text(); 
            return data;
        } else {
            const err = await response.text();
            throw new Error(`Failed to add relative: ${err}`);
        }
    } catch (error) {
        console.error("Error adding relative:", error);
        throw error;
    }
}

export async function GetAllRelatives(){
    try {
        const token = await AsyncStorage.getItem("access");

        const response = await fetch(`${API_URL}/api/v2/wheelchair/getallrel`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.ok){
            const data = await response.json();
            return data;
        } else {
            throw new Error("Failed to fetch relatives");
        }
    } catch (error) {
        console.error("Error fetching relatives data:", error);
        throw error;
    }
}

