var crypto = require('crypto'),
    fs = require('fs');

module.exports = {
    md5: function(_filePath, _callback) {
		// the file you want to get the hash    
        var hash = crypto.createHash('md5'),
            rs = fs.createReadStream(_filePath);
        hash.setEncoding('hex');

        rs.on('end', function() {
            hash.end();
            var md5sum = hash.read();
            _callback && _callback(false, md5sum);
        });

        // read all file and pipe it (write it) to the hash object
        rs.pipe(hash);
    },
};