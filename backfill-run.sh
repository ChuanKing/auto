#!/bin/sh

# 1. VAR
SCRIPT_HOME=/Users/James/projects/auto
OUTPUT=${SCRIPT_HOME}/output
DATE=$1

# 2. clean file
cd ${OUTPUT}/processed-data
rm expired.jl
rm new.jl

# 3. run raw data organizer
cd ${SCRIPT_HOME}/craigslist_auto_RDO
node tst/testHandler.js ${DATE} ${OUTPUT}/raw-data ${OUTPUT}/processed-data

# 4. zip output
cd ${OUTPUT}/processed-data
zip -r ${DATE}-expired.zip expired.jl

wc -l new.jl&& wc -l historical.jl && wc -l expired.jl