import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';

export default async function testNotificationSystem() {
    let permissionGranted = await isPermissionGranted();

    console.log(`🔒 Current notification permission status: ${permissionGranted}`);

    if (!permissionGranted) {
        console.log("Asking for notification permissions...");
        const permission = await requestPermission();
        permissionGranted = permission === 'granted';
        console.log(`🔑 New permission result: ${permissionGranted}`);
    }

    if (permissionGranted) {
        sendNotification({
            title: 'Domain Expansion',
            body: 'Test notification working flawlessly!'
        });
    } else {
        console.warn("⚠️ Notification blocked: Permission was denied by the user/system.");
    }
}