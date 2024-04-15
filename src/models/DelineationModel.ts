import { Schema } from 'express-validator';

export type Delineation = {
    startDate: string;
    endDate: string;
    duration: number;
    measures: {
        valid: number;
        invalid: number;
        total: number;
        p: number;
        qrs: number;
        t: number;
    };
    meanHeartRate: number;
    highestHeartRate: {
        value: number;
        startDate: string;
        endDate: string;
        tag?: string;
    };
    lowestHeartRate: {
        value: number;
        startDate: string;
        endDate: string;
        tag?: string;
    };
};
