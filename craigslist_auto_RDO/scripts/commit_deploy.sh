#!/bin/bash
home=/Users/James/projects/auto/craigslist_auto_RDO
git_message=${1:-commit}

cd ${home}

if [ $# -gt 0 ] 
then
    git add --all &>/dev/null
    git commit -m "$1" &>/dev/null
    git push origin master &>/dev/null
    echo "git commit done"
fi

zip -r craigslist_auto_RDO.zip ./* &>/dev/null
echo "create zip file done"

aws s3 cp craigslist_auto_RDO.zip s3://qinchuan-toolbox &>/dev/null
echo "https://qinchuan-toolbox.s3.amazonaws.com/craigslist_auto_RDO.zip"

rm craigslist_auto_RDO.zip
echo "clean done"