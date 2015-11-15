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

describe('runOnCommit', () => {

    it('createRun', (done) => {

        const fishFinder = new FishFinder(internals.defaults);
        const commands = ['uptime'];
        const scm = {
            type: 'git',
            url: 'https://github.com/fishin/pail',
            runOnCommit: true,
            branch: 'master'
        };
        const run = fishFinder.createRun(scm, commands);
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
                //console.log(run);
                expect(run.checkout).to.exist();
                expect(run.checkout.status).to.equal('succeeded');
                expect(run.commit).to.exist();
                clearInterval(interval);
                done();
            }
        }, 1000);
    });

    it('createRun 2', (done) => {

        const fishFinder = new FishFinder(internals.defaults);
        const commands = ['uptime'];
        const scm = {
            type: 'git',
            url: 'https://github.com/fishin/pail',
            runOnCommit: true,
            branch: 'master'
        };
        const run = fishFinder.createRun(scm, commands);
        expect(run.id).to.exist();
        done();
    });

    it('startRun 2', (done) => {

        const fishFinder = new FishFinder(internals.defaults);
        const runId = fishFinder.getRuns()[1].id;
        fishFinder.startRun(runId, () => {

            const runs = fishFinder.getRuns();
            expect(runs.length).to.equal(1);
            done();
        });
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
