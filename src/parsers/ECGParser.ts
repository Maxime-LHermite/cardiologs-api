import { ECG, ECGData } from '../models/ECGModel';
import { z } from 'zod';

export type ParsedECG = {
    data: ECG;
    invalid: number;
};

const ecgSchema = z.object({
    type: z.enum(['P', 'QRS', 'T']),
    startDate: z.number({ coerce: true }),
    endDate: z.number({ coerce: true }),
    tag: z.string().optional(),
});

const parseLine = (line: string[]): ECGData | undefined => {
    if (line.length !== 3 && line.length !== 4) {
        return undefined;
    }
    const parsedData = ecgSchema.safeParse({ type: line[0], startDate: line[1], endDate: line[2], tag: line[3] });
    if (!parsedData.success) {
        return undefined;
    }
    return parsedData.data;
};

export const parseECG = (csv: string): ParsedECG => {
    const lines = csv.split(/\r\n|\n/);
    const result: ECG = [];
    let invalidLines = 0;
    for (const line of lines) {
        const parsedLine = parseLine(line.split(','));
        if (parsedLine) {
            result.push(parsedLine);
        } else {
            invalidLines += 1;
        }
    }
    return { data: result, invalid: invalidLines };
};
