# browser-geo-tz

This is a browser variant of [node-geo-tz](https://github.com/evansiroky/node-geo-tz). The original library says that the files are too big for the browser.
This library takes advantage of HTTP range requests to load the data quickly.

## Usage

### Unpkg

```html
<script src="http://unpkg.com/browser-geo-tz@latest/dist/geotz.js"></script>
<script>
  console.log(await GeoTZ.find(37.3861, -122.0839));
</script>
```

### NPM

```bash
npm install browser-geo-tz
```

```javascript
import GeoTZ from "browser-geo-tz";
console.log(await GeoTZ.find(37.3861, -122.0839));
```
