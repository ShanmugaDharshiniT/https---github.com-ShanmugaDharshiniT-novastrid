import express, { Application, NextFunction, Request, Response } from 'express'
import multer from 'multer'
import xlsx from 'xlsx'
import mysql from 'mysql2/promise'
import pool from './db'


const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/chats', upload.single('file'), async (req: any, res: Response): Promise<void> => {
    if (!req.file) {
        res.status(400).json({ error: "no file" })
    }
    try {

        const workbook = xlsx.readFile(req.file.path);
        console.log("workbook", workbook);

        const sheetname = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetname]);

        const chat_data = data.map((row: any) => ([
            row.sender,
            row.receiver,
            row.Message,
            new Date(row.Timestamp)
        ]));

        const query = 'INSERT INTO chat_history(sender, receiver, message,timestamp) VALUES ?';

        console.log("query", query);

        const connection = await pool.getConnection();
        await connection.query(query, [chat_data]);

        connection.release();
        res.json({ message: "chat history imported succesffuly" });
    } catch (error) {
        console.error(error, "error");
        res.status(500).json({ error: "error occured" });
    }
});

app.listen(3000, () => {
    console.log("server running on port");

});
