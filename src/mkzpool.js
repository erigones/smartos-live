#! /usr/node/bin/node

/*
 * Copyright 2012 Joyent, Inc.  All rights reserved.
 * Copyright 2016 Erigones, s. r. o. All rights reserved.
 */

var fs = require('fs');
var zfs = require('/usr/node/node_modules/zfs');
var getopt = require('/usr/node/node_modules/getopt');

function
fatal(msg)
{
	console.log('fatal error: ' + msg);
	process.exit(-1);
}

function
usage()
{
	console.log('usage: ' + process.argv[0] + '[-f] [-B] [-R <altroot>] <pool> <file.json>');
	process.exit(-1);
}

var json;
var config;
var pool;
var altroot;

var option;
var opt_f = false;
var opt_R = false;
var opt_efi = false;
var parser = new getopt.BasicParser('fBR:', process.argv);

while ((option = parser.getopt()) !== undefined && !option.error) {
	switch (option.option) {
	case 'f':
		opt_f = true;
		continue;
    case 'R':
        opt_R = true;
        altroot = option.optarg;
        continue;
	case 'B':
		opt_efi = true;
		continue;
	default:
		usage();
		break;
	}
}

if (option && option.error)
	usage();

if (!process.argv[parser.optind()] || !process.argv[parser.optind() + 1])
	usage();

pool = process.argv[parser.optind()];
json = fs.readFileSync(process.argv[parser.optind() + 1], 'utf8');
config = JSON.parse(json);

if (opt_efi == true) {
    zfs.zpool.efi_create(pool, config, opt_f, altroot, function (err) {
        if (err) {
            fatal('pool creation failed: ' + err);
        }
    });
} else if (opt_R !== true) {
    zfs.zpool.create(pool, config, opt_f, function (err) {
        if (err) {
            fatal('pool creation failed: ' + err);
        }
    });
} else {
    zfs.zpool.rcreate(pool, config, opt_f, altroot, function (err) {
        if (err) {
            fatal('pool creation failed: ' + err);
        }
    });
}

