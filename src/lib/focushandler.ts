import {getCurrentWindow} from "@tauri-apps/api/window";
import {sendNotification} from "@tauri-apps/plugin-notification";

export default async function handleNewIncomingMessage(messageData) {
    // Get the current OS window instance
    const appWindow = getCurrentWindow();

    // Ask the OS if the user is currently interacting with our app
    const isFocused = await appWindow.isFocused();
    const isMinimized = await appWindow.isMinimized();

    // Only fire the toast if the app is hidden or out of focus
    if (!isFocused || isMinimized) {
        sendNotification({
            title: messageData.senderName,
            body: messageData.text,
        });
    } else {
        // The user is actively looking at the chat!
        // You could maybe play a subtle 'pop' sound here instead of a full OS notification.
        console.log("🤫 Message received while in focus. Suppressing OS notification.");
    }
}