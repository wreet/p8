#!/usr/bin/env node
// this source code is distributed under the terms of the Bad Code License.
// you are forbidden from distributing software containing this code to end users, because it's bad
// https://twitter.com/s1guza/status/1141964422354743296

var dns = require("dns");
var async = require("async");
var fs = require("fs");

dns.setServers([ // we want fast, reliable resolution
  "8.8.8.8",
  "8.8.4.4"
]);

process.on("exit", function() {
  // handle alerting
  if (p8.discovered.length == 0) {
    //if (p8.args.domain) console.log("[-] did not find any subdomains for '%s'", p8.args.domain[0]);
    return;
  }
  for (var h of p8.discovered) {
    console.log("[+] discovered subdomain: %s", h.host);
  }
  if (p8.args.outfile) {
    fs.writeFileSync(p8.args.outfile, p8.discovered.map(function(h) {
      return h.host;
    }).join("\n"));
  }
});

var p8 = {
  args: {}, // current run args
  discovered: [], // domains we have found
  run: { // stuff we need 
    variations: [],
    sublist: []
  }, // end run

  lookup: function(domain) { // individual lookups flow through here
    dns.resolveAny(domain, function(err, res) {
      if (err) return; // keep it quiet
      //console.log(res);
      p8.discovered.push({
        host: domain
      });
      // if variations on we need to check this one too
      if (p8.args.variations) p8.checkDomainVariations(domain);
      // if recursive enabled we have to go again
      if (p8.args.recursive) {
        console.log("going recurse: " + domain);
        p8.enumerateSubs(domain);
      }
    });
  }, // end lookup

  checkDomainVariations: function(domain) {
    if (domain == "") return;
    // first make sure this is not wildcard
    var rand = "wreet" + Math.floor(Math.random() * 1000000).toString();
    dns.resolveAny(rand + "." + domain, function(err, res) {
      if(!err) {
        console.log("[i] wildcard: *.%s", domain);
        return;
      }
      console.log("[i] searching for common variations of '%s'", domain);
      if (p8.run.variations.length == 0) {
        // get it
        try {
          p8.run.variations = fs.readFileSync("./subs/variations.txt").toString().split("\n");
        } catch(e) {
          console.log("[!} could not open variations file: %s", e);
          process.exit();
        }
      } // end variation check
      for (var v of p8.run.variations) {
        if (v == "") continue; // sometimes we get blanks in the lines, thanks echo 
        p8.lookup(v + "." + domain);
      } // end variation iter
    }); // end wildcard check
  }, // end checkDomainVariations

  enumerateSubs: function(domain) {
    // first make sure this is not wildcard
    var rand = "wreet" + Math.floor(Math.random() * 1000000).toString();
    dns.resolveAny(rand + "." + domain, function(err, res) {
      if(!err) {
        console.log("[!] %s returns wildcard, cannot enumerate", domain);
        return;
      }
      console.log("[i] enumerating subdomains for '%s':", domain);
      if (p8.run.sublist.length == 0) {
        // get it
        try {
          p8.run.sublist = fs.readFileSync("./subs/subs.txt").toString().split("\n");
        } catch(e) {
          console.log("[!] could not open subdomains file: %s", e);
          process.exit();
        }
        async.each(p8.run.sublist, function(sub) {
          p8.lookup(sub + "." + domain);
        }, function(err) {
          if (err) console.log("[!] %s", err);
        });
      }
    }); // end wildcard check
  }, // end enumerateSubs

  parseArgs: function(args) {
    for (var i = 0; i < args.length; i++) {
      var arg = args[i];
      switch(arg) {
        case "-d": // url
          p8.args.domain = [args[++i]];
          if (p8.args.domain[0].indexOf("/") != -1) {
            p8.args.domain = fs.readFileSync(p8.args.domain[0]).toString().split("\n");
          }
          break;

        case "-e": // enumerate subs
          p8.args.enumerate_subs = true;
          break;

        case "-v": // try variations
          p8.args.variations = true;
          break; 

        case "-o": // outfile, will be list of subs
          p8.args.outfile = args[++i];
          break;

        case "-r": // recursive enumeration
          p8.args.recursive = true;
          break;

        case "-t": // only show subs with matching dns records
          p8.args.type = agrs[++i].toUpperCase();
          break;

        default:
          console.log("[!] did not recognize parameter '%s'", arg);
          p8.usage();
      }
    } // end arg iter
  }, // end parseargs

  usage: function() {
    console.log("[~] p8.js %s - subhunter by %s", require("./package.json").version, "@chaseahiggins");
    console.log("usage: p8.js [opts]")
    console.log("options:");
    console.log("    -d   the domain to test or path to domains list");
    console.log("    -v   test common variations of target domains(eg. dev.domain.com)");
    console.log("    -e   enumerate most common subs, can be used with -v to test sub variations");
    console.log("    -t   only show subs with record type -t(like dig, defauly is any)")
    console.log("    -o   output domains to a list, separated by newlines");
    //console.log("    -r   recursive enumeration for discovered subdomains(slower)");
    console.log();
    console.log("in variation mode, domains arg can take path to file of domains to test for variations");
    console.log("note: path must include a slash, eg ./domains.txt");
    process.exit();
  }, // end usage
}; // end p8

function main() {
  // load variations and common subs
  if (process.argv.length < 3) p8.usage();
  var cmd = process.argv[2];
  p8.parseArgs(process.argv.slice(2));
  // decide what is about to go down
  if (p8.args.variations && !p8.args.enumerate_subs) {
    p8.args.domain.forEach(function(d) {
      if (d) p8.checkDomainVariations(d);
    });
  } else if (p8.args.enumerate_subs) {
    p8.args.domain.forEach(function(d) {
      if (d) p8.enumerateSubs(d);
    });
  }
} // end main

main();