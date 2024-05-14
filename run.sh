#!/bin/sh
set -eu

# POSIX compatible way to get the script directory
DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

up(){
  bun run $DIR/index.ts
}

"$@"
