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

describe('normal', () => {

    it('createRun', (done) => {

        const fishFinder = new FishFinder(internals.defaults);
        const commands = ['uptime', 'date'];
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
                expect(run.status).to.equal('succeeded');
                expect(run.commands.length).to.equal(2);
                done();
            }
        }, 1000);
    });

    it('createRun 2', (done) => {

        const fishFinder = new FishFinder(internals.defaults);
        const commands = ['uptime', 'date'];
        const run = fishFinder.createRun(null, commands);
        expect(run.id).to.exist();
        done();
    });

    it('startRun 2', (done) => {

        const fishFinder = new FishFinder(internals.defaults);
        const runId = fishFinder.getRuns()[0].id;
        fishFinder.startRun(runId, () => {

            const runs = fishFinder.getRuns();
            expect(runs[0].status).to.equal('started');
            done();
        });
    });

    it('getRuns 2', (done) => {

        const fishFinder = new FishFinder(internals.defaults);
        const runs = fishFinder.getRuns();
        expect(runs.length).to.equal(2);
        done();
    });

    it('getRun 2', (done) => {

        const fishFinder = new FishFinder(internals.defaults);
        const runId = fishFinder.getRuns()[0].id;
        let run = fishFinder.getRun(runId);
        const interval = setInterval(() => {

            run = fishFinder.getRun(runId);
            if (run.finishTime) {
                clearInterval(interval);
                //console.log(run);
                expect(run.status).to.equal('succeeded');
                expect(run.commands.length).to.equal(2);
                done();
            }
        }, 1000);
    });

    it('deleteRun 2', (done) => {

        const fishFinder = new FishFinder(internals.defaults);
        const runId = fishFinder.getRuns()[0].id;
        fishFinder.deleteRun(runId);
        const runs = fishFinder.getRuns();
        expect(runs.length).to.equal(1);
        done();
    });

    it('deleteRun', (done) => {

        const fishFinder = new FishFinder(internals.defaults);
        const runId = fishFinder.getRuns()[0].id;
        fishFinder.deleteRun(runId);
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
