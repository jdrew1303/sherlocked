/*
    Handles Github hooks for Sherlocked.
*/
var Github = require('github');
var Promise = require('es6-promise').Promise;
var sherlocked = require('sherlocked');

var config = require('./config');


var github = new Github({
    version: '3.0.0',
    protocol: 'https',
    host: 'api.github.com',
    timeout: 5000,
    headers: {
        'user-agent': 'Sherlocked'
    }
});


function postBuildIssueComment(user, repo, prNum, buildId) {
    github.authenticate({
        type: 'oauth',
        token: config.githubToken
    });

    var buildTitle = 'The Adventure of the ' + sherlocked.getVerb() + ' Build';
    var url = 'http://sherlocked.dev.mozaws.net/builds/' + buildId;
    var body = '[ ' + buildTitle + '](' + url + ')';

    return new Promise(function(resolve) {
        github.issues.createComment({
            user: user,
            repo: repo,
            number: prNum,
            body: body
        }, function(err, res) {
            if (err) {
                console.log(err);
            }
            resolve(res);
        });
    });
}


module.exports = {
    postBuildIssueComment: postBuildIssueComment
};
