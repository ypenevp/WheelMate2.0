import { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Linking } from 'react-native';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import { deleteWheelChair, getWheelChair, updateWheelChair } from '../services/wheelChair.js';

export default function MyWheelChair() {
    const [wheelchair, setWheelchair] = useState(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchWheelchairData();
    }, []);

    const fetchWheelchairData = async () => {
        setIsLoading(true);
        try {
            const data = await getWheelChair();
            setWheelchair(data);
        } catch (error) {
            console.log("No wheelchair found or error fetching");
            setWheelchair(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditName = () => {
        setEditedName(wheelchair?.name || '');
        setIsEditModalVisible(true);
    };

    const handleSaveName = async () => {
        if (editedName.trim()) {
            try {
                await updateWheelChair(editedName.trim());
                setWheelchair({ ...wheelchair, name: editedName.trim() });
                setIsEditModalVisible(false);
                Alert.alert('Success', 'Wheelchair name updated successfully!');
            } catch (error) {
                Alert.alert('Error', 'Failed to update wheelchair name');
            }
        } else {
            Alert.alert('Error', 'Name cannot be empty');
        }
    };

    const handleDeleteWheelchair = async () => {
        setIsDeleteModalVisible(false);
        try {
            await deleteWheelChair();
            setWheelchair(null);
        } catch (error) {
            Alert.alert('Error', 'Failed to delete wheelchair');
        }
    };

    const openGPS = () => {
        if (wheelchair?.location) {
            Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${wheelchair.location}`);
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <MaterialIcons name="accessible" size={36} color="#3b82f6" />
                </View>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#6b7280' }}>Loading wheelchair data...</Text>
            </View>
        );
    }

    if (!wheelchair) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40, flex: 1, justifyContent: 'center' }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                        <View style={{ width: 96, height: 96, borderRadius: 24, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                            <MaterialIcons name="accessible" size={48} color="#d1d5db" />
                        </View>
                        <Text style={{ fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 }}>No Wheelchair Found</Text>
                        <Text style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center', paddingHorizontal: 40 }}>
                            You haven't registered a wheelchair yet. Add one to start tracking.
                        </Text>
                    </View>
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 26, fontWeight: '700', color: '#111827', letterSpacing: -0.5 }}>
                        My Wheelchair
                    </Text>
                    <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
                        Manage your smart wheelchair device
                    </Text>
                </View>

                <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 24, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4, borderWidth: 1, borderColor: '#f3f4f6' }}>
                    <View style={{ alignItems: 'center', marginBottom: 20 }}>
                        <View style={{ width: 80, height: 80, borderRadius: 20, backgroundColor: wheelchair.panic ? '#fef2f2' : '#eff6ff', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 3, borderColor: wheelchair.panic ? '#fecaca' : '#bfdbfe' }}>
                            <MaterialIcons name="accessible" size={42} color={wheelchair.panic ? '#ef4444' : '#3b82f6'} />
                        </View>
                        <Text style={{ fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 4 }}>
                            {wheelchair.name}
                        </Text>
                        <View style={{ paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, backgroundColor: wheelchair.panic ? '#fef2f2' : '#f0fdf4', borderWidth: 1, borderColor: wheelchair.panic ? '#fecaca' : '#bbf7d0', marginBottom: 8 }}>
                            <Text style={{ fontSize: 12, fontWeight: '700', color: wheelchair.panic ? '#ef4444' : '#16a34a' }}>
                                {wheelchair.panic ? 'Panic Mode Active' : 'Normal Status'}
                            </Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TouchableOpacity
                            style={{ flex: 1, backgroundColor: '#3b82f6', borderRadius: 14, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                            onPress={handleEditName}
                            activeOpacity={0.8}
                        >
                            <Feather name="edit-2" size={16} color="#fff" />
                            <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Edit Name</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ flex: 1, backgroundColor: '#f3f4f6', borderRadius: 14, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#e5e7eb' }}
                            onPress={openGPS}
                            disabled={!wheelchair.location}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="location" size={16} color={wheelchair.location ? "#3b82f6" : "#9ca3af"} />
                            <Text style={{ fontSize: 15, fontWeight: '700', color: wheelchair.location ? '#3b82f6' : '#9ca3af' }}>View GPS</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={{ fontSize: 12, fontWeight: '700', color: '#9ca3af', letterSpacing: 1.5, marginBottom: 12, marginLeft: 4 }}>
                    DEVICE STATUS
                </Text>

                <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#f3f4f6' }}>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <View style={{ flex: 1, backgroundColor: '#f9fafb', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#f3f4f6' }}>
                            <Ionicons name="person" size={24} color="#8b5cf6" style={{ marginBottom: 6 }} />
                            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>
                                {wheelchair.userInChair ? 'Yes' : 'No'}
                            </Text>
                            <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>User In Chair</Text>
                        </View>

                        <View style={{ flex: 1, backgroundColor: '#f9fafb', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#f3f4f6' }}>
                            <Ionicons name="location" size={24} color="#10b981" style={{ marginBottom: 6 }} />
                            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>
                                {wheelchair.location || 'N/A'}
                            </Text>
                            <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Location</Text>
                        </View>
                    </View>
                </View>

                <View style={{ backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#fee2e2' }}>
                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 }}
                        onPress={() => setIsDeleteModalVisible(true)}
                        activeOpacity={0.7}
                    >
                        <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                            <Feather name="trash-2" size={18} color="#ef4444" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 16, fontWeight: '600', color: '#ef4444' }}>Delete Wheelchair</Text>
                            <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>This action cannot be undone</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal
                visible={isEditModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsEditModalVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
                    <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '100%', maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                <Feather name="edit-2" size={20} color="#3b82f6" />
                            </View>
                            <Text style={{ fontSize: 20, fontWeight: '700', color: '#111827', flex: 1 }}>Edit Name</Text>
                            <TouchableOpacity
                                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}
                                onPress={() => setIsEditModalVisible(false)}
                            >
                                <Ionicons name="close" size={18} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Wheelchair Name</Text>
                        <TextInput
                            style={{ backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#111827', borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 20 }}
                            value={editedName}
                            onChangeText={setEditedName}
                            placeholder="Enter wheelchair name"
                            placeholderTextColor="#9ca3af"
                        />

                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity
                                style={{ flex: 1, backgroundColor: '#f3f4f6', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' }}
                                onPress={() => setIsEditModalVisible(false)}
                                activeOpacity={0.8}
                            >
                                <Text style={{ fontSize: 15, fontWeight: '700', color: '#6b7280' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ flex: 1, backgroundColor: '#3b82f6', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
                                onPress={handleSaveName}
                                activeOpacity={0.8}
                            >
                                <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={isDeleteModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsDeleteModalVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
                    <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '100%', maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                <Feather name="alert-triangle" size={22} color="#ef4444" />
                            </View>
                            <Text style={{ fontSize: 20, fontWeight: '700', color: '#111827', flex: 1 }}>Delete Wheelchair</Text>
                        </View>

                        <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 24, lineHeight: 20 }}>
                            Are you sure you want to delete this wheelchair? This action cannot be undone and all associated data will be permanently removed.
                        </Text>

                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity
                                style={{ flex: 1, backgroundColor: '#f3f4f6', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' }}
                                onPress={() => setIsDeleteModalVisible(false)}
                                activeOpacity={0.8}
                            >
                                <Text style={{ fontSize: 15, fontWeight: '700', color: '#6b7280' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ flex: 1, backgroundColor: '#ef4444', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
                                onPress={handleDeleteWheelchair}
                                activeOpacity={0.8}
                            >
                                <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}