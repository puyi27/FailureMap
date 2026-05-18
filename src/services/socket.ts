import { io } from 'socket.io-client';
import { useDashboardStore } from '../store';

let socketInstance: any = null;

export const initializeSocket = () => {
    if (socketInstance) return socketInstance;

    socketInstance = io('http://localhost:3000');

    socketInstance.on('connect_error', () => {
        useDashboardStore.setState({ serverError: true });
    });

    socketInstance.on('connect', () => {
        useDashboardStore.setState({ serverError: false });
    });

    socketInstance.on('device_update', (updatedDevice: any) => {
        useDashboardStore.setState((state: any) => {
            const nextData = state.apiData.map((d: any) =>
                d.deviceId === updatedDevice.deviceId
                    ? { ...d, ...updatedDevice, lat: Number(updatedDevice.lat), lng: Number(updatedDevice.lng) }
                    : d
            );

            const nextSelected = state.selectedPoint?.deviceId === updatedDevice.deviceId
                ? { ...state.selectedPoint, ...updatedDevice }
                : state.selectedPoint;

            return { apiData: nextData, selectedPoint: nextSelected };
        });
    });

    return socketInstance;
};

export const disconnectSocket = () => {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
    }
};