import { FontAwesome } from '@expo/vector-icons';
import { Tabs, useLocalSearchParams } from 'expo-router';
import LogoutButton from '../LogoutButton';

export default function TabLayout() {
  const { userEmail } = useLocalSearchParams();
  const emailString = userEmail ? String(userEmail) : '';

  const headerTheme = {
    headerShown: true,
    headerStyle: { backgroundColor: 'black' },
    headerTintColor: '#00FF00',
    // ...
  };

  return (
    <Tabs>
      <Tabs.Screen
        name="todos"
        options={{
          title: 'Tareas',
          ...headerTheme,
          href: { pathname: '/(tabs)/todos', params: { userEmail: emailString } },
          tabBarIcon: ({ color }) => (
            <FontAwesome name="check-square-o" color={color} size={24} />
          ),
          headerRight: () => <LogoutButton />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          ...headerTheme,
          href: { pathname: '/(tabs)/profile', params: { userEmail: emailString } },
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user" color={color} size={24} />
          ),
          headerRight: () => <LogoutButton />,
        }}
      />
    </Tabs>
  );
}