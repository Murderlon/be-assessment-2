# be-assessment-2

> Production ready `express` setup.

## Content

* [🏗 Architecture](#-architecture)
* [🔐 Security](#-security)
* [🔁 Sessions](#-sessions)
* [⬆️ Uploads](#-uploads)
* [👩‍💻 Install](#-install)
* [⚖️ Licence](#-licence)

## 🏗 Architecture

Architecture is done as modular as possible, `server.js` only serves as a high-level overview as it passes further middleware setup to `lib/` and requests to distinguished routers in `routes/`.

```
be-assessment-2/
├─ lib/
├─ models/
├─ node_modules/
├─ routes/
├─ static/
│  └─ img/
│  └─ ...
├─ view/
│  └─ partials/
│  └─ ...
├─ .env
├─ package.json
├─ README.md
├─ server.js
└─ ...
```

## 🔐 Security

### [`Passport`](http://www.passportjs.org/)

> Simple, unobtrusive authentication

### [`Helmet`](https://helmetjs.github.io/)

> Secure Express apps by setting various HTTP headers.

## 🔁 Sessions

User can stay logged in through `express-session`. Additionally, when the server restarts the sessions stay in place because they are saved in `MongoDB` with `connect-mongo`, as can be seen by the `store` property below.

```js
// ...
.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
)
// ...
```

The `process.env.SESSION_SECRET` is a 64 character crypto string.

## ⬆️ Uploads

File uploads are done with `multer` with custom settings to generate unique file names with `shortid`. How unique are pseudo-random generators you may ask? According to [this](https://stackoverflow.com/questions/29605672/how-to-generate-short-unique-names-for-uploaded-files-in-nodejs#29608123) answer on Stackoverflow we're pretty safe:

> While shortid's are not guaranteed to be unique, the likelihood of a collision is extremely small. Unless you generate billions of entries per year, you could safely assume that a collision will never happen.

Custom settings for `multer`:

```js
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'static/img'),
  filename: (req, { originalname }, cb) =>
    cb(null, shortid.generate() + path.extname(originalname))
})
```

## ‍💻 Install

1.  **Get a MongoDB database, either locally or online.**

* Local recommendation: [Kitematic](https://kitematic.com/).
* Online recommendation: [MLab](https://mlab.com/)

2.  **Get this repository.**

```
$ git clone https://github.com/Murderlon/be-assessment-2.git
```

3.  **Install dependencies.**

```
$ yarn
```

or

```
$ npm install
```

4.  **Create your `.env` file** (and fill in the empty variables).

```bash
$ echo 'DB_URL=
  SESSION_SECRET=' > .env
```

5.  **Run it.**

```
yarn start
```

or

```
npm start
```

That's it!

## ⚖️ Licence

[MIT](https://oss.ninja/mit/murderlon) © [Merlijn Vos](https://github.com/Murderlon).
