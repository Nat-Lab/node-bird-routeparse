node-bird-routeparse
---

Generate JSON from bird's stdout, if you nat-lab/node-bird-routedump use too much of memory, try this one.

### Todo

- Support recursive route

### Usage

```
root@router $ bird -v 'show route all' | node nbrp.js > routes.json
```

### Licenses

MIT
