# Enonic Wizardry

Functional utility library for Enonic XP

## API

### html.tag

> `String → [String] → ({*} → {*})`

Creates a function that adds a `$body` attribute to a model. Takes the `elementName`, and an array of attribute names that will get values from the model.

If the model already contains a `$body` it will be wrapped in this tag.

```javascript
var fooTag = w.html.tag('foo', ['bar']);
var result = fooTag({ bar: 'baz' }); // => { bar: 'baz', $body: '<foo bar="baz" />' }
var result2 = fooTag({ $body: 'Hi' }); // => { $body: '<foo>Hi</foo>' }
```

### bootstrap.panel

Expects the model to contain `id`, `title` and `$body` fields.

```javascript
var result = w.bootstrap.panel({ id: 'panel-1', title: 'My title', $body: 'Hi' }); // => { ..., $body: '<se below>' }
```

*Contents of $body*

```html
<div class="panel panel-default" id="panel-1">
    <div class="panel-heading">
        <h3 class="panel-title">My title</h3>
    </div>
    <div class="panel-body">Hi</div>
</div>
```