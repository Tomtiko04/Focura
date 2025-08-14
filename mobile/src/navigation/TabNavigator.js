import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import HomeScreen from '../screens/HomeScreen'
import TasksScreen from '../screens/TasksScreen'
import AddTypedTaskScreen from '../screens/AddTypedTaskScreen'
import SnapTaskScreen from '../screens/SnapTaskScreen'

const Tab = createBottomTabNavigator()

export default function TabNavigator () {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarIcon: ({ color, size }) => {
          let icon = 'home-outline'
          if (route.name === 'Home') icon = 'home-outline'
          if (route.name === 'Tasks') icon = 'list-outline'
          if (route.name === 'Snap') icon = 'camera'
          if (route.name === 'Type') icon = 'create-outline'
          return <Ionicons name={icon} size={size} color={color} />
        }
      })}
    >
      <Tab.Screen name='Home' component={HomeScreen} />
      <Tab.Screen name='Tasks' component={TasksScreen} />
      <Tab.Screen name='Snap' component={SnapTaskScreen} />
      <Tab.Screen name='Type' component={AddTypedTaskScreen} />
    </Tab.Navigator>
  )
}


