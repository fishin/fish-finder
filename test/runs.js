'use strict';

const Code = require('code');
const FishFinder = require('..');
const Hoek = require('hoek');
const Lab = require('lab');
const Pail = require('pail');
const Rimraf = require('rimraf');

const internals = {
    defaults: {
        dirPath: __dirname + '/tmp'
    }
};

const lab = exports.lab = Lab.script();
const after = lab.after;
const expect = Code.expect;
const describe = lab.describe;
const it = lab.it;

describe('runs', () => {

    after((done) => {

        Rimraf(internals.defaults.dirPath, Hoek.ignore);
        done();
    });

    it('deleteRun many', (done) => {

        const fishfinder = new FishFinder(internals.defaults);
        // 2 success
        const pail = new Pail({ dirPath: internals.defaults.dirPath });
        const commands = ['uptime', 'date'];
        const success1Run = fishfinder.createRun(null, commands);
        expect(success1Run.status).to.equal('created');
        success1Run.status = 'succeeded';
        const updateSuccessPail1 = pail.updatePail(success1Run);
        expect(updateSuccessPail1.status).to.equal('succeeded');
        const success2Run = fishfinder.createRun(null, commands);
        expect(success2Run.status).to.equal('created');
        success2Run.status = 'succeeded';
        const updateSuccessPail2 = pail.updatePail(success2Run);
        expect(updateSuccessPail2.status).to.equal('succeeded');
        // 2 failed
        const fail1Run = fishfinder.createRun(null, commands);
        expect(fail1Run.status).to.equal('created');
        fail1Run.status = 'failed';
        const updateFailPail1 = pail.updatePail(fail1Run);
        expect(updateFailPail1.status).to.equal('failed');
        const fail2Run = fishfinder.createRun(null, commands);
        expect(fail2Run.status).to.equal('created');
        fail2Run.status = 'failed';
        const updateFailPail2 = pail.updatePail(fail2Run);
        expect(updateFailPail2.status).to.equal('failed');
        // 2 cancelled
        const cancel1Run = fishfinder.createRun(null, commands);
        expect(cancel1Run.status).to.equal('created');
        cancel1Run.status = 'cancelled';
        const updateCancelPail1 = pail.updatePail(cancel1Run);
        expect(updateCancelPail1.status).to.equal('cancelled');
        const cancel2Run = fishfinder.createRun(null, commands);
        expect(cancel2Run.status).to.equal('created');
        cancel2Run.status = 'cancelled';
        const updateCancelPail2 = pail.updatePail(cancel2Run);
        expect(updateCancelPail2.status).to.equal('cancelled');
        const success3Run = fishfinder.createRun(null, commands);
        expect(success3Run.status).to.equal('created');
        success3Run.status = 'fixed';
        const updateSuccessPail3 = pail.updatePail(success3Run);
        expect(updateSuccessPail3.status).to.equal('fixed');
        const success4Run = fishfinder.createRun(null, commands);
        expect(success4Run.status).to.equal('created');
        success4Run.status = 'succeeded';
        const updateSuccessPail4 = pail.updatePail(success4Run);
        expect(updateSuccessPail4.status).to.equal('succeeded');
        // now start deleting stuff
        fishfinder.deleteRun(success4Run.id);
        expect(pail.getPailByName('last')).to.equal(success3Run.id);
        expect(pail.getPailByName('lastSuccess')).to.equal(success3Run.id);
        fishfinder.deleteRun(success3Run.id);
        expect(pail.getPailByName('last')).to.equal(cancel2Run.id);
        expect(pail.getPailByName('lastSuccess')).to.equal(success2Run.id);
        expect(pail.getPailByName('lastCancel')).to.equal(cancel2Run.id);
        fishfinder.deleteRun(cancel2Run.id);
        expect(pail.getPailByName('last')).to.equal(cancel1Run.id);
        expect(pail.getPailByName('lastCancel')).to.equal(cancel1Run.id);
        fishfinder.deleteRun(cancel1Run.id);
        expect(pail.getPailByName('last')).to.equal(fail2Run.id);
        expect(pail.getPailByName('lastFail')).to.equal(fail2Run.id);
        expect(pail.getPailByName('lastCancel')).to.not.exist();
        fishfinder.deleteRun(fail2Run.id);
        expect(pail.getPailByName('last')).to.equal(fail1Run.id);
        expect(pail.getPailByName('lastFail')).to.equal(fail1Run.id);
        fishfinder.deleteRun(fail1Run.id);
        expect(pail.getPailByName('last')).to.equal(success2Run.id);
        expect(pail.getPailByName('lastSuccess')).to.equal(success2Run.id);
        expect(pail.getPailByName('lastFail')).to.not.exist();
        fishfinder.deleteRun(success2Run.id);
        expect(pail.getPailByName('last')).to.equal(success1Run.id);
        expect(pail.getPailByName('lastSuccess')).to.equal(success1Run.id);
        fishfinder.deleteRun(success1Run.id);
        expect(pail.getPailByName('last')).to.not.exist();
        expect(pail.getPailByName('lastSuccess')).to.not.exist();
        done();
    });

    it('deleteRun not last', (done) => {

        const fishfinder = new FishFinder(internals.defaults);
        const pail = new Pail({ dirPath: internals.defaults.dirPath });
        // 3 success
        const commands = ['uptime', 'date'];
        const success1Run = fishfinder.createRun(null, commands);
        expect(success1Run.status).to.equal('created');
        success1Run.status = 'succeeded';
        const updateSuccessPail1 = pail.updatePail(success1Run);
        expect(updateSuccessPail1.status).to.equal('succeeded');
        const success2Run = fishfinder.createRun(null, commands);
        expect(success2Run.status).to.equal('created');
        success2Run.status = 'succeeded';
        const updateSuccessPail2 = pail.updatePail(success2Run);
        expect(updateSuccessPail2.status).to.equal('succeeded');
        const success3Run = fishfinder.createRun(null, commands);
        expect(success3Run.status).to.equal('created');
        success3Run.status = 'succeeded';
        const updateSuccessPail3 = pail.updatePail(success3Run);
        expect(updateSuccessPail3.status).to.equal('succeeded');
        expect(pail.getPailByName('last')).to.equal(success3Run.id);
        fishfinder.deleteRun(success2Run.id);
        expect(pail.getPailByName('last')).to.equal(success3Run.id);
        fishfinder.deleteRun(success1Run.id);
        fishfinder.deleteRun(success3Run.id);
        done();
    });

    it('getPreviousRun', (done) => {

        const fishfinder = new FishFinder(internals.defaults);
        // 3 success
        const pail = new Pail({ dirPath: internals.defaults.dirPath });
        const commands = ['uptime', 'date'];
        const success1Run = fishfinder.createRun(null, commands);
        expect(success1Run.status).to.equal('created');
        success1Run.status = 'succeeded';
        const updateSuccessPail1 = pail.updatePail(success1Run);
        expect(updateSuccessPail1.status).to.equal('succeeded');
        const success2Run = fishfinder.createRun(null, commands);
        expect(success2Run.status).to.equal('created');
        success2Run.status = 'succeeded';
        const updateSuccessPail2 = pail.updatePail(success2Run);
        expect(updateSuccessPail2.status).to.equal('succeeded');
        const success3Run = fishfinder.createRun(null, commands);
        expect(success3Run.status).to.equal('created');
        success3Run.status = 'succeeded';
        const updateSuccessPail3 = pail.updatePail(success3Run);
        expect(updateSuccessPail3.status).to.equal('succeeded');
        expect(pail.getPailByName('last')).to.equal(success3Run.id);
        let run = fishfinder.getPreviousRun(success3Run.id);
        expect(run.id).to.equal(success2Run.id);
        run = fishfinder.getPreviousRun(success2Run.id);
        expect(run.id).to.equal(success1Run.id);
        run = fishfinder.getPreviousRun(success1Run.id);
        expect(run).to.not.exist();
        fishfinder.deleteRun(success1Run.id);
        fishfinder.deleteRun(success2Run.id);
        fishfinder.deleteRun(success3Run.id);
        done();
    });
});
