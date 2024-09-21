#!/bin/bash
curl -sL https://raw.githubusercontent.com/jakguru/ts-app-starter/refs/heads/main/bin/init.cjs -o /tmp/ts-app-starter-initializer.cjs 
node /tmp/ts-app-starter-initializer.cjs 
rm /tmp/ts-app-starter-initializer.cjs
