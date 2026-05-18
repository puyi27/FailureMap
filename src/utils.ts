export const getTodayStr = () => new Date().toISOString().split('T')[0];

export const formatExactTime = (ms: number) => {
    if (!ms || ms === 0) return '0s';
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0) parts.push(`${mins}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
    return parts.join(' ');
};

export const formatDurationMinutes = (totalMinutes: number) => {
    if (totalMinutes < 60) return `${Math.ceil(totalMinutes)} min`;
    const hours = Math.floor(totalMinutes / 60);
    const min = Math.ceil(totalMinutes % 60);
    return min > 0 ? `${hours}h ${min}m` : `${hours}h`;
};

export const REGION_TIMEZONES: Record<string, string> = {
    'Frankfurt': 'Europe/Berlin', 'Berlin': 'Europe/Berlin', 'Vienna': 'Europe/Vienna',
    'Paris': 'Europe/Paris', 'Rome': 'Europe/Rome', 'Milan': 'Europe/Rome', 'Naples': 'Europe/Rome',
    'Madrid': 'Europe/Madrid', 'Seville': 'Europe/Madrid', 'Barcelona': 'Europe/Madrid',
    'New York': 'America/New_York', 'Los Angeles': 'America/Los_Angeles',
    'Rio de Janeiro': 'America/Sao_Paulo', 'Sao Paulo': 'America/Sao_Paulo',
    'Buenos Aires': 'America/Argentina/Buenos_Aires', 'Montevideo': 'America/Montevideo',
    'Santiago de Chile': 'America/Santiago', 'Tokyo': 'Asia/Tokyo', 'Sydney': 'Australia/Sydney'
};

export const formatInTimezone = (date: Date | string | number, timezone?: string, region?: string) => {
    let tz = timezone;
    if ((!tz || tz === 'UTC') && region && REGION_TIMEZONES[region]) tz = REGION_TIMEZONES[region];
    try {
        return new Date(date).toLocaleTimeString('es-ES', {
            timeZone: tz || undefined, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        });
    } catch {
        return new Date(date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    }
};

export const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
export const COMPANY_COLORS: Record<string, string> = { DataSys: '#3b82f6', EcoServe: '#8b5cf6', GlobalNet: '#ec4899', TechCorp: '#eab308' };

export const TIME_OPTIONS = [
    { value: 1, label: '1 Hora' }, { value: 4, label: '4 Horas' },
    { value: 8, label: '8 Horas' }, { value: 12, label: '12 Horas' }, { value: 24, label: '24 Horas' }
];

export const HISTORICAL_TIMESLOTS = [
    { start: 0, end: 24, label: 'Todo el día' }, { start: 0, end: 3, label: '00:00 - 03:00' },
    { start: 3, end: 6, label: '03:00 - 06:00' }, { start: 6, end: 9, label: '06:00 - 09:00' },
    { start: 9, end: 12, label: '09:00 - 12:00' }, { start: 12, end: 15, label: '12:00 - 15:00' },
    { start: 15, end: 18, label: '15:00 - 18:00' }, { start: 18, end: 21, label: '18:00 - 21:00' },
    { start: 21, end: 24, label: '21:00 - 23:59' }
];  