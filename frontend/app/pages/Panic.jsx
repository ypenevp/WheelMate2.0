import { use, useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { GetPanics, GetFakePanics } from "../services/panic";

export default function Panic() {
    const [activeTab, setActiveTab] = useState("panic");
    const [panics, setPanics] = useState([]);
    const [fakePanics, setFakePanics] = useState([]);

    const logs = activeTab === "panic" ? panics : fakePanics;
    const isPanic = activeTab === "panic";

    useEffect(() => {
        async function fetchPanics() {
            try {
                const panicsData = await GetPanics();
                console.log("Fetched panic logs:", panicsData);
                
                const sortedPanics = panicsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setPanics(sortedPanics);
            } catch (error) {
                console.error("Error fetching panic logs:", error);
            }
        }
        fetchPanics();

        async function fetchFakePanics() {
            try {
                const fakePanicsData = await GetFakePanics();
                console.log("Fetched fake panic logs:", fakePanicsData);
                
                const sortedFakePanics = fakePanicsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setFakePanics(sortedFakePanics);
            } catch (error) {
                console.error("Error fetching fake panic logs:", error);
            }
        }
        fetchFakePanics();
    }, []);


    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: '#f9fafb' }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 48 }}
            showsVerticalScrollIndicator={false}
        >
            <View style={{ marginBottom: 28 }}>
                <Text style={{ fontSize: 26, fontWeight: '700', color: '#111827', letterSpacing: -0.5 }}>
                    {isPanic ? "Panic Logs" : "Fake Panic Logs"}
                </Text>
                <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
                    {logs.length} {logs.length === 1 ? "record" : "records"} found
                </Text>
            </View>

            <View style={{ flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 14, padding: 4, marginBottom: 20 }}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setActiveTab("panic")}
                    style={{
                        flex: 1, paddingVertical: 12, borderRadius: 12,
                        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                        backgroundColor: isPanic ? '#fff' : 'transparent',
                        shadowColor: isPanic ? '#000' : 'transparent', shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: isPanic ? 0.05 : 0, shadowRadius: 3, elevation: isPanic ? 1 : 0,
                    }}
                >
                    <Feather name="alert-triangle" size={16} color={isPanic ? '#ef4444' : '#9ca3af'} />
                    <Text style={{ fontSize: 14, fontWeight: '600', color: isPanic ? '#ef4444' : '#6b7280' }}>
                        Panic
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setActiveTab("fake")}
                    style={{
                        flex: 1, paddingVertical: 12, borderRadius: 12,
                        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                        backgroundColor: !isPanic ? '#fff' : 'transparent',
                        shadowColor: !isPanic ? '#000' : 'transparent', shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: !isPanic ? 0.05 : 0, shadowRadius: 3, elevation: !isPanic ? 1 : 0,
                    }}
                >
                    <Feather name="shield-off" size={16} color={!isPanic ? '#f59e0b' : '#9ca3af'} />
                    <Text style={{ fontSize: 14, fontWeight: '600', color: !isPanic ? '#f59e0b' : '#6b7280' }}>
                        Fake Panic
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={{ gap: 12 }}>
                {logs.length === 0 ? (
                    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
                        <MaterialIcons name="accessible" size={48} color="#e5e7eb" style={{ marginBottom: 12 }} />
                        <Text style={{ fontSize: 15, fontWeight: '500', color: '#9ca3af' }}>No logs found</Text>
                    </View>
                ) : (
                    logs.map((log) => (
                        <View
                            key={log.id}
                            style={{
                                backgroundColor: isPanic ? "#fef2f2" : "#fffbeb",
                                borderRadius: 18, padding: 18,
                                borderWidth: 1, borderColor: isPanic ? "#fecaca" : "#fde68a",
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                <View style={{
                                    width: 46, height: 46, borderRadius: 14,
                                    backgroundColor: isPanic ? "#fee2e2" : "#fef3c7",
                                    alignItems: 'center', justifyContent: 'center', marginRight: 12
                                }}>
                                    {isPanic
                                        ? <Feather name="alert-triangle" size={22} color="#ef4444" />
                                        : <Feather name="shield-off" size={22} color="#f59e0b" />
                                    }
                                </View>
                                <View>
                                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>
                                        {log.wheelchair.name}
                                    </Text>
                                    <Text style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>
                                        {isPanic ? "Panic Event" : "False Alarm"}
                                    </Text>
                                </View>
                            </View>

                            <View style={{ gap: 8, backgroundColor: 'rgba(255,255,255,0.4)', padding: 12, borderRadius: 12 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Feather name="user" size={14} color="#6b7280" />
                                    <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>
                                        {log.userInChair ? "User is in chair" : "User is not in chair"}
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Ionicons name="location-outline" size={15} color="#6b7280" />
                                    <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>
                                        {log.location}
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Feather name="clock" size={14} color="#6b7280" />
                                    <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>
                                        {new Date(log.timestamp).toLocaleString()}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}
