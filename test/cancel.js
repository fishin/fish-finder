var Code = require('code');
var Lab = require('lab');
var Hapi = require('hapi');

var FishFinder = require('..');

var internals = {
    defaults: {
        dirPath: __dirname + '/tmp/runs',
        workspace: 'workspace',
        configFile: 'config.json'
    }
};

var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.describe;
var it = lab.it;

describe('cancel', function () {

    it('createRun', function (done) {

        var fishFinder = new FishFinder(internals.defaults);
        var commands = ['sleep 5'];
        var run = fishFinder.createRun(null, commands);
        expect(run.id).to.exist();
        done();
    });

    it('startRun', function (done) {

        var fishFinder = new FishFinder(internals.defaults);
        var runId = fishFinder.getRuns()[0].id;
        fishFinder.startRun(runId, function () {

            var runs = fishFinder.getRuns();
            expect(runs[0].status).to.equal('started');
            done();
        });
    });

    it('cancelRun', function (done) {

        var fishFinder = new FishFinder(internals.defaults);
        var runId = fishFinder.getRuns()[0].id;
        var run = fishFinder.getRun(runId);
        fishFinder.cancelRun(runId);
        run = fishFinder.getRun(runId);
        expect(run.status).to.equal('cancelled');
        done();
    });

    it('deleteRun', function (done) {

        var fishFinder = new FishFinder(internals.defaults);
        var runId = fishFinder.getRuns()[0].id;
        fishFinder.deleteRun(runId);
        var runs = fishFinder.getRuns();
        expect(runs.length).to.equal(0);
        done();
    });
});
