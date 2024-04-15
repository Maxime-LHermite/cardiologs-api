export type ECGDataTypes = 'P' | 'QRS' | 'T';

export type ECGData = {
    type: ECGDataTypes;
    startDate: number;
    endDate: number;
    tag?: string;
};

export type ECG = ECGData[];
