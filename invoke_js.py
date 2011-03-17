#!/usr/local/bin/python
# -*- coding: utf-8 -*-

"""A simple script to invoke a given javascript file within Adobe
Photoshop environment"""

import os
import sys
import appscript


def main(path, args):
    """The main function"""

    ps_app = appscript.app('Adobe Photoshop CS4')

    # If there are paths among arguments, convert them to absolute paths
    normalized_args = []
    for arg in args:
        if os.path.exists(arg):
            normalized_args.append(os.path.abspath(arg))
        else:
            normalized_args.append(arg)

    ps_app.do_javascript(open(path, 'r').read(),
                         with_arguments=normalized_args)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print 'Usage: invoke-js.py SCRIPT_NAME [arguments ...]'
        exit(1)

    main(sys.argv[1], sys.argv[2:])
