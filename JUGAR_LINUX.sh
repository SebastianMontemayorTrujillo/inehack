#!/bin/sh
set -eu
cd -- "$(dirname -- "$0")"
chmod u+x build/linux/voces-de-la-plaza.x86_64
exec ./build/linux/voces-de-la-plaza.x86_64 "$@"
