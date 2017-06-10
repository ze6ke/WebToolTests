let ffmetadata = require('ffmetadata')

ffmetadata.read('11 Sous Les Jupes Des Filles.mp3', function(err, data) {
    if (err) console.error('Error reading metadata', err);
    else console.log(data);
});
