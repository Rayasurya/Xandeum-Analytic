#!/usr/local/bin/python3.10
# -*- coding: utf-8 -*-
import re
import shutil
import sys
from os import makedirs
from aixblock_core.server import initialize_database, _setup_env
from django.core.management import call_command

if __name__ == '__main__':
    sys.argv[0] = re.sub(r'(-script\.pyw|\.exe)?$', '', sys.argv[0])
    _setup_env()
    call_command('migrate')
    makedirs("static", 0o775, True)
    initialize_database()
    shutil.rmtree("static")
