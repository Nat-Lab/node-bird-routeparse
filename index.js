var util = require('util'), stream = require('stream'), es = require('event-stream');
var args = process.argv.slice(2);

var parse_route = function (outfile) {
  var ln = 0;
  //var routes = [];
  var isFieldHead = line => /^(\d{4})-/.test(line);
  var robj = {};
  process.stdout.write('[');
  var isFirst = true;

  var read_stream = process.stdin.pipe(es.split()).pipe(es.mapSync(line => {
    read_stream.pause();
    ln++;
    try {
      if (ln % 100000 == 0) {
        var men = process.memoryUsage();
        console.error(`Line ${ln}, rss: ${men.rss}, heapTotal: ${men.heapTotal}, heapUsed: ${men.heapUsed}`);
      }
      line = line.replace(/\s+/g, ' ');
      if (isFieldHead(line)) {
        var fid = Number.parseInt(line.substring(0, 4));
        var rline = line.substring(5);
        switch (fid) {
          case 1007:
            var rinfo = rline.split(' ');
            if (robj.route) {
              var this_line = JSON.stringify(robj);
              if (isFirst && this_line.length > 0) { // TODO: wtf? 
                isFirst = false;
                process.stdout.write(JSON.stringify(robj));
              } else process.stdout.write(',' + JSON.stringify(robj));
            }
            var last = robj;
            robj = {};
            robj.route = rinfo[0] == '' ? last.route : rinfo[0];
            robj.via = rinfo[2];
            robj.dev = rinfo[4];
            robj.peer = rinfo[5].substring(1);
            robj.uptime = rinfo[6].slice(0, -1);
            break;
          case 1008:
            robj.types = rline.split(' ').slice(2);
            break;
          case 1012:
            robj.origin = rline.split(' ')[2];
        }
      } else {
        var rbase = line.split(' ').slice(1);
        switch (rbase[0]) {
          case 'BGP.as_path:':
            robj.as_path = rbase.slice(1).map(n => Number.parseInt(n));
            break;
          case 'BGP.next_hop:':
             robj.next_hop = rbase.slice(1);
            break;
          case 'BGP.local_pref':
            robj.local_pref = Number.parseInt(rbase.slice(1)[0]);
            break;
          case 'BGP.community:':
            robj.bgp_community = rbase.slice(1).map(s => s.replace(/[\(\)]/g, '').replace(',', ':'));
            break;
          case 'BGP.aggregator:':
            var aggr_ = rbase.slice(1);
            var aggr = {};
            aggr.ip = aggr_[0];
            aggr.asn = Number.parseInt(aggr_[1].replace('AS', ''));
            robj.aggregator = aggr;
        }
      }
    } catch (e) {
      console.error("err on line: " + ln, e)
    }
    read_stream.resume();
  }));

  read_stream.on('end', () => {
    process.stdout.write((isFirst ? '' : ',') + JSON.stringify(robj));
    process.stdout.write(']');
  });

};

parse_route();
