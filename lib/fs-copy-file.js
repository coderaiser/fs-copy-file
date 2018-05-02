'use strict';

const fs = require('fs');
const _copyFile = require('@cloudcmd/copy-file');

const COPYFILE_EXCL = 1;

module.exports = fs.copyFile ? fs.copyFile : copyFile;

module.exports.constants = {
    COPYFILE_EXCL
};

function copyFile(src, dest, flags, callback) {
    if (!callback) {
        callback = flags;
        flags = 0;
    }
    
    check(src, dest, flags, callback);
    
    if (flags !== COPYFILE_EXCL)
        return _copyFile(src, dest, callback);
    
    fs.stat(dest, (error) => {
        if (!error)
            return callback(getEExist(src, dest));
        
        if (error.code !== 'ENOENT')
            return callback(error);
        
        _copyFile(src, dest, callback);
    });
}

function check(src, dest, flags, callback) {
    if (typeof callback !== 'function') {
        const error = TypeError('The "callback" argument must be of type function');
        error.code = 'ERR_INVALID_CALLBACK';
        throw error;
    }
    
    if (typeof dest !== 'string')
        throw TypeError('The "dest" argument must be one of type string, Buffer, or URL. Received type number');
    
    if (typeof src !== 'string')
        throw TypeError('The "src" argument must be one of type string, Buffer, or URL. Received type number');
    
    if (typeof flags === 'number' && flags && flags !== COPYFILE_EXCL)
        throw Error(`EINVAL: invalid argument, copyfile -> '${dest}'`);
}

function getEExist(src, dest) {
    const error = Error(`EEXIST: file already exists, copyfile '${src}' -> '${dest}'`);
    
    error.errno = -17;
    error.code = 'EEXIST';
    error.syscall = 'copyfile';
    error.path = src;
    error.dest = dest;
    
    return error;
}

