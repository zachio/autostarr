let mix = require('laravel-mix');

mix
   .js  ('src/main/app.js',   'public_html/build/main')
   .sass('src/main/app.scss', 'public_html/build/main')
   .extract();
