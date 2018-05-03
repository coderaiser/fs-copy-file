'use strict';

const fs = require('fs');
const _copyFile = require('@cloudcmd/copy-file');

const COPYFILE_EXCL = 1;
const COPYFILE_FICLONE = 2;
const COPYFILE_FICLONE_FORCE = 4;

const constants = {
    COPYFILE_EXCL,
    COPYFILE_FICLONE,
    COPYFILE_FICLONE_FORCE,
};

module.exports = fs.copyFile ? fs.copyFile : copyFile;
module.exports.constants = constants;

const isNumber = (a) => typeof a === 'number';
const or = (a, b) => a | b;
const getValue = (obj) => (key) => obj[key];

const getMaxMask = (obj) => Object
    .keys(obj)
    .map(getValue(obj))
    .reduce(or);

const MAX_MASK = getMaxMask(constants);
const isExcl = (flags) => flags & COPYFILE_EXCL;

function copyFile(src, dest, flags, callback) {
    if (!callback) {
        callback = flags;
        flags = 0;
    }
    
    check(src, dest, flags, callback);
    
    if (isExcl(flags) !== COPYFILE_EXCL)
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
    
    if (flags && isNumber(flags) && (flags > MAX_MASK || flags < 0))
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

