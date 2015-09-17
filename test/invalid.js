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

describe('invalid', function () {

    it('getRun', function (done) {

        var fishFinder = new FishFinder(internals.defaults);
        var run = fishFinder.getRun('1');
        expect(run).to.not.exist();
        done();
    });

    it('getRunPids', function (done) {

        var fishFinder = new FishFinder(internals.defaults);
        var pids = fishFinder.getRunPids('1');
        expect(pids.length).to.equal(0);
        done();
    });

    it('createRun', function (done) {

        var fishFinder = new FishFinder(internals.defaults);
        var commands = ['invalid'];
        var run = fishFinder.createRun(null, commands);
        expect(run.id).to.exist();
        done();
    });

    it('getRuns', function (done) {

        var fishFinder = new FishFinder(internals.defaults);
        var runs = fishFinder.getRuns();
        expect(runs.length).to.equal(1);
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

    it('getRun', function (done) {

        var fishFinder = new FishFinder(internals.defaults);
        var runId = fishFinder.getRuns()[0].id;
        var run = fishFinder.getRun(runId);
        var interval = setInterval(function () {

            run = fishFinder.getRun(runId);
            if (run.finishTime) {
                clearInterval(interval);
                //console.log(run);
                expect(run.status).to.equal('failed');
                expect(run.commands.length).to.equal(1);
                done();
            }
        }, 1000);
    });

    it('deleteRuns', function (done) {

        var fishFinder = new FishFinder(internals.defaults);
        fishFinder.deleteRuns();
        var runs = fishFinder.getRuns();
        expect(runs.length).to.equal(0);
        done();
    });

    it('deleteWorkspace', function (done) {

        var fishFinder = new FishFinder(internals.defaults);
        fishFinder.deleteWorkspace();
        done();
    });
});
