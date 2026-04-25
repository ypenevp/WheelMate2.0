import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import webSocketService from '../services/websocket';
import { GetAllTrackedWheelchairsWithLogs } from "../services/relativeActivityLogs";
import { getAllWheelChair } from "../services/wheelChair";

export default function ActivityLogs() {
    const [activeTab, setActiveTab] = useState("mobility");
    const [selectedWheelchairIndex, setSelectedWheelchairIndex] = useState(0);

    const [allActivityLogs, setAllActivityLogs] = useState([]);
    const [trackedWheelchairs, setTrackedWheelchairs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const formatActivityPeriodsByDay = (activityPeriods) => {
        if (!activityPeriods || activityPeriods.length === 0) {
            return [];
        }

        const grouped = {};

        activityPeriods.forEach((period) => {
            const date = period.date;
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push({
                action: period.action,
                time: period.time,
                timestamp: period.timestamp
            });
        });

        return Object.keys(grouped).map((date) => ({
            date: formatDate(date),
            logs: grouped[date]
        }));
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        } catch (e) {
            return dateString;
        }
    };

    const formatDuration = (seconds) => {
        if (!seconds) return "0s";

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    };

    const fetchAllData = async () => {
        try {
            setLoading(true);

            const wheelchairs = await getAllWheelChair();
            setTrackedWheelchairs(wheelchairs);

            const logs = await GetAllTrackedWheelchairsWithLogs();
            setAllActivityLogs(logs);

            console.log("Data fetched successfully");
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            await fetchAllData();
        } catch (error) {
            console.error("Error refreshing:", error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

        useEffect(() => {
        const subscriptions = [];

        const mobilitySub = webSocketService.subscribe('/topic/mobilities', () => {
            console.log("Mobility update received via WebSocket");
            fetchAllData();
        });

        if (allActivityLogs.length > 0) {
            allActivityLogs.forEach((log) => {
                if (log.wheelchairId) {
                    const sub = webSocketService.subscribe(
                        `/topic/activity-logs/${log.wheelchairId}`,
                        () => {
                            console.log(`Activity logs update for wheelchair ${log.wheelchairId}`);
                            fetchAllData();
                        }
                    );
                    subscriptions.push(sub);
                }
            });
        }

        return () => {
            if (mobilitySub && typeof mobilitySub.unsubscribe === 'function') {
                mobilitySub.unsubscribe();
            }
            
            subscriptions.forEach(sub => {
                if (sub && typeof sub.unsubscribe === 'function') {
                    sub.unsubscribe();
                }
            });
        };
    }, [allActivityLogs]);

    const isMobility = activeTab === "mobility";

    const currentWheelchair = trackedWheelchairs[selectedWheelchairIndex];
    const currentActivityLog = allActivityLogs[selectedWheelchairIndex];

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f5f7fb', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#7c3aed" />
                <Text style={{ marginTop: 12, fontSize: 14, color: '#64748b' }}>Loading activity logs...</Text>
            </View>
        );
    }

    if (trackedWheelchairs.length === 0) {
        return (
            <ScrollView style={{ flex: 1, backgroundColor: '#f5f7fb' }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 48 }}>
                <View style={{ marginBottom: 28 }}>
                    <Text style={{ fontSize: 26, fontWeight: '700', color: '#0f172a', letterSpacing: -0.5 }}>
                        Activity Logs
                    </Text>
                </View>
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 64 }}>
                    <MaterialIcons name="wheelchair-pickup" size={64} color="#e2e8f0" style={{ marginBottom: 16 }} />
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 8 }}>No wheelchairs tracked</Text>
                    <Text style={{ fontSize: 14, color: '#64748b', textAlign: 'center' }}>
                        You are not tracking any wheelchairs yet. Ask someone to add you as a relative.
                    </Text>
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: '#f5f7fb' }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 48 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    tintColor="#7c3aed"
                    colors={["#7c3aed"]}
                />
            }
        >
            <View style={{ marginBottom: 28 }}>
                <Text style={{ fontSize: 26, fontWeight: '700', color: '#0f172a', letterSpacing: -0.5 }}>
                    Activity Logs
                </Text>
                <Text style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
                    Tracking {trackedWheelchairs.length} {trackedWheelchairs.length === 1 ? "wheelchair" : "wheelchairs"}
                </Text>
            </View>

            {trackedWheelchairs.length > 1 && (
                <View style={{ marginBottom: 24, backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e2e8f0' }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Select Wheelchair
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -12 }}>
                        {trackedWheelchairs.map((wheelchair, index) => (
                            <TouchableOpacity
                                key={wheelchair.id}
                                onPress={() => setSelectedWheelchairIndex(index)}
                                style={{
                                    paddingVertical: 10,
                                    paddingHorizontal: 14,
                                    marginHorizontal: 6,
                                    borderRadius: 10,
                                    backgroundColor: selectedWheelchairIndex === index ? '#7c3aed' : '#f1f5f9',
                                    borderWidth: 1,
                                    borderColor: selectedWheelchairIndex === index ? '#7c3aed' : '#e2e8f0'
                                }}
                            >
                                <Text style={{
                                    fontSize: 13,
                                    fontWeight: '600',
                                    color: selectedWheelchairIndex === index ? '#fff' : '#0f172a'
                                }}>
                                    {wheelchair.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

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
                        Mobility Periods
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
                        Daily Activity
                    </Text>
                </TouchableOpacity>
            </View>

            {isMobility ? (
                <View style={{ gap: 12 }}>
                    {!currentActivityLog || !currentActivityLog.mobilityLogs || currentActivityLog.mobilityLogs.length === 0 ? (
                        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
                            <MaterialIcons name="health-and-safety" size={48} color="#e2e8f0" style={{ marginBottom: 12 }} />
                            <Text style={{ fontSize: 15, fontWeight: '500', color: '#94a3b8' }}>No mobility logs found</Text>
                        </View>
                    ) : (
                        currentActivityLog.mobilityLogs.map((log, i) => (
                            <View
                                key={log.id || i}
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
                                            {currentWheelchair?.name || currentActivityLog.wheelchairName || 'Wheelchair'}
                                        </Text>
                                        <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                                            {log.inWheelchair ? 'User in wheelchair' : 'User outside wheelchair'}
                                        </Text>
                                    </View>
                                </View>

                                {log.inWheelchair && (
                                    <View style={{ backgroundColor: '#ffee97', padding: 10, borderRadius: 10, marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
                                        <MaterialIcons name="warning" size={18} color="#ff8522" style={{ marginRight: 8 }} />
                                        <Text style={{ fontSize: 13, fontWeight: '500', color: '#c57417', flex: 1 }}>
                                            User has been in the wheelchair for {formatDuration(log.durationSeconds)}.
                                        </Text>
                                    </View>
                                )}

                                <Text style={{ fontSize: 12, fontWeight: '600', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
                                    Duration & Timeline
                                </Text>

                                <View style={{ backgroundColor: 'rgba(255,255,255,0.6)', padding: 12, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <View style={{ gap: 8 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <MaterialIcons name="play-circle-outline" size={16} color="#7c3aed" />
                                            <Text style={{ fontSize: 14, fontWeight: '500', color: '#334155' }}>
                                                Start: {log.startTime ? new Date(log.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                            </Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <MaterialIcons name="stop-circle" size={16} color="#7c3aed" />
                                            <Text style={{ fontSize: 14, fontWeight: '500', color: '#334155' }}>
                                                End: {log.endTime ? new Date(log.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ongoing'}
                                            </Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                            <MaterialIcons name="schedule" size={16} color="#7c3aed" />
                                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#7c3aed' }}>
                                                Duration: {formatDuration(log.durationSeconds)}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={{ fontSize: 12, fontWeight: '500', color: '#94a3b8' }}>
                                        {log.startTime ? new Date(log.startTime).toLocaleDateString() : ''}
                                    </Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            ) : (
                <View>
                    {!currentActivityLog || !currentActivityLog.activityPeriods || currentActivityLog.activityPeriods.length === 0 ? (
                        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
                            <MaterialIcons name="directions-walk" size={48} color="#e2e8f0" style={{ marginBottom: 12 }} />
                            <Text style={{ fontSize: 15, fontWeight: '500', color: '#94a3b8' }}>No activity found</Text>
                        </View>
                    ) : (
                        formatActivityPeriodsByDay(currentActivityLog.activityPeriods).map((dayGroup, index) => (
                            <View key={index} style={{ marginBottom: 24 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                    <View style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
                                    <Text style={{ marginHorizontal: 16, fontSize: 12, fontWeight: '700', color: '#94a3b8', letterSpacing: 1.2 }}>
                                        {dayGroup.date}
                                    </Text>
                                    <View style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
                                </View>

                                <View style={{ gap: 10 }}>
                                    {dayGroup.logs.map((log, i) => {
                                        const isSitting = log.action === 'sit';
                                        const iconName = isSitting ? 'event-seat' : 'directions-walk';
                                        const iconColor = isSitting ? '#0ea5e9' : '#10b981';
                                        const bgColor = isSitting ? '#e0f2fe' : '#d1fae5';
                                        const cardBg = isSitting ? '#f0f9ff' : '#ecfdf5';
                                        const borderCol = isSitting ? '#bae6fd' : '#a7f3d0';
                                        const actionText = isSitting ? 'User in wheelchair' : 'User got up from wheelchair';

                                        return (
                                            <View
                                                key={log.timestamp || i}
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
                                                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 2 }}>
                                                        {log.time}
                                                    </Text>
                                                    <Text style={{ fontSize: 13, color: '#64748b' }}>
                                                        {actionText}
                                                    </Text>
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