'use strict';

const Code = require('code');
const Lab = require('lab');

const FishFinder = require('..');

const internals = {
    defaults: {
        dirPath: __dirname + '/tmp/runs',
        workspace: 'workspace',
        configFile: 'config.json'
    }
};

const lab = exports.lab = Lab.script();
const expect = Code.expect;
const describe = lab.describe;
const it = lab.it;

describe('invalid', () => {

    it('getRun', (done) => {

        const fishFinder = new FishFinder(internals.defaults);
        const run = fishFinder.getRun('1');
        expect(run).to.not.exist();
        done();
    });

    it('getRunPids', (done) => {

        const fishFinder = new FishFinder(internals.defaults);
        const pids = fishFinder.getRunPids('1');
        expect(pids.length).to.equal(0);
        done();
    });

    it('createRun', (done) => {

        const fishFinder = new FishFinder(internals.defaults);
        const commands = ['invalid'];
        const run = fishFinder.createRun(null, commands);
        expect(run.id).to.exist();
        done();
    });

    it('getRuns', (done) => {

        const fishFinder = new FishFinder(internals.defaults);
        const runs = fishFinder.getRuns();
        expect(runs.length).to.equal(1);
        done();
    });

    it('startRun', (done) => {

        const fishFinder = new FishFinder(internals.defaults);
        const runId = fishFinder.getRuns()[0].id;
        fishFinder.startRun(runId, () => {

            const runs = fishFinder.getRuns();
            expect(runs[0].status).to.equal('started');
            done();
        });
    });

    it('getRun', (done) => {

        const fishFinder = new FishFinder(internals.defaults);
        const runId = fishFinder.getRuns()[0].id;
        let run = fishFinder.getRun(runId);
        const interval = setInterval(() => {

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

    it('deleteRuns', (done) => {

        const fishFinder = new FishFinder(internals.defaults);
        fishFinder.deleteRuns();
        const runs = fishFinder.getRuns();
        expect(runs.length).to.equal(0);
        done();
    });

    it('deleteWorkspace', (done) => {

        const fishFinder = new FishFinder(internals.defaults);
        fishFinder.deleteWorkspace();
        done();
    });
});
