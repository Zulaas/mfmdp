# Developers documentation

This project is build upon kickstart.

## Project setup

The first to do is to install kickstart, therefore follow the instructions on [infracamp](http://nfra.infracamp.org/) our
you find programming language specific information in [.kicker/README_KICKSTART.md](.kicker/README_KICKSTART.md)

This project should simulate several different servers. 

To achieve this [VirtualHost](https://httpd.apache.org/docs/2.4/vhosts/examples.html) are used. 
This technic allows to run several name-based websites on a single IP address.
The vhost configuration can be found [here](/.kicker/conf/etc/apache2/sites-available/000-default.conf). 
Search for __\<VirtualHost\>__-Tags

In order to redirect the hostnames to localhost 127.0.0.1 the host file has to be modified. 
The [hosts file](https://wiki.ubuntuusers.de/hosts/) is a local configuration file to map host names to IP addresses.

To open the file enter the following command in the console:

```shell
    $ sudo nano /etc/hosts
```

add the following line:

```text
    127.0.0.1       m.tld r1.tld r2.tld
```

Save changes and close the text editor.

This allows to resolve the three hostnames (m.tld ; r1.tld ; r2.tld) to localhost.

The domain .tld was taken because it is not an official top-level domain see [list of top-level domains](https://en.wikipedia.org/wiki/List_of_Internet_top-level_domains) and 
it is the abbreviation for [Top-Level-Domains](https://en.wikipedia.org/wiki/Top-level_domain).

Thus, no complications arise when using the Internet.

After every thing is setup return to: [Projekt Start](/README.md)



