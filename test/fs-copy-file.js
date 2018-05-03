'use strict';

const path = require('path');
const fs = require('fs');
const test = require('tape');
const tryToCatch = require('try-to-catch');
const {promisify} = require('util');

const {
    COPYFILE_FICLONE,
    COPYFILE_FICLONE_FORCE,
    COPYFILE_EXCL,
} = require('..').constants;

const fixture = path.join(__dirname, 'fixture');
const noop = () => {};

test('fs.copyFile: no args: message', async (t) => {
    const copyFileOriginal = fs.copyFile;
    fs.copyFile = null;
    
    const copyFile = promisify(rerequire('..'));
    const _copyFile = promisify(copyFile);
    
    const msg = 'The "callback" argument must be of type function';
    const [e] = await tryToCatch(_copyFile);
    
    fs.copyFile = copyFileOriginal;
    
    t.equal(e.message, msg, 'should throw when no callback');
    t.end();
});

test('copyFile: no args: code', async (t) => {
    const copyFileOriginal = fs.copyFile;
    fs.copyFile = null;
    
    const copyFile = promisify(rerequire('..'));
    const _copyFile = promisify(copyFile);
    
    const code = 'ERR_INVALID_CALLBACK';
    const [e] = await tryToCatch(_copyFile);
    
    fs.copyFile = copyFileOriginal;
    
    t.equal(e.code, code, 'should throw when no callback');
    t.end();
});

test('copyFile: no dest', async (t) => {
    const src = '1';
    const dest = 0;
    
    const original = fs.copyFile;
    fs.copyFile = null;
    const copyFile = rerequire('..');
    const _copyFile = promisify(copyFile);
    
    const [e] = await tryToCatch(_copyFile, src, dest);
    const msg = 'The "dest" argument must be one of type string, Buffer, or URL. Received type number';
    fs.copyFile = original;
    
    t.equal(e.message, msg, 'should throw when dest not string');
    t.end();
});

test('copyFile: no src', async (t) => {
    const src = 1;
    const dest = '0';
    
    const original = fs.copyFile;
    fs.copyFile = null;
    const copyFile = rerequire('..');
    const _copyFile = promisify(copyFile);
    
    const [e] = await tryToCatch(_copyFile, src, dest);
    const msg = 'The "src" argument must be one of type string, Buffer, or URL. Received type number';
    fs.copyFile = original;
    
    t.equal(e.message, msg, 'should throw when src not string');
    t.end();
});

test('copyFile: no src', async(t) => {
    const src = path.join(fixture, String(Math.random()));
    const dest = path.join(fixture, 'dest');
    
    const original = fs.copyFile;
    fs.copyFile = null;
    
    const copyFile = promisify(rerequire('..'));
    const [e] = await tryToCatch(copyFile, src, dest);
    
    fs.copyFile = original;
    
    t.equal(e.code, 'ENOENT', 'should not find file');
    t.end();
});

test('copyFile', async (t) => {
    const src = path.join(fixture, 'src');
    const dest = path.join(fixture, 'dest');
    
    const original = fs.copyFile;
    fs.copyFile = null;
    
    const copyFile = promisify(rerequire('..'));
    await tryToCatch(copyFile, src, dest);
    
    const data = fs.readFileSync(dest, 'utf8');
    fs.unlinkSync(dest);
    fs.copyFile = original;
    
    t.equal(data, 'hello\n', 'should copy file');
    t.end();
});

test('copyFile: original', async (t) => {
    const src = path.join(fixture, 'src');
    const dest = path.join(fixture, 'dest');
    
    const copyFile = promisify(rerequire('..'));
    await tryToCatch(copyFile, src, dest);
    
    const data = fs.readFileSync(dest, 'utf8');
    fs.unlinkSync(dest);
    
    t.equal(data, 'hello\n', 'should copy file');
    t.end();
});

test('copyFile: EEXIST', async (t) => {
    const src = path.join(fixture, 'src');
    const dest = path.join(fixture, 'dest');
    const {COPYFILE_EXCL} = fs.constants;
    
    const original = fs.copyFile;
    fs.copyFile = null;
    
    fs.writeFileSync(dest, 'hello');
    
    const copyFile = promisify(rerequire('..'));
    const [e] = await tryToCatch(copyFile, src, dest, COPYFILE_EXCL);
    
    fs.copyFile = original;
    fs.unlinkSync(dest);
    
    t.equal(e.code, 'EEXIST', 'should return error');
    t.end();
});

test('copyFile: pipe', async (t) => {
    const src = path.join(fixture, 'src');
    const dest = path.join(fixture, 'dest');
    
    const original = fs.copyFile;
    fs.copyFile = null;
    
    const copyFile = promisify(rerequire('..'));
    await tryToCatch(copyFile, src, dest, COPYFILE_EXCL);
    
    const data = fs.readFileSync(dest, 'utf8');
    fs.unlinkSync(dest);
    
    fs.copyFile = original;
    t.equal(data, 'hello\n', 'should copy file');
    t.end();
});

test('copyFile: COPYFILE_EXCL: EEXIST: pipe', async (t) => {
    const src = path.join(fixture, 'src');
    const dest = path.join(fixture, 'dest');
    
    const original = fs.copyFile;
    fs.copyFile = null;
    
    fs.writeFileSync(dest, 'hello');
    
    const copyFile = promisify(rerequire('..'));
    const [e] = await tryToCatch(copyFile, src, dest, COPYFILE_EXCL);
    
    fs.unlinkSync(dest);
    fs.copyFile = original;
    t.equal(e.code, 'EEXIST', 'should return error');
    t.end();
});

test('copyFile: COPYFILE_EXCL | COPYFILE_FICLONE : EEXIST: pipe', async (t) => {
    const src = path.join(fixture, 'src');
    const dest = path.join(fixture, 'dest');
    
    const original = fs.copyFile;
    fs.copyFile = null;
    
    fs.writeFileSync(dest, 'hello');
    
    const copyFile = promisify(rerequire('..'));
    const [e] = await tryToCatch(copyFile, src, dest, COPYFILE_EXCL | COPYFILE_FICLONE);
    
    fs.unlinkSync(dest);
    fs.copyFile = original;
    t.equal(e.code, 'EEXIST', 'should return error');
    t.end();
});

test('copyFile: COPYFILE_EXCL | COPYFILE_FICLONE_FORCE : EEXIST: pipe', async (t) => {
    const src = path.join(fixture, 'src');
    const dest = path.join(fixture, 'dest');
    
    const original = fs.copyFile;
    fs.copyFile = null;
    
    fs.writeFileSync(dest, 'hello');
    
    const copyFile = promisify(rerequire('..'));
    const [e] = await tryToCatch(copyFile, src, dest, COPYFILE_EXCL | COPYFILE_FICLONE_FORCE);
    
    fs.unlinkSync(dest);
    fs.copyFile = original;
    t.equal(e.code, 'EEXIST', 'should return error');
    t.end();
});

test('copyFile: pipe: COPYFILE_EXCL', async (t) => {
    const src = path.join(fixture, 'src');
    const dest = path.join(fixture, 'dest');
    
    const original = fs.copyFile;
    fs.copyFile = null;
    
    const copyFile = promisify(rerequire('..'));
    await tryToCatch(copyFile, src, dest, COPYFILE_EXCL);
    
    const data = fs.readFileSync(dest, 'utf8');
    fs.unlinkSync(dest);
    
    fs.copyFile = original;
    t.equal(data, 'hello\n', 'should copy file');
    t.end();
});

test('copyFile: COPYFILE_EXCL: stat: error', async (t) => {
    const src = path.join(fixture, 'src');
    const dest = path.join(fixture, 'dest');
    
    const original = fs.copyFile;
    const {stat} = fs;
    
    fs.copyFile = null;
    fs.stat = (name, cb) => cb(Error('hello'));
    
    const copyFile = promisify(rerequire('..'));
    const [e] = await tryToCatch(copyFile, src, dest, COPYFILE_EXCL);
    
    fs.copyFile = original;
    fs.stat = stat;
    
    t.equal(e.message, 'hello', 'should return stat error');
    t.end();
});

test('copyFile: bad flags: more', (t) => {
    const src = '1';
    const dest = '2';
    
    const original = fs.copyFile;
    fs.copyFile = null;
    
    const copyFile = rerequire('..');
    
    const fn = () => copyFile(src, dest, 8, noop);
    
    fs.copyFile = original;
    t.throws(fn, /EINVAL: invalid argument, copyfile -> '2'/, 'should throw');
    t.end();
});

test('copyFile: bad flags: less', (t) => {
    const src = '1';
    const dest = '2';
    
    const original = fs.copyFile;
    fs.copyFile = null;
    
    const copyFile = rerequire('..');
    
    const fn = () => copyFile(src, dest, -1, noop);
    
    fs.copyFile = original;
    t.throws(fn, /EINVAL: invalid argument, copyfile -> '2'/, 'should throw');
    t.end();
});

function rerequire(name) {
    delete require.cache[require.resolve(name)];
    return require(name);
}

