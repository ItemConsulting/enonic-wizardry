# Enonic Wizardry

Functional utility library for Enonic XP

## API

### html.tag

> `String → [String] → ({*} → {*})`

Creates a function that adds a `$body` attribute to a model. Takes the `elementName`, and an array of attribute names that will get values from the model.

If the model already contains a `$body` it will be wrapped in this tag.

```javascript
var fooTag = w.html.tag('foo', ['bar']); // => function

var result = fooTag({ bar: 'baz' }); // => { bar: 'baz', $body: '<foo bar="baz" />' }
var result2 = fooTag({ $body: 'Hi' }); // => { $body: '<foo>Hi</foo>' }
```

### bootstrap.panel

 > `{*} → {*}`

Creates a function wraps the current `$body` attribute with a [bootstrap panel](http://getbootstrap.com/components/#panels), and stores the result to `$body`

Expects the model to contain `id`, `title` and `$body` attribute.

```javascript
var model = {
    id: 'panel-1',
    title: 'My title',
    $body: 'Hi'
}

var result = w.bootstrap.panel(model).$body; // => see below
```
*Contents of result*

```html
<div class="panel panel-default" id="panel-1">
    <div class="panel-heading">
        <h3 class="panel-title">My title</h3>
    </div>
    <div class="panel-body">Hi</div>
</div>
```

### asHtml

Takes a model which contains a `$body` attribute, and creates a Enonic compatible result object.

```javascript
var result = w.asHtml({ $body: '<div>test</div>' }); // => see below
```

*Contents of result*

```json
{
    "contentType": "text/html",
    "body": "<div>test</div>"
}
```


### asJson