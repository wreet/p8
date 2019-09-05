# p8.js - subhunter

A basic subdomain enumeration tool

## usage
```
[~] p8.js - subhunter
usage: p8.js [opts]
options:
    -d   the domain to test or path to domains list
    -v   test common variations of target domains(eg. dev.domain.com)
    -e   enumerate most common subs, can be used with -v to test sub variations
    -o   output domains to a list, separated by newlines

in variation mode, domains arg can take path to file of domains to test for variations
note: path must include a slash, eg ./domains.txt
```

p8 accepts a domain or a list of domains and enumerates common subdomains by trying a list of the ~10000 most popular subdomains on the internet. What makes it different is that p8 will also try a list of common interesting subdomains(in -v mode), mostly environments e.g. prod.wreet.xyz, for any subdomain it discovers. This helps to find more interesting attack surfaces.

This is a DNS-only tool. Thus it cannot provide as exhaustive a list as some other subdomain finders, however it is very fast.  

You can provide root domains, eg. wreet.xyz, or existing subdomains, eg. hola.wreet.xyz, to be tested. 
## adding subdomains or variations
If you want to add your own subdomains or variations to check for, just append them to the appropriate file in the subs directory.

`echo "staging2" >> subs/variations.txt`

`echo "mail1337" >> subs/subs.txt`


## examples
`./p8.js -d wreet.xyz -v` 
Test the common variations and print results to console.

`./p8.js -d wreet.xyz -e` 
Enumerate subdomains and print result to console.

`./p8.js -d wreet.xyz -e -v -o results.txt` 
Do both enumeration and common variations check and export a list to results.txt.

`./p8.js -d domains.txt -v` 
Run common variations check on list of domains in domains.txt, print results to console.

`./p8 -d app1337.wreet.xyz -e` Enumerate subs for the subdomain, print results to console.

**Sources to be implemented**
https://riddler.io/
https://spyse.com/

