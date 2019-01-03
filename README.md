# MaSelectionImmo

Tous les programmes immobiliers neufs en France sont sur MaSelectionImmo.fr.

## Getting Started

Just clone the repository.

```sh
git clone git@git.misterbell.com:ma-selection/msi.git
```

### Prerequisites

* PHP > 5.3, < 7.x
* Mysql >= 5.x or MariaDB >= 10.x

### Tasks

#### Manually ingest real estate developer flux

Each real estate developer can send XML, JSON or CSV files to ingest into the
database. Each scripts are localized into **_htdocs/configs/updater_**.

Steps to generate and ingest data :

**All datas are generated automatically in 'deploy/crontab-daily' but you can
generate all these scripts yourself :**

* For programs :

**(generate also resized pictures, resized logos, geoloc infos)**

```sh
dokku run maselectionimmo php /var/www/html/configs/updater/update-ads-nexity.php PROD
dokku run maselectionimmo php /var/www/html/configs/updater/update-ads-bi.php PROD
dokku run maselectionimmo php /var/www/html/configs/updater/update-ads-pichet.php PROD
dokku run maselectionimmo php /var/www/html/configs/updater/update-ads-resideetudes.php PROD
dokku run maselectionimmo php /var/www/html/configs/updater/update-ads-cogedim.php PROD
dokku run maselectionimmo php /var/www/html/configs/updater/update-ads-emerige.php PROD
dokku run maselectionimmo php /var/www/html/configs/updater/update-ads-capelli.php PROD
dokku run maselectionimmo php /var/www/html/configs/updater/update-ads-lnc.php PROD
dokku run maselectionimmo php /var/www/html/configs/updater/update-ads-mki.php PROD
dokku run maselectionimmo php /var/www/html/configs/updater/update-ads-kaufmanbroad.php PROD
dokku run maselectionimmo php /var/www/html/configs/updater/update-ads-urbis.php PROD
dokku run maselectionimmo php /var/www/html/configs/updater/update-ads-copra.php PROD
dokku run maselectionimmo php /var/www/html/configs/updater/update-ads-archepromotion.php PROD
dokku run maselectionimmo php /var/www/html/configs/updater/update-ads-foncim.php PROD
```

* For sitemap, xml catalogs, geo.json, google maps markers.js :

```sh
dokku run maselectionimmo php /var/www/html/configs/generator/generator-global.php PROD
```

* For Facebook lead recover

```sh
dokku run maselectionimmo php /var/www/html/configs/facebook/cron/leadgen.php from='2017-12-05' PROD #or
dokku run maselectionimmo php /var/www/html/configs/facebook/cron/leadgen.php from='2017-12-02' to='2017-12-03' PROD
```

## Deployment

* Push to the remote development repository

```sh
git push origin master
```

* Add the remote production repository.

```sh
git remote add prod dokku@dokku.misterbell.systems:maselectionimmo
```

* Just push the master branch to the remote production repository.

```sh
git push prod master
```

## DOKKU (PaaS) installation

For production we use a mini PaaS: DOKKU.

You should to
[install](http://dokku.viewdocs.io/dokku/getting-started/installation/) it by
default. And follow all the docs to learn how to use it.

We are using [MariaDB plugin](https://github.com/dokku/dokku-mariadb) as
database.

### Docker binded volume

You should declare binded volume to store persistent folders

```sh
# Show the list to declare
dokku storage:list maselectionimmo
maselectionimmo volume bind-mounts:
/mnt/volume-dokku-fra1-01/maselectionimmo/admin/ad-pictures:/var/www/html/configs/admin/ad-pictures
/mnt/volume-dokku-fra1-01/maselectionimmo/admin/exports:/var/www/html/configs/admin/exports
/mnt/volume-dokku-fra1-01/maselectionimmo/agencies:/var/www/html/public/images/agencies
/mnt/volume-dokku-fra1-01/maselectionimmo/brochures:/var/www/html/public/brochures
/mnt/volume-dokku-fra1-01/maselectionimmo/detail:/var/www/html/public/images/detail
/mnt/volume-dokku-fra1-01/maselectionimmo/json:/var/www/html/public/json
/mnt/volume-dokku-fra1-01/maselectionimmo/markers:/var/www/html/public/js/markers
/mnt/volume-dokku-fra1-01/maselectionimmo/products:/var/www/html/public/images/products
/mnt/volume-dokku-fra1-01/maselectionimmo/sitemap:/var/www/html/public/sitemap
/mnt/volume-dokku-fra1-01/maselectionimmo/xml:/var/www/html/public/xml
```

### CRON

You should declare some tasks to have a consistency server:

#NBA APP BACKEND API

## TODO:
1. Join Player table to matchStat table (join on playerId ?)
2. Related player table and matchStat

## Authors
* **tphilippini**
