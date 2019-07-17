#!/usr/bin/env python
# ***** BEGIN LICENSE BLOCK *****
# Version: MPL 1.1/GPL 2.0/LGPL 2.1
# 
# The contents of this file are subject to the Mozilla Public License
# Version 1.1 (the "License"); you may not use this file except in
# compliance with the License. You may obtain a copy of the License at
# http://www.mozilla.org/MPL/
# 
# Software distributed under the License is distributed on an "AS IS"
# basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See the
# License for the specific language governing rights and limitations
# under the License.
# 
# The Original Code is Komodo code.
# 
# The Initial Developer of the Original Code is ActiveState Software Inc.
# Portions created by ActiveState Software Inc are Copyright (C) 2000-2007
# ActiveState Software Inc. All Rights Reserved.
# 
# Contributor(s):
#   ActiveState Software Inc
# 
# Alternatively, the contents of this file may be used under the terms of
# either the GNU General Public License Version 2 or later (the "GPL"), or
# the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
# in which case the provisions of the GPL or the LGPL are applicable instead
# of those above. If you wish to allow use of your version of this file only
# under the terms of either the GPL or the LGPL, and not to allow others to
# use your version of this file under the terms of the MPL, indicate your
# decision by deleting the provisions above and replace them with the notice
# and other provisions required by the GPL or the LGPL. If you do not delete
# the provisions above, a recipient may use your version of this file under
# the terms of any one of the MPL, the GPL or the LGPL.
# 
# ***** END LICENSE BLOCK *****

"""Distutils setup script for luddite.py"""

import sys
import os
from distutils.core import setup


#---- support routines

def _getVersion():
    import luddite
    return luddite.__version__


#---- setup mainline

setup(name="luddite",
      version=_getVersion(),
      description="A tool for building Komodo UDL-based language extensions",
      author="ActiveState Komodo Team",
      author_email="komodo-feedback@ActiveState.com",
      url="https://www.activestate.com/komodo-ide",
      license="Komodo License",
      platforms=["Windows", "Linux", "Mac OS X"],
      long_description="""\
UDL (User-Defined Languages) is a system for building custom language
extensions for Komodo. Luddite (this package) is a tool for working with
UDL: compiling UDL resources, packaging bits into Komodo extensions.
""",
      keywords="udl komodo extension languages".split(),

      scripts=["luddite.py"],
      packages=["ludditelib"],
      package_dir={"ludditelib": "ludditelib"},
      package_data={"ludditelib": ["install.rdf.in"]},
     )

