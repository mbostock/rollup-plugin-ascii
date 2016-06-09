# rollup-plugin-ascii

Rewrite JavaScript to escape any non-ASCII characters in string literals. For example, the following input:

```js
console.log("Ich ♥ Bücher");
```

Becomes the following output:

```js
console.log("Ich \u2665 B\xFCcher");
```

Only string literals are escaped! If you want to escape Unicode symbols, too, you’ll need something like UglifyJS2.
