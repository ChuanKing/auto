#!/bin/sh

# 1. VAR
SCRIPT_HOME=/home/ec2-user/auto
OUTPUT=${SCRIPT_HOME}/output
DATE=$(date '+%Y%m%d')

# 2. setup folders
mkdir -p ${OUTPUT}/raw-data
mkdir -p ${OUTPUT}/processed-data

# 3. exe crawler
cd ${SCRIPT_HOME}/craigslist_crawler
echo start getting data...
/home/ec2-user/.local/bin/scrapy crawl auto -o ${OUTPUT}/raw-data/${DATE}.jl

# 4. get exisiting file from S3
cd ${OUTPUT}/processed-data
touch new.jl historical.jl expired.jl
zip historical.zip historical.jl
rm historical.jl
aws s3 cp s3://qinchuan-auto/craigslist/historical/historical.zip ./
unzip historical.zip

# 5. run raw data organizer
cd ${SCRIPT_HOME}/craigslist_auto_RDO
node tst/testHandler.js ${DATE} ${OUTPUT}/raw-data ${OUTPUT}/processed-data

# 6. create report
cd ${SCRIPT_HOME}/craigslist_reporter
node run.js ${OUTPUT}/processed-data

# 7. zip output
cd ${OUTPUT}/processed-data
zip -r historical.zip historical.jl
zip -r ${DATE}-expired.zip expired.jl

# 8. clean s3 folder
aws s3 rm s3://qinchuan-auto/craigslist/historical/historical.zip
aws s3 rm s3://qinchuan-auto/craigslist/today-new/new.jl
aws s3 rm s3://qinchuan-auto/craigslist/today-new/index.html

# 9. upload
cd ${OUTPUT}/processed-data
aws s3 cp new.jl s3://qinchuan-auto/craigslist/today-new/new.jl
aws s3 cp new.jl s3://qinchuan-auto/craigslist/today-new/index.html
aws s3 cp historical.zip s3://qinchuan-auto/craigslist/historical/historical.zip
aws s3 cp ${DATE}-expired.zip s3://qinchuan-auto/craigslist/expired/${DATE}-expired.zip

# 10. clean up
rm -rf ${OUTPUT}
