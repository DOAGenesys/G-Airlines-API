// Helper function to create structured log entries.
export const createLog = (level: 'INFO' | 'DEBUG' | 'ERROR' | 'FATAL' | 'WARN', message: string, details: object = {}) => {
    const logObject = {
        level,
        message,
        ...details,
        timestamp: new Date().toISOString()
    };
    console.log(JSON.stringify(logObject));
};

// Helper function to format date to MM/DD/YYYY hh:mm:ss AM/PM.
export const formatTo12Hour = (date: Date): string => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
};


// Helper function to format date for charge description, e.g., 27Jul2025 Fri.
export const formatForChargeDesc = (date: Date): string => {
    const day = date.getDate().toString();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    const weekday = date.toLocaleString('en-US', { weekday: 'short' });
    return `${day}${month}${year} ${weekday}`;
};

// Helper function to format time as HH:MM.
export const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};
