SRCPATH=$(dirname $0)
node $SRCPATH/../../node_modules/minijasminenode/bin/minijn $SRCPATH/specs/smoke.js
node $SRCPATH/../../node_modules/minijasminenode/bin/minijn $SRCPATH/specs/files.js
node $SRCPATH/../../node_modules/minijasminenode/bin/minijn $SRCPATH/specs/rewrite.js
