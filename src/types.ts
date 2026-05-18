export interface FaultEvent {
    timestamp: string;
    status: string;
    message: string;
}

export interface TelemetryHistory {
    val: number;
    msg: string;
    ts: string;
}

export interface TelemetryDevice {
    deviceId: string;
    info: string;
    company: string;
    type: string;
    lat: number;
    lng: number;
    region?: string;
    timezone?: string;
    lastStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'REPAIR_ORDER';
    color: string;
    events: FaultEvent[];
    history: TelemetryHistory[];
    accumulated: Record<string, number>;
    lastTick: number;
    statusTicks: number;
}

export interface RepairOrder {
    id: string;
    deviceId: string;
    status: 'OPEN' | 'RESOLVED';
}

export interface MapPoint {
    px: number;
    py: number;
    data: TelemetryDevice;
}