#!/bin/sh
set -eu

# POSIX compatible way to get the script directory
DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

up(){
  bun run --cwd $DIR/src index.ts
}

test(){
  bun test --cwd $DIR/src 
}

"$@"
