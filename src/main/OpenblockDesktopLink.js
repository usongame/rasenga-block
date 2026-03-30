import {app} from 'electron';
import path from 'path';
import os from 'os';
import {execFile, spawn} from 'child_process';
import fs from 'fs-extra';

import sudo from 'sudo-prompt';
import {productName} from '../../package.json';

import OpenBlockLink from 'openblock-link';
import OpenblockResourceServer from 'openblock-resource';

class OpenblockDesktopLink {
    constructor () {
        this._resourceServer = null;

        this.appPath = app.getAppPath();
        if (this.appPath.search(/app/g) !== -1) {
            // Normal app
            this.appPath = path.join(this.appPath, '../../');
        } else if (this.appPath.search(/main/g) !== -1) { // eslint-disable-line no-negated-condition
            // Start by start script in debug mode.
            this.appPath = path.join(this.appPath, '../../');
        } else {
            // App in dir mode
            this.appPath = path.join(this.appPath, '../');
        }

        const userDataPath = app.getPath(
            'userData'
        );
        this.dataPath = path.join(userDataPath, 'Data');

        const cacheResourcesPath = path.join(this.dataPath, 'external-resources');
        if (!fs.existsSync(cacheResourcesPath)) {
            fs.mkdirSync(cacheResourcesPath, {recursive: true});
        }

        this._link = new OpenBlockLink(this.dataPath, path.join(this.appPath, 'tools'));
        this._resourceServer = new OpenblockResourceServer(cacheResourcesPath,
            path.join(this.appPath, 'external-resources'),
            app.getLocaleCountryCode());
    }

    get resourceServer () {
        return this._resourceServer;
    }

    installDriver (callback = null) {
        const driverPath = path.join(this.appPath, 'drivers');

        // Check if drivers directory exists
        if (!fs.existsSync(driverPath)) {
            console.error(`Drivers directory not found: ${driverPath}`);
            if (callback) {
                callback(new Error(`Drivers directory not found: ${driverPath}`));
            }
            return;
        }

        if ((os.platform() === 'win32') && (os.arch() === 'x64')) {
            const batPath = path.join(driverPath, 'install_x64.bat');
            if (!fs.existsSync(batPath)) {
                console.error(`Driver installer not found: ${batPath}`);
                if (callback) callback(new Error('Driver installer not found'));
                return;
            }
            execFile(batPath, [], {cwd: driverPath}, (error) => {
                if (error) {
                    console.error('Failed to install driver:', error);
                }
                if (callback) callback(error);
            });
        } else if ((os.platform() === 'win32') && (os.arch() === 'ia32')) {
            const batPath = path.join(driverPath, 'install_x86.bat');
            if (!fs.existsSync(batPath)) {
                console.error(`Driver installer not found: ${batPath}`);
                if (callback) callback(new Error('Driver installer not found'));
                return;
            }
            execFile(batPath, [], {cwd: driverPath}, (error) => {
                if (error) {
                    console.error('Failed to install driver:', error);
                }
                if (callback) callback(error);
            });
        } else if ((os.platform() === 'darwin')) {
            const installScript = path.join(driverPath, 'install.sh');
            if (!fs.existsSync(installScript)) {
                console.error(`Driver installer not found: ${installScript}`);
                if (callback) callback(new Error('Driver installer not found'));
                return;
            }
            // Use execFile instead of spawn with shell:true for better error handling
            const child = spawn('/bin/sh', [installScript], {
                cwd: driverPath,
                detached: true,
                stdio: 'ignore'
            });
            child.on('error', (error) => {
                console.error('Failed to spawn driver installer:', error);
                if (callback) callback(error);
            });
            child.unref();
            // Callback immediately since the script runs independently
            if (callback) callback(null);
        } else if ((os.platform() === 'linux')) {
            const setupScript = path.join(driverPath, 'linux_setup.sh');
            if (!fs.existsSync(setupScript)) {
                console.error(`Driver installer not found: ${setupScript}`);
                if (callback) callback(new Error('Driver installer not found'));
                return;
            }
            sudo.exec(`sh "${setupScript}" yang`, {name: productName},
                error => {
                    if (error) {
                        console.error('Failed to install driver:', error);
                    }
                    if (callback) {
                        callback(error);
                    }
                }
            );
        }
    }

    clearCache (reboot = true) {
        if (fs.existsSync(this.dataPath)) {
            fs.rmSync(this.dataPath, {recursive: true, force: true});
        }
        if (reboot){
            app.relaunch();
            app.exit();
        }
    }

    start () {
        this._link.listen();

        // start resource server
        this._resourceServer.listen();
    }
}

export default OpenblockDesktopLink;
