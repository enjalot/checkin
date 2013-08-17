# to download member info:

copy settings-example.js to settings.js and fill it out with your meetup api information

```
npm install
node members.js
```

this will downlaod member data from meetup API and save into a mongo collection
called members in the "checkin" database by default. you can edit this in the
members.js file.
