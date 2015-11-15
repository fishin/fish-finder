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

describe('cancel', () => {

    it('createRun', (done) => {

        const fishFinder = new FishFinder(internals.defaults);
        const commands = ['sleep 5'];
        const run = fishFinder.createRun(null, commands);
        expect(run.id).to.exist();
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

    it('cancelRun', (done) => {

        const fishFinder = new FishFinder(internals.defaults);
        const runId = fishFinder.getRuns()[0].id;
        let run = fishFinder.getRun(runId);
        fishFinder.cancelRun(runId);
        run = fishFinder.getRun(runId);
        expect(run.status).to.equal('cancelled');
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
