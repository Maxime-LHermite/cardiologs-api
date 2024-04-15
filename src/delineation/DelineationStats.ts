import { Delineation } from '../models/DelineationModel';
import { ParsedECG } from '../parsers/ECGParser';
import { isNonEmpty } from '../utils/NonEmpty';
import { DateTime, Duration } from 'luxon';
import { ECG } from '../models/ECGModel';

export type DelineationStatsInput = {
    customStartDate?: string;
    parsedECG: ParsedECG;
};

const midWave = (start: number, end: number) => (start + end) / 2;
const timeBetweenWavesToHeartRate = (timeBetweenWaves: number) => 60 / (timeBetweenWaves / 1000);

const countMeasures = (parsedECG: ParsedECG) => {
    const valid = parsedECG.data.length;
    const invalid = parsedECG.invalid;
    const { p, qrs, t } = parsedECG.data.reduce(
        (acc, item) => {
            if (item.type === 'P') {
                acc.p += 1;
            } else if (item.type === 'QRS') {
                acc.qrs += 1;
            } else if (item.type === 'T') {
                acc.t += 1;
            }
            return acc;
        },
        { p: 0, qrs: 0, t: 0 }
    );
    return {
        valid,
        invalid,
        total: valid + invalid,
        p,
        qrs,
        t,
    };
};

const analyseHeartRates = (ecg: ECG) => {
    const heartRateData = ecg.filter((item) => item.type === 'QRS');

    let x = 0;
    let y = 1;

    let lowest = {
        value: 0,
        startDate: 0,
        endDate: 0,
    };
    let highest = {
        value: Infinity,
        startDate: 0,
        endDate: 0,
    };
    let sumTimeBetweenWaves = 0;

    while (y < heartRateData.length) {
        const firstWave = midWave(heartRateData[x]!.startDate, heartRateData[x]!.endDate);
        const secondWave = midWave(heartRateData[y]!.startDate, heartRateData[y]!.endDate);
        const timeBetweenWaves = secondWave - firstWave;
        if (timeBetweenWaves > lowest.value) {
            lowest = {
                value: timeBetweenWaves,
                startDate: firstWave,
                endDate: secondWave,
            };
        } else if (timeBetweenWaves < highest.value) {
            highest = {
                value: timeBetweenWaves,
                startDate: firstWave,
                endDate: secondWave,
            };
        }
        sumTimeBetweenWaves += timeBetweenWaves;
        x += 1;
        y += 1;
    }

    return {
        lowest: {
            value: timeBetweenWavesToHeartRate(lowest.value),
            startDate: lowest.startDate,
            endDate: lowest.endDate,
        },
        highest: {
            value: timeBetweenWavesToHeartRate(highest.value),
            startDate: highest.startDate,
            endDate: highest.endDate,
        },
        meanHeartRate: timeBetweenWavesToHeartRate(sumTimeBetweenWaves / ecg.length),
    };
};

export const calculateDelineationStats = ({ parsedECG, customStartDate }: DelineationStatsInput): Delineation => {
    const data = parsedECG.data;
    if (!isNonEmpty(data)) {
        throw new Error('No valid data found');
    }
    const initialDate = customStartDate ? DateTime.fromISO(customStartDate) : DateTime.now();

    const startDate = initialDate.plus(Duration.fromMillis(data[0].startDate));
    const endDate = initialDate.plus(Duration.fromMillis(data[data.length - 1]?.endDate ?? 0));
    const duration = endDate.diff(startDate);

    const measures = countMeasures(parsedECG);

    const { lowest, highest, meanHeartRate } = analyseHeartRates(data);
    const highestStartDate = initialDate.plus(Duration.fromMillis(highest.startDate));
    const highestEndDate = initialDate.plus(Duration.fromMillis(highest.endDate));
    const lowestStartDate = initialDate.plus(Duration.fromMillis(lowest.startDate));
    const lowestEndDate = initialDate.plus(Duration.fromMillis(lowest.endDate));

    if (
        !startDate.isValid ||
        !endDate.isValid ||
        !duration.isValid ||
        !highestStartDate.isValid ||
        !highestEndDate.isValid ||
        !lowestStartDate.isValid ||
        !lowestEndDate.isValid
    ) {
        throw new Error('Invalid dates');
    }

    return {
        startDate: startDate.toISO(),
        endDate: endDate.toISO(),
        duration: duration.toMillis(),
        measures: measures,
        meanHeartRate,
        highestHeartRate: {
            value: highest.value,
            startDate: highestStartDate.toISO(),
            endDate: highestEndDate.toISO(),
        },
        lowestHeartRate: {
            value: lowest.value,
            startDate: lowestStartDate.toISO(),
            endDate: lowestEndDate.toISO(),
        },
    };
};
