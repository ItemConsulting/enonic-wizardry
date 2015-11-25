# Enonic Wizardry

Functional utility library for Enonic XP

## API

### html.tag

> String → [String] → ({*} → {*})

Creates a function that adds a `$body` attribute to a model. Takes the `elementName`, and an array of attribute names that will get values from the model.

If the model already contains a `$body` it will be wrapped in this tag.

```
   var fooTag = w.html.tag('foo', ['bar']);
   var result = fooTag({ bar: 'baz' }); // => { bar: 'baz', $body: '<foo bar="baz" />' }
   var result2 = fooTag({ $body: 'Hei' }); // => { $body: '<foo>Hei</foo>' }
```