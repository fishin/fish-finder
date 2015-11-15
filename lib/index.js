'use strict';

const Bobber = require('bobber');
const Hoek = require('hoek');
const Pail = require('pail');
const Path = require('path');
const Smelt = require('smelt');

const internals = {
    runs: {},
    defaults: {
        dirPath: '/tmp/fishfinder/runs',
        workspace: 'workspace'
    }
};

module.exports = internals.FishFinder = function (options) {

    const settings = Hoek.applyToDefaults(internals.defaults, options);
    internals.FishFinder.settings = settings;
    settings.getRuns = exports.getRuns;
    this.createRun = exports.createRun;
    this.startRun = exports.startRun;
    this.cancelRun = exports.cancelRun;
    this.getRun = exports.getRun;
    this.getRunPids = exports.getRunPids;
    this.getPreviousRun = exports.getPreviousRun;
    this.getRuns = exports.getRuns;
    this.deleteRun = exports.deleteRun;
    this.deleteRuns = exports.deleteRuns;
    this.createWorkspace = exports.createWorkspace;
    this.deleteWorkspace = exports.deleteWorkspace;
//    this.getActiveRuns = exports.getActiveRuns;
    internals.FishFinder.createRun = exports.createRun;
    internals.FishFinder.getRun = exports.getRun;
    internals.FishFinder.getRuns = exports.getRuns;
    internals.FishFinder.getRunPids = exports.getRunPids;
    internals.FishFinder.deleteRun = exports.deleteRun;
    internals.FishFinder.getPreviousRun = exports.getPreviousRun;
    internals.FishFinder.createWorkspace = exports.createWorkspace;
    internals.FishFinder.deleteWorkspace = exports.deleteWorkspace;
};
/*
exports.getActiveRuns = function () {

    return internals.runs;
};
*/
exports.createRun = function (scm, cmds) {

    const commands = internals.buildCommandArray(cmds);
    const config = {
        commands: commands,
        scm: scm,
        status: 'created'
    };
    const path = Path.join(internals.FishFinder.settings.dirPath);
    const pail = new Pail({ dirPath: path });
    const result = pail.createPail(config);
    return result;
};

exports.cancelRun = function (runId) {

    const config = internals.FishFinder.getRun(runId);
    const pids = internals.FishFinder.getRunPids(runId);
    const path = Path.join(internals.FishFinder.settings.dirPath);
    const pail = new Pail({ dirPath: path });
    for (let i = 0; i < pids.length; ++i) {
        console.log('killing pids: ' + pids[i]);
        internals.killProcess(pids[i]);
    }
    config.status = 'cancelled';
    pail.updatePail(config);
    return config;
};

internals.killProcess = function (ppid) {

    process.kill(ppid, 'SIGTERM');
};

exports.getRun = function (runId) {

    const path = internals.FishFinder.settings.dirPath;
    const pail = new Pail({ dirPath: path });
    const config = pail.getPail(runId);
    //console.log(config);
    if (config) {
        if (config.finishTime) {
            config.elapsedTime = config.finishTime - config.startTime;
        }
    }
    else {
        console.log('no config for ' + runId);
    }
    return config;
};

exports.getRunPids = function (runId) {

    //console.log('getting pids for: ' + runId);
    if (internals.runs[runId]) {
        return internals.runs[runId].pids;
    }
    return [];
};

exports.getRuns = function () {

    const path = internals.FishFinder.settings.dirPath;
    const pail = new Pail({ dirPath: path });
    const runs = pail.getPails();
    const fullRuns = [];
    for (let i = 0; i < runs.length; ++i) {
        const run = internals.FishFinder.getRun(runs[i]);
        fullRuns.push(run);
    }
    fullRuns.sort((a, b) => {

        return b.createTime - a.createTime;
    });
    return fullRuns;
};

exports.deleteRun = function (runId) {

    const path = internals.FishFinder.settings.dirPath;
    const pail = new Pail({ dirPath: path });
    //console.log('deleting runId: ' + runId);
    const prevRun = internals.FishFinder.getPreviousRun(runId);
    pail.deletePail(runId);
    internals.fixRun(prevRun);
    return null;
};

exports.deleteRuns = function () {

    const path = Path.join(internals.FishFinder.settings.dirPath);
    const pail = new Pail({ dirPath: path });
    const runs = internals.FishFinder.getRuns();
    for (let i = 0; i < runs.length; ++i) {
        const runId = runs[i].id;
        pail.deletePail(runId);
    }
    return null;
};

internals.buildCommandArray = function (cmds) {

    const commands = [];
    for (let i = 0; i < cmds.length; ++i) {

        // parallel commands
        let cmdObj = {};
        if (typeof cmds[i] === 'object' ) {
            const parallelCommands = [];
            for (let j = 0; j < cmds[i].length; ++j) {

                cmdObj = { command: cmds[i][j] };
                parallelCommands.push(cmdObj);
            }
            commands.push(parallelCommands);
        }
        // serial commands
        else {
            cmdObj = { command: cmds[i] };
            commands.push(cmdObj);
        }
    }
    return commands;
};

internals.initializeActiveRun = function (runId) {

    internals.runs[runId] = { pids: [] };
};

exports.createWorkspace = function () {

    const pail = new Pail(internals.FishFinder.settings);
    pail.createDir(internals.FishFinder.settings.workspace);
};

exports.deleteWorkspace = function () {

    const pail = new Pail(internals.FishFinder.settings);
    pail.deleteDir(internals.FishFinder.settings.workspace);
};

exports.startRun = function (runId, cb) {

    // create workspace
    const pail = new Pail(internals.FishFinder.settings);
    internals.FishFinder.createWorkspace();
    let run = pail.getPail(runId);
    run.status = 'starting';
    const runConfig = pail.updatePail(run);
    const commands = internals.parseCommands(run.commands);
    internals.initializeActiveRun(runConfig.id);
    if (run.scm) {
        if (run.scm.type === 'git') {
            const bobber = new Bobber({});
            const pidsObj = internals.runs[runId].pids;
            const options = {
                path: Path.join(internals.FishFinder.settings.dirPath, internals.FishFinder.settings.workspace),
                scm: run.scm,
                pidsObj: pidsObj
            };
            bobber.checkoutCode(options, (result) => {

                run.checkout = result;
                if (result.status === 'failed') {
                    console.log(result.commands[0].stderr);
                    run.status = 'failed';
                    run.finishTime = new Date().getTime();
                    run.elapsedTime = run.finishTime - run.elapsedTime;
                    run = pail.updatePail(run);
                    internals.finishRun(run.id, 'failed', () => {

                        return cb(run.id);
                    });
                }
                else {
                    run = pail.updatePail(run);
                    if (run.scm.runOnCommit) {
                        //console.log('checking if commit was updated');
                        let prevCommit;
                        const runs = internals.FishFinder.getRuns();
                        if (runs.length > 1) {
                            prevCommit = runs[1].commit;
                        }
                        bobber.getLatestCommit(Path.join(internals.FishFinder.settings.dirPath, internals.FishFinder.settings.workspace), (afterCommit) => {

                            //console.log('prevCommit: ' + prevCommit);
                            //console.log('afterCommit: ' + afterCommit);
                            if (afterCommit === prevCommit) {
                                console.log('nothing to do');
                                pail.deletePail(run.id);
                                internals.cleanPids();
                                return cb(null);
                            }
                            internals.runCommands(run.id, commands, Hoek.ignore);
                            return cb(run.id);
                        });
                    }
                    else {
                        internals.runCommands(run.id, commands, Hoek.ignore);
                        return cb(run.id);
                    }
                }
            });
        }
        else {
            internals.runCommands(run.id, commands, Hoek.ignore);
            return cb(run.id);
        }
    }
    else {
        internals.runCommands(run.id, commands, Hoek.ignore);
        return cb(run.id);
    }
};

internals.parseCommands = function (cmds) {

    const commands = [];
    // need to get this back to a plain array list for exec
    for (let i = 0; i < cmds.length; ++i) {

        if (JSON.stringify(cmds[i]).match(',')) {
            const json = JSON.parse(JSON.stringify(cmds[i]));
            const parallelCommands = [];
            for (let j = 0; j < json.length; ++j) {
                parallelCommands.push(json[j].command);
            }
            commands.push(parallelCommands);
        }
        else {
            commands.push(cmds[i].command);
        }
    }
    return commands;
};

internals.cleanPids = function (runId) {

    delete internals.runs[runId];
};

internals.finishRun = function (runId, err, cb) {

    const pail = new Pail({ dirPath: internals.FishFinder.settings.dirPath });
    const run = pail.getPail(runId);
    if (run.scm) {
        if (run.scm.type === 'git') {
            const bobber = new Bobber({});
            const workspace = Path.join(internals.FishFinder.settings.dirPath, internals.FishFinder.settings.workspace);
            bobber.getLatestCommit(workspace, (commit) => {

                //console.log(commit);
                run.commit = commit;
                internals.finalizeFinishRun(err, runId, run, pail);
                return cb();
            });
        }
        else {
            internals.finalizeFinishRun(err, runId, run, pail);
            return cb();
        }
    }
    else {
        internals.finalizeFinishRun(err, runId, run, pail);
        return cb();
    }
};

internals.finalizeFinishRun = function (err, runId, run, pail) {

    if (err) {
        if (err.match('signal')) {
            run.status = 'cancelled';
        }
        else {
            run.status = 'failed';
        }
    }
    else {
        const prevRun = internals.FishFinder.getPreviousRun(runId);
        if (prevRun && prevRun.status !== 'succeeded' && prevRun.status !== 'fixed') {
            run.status = 'fixed';
        }
        else {
            run.status = 'succeeded';
        }
    }
    pail.updatePail(run);

    // we dont have to block on notify
    internals.cleanPids(runId);
};

exports.getPreviousRun = function (runId) {

    const runs = internals.FishFinder.getRuns();
    if (runs.length > 1) {
        // dont check last one as its not possible to have a previous
        for (let i = 0; i < runs.length - 1; ++i) {
            if (runs[i].id === runId) {
                return runs[i + 1];
            }
        }
    }
    return null;
};

internals.runCommands = function (runId, commands, cb) {

    const workspace = Path.join(internals.FishFinder.settings.dirPath, internals.FishFinder.settings.workspace);
    const smelt = new Smelt({ dirPath: workspace });
    const pidsObj = internals.runs[runId].pids;
    const options = {
        commands: commands,
        pidsObj: pidsObj
    };
    smelt.runCommands(options, (err, result) => {

        internals.saveResult(runId, result);
        internals.finishRun(runId, err, () => {

            return cb();
        });
    });
};

internals.saveResult = function (runId, result) {

    const path = Path.join(internals.FishFinder.settings.dirPath);
    const pail = new Pail({ dirPath: path });
    const run = pail.getPail(runId);
    //console.log(run);
    //console.log(result);
    run.commands = result;
    pail.updatePail(run);
};

internals.fixRun = function (prevRun) {

    const pail = new Pail({ dirPath: internals.FishFinder.settings.dirPath });
    let lastSuccess = null;
    let lastFail = null;
    let lastCancel = null;
    // move symlinks
    if (prevRun) {
        //console.log('prevRunId: ' + prevRun.id);
        const runs = internals.FishFinder.getRuns();

        // if prevRun is the last Id create the name again
        if (prevRun.id === runs[0].id) {
            //console.log('creating last for: ' + runs[0].id);
            pail.createName(runs[0].id, 'last');
        }
        for (let i = 0; i < runs.length; ++i) {
            const run = runs[i];
            if (!lastSuccess && run.status === 'succeeded') {
                lastSuccess = run.id;
                pail.createName(lastSuccess, 'lastSuccess');
            }
            if (!lastSuccess && run.status === 'fixed') {
                lastSuccess = run.id;
                pail.createName(lastSuccess, 'lastSuccess');
            }
            if (!lastFail && run.status === 'failed') {
                lastFail = run.id;
                pail.createName(lastFail, 'lastFail');
            }
            if (!lastCancel && run.status === 'cancelled') {
                lastCancel = run.id;
                pail.createName(lastCancel, 'lastCancel');
            }
        }
    }
};
