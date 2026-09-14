/**
 * Backend base URL.
 *
 * Currently targeting a physical device over USB via
 *   adb reverse tcp:3000 tcp:3000
 * which tunnels the device's 127.0.0.1:3000 to the dev machine's
 * 127.0.0.1:3000 over the existing USB/adb connection — the same
 * mechanism already used for Metro (port 8081) on this device. No LAN
 * exposure, no firewall changes, no dependency on Wi-Fi IP.
 *
 * - Physical device via adb reverse (current): "http://127.0.0.1:3000"
 * - Android emulator instead: "http://10.0.2.2:3000" (the emulator's
 *   virtual-host alias for the dev machine's localhost — NOT valid on a
 *   physical device, which is what caused "Could not reach the server").
 */
export const API_BASE_URL = 'http://127.0.0.1:3000';
