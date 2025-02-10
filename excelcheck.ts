import express, { Application, NextFunction, Request, Response } from 'express'
import multer from 'multer'
import xlsx from 'xlsx'

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/chats', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
        res.status(400).json({ error: "no file" })
    }
    try {

        // const workbook = xlsx.readFile(req.file.path)
    } catch (error) {
        console.error(error, "error");
        res.status(500).json({ error: "error occured" });
    }
});
