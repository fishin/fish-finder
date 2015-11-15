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

describe('fixed', () => {

    it('createRun invalid', (done) => {

        const fishFinder = new FishFinder(internals.defaults);
        const commands = ['invalid'];
        const run = fishFinder.createRun(null, commands);
        expect(run.id).to.exist();
        done();
    });

    it('getRuns invalid', (done) => {

        const fishFinder = new FishFinder(internals.defaults);
        const runs = fishFinder.getRuns();
        expect(runs.length).to.equal(1);
        done();
    });

    it('startRun invalid', (done) => {

        const fishFinder = new FishFinder(internals.defaults);
        const runId = fishFinder.getRuns()[0].id;
        fishFinder.startRun(runId, () => {

            const runs = fishFinder.getRuns();
            expect(runs[0].status).to.equal('started');
            done();
        });
    });

    it('getRun invalid', (done) => {

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

    it('createRun valid', (done) => {

        const fishFinder = new FishFinder(internals.defaults);
        const commands = ['uptime'];
        const run = fishFinder.createRun(null, commands);
        expect(run.id).to.exist();
        done();
    });

    it('getRuns valid', (done) => {

        const fishFinder = new FishFinder(internals.defaults);
        const runs = fishFinder.getRuns();
        expect(runs.length).to.equal(2);
        done();
    });

    it('startRun valid', (done) => {

        const fishFinder = new FishFinder(internals.defaults);
        const runId = fishFinder.getRuns()[0].id;
        fishFinder.startRun(runId, () => {

            const runs = fishFinder.getRuns();
            expect(runs[0].status).to.equal('started');
            done();
        });
    });

    it('getRun valid', (done) => {

        const fishFinder = new FishFinder(internals.defaults);
        const runId = fishFinder.getRuns()[0].id;
        let run = fishFinder.getRun(runId);
        const interval = setInterval(() => {

            run = fishFinder.getRun(runId);
            if (run.finishTime) {
                clearInterval(interval);
                //console.log(run);
                expect(run.status).to.equal('fixed');
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
