import { API_URL } from '@env'
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function GetAllTrackedWheelchairsWithLogs() {
    try {
        const token = await AsyncStorage.getItem("access");

        if (!token) {
            console.error("No token found");
            return [];
        }

        const wheelchairsResponse = await fetch(`${API_URL}/api/v2/wheelchair/relative/my-tracked`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        });

        if (!wheelchairsResponse.ok) {
            throw new Error(`Failed to fetch wheelchairs: ${wheelchairsResponse.status}`);
        }

        const wheelchairs = await wheelchairsResponse.json();
        console.log("Wheelchairs fetched:", wheelchairs.length);

        const allActivityLogs = await Promise.all(
            wheelchairs.map(async (wheelchair) => {
                try {
                    const userId = wheelchair.owner?.id || wheelchair.ownerId;

                    const logsResponse = await fetch(
                        `${API_URL}/api/v2/mobility/relative/activity-logs/${userId}`,
                        {
                            method: "GET",
                            headers: {
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            },
                        }
                    );

                    if (logsResponse.ok) {
                        const logData = await logsResponse.json();
                        console.log(`Activity logs fetched for wheelchair ${wheelchair.id}`);
                        return logData;
                    } else {
                        const errorText = await logsResponse.text();
                        console.warn(`Failed to fetch logs for wheelchair ${wheelchair.id}: ${errorText}`);
                        return null;
                    }
                } catch (error) {
                    console.error(`Error fetching logs for wheelchair:`, error);
                    return null;
                }
            })
        );

        return allActivityLogs.filter(log => log !== null);

    } catch (error) {
        console.error("Error in GetAllTrackedWheelchairsWithLogs:", error);
        throw error;
    }
}
