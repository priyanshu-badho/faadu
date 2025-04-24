// App.tsx
import React, { useEffect } from "react";
import { View, Text, Button, Alert } from "react-native";
import messaging from "@react-native-firebase/messaging";
import notifee, { AndroidImportance } from "@notifee/react-native";

export default function App() {
  useEffect(() => {
    // Request permissions on mount
    messaging().requestPermission();
    notifee.requestPermission();
    messaging().registerDeviceForRemoteMessages();
    messaging()
      .getToken()
      .then((token) => {
        console.log("[FCM TOKEN] Device token:", token);
      });

    // Foreground listener
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      handleIncomingNotification(remoteMessage?.data);
    });

    // Background message handler
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      const data = remoteMessage?.data;

      if (data?.showNotification === "true") {
        await notifee.displayNotification({
          title: data.title || "Notification",
          body: data.body || "",
          android: {
            channelId: "default",
            importance: AndroidImportance.HIGH,
          },
        });
      }

      console.log("[BG HANDLER] Notification received:", data);
    });

    // Check if app was opened from a notification
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log(
            "[INITIAL NOTIF] Opened from notification:",
            remoteMessage.data
          );
        }
      });

    return () => unsubscribe();
  }, []);

  const handleIncomingNotification = async (data: any) => {
    console.log("[FOREGROUND] Notification received:", data);

    if (data?.showNotification === "true") {
      await notifee.displayNotification({
        title: data.title || "Notification",
        body: data.body || "",
        android: {
          channelId: "default",
          importance: AndroidImportance.HIGH,
        },
      });
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Expo + FCM + Notifee</Text>
      <Button
        title="Test Notification Data"
        onPress={() => {
          const mockData = {
            title: "Hello!",
            body: "This is a test notification",
            showNotification: "true",
          };
          handleIncomingNotification(mockData);
        }}
      />
    </View>
  );
}
