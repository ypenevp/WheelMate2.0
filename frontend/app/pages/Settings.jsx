import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import "../global.css";
import PersonalInfoModal from '../components/PersonalInfo.jsx';
import useAuthStore from '../../store/AuthStore.js';
import useUserStore from '../../store/UserStore.js';
import { GetUserProfileDetails } from '../services/userDetails.js';

const mockUser = {
    name: 'Borislav Stoinev',
    email: 'borislav@example.com',
    role: 'Random User',
};

const SettingRow = ({ icon, label, value, trailing, onPress, destructive, isCheckbox, isChecked, onCheckChange }) => (
    <TouchableOpacity
        style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 14,
            gap: 14,
            ...(destructive && { justifyContent: 'center' })
        }}
        onPress={isCheckbox ? () => onCheckChange(!isChecked) : onPress}
        activeOpacity={0.7}
    >
        <View style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: destructive ? 'rgba(239,68,68,0.1)' : '#f3f4f6',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            {icon}
        </View>

        <Text style={{
            flex: 1,
            fontSize: 16,
            fontWeight: '500',
            color: destructive ? '#ef4444' : '#111827',
        }}>
            {label}
        </Text>

        {value && !isCheckbox && !trailing && (
            <Text style={{
                fontSize: 14,
                color: '#9ca3af',
                marginRight: 4,
            }}>
                {value}
            </Text>
        )}

        {trailing}

        {!trailing && !destructive && isCheckbox && (
            <View style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                borderWidth: 2,
                borderColor: isChecked ? '#3b82f6' : '#d1d5db',
                backgroundColor: isChecked ? '#3b82f6' : '#fff',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                {isChecked && (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                )}
            </View>
        )}

        {!trailing && !destructive && !isCheckbox && (
            <Ionicons name="chevron-forward" size={18} color="#a0a0a0" />
        )}
    </TouchableOpacity>
);

const SectionTitle = ({ children }) => (
    <Text style={{
        fontSize: 12,
        fontWeight: '700',
        color: '#9ca3af',
        letterSpacing: 1.5,
        marginBottom: 8,
        marginLeft: 4,
    }}>
        {children}
    </Text>
);

export default function Settings({ navigation }) {
    const [profileImage, setProfileImage] = useState(null);
    const [showPersonalInfo, setShowPersonalInfo] = useState(false);

    const authUser = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const userDetails = useUserStore((state) => state.user);
    const isLoggedIn = !!authUser;

    const handleSignOut = async () => {
        await logout();
        navigation.navigate('Home');
    };

    useEffect(() => {
        const loadProfileImage = async () => {
            if (!userDetails?.id) return;
            try {
                const profileDetails = await GetUserProfileDetails(userDetails.id);
                setProfileImage(profileDetails?.photoUrl || profileDetails?.photo || null);
            } catch (error) {
                console.error("Error fetching profile image:", error);
                if (userDetails?.photo) {
                    setProfileImage(userDetails.photo);
                }
            }
        };

        loadProfileImage();
    }, [userDetails, showPersonalInfo]);

    return (
        <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingTop: 48,
                    paddingBottom: 50,
                }}
            >
                <View style={{
                    alignItems: 'center',
                    marginBottom: 32,
                }}>
                    <View style={{ position: 'relative', marginBottom: 16, marginTop: -15 }}>
                        <Image
                            source={
                                profileImage
                                    ? { uri: profileImage }
                                    : require('../../assets/defaultIcon.jpg')
                            }
                            style={{
                                width: 128,
                                height: 128,
                                borderRadius: 64,
                                borderWidth: 4,
                                borderColor: '#fff',
                            }}
                        />
                    </View>

                    <Text style={{
                        fontSize: 24,
                        fontWeight: '600',
                        color: '#111827',
                        letterSpacing: -0.5,
                    }}>
                        {userDetails?.username || mockUser.name}
                    </Text>

                    <Text style={{
                        fontSize: 14,
                        color: '#6b7280',
                        marginTop: 2,
                    }}>
                        {userDetails?.email || mockUser.email}
                    </Text>

                    <View style={{
                        marginTop: 8,
                        backgroundColor: 'rgba(59,130,246,0.1)',
                        paddingHorizontal: 12,
                        paddingVertical: 3,
                        borderRadius: 999,
                    }}>
                        <Text style={{
                            fontSize: 12,
                            fontWeight: '600',
                            color: '#3b82f6',
                        }}>
                            {userDetails?.role || mockUser.role}
                        </Text>
                    </View>
                </View>

                <SectionTitle>ACCOUNT</SectionTitle>
                <View style={{
                    backgroundColor: '#fff',
                    borderRadius: 16,
                    marginBottom: 16,
                    overflow: 'hidden',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.04,
                    shadowRadius: 3,
                    elevation: 1,
                }}>
                    <SettingRow
                        icon={<Feather name="user" size={18} color="#6b7280" />}
                        label="Personal Information"
                        value={userDetails?.username || mockUser.name}
                        onPress={() => setShowPersonalInfo(true)}
                    />
                </View>

                {isLoggedIn && (
                    <View style={{
                        backgroundColor: '#fff',
                        borderRadius: 16,
                        marginTop: 12,
                        marginBottom: 16,
                        overflow: 'hidden',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.04,
                        shadowRadius: 3,
                        elevation: 1,
                    }}>
                        <SettingRow
                            icon={<Feather name="log-out" size={18} color="#ef4444" />}
                            label="Sign Out"
                            destructive
                            onPress={handleSignOut}
                        />
                    </View>
                )}
            </ScrollView>

            <PersonalInfoModal
                visible={showPersonalInfo}
                onClose={() => setShowPersonalInfo(false)}
            />
        </View>
    );
}