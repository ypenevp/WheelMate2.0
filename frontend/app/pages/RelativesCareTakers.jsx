import { Text, View, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

import { AddRelative } from '../services/wheelChair';
 
export default function RelativesCareTakers() {
    const [relativeEmail, setRelativeEmail] = useState('');
    const [relativeLoading, setRelativeLoading] = useState(false);
    const [relativeFocus, setRelativeFocus] = useState(false);
 
    const handleAddRelative = async () => {
        if (!relativeEmail) { alert("Please enter the relative's email."); return; }
        setRelativeLoading(true);
        try {
            await AddRelative(relativeEmail);
            alert('Relative added successfully!');
            setRelativeEmail('');
        } catch (error) {
            alert('An error occurred while adding the relative.');
        } finally {
            setRelativeLoading(false);
        }
    };

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: '#f9fafb' }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 48 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            <View style={{ marginBottom: 28 }}>
                <Text style={{ fontSize: 26, fontWeight: '700', color: '#111827', letterSpacing: -0.5 }}>
                    Connections
                </Text>
                <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
                    Add relatives to your network
                </Text>
            </View>
 
            <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 22, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#f3f4f6' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#a3c0ff', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                        <Ionicons name="people" size={22} color="#2c5fb1" />
                    </View>
                    <View>
                        <Text style={{ fontSize: 17, fontWeight: '700', color: '#111827' }}>Add Relative</Text>
                        <Text style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>Link a family member by email</Text>
                    </View>
                </View>
 
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Email address</Text>
 
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 14, borderWidth: 1.5, borderColor: relativeFocus ? '#2c5fb1' : '#e5e7eb', paddingHorizontal: 14, paddingVertical: 2, marginBottom: 16 }}>
                    <Feather name="mail" size={16} color={relativeFocus ? '#2c5fb1' : '#9ca3af'} style={{ marginRight: 10 }} />
                    <TextInput
                        placeholder="relative@email.com"
                        placeholderTextColor="#d1d5db"
                        value={relativeEmail}
                        onChangeText={setRelativeEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onFocus={() => setRelativeFocus(true)}
                        onBlur={() => setRelativeFocus(false)}
                        style={{ flex: 1, fontSize: 15, color: '#111827', paddingVertical: 13 }}
                    />
                    {relativeEmail.length > 0 && (
                        <TouchableOpacity onPress={() => setRelativeEmail('')} activeOpacity={0.7}>
                            <Feather name="x-circle" size={16} color="#d1d5db" />
                        </TouchableOpacity>
                    )}
                </View>
 
                <TouchableOpacity
                    onPress={handleAddRelative}
                    activeOpacity={0.8}
                    style={{ backgroundColor: '#2f61b1', borderRadius: 14, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                >
                    <Feather name="user-plus" size={16} color="#fff" />
                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>
                        {relativeLoading ? 'Adding...' : 'Add Relative'}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}