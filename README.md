## REST api "Mini-Insta" projeltile

<p id="top"></p>

TLÜ Haapsalu Kolledži "Programmeerimine II" raames loodud projekt

### Ülesehitus

1. `index.ts`
2. `/controller` - iga funktsionaalsuse/route jaoks oma fail
3. `/model` - andmetüüpide kirjeldused
4. `.env` - konfiguratsiooni fail

### Seadistamine

1. Klooni repo
   ```sh
   git clone https://github.com/kaiusk/insta_api
   ```
2. paigalda sõltuvused
   ```sh
   npm install
   ```
3. kopeeri seadistuse fail `.env.example` -> `.env` ja muuda vajadusel väärtused
4. käivita käsuga
   ```sh
   npm start
   ```

## API endpoints

### User

1. `POST /users/login` logib sisse
2. `GET /users/:id` kasutaja profiil
3. `POST /users` kasutaja loomine
4. `DELETE /users/:id` kasutaja kustutamine
5. `PUT /users/:id` kasutaja andmete muutmine
6. `POST /users/fallow/:id` kasutaja jälgima hakkamine
7. `GET /user/posts/:id` kasutaja poolt jälgitavate kasutajate poolt tehtud postitused

### Post

1. `GET /posts/overview/:id` postitus, koos ühe meedia faili ja postitusega seotud kogu meedia failide arvuga
2. `GET /posts/header/:id` postituse päis: kasutajanimi, profiili pilt, meeldimiste arv
3. `GET /posts/media/:id` postituse meedia failid
4. `GET /posts/comments/:id` postituse meedia failid
5. `POST /posts/comments/:id` lisa kommentaar
6. `POST /posts/like/:id` lisa like
7. `POST /posts/media/:id` lisa meedia postitusele
8. `POST /posts/:id` lisa postitus
9. `DELETE /posts/:id` kustuta postitus

### Stats

1. `GET /stats/` Analüütilised andmed
2. `GET /stats/top-users` Top 10 kasutajat kõige rohkemate jälgijatega
3. `GET /stats/users-added` Kasutajaks registreerumised kuupäevade kaupa
4. `GET /stats/users-gender` Kasutajate jagunemine soo järgi

<!-- CONTACT -->

## Kontakt

Kaius Karon - [kaiusk@tlu.ee](kaiusk@tlu.ee)

Project Link: [https://github.com/kaiusk/insta_api](https://github.com/kaiusk/insta_api)

<p align="right">(<a href="#top">tagasi üles</a>)</p>
