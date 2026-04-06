import { Text, View, ScrollView, TouchableOpacity, Touchable } from 'react-native';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useUserStore from '../../store/UserStore';
import { postWheelChair } from '../services/wheelChair';

export default function Home() {
    const navigation = useNavigation();
    const user = useUserStore((state) => state.user);

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: '#f9fafb' }}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
        >
            <View style={{ backgroundColor: '#1e40af', paddingTop: 54, paddingBottom: 36, paddingHorizontal: 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 22 }}>
                    <View style={{ width: 50, height: 50, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}>
                        <MaterialIcons name="accessible" size={26} color="#fff" />
                    </View>
                    <View>
                        <Text style={{ fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.5 }}>
                            WheelMate
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ade80' }} />
                            <Text style={{ fontSize: 12, color: '#4ade80', fontWeight: '500' }}>System online</Text>
                        </View>
                    </View>
                </View>

                <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 23, marginBottom: 24 }}>
                    Wheel Mate is your smart companion for wheelchair users, providing real-time monitoring, navigation, and a supportive community to enhance your mobility and independence.
                </Text>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                    { user?.role === "USER" && (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={postWheelChair}
                            style={{ flex: 1, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}
                        >
                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#1e40af' }}>+ Add Wheelchair</Text>
                        </TouchableOpacity>
                    
                    )}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('Monitoring')}
                        style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}
                    >
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Monitoring</Text>
                    </TouchableOpacity>

                </View>
            </View>



            <View style={{ paddingHorizontal: 20, marginTop: 32 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#9ca3af', letterSpacing: 1.4, marginBottom: 14 }}>
                    QUICK ACCESS
                </Text>

                {[
                    { icon: 'tablet-landscape', lib: 'ionicons', color: '#3b82f6', bg: '#dbeafe', title: 'Monitoring', desc: 'Live wheelchair data, speed, status and location.', route: 'Monitoring' },
                    { icon: 'location', lib: 'ionicons', color: '#22c55e', bg: '#dcfce7', title: 'Map & Navigation', desc: 'Real-time GPS tracking and accessible routing.', route: 'Map' },
                    { icon: 'people', lib: 'ionicons', color: '#8b5cf6', bg: '#ede9fe', title: 'Relatives & Caretakers', desc: 'Manage your connections and emergency contacts.', route: 'RelativesCareTakers' },
                ].map((item, i) => (
                    <TouchableOpacity
                        key={i}
                        activeOpacity={0.75}
                        onPress={() => navigation.navigate(item.route)}
                        style={{ backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1, borderWidth: 1, borderColor: '#f3f4f6' }}
                    >
                        <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: item.bg, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                            <Ionicons name={item.icon} size={22} color={item.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }}>{item.title}</Text>
                            <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 3, lineHeight: 17 }}>{item.desc}</Text>
                        </View>
                        <Feather name="chevron-right" size={18} color="#d1d5db" />
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}