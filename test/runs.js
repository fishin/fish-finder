var Code = require('code');
var FishFinder = require('..');
var Hoek = require('hoek');
var Lab = require('lab');
var Pail = require('pail');
var Rimraf = require('rimraf');

var internals = {
    defaults: {
        dirPath: __dirname + '/tmp'
    }
};

var lab = exports.lab = Lab.script();
var after = lab.after;
var expect = Code.expect;
var describe = lab.describe;
var it = lab.it;

describe('runs', function () {

    after(function (done) {

        Rimraf(internals.defaults.dirPath, Hoek.ignore);
        done();
    });

    it('deleteRun many', function (done) {

        var fishfinder = new FishFinder(internals.defaults);
        // 2 success
        var pail = new Pail({ dirPath: internals.defaults.dirPath });
        var commands = ['uptime', 'date'];
        var success1Run = fishfinder.createRun(null, commands);
        expect(success1Run.status).to.equal('created');
        success1Run.status = 'succeeded';
        var updateSuccessPail1 = pail.updatePail(success1Run);
        expect(updateSuccessPail1.status).to.equal('succeeded');
        var success2Run = fishfinder.createRun(null, commands);
        expect(success2Run.status).to.equal('created');
        success2Run.status = 'succeeded';
        var updateSuccessPail2 = pail.updatePail(success2Run);
        expect(updateSuccessPail2.status).to.equal('succeeded');
        // 2 failed
        var fail1Run = fishfinder.createRun(null, commands);
        expect(fail1Run.status).to.equal('created');
        fail1Run.status = 'failed';
        var updateFailPail1 = pail.updatePail(fail1Run);
        expect(updateFailPail1.status).to.equal('failed');
        var fail2Run = fishfinder.createRun(null, commands);
        expect(fail2Run.status).to.equal('created');
        fail2Run.status = 'failed';
        var updateFailPail2 = pail.updatePail(fail2Run);
        expect(updateFailPail2.status).to.equal('failed');
        // 2 cancelled
        var cancel1Run = fishfinder.createRun(null, commands);
        expect(cancel1Run.status).to.equal('created');
        cancel1Run.status = 'cancelled';
        var updateCancelPail1 = pail.updatePail(cancel1Run);
        expect(updateCancelPail1.status).to.equal('cancelled');
        var cancel2Run = fishfinder.createRun(null, commands);
        expect(cancel2Run.status).to.equal('created');
        cancel2Run.status = 'cancelled';
        var updateCancelPail2 = pail.updatePail(cancel2Run);
        expect(updateCancelPail2.status).to.equal('cancelled');
        var success3Run = fishfinder.createRun(null, commands);
        expect(success3Run.status).to.equal('created');
        success3Run.status = 'fixed';
        var updateSuccessPail3 = pail.updatePail(success3Run);
        expect(updateSuccessPail3.status).to.equal('fixed');
        var success4Run = fishfinder.createRun(null, commands);
        expect(success4Run.status).to.equal('created');
        success4Run.status = 'succeeded';
        var updateSuccessPail4 = pail.updatePail(success4Run);
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

    it('deleteRun not last', function (done) {

        var fishfinder = new FishFinder(internals.defaults);
        var pail = new Pail({ dirPath: internals.defaults.dirPath });
        // 3 success
        var commands = ['uptime', 'date'];
        var success1Run = fishfinder.createRun(null, commands);
        expect(success1Run.status).to.equal('created');
        success1Run.status = 'succeeded';
        var updateSuccessPail1 = pail.updatePail(success1Run);
        expect(updateSuccessPail1.status).to.equal('succeeded');
        var success2Run = fishfinder.createRun(null, commands);
        expect(success2Run.status).to.equal('created');
        success2Run.status = 'succeeded';
        var updateSuccessPail2 = pail.updatePail(success2Run);
        expect(updateSuccessPail2.status).to.equal('succeeded');
        var success3Run = fishfinder.createRun(null, commands);
        expect(success3Run.status).to.equal('created');
        success3Run.status = 'succeeded';
        var updateSuccessPail3 = pail.updatePail(success3Run);
        expect(updateSuccessPail3.status).to.equal('succeeded');
        expect(pail.getPailByName('last')).to.equal(success3Run.id);
        fishfinder.deleteRun(success2Run.id);
        expect(pail.getPailByName('last')).to.equal(success3Run.id);
        fishfinder.deleteRun(success1Run.id);
        fishfinder.deleteRun(success3Run.id);
        done();
    });

    it('getPreviousRun', function (done) {

        var fishfinder = new FishFinder(internals.defaults);
        // 3 success
        var pail = new Pail({ dirPath: internals.defaults.dirPath });
        var commands = ['uptime', 'date'];
        var success1Run = fishfinder.createRun(null, commands);
        expect(success1Run.status).to.equal('created');
        success1Run.status = 'succeeded';
        var updateSuccessPail1 = pail.updatePail(success1Run);
        expect(updateSuccessPail1.status).to.equal('succeeded');
        var success2Run = fishfinder.createRun(null, commands);
        expect(success2Run.status).to.equal('created');
        success2Run.status = 'succeeded';
        var updateSuccessPail2 = pail.updatePail(success2Run);
        expect(updateSuccessPail2.status).to.equal('succeeded');
        var success3Run = fishfinder.createRun(null, commands);
        expect(success3Run.status).to.equal('created');
        success3Run.status = 'succeeded';
        var updateSuccessPail3 = pail.updatePail(success3Run);
        expect(updateSuccessPail3.status).to.equal('succeeded');
        expect(pail.getPailByName('last')).to.equal(success3Run.id);
        var run = fishfinder.getPreviousRun(success3Run.id);
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
