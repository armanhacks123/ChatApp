import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Login from './Login'
import SignUp from './SignUp'
import ChatScreen from './ChatScreen'
import Users from './Users'
import ChatList from './ChatList'
import ProfileScreen from './ProfileScreen'

const Stack = createNativeStackNavigator()

const Navigation = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
                <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
                <Stack.Screen name="ChatList" component={ChatList} options={{ headerShown: false }} />
                <Stack.Screen name="Users" component={Users} />
                <Stack.Screen name="ChatScreen" component={ChatScreen} />
                <Stack.Screen name='ProfileScreen' component={ProfileScreen} />



            </Stack.Navigator>
        </NavigationContainer>

    )
}

export default Navigation;
