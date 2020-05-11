module.exports = function(app, opts, done) {

    app.addContentTypeParser('application/x-www-form-urlencoded', {parseAs: 'buffer', bodyLimit: opts.bodyLimit}, function(req, body, done) {
        done(null, qs.parse(body.toString()));
    });

    app.post('/vote', async (req, res) => {

    });
    done();
}
