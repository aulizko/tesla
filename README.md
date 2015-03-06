# tc-tesla.com sources

I made this website for the friend of mine. The basic idea - to introduce the logo something of a neon lamp, illuminating the rest, quite dark page.

And, of course, a random color for each hit on the page.

Check the [demo](http://tc-tesla.com) or see screenshotes below.

![Yellow variant](https://habrastorage.org/files/3d3/dc0/cc9/3d3dc0cc9687492892effa7cd064821f.png)
![Purple variant](https://habrastorage.org/files/aed/bf5/e95/aedbf5e950e8491b8da43dadb087a0df.png)
![Green variant](https://habrastorage.org/files/a69/8d0/803/a698d0803487427193bba2cfd9f15d0a.png)

## Thanks

Server-side working on top [Express.js](http://expressjs.com), with [Mongoose.js](http://mongoosejs.com) as ORM and
[Ractive.js](http://www.ractivejs.org) as view engine.

Server-side built on top of [Node Express Mongoose](https://github.com/madhums/node-express-mongoose) boilerplate.

Front-end is built with Less.js, Browserify and Gulp.

Some (huge) amount of CSS-code borrowed from [Bootstrap](http://getbootstrap.com).

Many thanks to [Davi Ferreira](https://github.com/daviferreira) for [Medium editor](https://github.com/daviferreira/medium-editor).

Special thanks for [Josip Kelava](http://josipkelava.com/) for awesome [Metropolis 1920](http://incredibletypes.com/metropolis-1920/) font.

## Running in dev mode

Make sure you have mongodb (2.6 or higher) installed.

You'll need node 0.11 or higher and [Gulp](https://www.npmjs.com/packages/gulp) installed globally.

1. Clone it.
2. CD into it.
3. Run `npm i`.
3. Run `gulp bower && gulp dev`.
4. Open [http://localhost:3000/](http://localhost:3000/) in your browser.

