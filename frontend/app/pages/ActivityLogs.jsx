import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function ActivityLogs() {

    const BLUE = '#2563eb';
    const BLUE_DARK = '#1e40af';

    // Dummy data , delete later!!!!.
    const [logData, setLogData] = useState([
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

    /* how to fetch (example):
    
    useEffect(() => {
        const fetchLogs = async () => {
            const data = await getActivityLogs();
            setLogData(data);
        };
        fetchLogs();
    }, []);
    */

    return (
        <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            <View style={{ backgroundColor: BLUE, paddingTop: 10, paddingBottom: 10, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Activity Logs</Text>
            </View>

            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 80 }}
                showsVerticalScrollIndicator={false}
            >
                {logData.map((dayGroup, index) => (
                    <View key={index} style={{ marginBottom: 30 }}>

                        {/* Day Separator */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                            <View style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
                            <Text style={{ marginHorizontal: 16, fontSize: 13, fontWeight: '700', color: '#9ca3af', letterSpacing: 1.2 }}>
                                {dayGroup.date}
                            </Text>
                            <View style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
                        </View>

                        {/* Logs for the Day */}
                        {dayGroup.logs.map((log) => {
                            const isSitting = log.action === 'sit';
                            const iconName = isSitting ? 'accessible' : 'directions-walk';
                            const iconColor = isSitting ? '#3b82f6' : '#10b981'; // Blue for sitting, Green for getting up
                            const bgColor = isSitting ? '#dbeafe' : '#dcfce7';
                            const actionText = isSitting ? 'User in wheelchair' : 'User got up from wheelchair';

                            return (
                                <View
                                    key={log.id}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: '#fff',
                                        borderRadius: 16,
                                        padding: 16,
                                        marginBottom: 12,
                                        borderWidth: 1,
                                        borderColor: '#f3f4f6',
                                        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1
                                    }}
                                >
                                    <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: bgColor, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                                        <MaterialIcons name={iconName} size={24} color={iconColor} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 2 }}>{log.time}</Text>
                                        <Text style={{ fontSize: 13, color: '#6b7280' }}>{actionText}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}