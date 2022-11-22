!["Mini-Insta"](./MINI_logo.svg)

# REST api Mini-Insta projektile

<p id="top"></p>

TLÜ Haapsalu Kolledži "Programmeerimine II" raames loodud projekt

### Ülesehitus

1. `index.ts`
2. `/controllers` - iga funktsionaalsuse/route jaoks oma fail
3. `/services` - iga funktsionaalsuse jaoks oma fail
4. `/middleware` - siin hoitakse erinevaid middleware faile
5. `.env` - konfiguratsiooni fail

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

### Users

1. `POST /users/login` logib sisse - ok
2. `GET /users/:id` kasutaja profiil - ok
3. `POST /users` kasutaja loomine - ok
4. `DELETE /users/:id` kasutaja kustutamine - ok
5. `PUT /users/:id` kasutaja andmete muutmine - ok
6. `POST /users/follow/:id` kasutaja jälgima hakkamine
7. `DELETE /users/follow/:id` lõpeta kasutaja jälgimine

### Posts

1. `GET /posts/overview` kasutaja poolt jälgitavate kasutajate poolt tehtud postitused
2. `GET /posts/recommend` soovita postitusi (jälgitavate jälgitavad)
3. `POST /posts/like/:id` lisa like
4. `DELETE /posts/like/:id` kustuts like
5. `POST /posts/` lisa postitus koos meediaga
6. `GET /posts/user/:id` ühe kasutaja postitused
7. `GET /posts/:id` üks postitus
8. `DELETE /posts/:id` kustuta postitus

### Stats

1. `GET /stats/` Analüütilised andmed
2. `GET /stats/topusers` Top 10 kasutajat kõige rohkemate jälgijatega
3. `GET /stats/users` Kasutajaks registreerumised kuupäevade kaupa
4. `GET /stats/genders` Kasutajate jagunemine soo järgi

<!-- CONTACT -->

## Kontakt

Kaius Karon - [kaiusk@tlu.ee](kaiusk@tlu.ee)

Project Link: [https://github.com/kaiusk/insta_api](https://github.com/kaiusk/insta_api)

<p align="right">(<a href="#top">tagasi üles</a>)</p>
