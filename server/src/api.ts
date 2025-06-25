import { Router, Request, Response } from "express";
import axios from "axios";

const bibleAPIClient = axios.create({
  baseURL: 'https://api.scripture.api.bible/v1',
  headers: {
    'api-key': '2c3fac5f2c049f578953ef5bdd7e6c69'
  }
});


export const apiController = () => {
  const router = Router();

  router.get('/', (req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  router.get('/bibles', async (req: Request, res: Response) => {
    const { data } = await bibleAPIClient.get('/bibles?language=eng');
    res.json(data.data);
  });

  router.get('/verse', async (req: Request, res: Response) => {
    const bibleVersionID = 'de4e12af7f2817c0-01';
    const bibleVerseID = '1:1';
    const { data } = await bibleAPIClient.get(`/bibles/${bibleVersionID}/verses/${bibleVerseID}?include-chapter-numbers=false&include-verse-numbers=false`);
    res.json(data); 
  });

  return router;
}
