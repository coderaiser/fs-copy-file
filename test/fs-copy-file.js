'use strict';

const path = require('path');
const fs = require('fs');
const test = require('tape');
const {promisify} = require('util');
const copyFile = require('../lib/fs-copy-file');

const {COPYFILE_EXCL} = fs.constants;

const fixture = path.join(__dirname, 'fixture');
const noop = () => {};

test('fs.copyFile: no args: message', (t) => {
    promisify(fs.copyFile)().catch((e) => {
        promisify(copyFile)().catch((error) => {
            t.equal(e.message, error.message, 'should throw when no callback');
            t.end();
        });
    });
});

test('copyFile: no args: message', (t) => {
    const original = fs.copyFile;
    fs.copyFile = null;
    const copyFile = rerequire('../lib/fs-copy-file');
    const fn = promisify(copyFile);
    
    promisify(original)().catch((e) => {
        fn().catch((error) => {
            fs.copyFile = original;
            
            t.equal(e.message, error.message, 'should throw when no callback');
            t.end();
        });
    });
});

test('copyFile: no args: code', (t) => {
    const original = fs.copyFile;
    fs.copyFile = null;
    const copyFile = rerequire('../lib/fs-copy-file');
    const fn = promisify(copyFile);
    
    promisify(original)().catch((e) => {
        fn().catch((error) => {
            fs.copyFile = original
            t.equal(e.code, error.code, 'should code be equal');
            t.end();
        });
    });
});

test('copyFile: no dest', (t) => {
    const src = '1';
    const dest = 0;
    
    const original = fs.copyFile;
    fs.copyFile = null;
    const copyFile = rerequire('../lib/fs-copy-file');
    const fn = promisify(copyFile);
    
    promisify(original)(src, dest, noop).catch((e) => {
        fn(src, dest, noop).catch((error) => {
            fs.copyFile = original;
            t.equal(e.message, error.message, 'should throw when no dest');
            t.end();
        });
    });
});

test('copyFile: no src', (t) => {
    const src = 1;
    const dest = '0';
    
    const original = fs.copyFile;
    fs.copyFile = null;
    const copyFile = rerequire('../lib/fs-copy-file');
    const fn = promisify(copyFile);
    
    promisify(original)(src, dest, noop).catch((e) => {
        fn(src, dest, noop).catch((error) => {
            fs.copyFile = original;
            t.equal(e.message, error.message, 'should throw when no dest');
            t.end();
        });
    });
});

test('copyFile: no src', (t) => {
    const src = path.join(fixture, String(Math.random()));
    const dest = path.join(fixture, 'dest');
    
    const original = fs.copyFile;
    fs.copyFile = null;
    const copyFile = rerequire('../lib/fs-copy-file');
    
    copyFile(src, dest, (error) => {
        fs.copyFile = original;
        t.equal(error.code, 'ENOENT', 'should not find file');
        t.end();
    });
});

test('copyFile', (t) => {
    const src = path.join(fixture, 'src');
    const dest = path.join(fixture, 'dest');
    
    const original = fs.copyFile;
    fs.copyFile = null;
    const copyFile = rerequire('../lib/fs-copy-file');
    
    copyFile(src, dest, () => {
        const data = fs.readFileSync(dest, 'utf8');
        fs.unlinkSync(dest);
        fs.copyFile = original;
        
        t.equal(data, 'hello\n', 'should copy file');
        t.end();
    });
});

test('copyFile: EEXIST', (t) => {
    const src = path.join(fixture, 'src');
    const dest = path.join(fixture, 'dest');
    const {COPYFILE_EXCL} = fs.constants;
    
    const original = fs.copyFile;
    fs.copyFile = null;
    const copyFile = rerequire('../lib/fs-copy-file');
    
    fs.writeFileSync(dest, 'hello');
    
    copyFile(src, dest, COPYFILE_EXCL, (error) => {
        fs.copyFile = original;
        fs.unlinkSync(dest);
        t.equal(error.code, 'EEXIST', 'should return error');
        t.end();
    });
});

test('copyFile: pipe', (t) => {
    const src = path.join(fixture, 'src');
    const dest = path.join(fixture, 'dest');
    
    const original = fs.copyFile;
    fs.copyFile = null;
    
    const copyFile = rerequire('../lib/fs-copy-file');
    
    copyFile(src, dest, () => {
        const data = fs.readFileSync(dest, 'utf8');
        fs.unlinkSync(dest);
        
        fs.copyFile = original;
        t.equal(data, 'hello\n', 'should copy file');
        t.end();
    });
});

test('copyFile: EEXIST: pipe', (t) => {
    const src = path.join(fixture, 'src');
    const dest = path.join(fixture, 'dest');
    
    const original = fs.copyFile;
    fs.copyFile = null;
    const copyFile = rerequire('../lib/fs-copy-file');
    
    fs.writeFileSync(dest, 'hello');
    
    copyFile(src, dest, COPYFILE_EXCL, (error) => {
        fs.unlinkSync(dest);
        fs.copyFile = original;
        t.equal(error.code, 'EEXIST', 'should return error');
        t.end();
    });
});

test('copyFile: pipe: COPYFILE_EXCL', (t) => {
    const src = path.join(fixture, 'src');
    const dest = path.join(fixture, 'dest');
    
    const original = fs.copyFile;
    fs.copyFile = null;
    
    const copyFile = rerequire('../lib/fs-copy-file');
    
    copyFile(src, dest, COPYFILE_EXCL, (error) => {
        console.log(error);
        const data = fs.readFileSync(dest, 'utf8');
        fs.unlinkSync(dest);
        
        fs.copyFile = original;
        t.equal(data, 'hello\n', 'should copy file');
        t.end();
    });
});

test('copyFile: COPYFILE_EXCL: stat: error', (t) => {
    const src = path.join(fixture, 'src');
    const dest = path.join(fixture, 'dest');
    
    const original = fs.copyFile;
    const {stat} = fs;
    
    fs.copyFile = null;
    fs.stat = (name, cb) => {
        cb(Error('hello'));
    }
    
    const copyFile = rerequire('../lib/fs-copy-file');
    
    copyFile(src, dest, COPYFILE_EXCL, (error) => {
        fs.copyFile = original;
        fs.stat = stat;
        
        t.equal(error.message, 'hello', 'should return stat error');
        t.end();
    });
});

test('copyFile: bad flags', (t) => {
    const src = '1';
    const dest = '2';
    
    const original = fs.copyFile;
    fs.copyFile = null;
    
    const copyFile = rerequire('../lib/fs-copy-file');
    
    const fn = () => copyFile(src, dest, 4, noop);
    
    fn.copyFile = original;
    t.throws(fn, /EINVAL: invalid argument, copyfile -> '2'/, 'should throw');
    t.end();
});

function rerequire(name) {
    delete require.cache[require.resolve(name)];
    return require(name);
}

