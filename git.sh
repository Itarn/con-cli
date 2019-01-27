#!/usr/bin/env bash
git pull
git add .
if [ ! -n "$1" ] ;then
    git commit -m "提交代码"
else
    git commit -m "$1"
fi
git push