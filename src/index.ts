import express, {Request, Response} from 'express';
import HttpStatus from "http-status-codes";

const app = express();

app.use(express.json);

app.get("/", (req: Request, res: Response) => {
    res.status(HttpStatus.OK).json({ message: "OK" });
});

app.listen(3000, ()=> {
    console.log('server is running...')
})