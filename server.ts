import express, { Application, NextFunction, Request, Response } from 'express'
import pool from './db'
import bodyParser from 'body-parser'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'


dotenv.config();
const app: Application = express();
const port: number = 3000;

app.use(bodyParser.json());

const authenticationcheck = (req: Request, res: Response, next: NextFunction): any => {
    const toekn = req.header('authorization')?.split(' ')[1];
    if (!toekn) {
        return res.status(401).json({ message: "authentication failed" });
    }
    try {
        const decoded = jwt.verify(toekn.replace('Bearer ', ''), process.env.JWT_TOKEN as string);
        (req as any).decodeduser = decoded;
        next();
    } catch (error) {
        console.error(error, "errorr");
        res.status(500).json({ error: "error occured" });
    }
}

app.post('/users', async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, dob, gender } = req.body;
    console.log("reqqqqq", req.body);

    try {
        const hash_password = await bcrypt.hash(password, 10)
        const [result]: any = await pool.query('INSERT INTO user(name, email, password, dob, gender) VALUES (?, ?, ?, ?, ?)', [name, email, hash_password, dob, gender]);
        res.status(200).json({ id: result.insertId, name, email, password, dob, gender });
    } catch (error) {
        console.error(error, "error");
        res.status(500).json({ error: "error occured" });
    }
});

app.post('/login', async (req: Request, res: Response): Promise<void> => {
    const { name, password } = req.body;
    console.log("reqqqqq", req.body);
    try {

        const [result]: any = await pool.query('SELECT *FROM user WHERE name = ?', [name]);
        if (result.length === 0) {
            res.status(400).json({ message: "invalid User" });
        }
        console.log("rsess", result);

        let user = result[0];
        console.log("useruser", user);

        let ispass_valid = await bcrypt.compare(password, user.password);
        if (!ispass_valid) {
            res.status(400).json({ message: "invalid password" });
        }
        let token = jwt.sign({ userId: user.id, name: user.name }, process.env.JWT_TOKEN as string, { expiresIn: '1h' });
        console.log("tokentoken", token);

        res.status(200).json({ id: result.insertId, name, password, token });
    } catch (error) {
        console.error(error, "error");
        res.status(500).json({ error: "error occured" });
    }
});

app.get('/users', async (req: Request, res: Response): Promise<void> => {
    const { status } = req.query;
    console.log("reqqqqq", req.query);

    try {
        let query: any = 'SELECT * FROM user ';
        let params: any[] = [];
        if (status) {
            query += 'WHERE status = ?';
            params.push(status.toString());
        }
        console.log("qqqq", query, params);

        const [result] = await pool.query(query, params);
        res.status(200).json({ result });
    } catch (error) {
        console.error(error, "error");
        res.status(500).json({ error: "error occured" });
    }
});

app.put('/update/:id', authenticationcheck, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const [result] = await pool.query('UPDATE user SET name = ? WHERE id = ? ', [name, id]);

        res.status(200).json({ message: "updated" });
    } catch (error) {
        console.error(error, 'ERROR');

        res.status(500).json({ message: "error" });

    }
});


app.listen(port, () => {
    console.log("server is listening");

});