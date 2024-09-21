#!/bin/bash
curl -sL https://raw.githubusercontent.com/jakguru/ts-app-starter/refs/heads/main/bin/init.cjs -o /tmp/init-ts-app-starter.cjs 
node /tmp/init-ts-app-starter.cjs 
rm /tmp/init-ts-app-starter.cjs
