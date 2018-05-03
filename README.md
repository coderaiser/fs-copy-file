fs-copy-file [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]
=========
Node.js v8.5.0 [fs.copyFile](https://nodejs.org/dist/latest-v10.x/docs/api/fs.html#fs_fs_copyfile_src_dest_flags_callback) [ponyfill](https://ponyfill.com).

Asynchronously copies `src` to `dest`. By default, dest is overwritten if it already exists. No arguments other than a possible exception are given to the callback function. Node.js makes no guarantees about the atomicity of the copy operation. If an error occurs after the destination file has been opened for writing, Node.js will attempt to remove the destination.

`flags` is an optional integer that specifies the behavior of the copy operation. It is possible to create a mask consisting of the bitwise OR of two or more values (e.g. `fs.constants.COPYFILE_EXCL | fs.constants.COPYFILE_FICLONE`).

- `fs.constants.COPYFILE_EXCL` - The copy operation will fail if dest already exists.
- `fs.constants.COPYFILE_FICLONE` - The copy operation will attempt to create a copy-on-write reflink. If the platform does not support copy-on-write, then a fallback copy mechanism is used.
- `fs.constants.COPYFILE_FICLONE_FORCE` - The copy operation will attempt to create a copy-on-write reflink. If the platform does not support copy-on-write, then the operation will fail.

## Install

```
npm i fs-copy-file
```

## API

Create pipe between streams and adds callback wich would 
be called once whenever everything is done, or error occures.

```js
const copyFile = require('fs-copy-file');

// destination.txt will be created or overwritten by default.
copyFile('source.txt', 'destination.txt', (err) => {
    if (err)
        throw err;
    
    console.log('source.txt was copied to destination.txt');
});
```

If the third argument is a number, then it specifies flags, as shown in the following example.

```js
const copyFile = require('fs-copy-file');
const { COPYFILE_EXCL } = copyFile.constants;

// By using COPYFILE_EXCL, the operation will fail if destination.txt exists.
fs.copyFile('source.txt', 'destination.txt', COPYFILE_EXCL, callback);
```

## Related

- [fs-copy-file-sync](https://github.com/coderaiser/fs-copy-file-sync "fs-copy-file-sync") - Synchronously copies src to dest.

## License
MIT

[NPMIMGURL]:                https://img.shields.io/npm/v/fs-copy-file.svg?style=flat
[BuildStatusIMGURL]:        https://img.shields.io/travis/coderaiser/fs-copy-file/master.svg?style=flat
[DependencyStatusIMGURL]:   https://img.shields.io/gemnasium/coderaiser/fs-copy-file.svg?style=flat
[LicenseIMGURL]:            https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[CoverageIMGURL]:           https://coveralls.io/repos/coderaiser/fs-copy-file/badge.svg?branch=master&service=github
[NPMURL]:                   https://npmjs.org/package/fs-copy-file "npm"
[BuildStatusURL]:           https://travis-ci.org/coderaiser/fs-copy-file  "Build Status"
[DependencyStatusURL]:      https://gemnasium.com/coderaiser/fs-copy-file "Dependency Status"
[LicenseURL]:               https://tldrlegal.com/license/mit-license "MIT License"
[CoverageURL]:              https://coveralls.io/github/coderaiser/fs-copy-file?branch=master

