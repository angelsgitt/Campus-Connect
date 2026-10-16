import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { Cyberwave } from '@/constants/cyberwave';

export type CyberwaveTabId = 'home' | 'explore' | 'circle' | 'profile';

interface CyberwaveBottomNavProps {
  activeTab?: CyberwaveTabId;
  onToast?: (message: string) => void;
}

export function CyberwaveBottomNav({ activeTab, onToast }: CyberwaveBottomNavProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handlePress = (tab: CyberwaveTabId) => {
    if (tab === 'home') {
      router.push('/');
    } else if (tab === 'explore') {
      router.push('/explore');
    } else if (tab === 'circle') {
      router.push('/circle' as any);
    } else if (tab === 'profile') {
      router.push('/profile' as any);
    }
  };

  const bottomBarHeight = 64 + Math.max(insets.bottom, 12);

  return (
    <View
      style={[
        styles.bottomNavContainer,
        {
          paddingBottom: Math.max(insets.bottom, 12),
          height: bottomBarHeight,
        },
      ]}>
      {/* Home */}
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'home' }}
        accessibilityLabel="Home tab"
        style={styles.navItem}
        onPress={() => handlePress('home')}>
        <View style={styles.navIconContainer}>
          <SymbolView
            name={{
              ios: activeTab === 'home' ? 'house.fill' : 'house',
              android: 'home',
              web: 'home',
            }}
            size={22}
            tintColor={
              activeTab === 'home'
                ? Cyberwave.electricBlue
                : Cyberwave.mutedSlate
            }
            fallback={
              <Text
                style={
                  activeTab === 'home'
                    ? styles.navFallbackActive
                    : styles.navFallbackInactive
                }>
                🏠
              </Text>
            }
          />
        </View>
        <Text
          style={[
            styles.navLabel,
            activeTab === 'home' && styles.navLabelActive,
          ]}>
          Home
        </Text>
      </Pressable>

      {/* Explore */}
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'explore' }}
        accessibilityLabel="Explore tab"
        style={styles.navItem}
        onPress={() => handlePress('explore')}>
        <View style={styles.navIconContainer}>
          <SymbolView
            name={{
              ios: activeTab === 'explore' ? 'safari.fill' : 'safari',
              android: 'explore',
              web: 'explore',
            }}
            size={22}
            tintColor={
              activeTab === 'explore'
                ? Cyberwave.electricBlue
                : Cyberwave.mutedSlate
            }
            fallback={
              <Text
                style={
                  activeTab === 'explore'
                    ? styles.navFallbackActive
                    : styles.navFallbackInactive
                }>
                🧭
              </Text>
            }
          />
        </View>
        <Text
          style={[
            styles.navLabel,
            activeTab === 'explore' && styles.navLabelActive,
          ]}>
          Explore
        </Text>
      </Pressable>

      {/* My Circle */}
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'circle' }}
        accessibilityLabel="My Circle tab"
        style={styles.navItem}
        onPress={() => handlePress('circle')}>
        <View style={styles.navIconContainer}>
          <SymbolView
            name={{
              ios: activeTab === 'circle' ? 'person.2.fill' : 'person.2',
              android: 'groups',
              web: 'groups',
            }}
            size={22}
            tintColor={
              activeTab === 'circle'
                ? Cyberwave.electricBlue
                : Cyberwave.mutedSlate
            }
            fallback={
              <Text
                style={
                  activeTab === 'circle'
                    ? styles.navFallbackActive
                    : styles.navFallbackInactive
                }>
                👥
              </Text>
            }
          />
        </View>
        <Text
          style={[
            styles.navLabel,
            activeTab === 'circle' && styles.navLabelActive,
          ]}>
          My Circle
        </Text>
      </Pressable>

      {/* Profile */}
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'profile' }}
        accessibilityLabel="Profile tab"
        style={styles.navItem}
        onPress={() => handlePress('profile')}>
        <View style={styles.navIconContainer}>
          <SymbolView
            name={{
              ios:
                activeTab === 'profile'
                  ? 'person.crop.circle.fill'
                  : 'person.crop.circle',
              android: 'person',
              web: 'person',
            }}
            size={22}
            tintColor={
              activeTab === 'profile'
                ? Cyberwave.electricBlue
                : Cyberwave.mutedSlate
            }
            fallback={
              <Text
                style={
                  activeTab === 'profile'
                    ? styles.navFallbackActive
                    : styles.navFallbackInactive
                }>
                👤
              </Text>
            }
          />
        </View>
        <Text
          style={[
            styles.navLabel,
            activeTab === 'profile' && styles.navLabelActive,
          ]}>
          Profile
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Cyberwave.white,
    borderTopWidth: 1,
    borderTopColor: Cyberwave.lightBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 100,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navIconContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Cyberwave.mutedSlate,
  },
  navLabelActive: {
    color: Cyberwave.electricBlue,
    fontWeight: '700',
  },
  navFallbackActive: {
    fontSize: 16,
  },
  navFallbackInactive: {
    fontSize: 16,
    opacity: 0.7,
  },
});
