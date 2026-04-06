import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, Image, Pressable,
    Animated, Dimensions, TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'react-native';
import useAuthStore from '../../store/AuthStore.js';
import useUIStore from '../../store/UIStore.js';

const BLUE = '#2563eb';
const BLUE_DARK = '#1e40af';

const TopNav = ({ navigation, currentRoute }) => {
    const authUser = useAuthStore((state) => state.user);
    const authLoading = useAuthStore((state) => state.isLoading);
    const openLogin = useUIStore((state) => state.openLogin);
    const openSignup = useUIStore((state) => state.openSignup);
    const isLoggedIn = !!authUser;

    const isHome = currentRoute === 'Home';
    const homeAnim = useRef(new Animated.Value(0)).current;

    return (
        <>
            <StatusBar barStyle="dark-content" />
            <View style={{
                width: '100%', height: 110, backgroundColor: '#fff',
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08, shadowRadius: 12, elevation: 8,
                zIndex: 50, paddingBottom: 4, paddingTop: 50, overflow: 'visible',
            }}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')} activeOpacity={0.8}
                    style={{ paddingLeft: 4, paddingRight: 12}}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image source={require('../../assets/logo.png')}
                            style={{ width: 60, height: 60, resizeMode: 'cover' }} />
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: BLUE, marginBottom: 6 }}>WheelMate</Text>
                            <Animated.View style={{
                                height: 2, width: '85%', borderRadius: 1,
                                backgroundColor: BLUE, marginTop: 2,
                                transform: [{ scaleX: homeAnim }],
                            }} />
                        </View>
                    </View>
                </TouchableOpacity>

                {!isLoggedIn && !authLoading && (
                    <View style={{
                        flexDirection: 'row', backgroundColor: '#f8fafc',
                        borderRadius: 15, overflow: 'hidden',
                        borderWidth: 2, borderColor: BLUE, marginBottom: 7, marginRight: 20,
                    }}>
                        <TouchableOpacity onPress={openLogin}
                            style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fff' }}>
                            <Text style={{ fontSize: 14, fontWeight: '600', color: BLUE }}>Log In</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={openSignup}
                            style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: BLUE }}>
                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                )}

            </View>
        </>
    );
};

export default TopNav;
