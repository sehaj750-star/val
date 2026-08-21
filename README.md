# Date invite pages

Personalized date invite pages hosted on GitHub Pages.

## Live links

| Person | URL |
|--------|-----|
| Tammy  | https://sehaj750-star.github.io/val/tammy/ |

## Add someone new

```bash
node scripts/new-person.mjs "Their Name"
node scripts/new-person.mjs "Their Name" --skip-days   # skip day picker on Yes
git add .
git commit -m "Add page for Their Name"
git push
```

The URL will be `https://sehaj750-star.github.io/val/<name-lowercase>/`.

Emails go to `sehaj750@gmail.com` when they tap Yes or pick a day.
