import { Request, Response, Router } from 'express';
import multer from 'multer';
import { Delineation } from '../models/DelineationModel';
import { parseECG } from '../parsers/ECGParser';
import { calculateDelineationStats } from '../delineation/DelineationStats';

export const routerV1 = Router();

const upload = multer({ storage: multer.memoryStorage() });

routerV1.post('/delineation', upload.single('file'), async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'File is required' });
    }
    const parsedECG = parseECG(req.file.buffer.toString());

    const response: Delineation = calculateDelineationStats({ parsedECG, customStartDate: req.body.startDate });
    return res.json(response);
});
