import React, { useEffect } from "react";
import { View, Button, Text } from "react-native";
import notifee, { AndroidImportance } from "@notifee/react-native";
import messaging from "@react-native-firebase/messaging";

notifee.requestPermission();

notifee.createChannel({
  id: "default",
  name: "Default Channel",
});

export default function Screen() {
  useEffect(() => {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      const data = remoteMessage?.data;

      notifee.displayNotification({
        title: data?.title,
        body: data?.body,
        android: {
          channelId: "default",
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: "default",
          },
        },
      });

      console.log("[BG HANDLER] Notification received:", data);
    });
  }, []);

  useEffect(() => {
    notifee.onBackgroundEvent(async (event) => {
      const { type, detail } = event;
      console.log("Background Event: ", event.detail.notification?.data);
    });
  }, []);

  useEffect(() => {
    const getNotifications = async () => {
      const ini = await notifee.getInitialNotification();
      console.log("Initial Notification: ", JSON.stringify(ini, null, 2));
      const not = await notifee.getDisplayedNotifications();
      console.log("Notifications: ", JSON.stringify(not[0], null, 2));
      await notifee.cancelAllNotifications();
    };
    getNotifications();
  }, []);

  return (
    <View>
      <Text>Push Notification Example</Text>
    </View>
  );
}
