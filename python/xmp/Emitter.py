#!/usr/bin/env python

import sys
sys.path.insert(0,"../")
from gepard import Client

# ==========================================================================

client = Client.getInstance()

client.emit ( "ALARM" )
client.close()
