node-bird-routeparse
---

Generate JSON from bird's stdout. 

### Todo

- Support recursive route

### Usage

```
root@router $ git clone https://github.com/Nat-Lab/node-bird-routeparse
root@router $ cd node-bird-routeparse
root@router $ npm i
root@router $ bird -v 'show route all' | node index.js > routes.json
```

### Licenses

MIT
