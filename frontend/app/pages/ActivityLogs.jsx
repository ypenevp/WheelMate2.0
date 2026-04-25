import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import webSocketService from '../services/websocket';
import { GetMobilityData } from "../services/mobility";

export default function Panic() {
    const [activeTab, setActiveTab] = useState("mobility");
    const [mobilityData, setMobilityData] = useState([]);
    const [activityLogs, setActivityLogs] = useState([
        {
            date: '25/04/2026',
            logs: [
                { id: 1, time: '08:00', action: 'sit' },
                { id: 2, time: '08:30', action: 'up' },
                { id: 3, time: '14:15', action: 'sit' },
            ]
        },
        {
            date: '26/04/2026',
            logs: [
                { id: 4, time: '09:00', action: 'up' },
                { id: 5, time: '11:30', action: 'sit' },
            ]
        }
    ]);

    const isMobility = activeTab === "mobility";

    const fetchMobilityData = async () => {
        try {
            const mobilityData = await GetMobilityData();
            const sortedMobilityData = mobilityData.sort((a, b) => new Date(b.starttime) - new Date(a.starttime));
            setMobilityData(sortedMobilityData);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchMobilityData();
    }, []);

    useEffect(() => {
        const mobilitySub = webSocketService.subscribe('/topic/mobilities', () => {
            fetchMobilityData();
        });

        return () => {
            mobilitySub.unsubscribe();
        };
    }, []);

    const totalActivityLogs = activityLogs.reduce((sum, day) => sum + day.logs.length, 0);
    const recordsCount = isMobility ? mobilityData.length : totalActivityLogs;

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: '#f5f7fb' }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 48 }}
            showsVerticalScrollIndicator={false}
        >
            <View style={{ marginBottom: 28 }}>
                <Text style={{ fontSize: 26, fontWeight: '700', color: '#0f172a', letterSpacing: -0.5 }}>
                    Activity Logs
                </Text>
                <Text style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
                    {recordsCount} {recordsCount === 1 ? "record" : "records"} found
                </Text>
            </View>

            <View style={{ flexDirection: 'row', backgroundColor: '#eef2ff', borderRadius: 14, padding: 4, marginBottom: 20 }}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setActiveTab("mobility")}
                    style={{
                        flex: 1, paddingVertical: 12, borderRadius: 12,
                        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                        backgroundColor: isMobility ? '#fff' : 'transparent',
                        shadowColor: isMobility ? '#000' : 'transparent', shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: isMobility ? 0.05 : 0, shadowRadius: 3, elevation: isMobility ? 1 : 0,
                    }}
                >
                    <MaterialIcons name="health-and-safety" size={16} color={isMobility ? '#7c3aed' : '#94a3b8'} />
                    <Text style={{ fontSize: 14, fontWeight: '600', color: isMobility ? '#7c3aed' : '#64748b' }}>
                        Mobility
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setActiveTab("activity")}
                    style={{
                        flex: 1, paddingVertical: 12, borderRadius: 12,
                        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                        backgroundColor: !isMobility ? '#fff' : 'transparent',
                        shadowColor: !isMobility ? '#000' : 'transparent', shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: !isMobility ? 0.05 : 0, shadowRadius: 3, elevation: !isMobility ? 1 : 0,
                    }}
                >
                    <MaterialIcons name="directions-walk" size={16} color={!isMobility ? '#0ea5e9' : '#94a3b8'} />
                    <Text style={{ fontSize: 14, fontWeight: '600', color: !isMobility ? '#0ea5e9' : '#64748b' }}>
                        Activity
                    </Text>
                </TouchableOpacity>
            </View>

            {isMobility ? (
                <View style={{ gap: 12 }}>
                    {mobilityData.length === 0 ? (
                        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
                            <MaterialIcons name="health-and-safety" size={48} color="#e2e8f0" style={{ marginBottom: 12 }} />
                            <Text style={{ fontSize: 15, fontWeight: '500', color: '#94a3b8' }}>No logs found</Text>
                        </View>
                    ) : (
                        mobilityData.map((log) => (
                            <View
                                key={log.id}
                                style={{
                                    backgroundColor: '#f5f3ff',
                                    borderRadius: 18, padding: 18,
                                    borderWidth: 1, borderColor: '#ddd6fe',
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                    <View style={{
                                        width: 46, height: 46, borderRadius: 14,
                                        backgroundColor: '#ede9fe',
                                        alignItems: 'center', justifyContent: 'center', marginRight: 12
                                    }}>
                                        <MaterialIcons name="health-and-safety" size={22} color="#7c3aed" />
                                    </View>
                                    <View>
                                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a' }}>
                                            {log.wheelchair.name}
                                        </Text>
                                    </View>
                                </View>

                                <View style={{ backgroundColor: '#ffee97', padding: 10, borderRadius: 10, marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
                                    <MaterialIcons name="warning" size={18} color="#ff8522" style={{ marginRight: 8 }} />
                                    <Text style={{ fontSize: 13, fontWeight: '500', color: '#c57417', flex: 1 }}>
                                        The user has been sitting in the wheelchair for an extended period without movement.
                                    </Text>
                                </View>

                                <Text style={{ fontSize: 12, fontWeight: '600', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
                                    Duration
                                </Text>

                                <View style={{ backgroundColor: 'rgba(255,255,255,0.6)', padding: 12, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <View style={{ gap: 8 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <MaterialIcons name="play-circle-outline" size={16} color="#7c3aed" />
                                            <Text style={{ fontSize: 14, fontWeight: '500', color: '#334155' }}>
                                                Start: {new Date(log.starttime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <MaterialIcons name="stop-circle" size={16} color="#7c3aed" />
                                            <Text style={{ fontSize: 14, fontWeight: '500', color: '#334155' }}>
                                                End: {new Date(log.finishtime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text style={{ fontSize: 12, fontWeight: '500', color: '#94a3b8' }}>
                                        {new Date(log.starttime).toLocaleDateString()}
                                    </Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            ) : (
                <View>
                    {activityLogs.length === 0 ? (
                        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
                            <MaterialIcons name="directions-walk" size={48} color="#e2e8f0" style={{ marginBottom: 12 }} />
                            <Text style={{ fontSize: 15, fontWeight: '500', color: '#94a3b8' }}>No logs found</Text>
                        </View>
                    ) : (
                        activityLogs.map((dayGroup, index) => (
                            <View key={index} style={{ marginBottom: 24 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                    <View style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
                                    <Text style={{ marginHorizontal: 16, fontSize: 12, fontWeight: '700', color: '#94a3b8', letterSpacing: 1.2 }}>
                                        {dayGroup.date}
                                    </Text>
                                    <View style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
                                </View>

                                <View style={{ gap: 10 }}>
                                    {dayGroup.logs.map((log) => {
                                        const isSitting = log.action === 'sit';
                                        const iconName = isSitting ? 'event-seat' : 'directions-walk';
                                        const iconColor = isSitting ? '#0ea5e9' : '#10b981';
                                        const bgColor = isSitting ? '#e0f2fe' : '#d1fae5';
                                        const cardBg = isSitting ? '#f0f9ff' : '#ecfdf5';
                                        const borderCol = isSitting ? '#bae6fd' : '#a7f3d0';
                                        const actionText = isSitting ? 'User in wheelchair' : 'User got up from wheelchair';

                                        return (
                                            <View
                                                key={log.id}
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    backgroundColor: cardBg,
                                                    borderRadius: 16,
                                                    padding: 16,
                                                    borderWidth: 1,
                                                    borderColor: borderCol,
                                                }}
                                            >
                                                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: bgColor, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                                                    <MaterialIcons name={iconName} size={24} color={iconColor} />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 2 }}>{log.time}</Text>
                                                    <Text style={{ fontSize: 13, color: '#64748b' }}>{actionText}</Text>
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        ))
                    )}
                </View>
            )}
        </ScrollView>
    );
}