# Enonic Wizardry

Functional utility library for Enonic XP

## Building and deploying

Requirements:

 * [npm](https://www.npmjs.com)
 * [gulp](http://gulpjs.com/)

#### Building

```bash
npm install
gulp
```

#### Testing

```bash
gulp test
```

## API

### pipe

> `(((a, b, …, n) → o), (o → p), …, (x → y), (y → z)) → ((a, b, …, n) → z)`

Creates a new function from n functions, by walkting trough them left to right, and passing the result of the previous function into the next one.

See [Ramdas pipe](http://ramdajs.com/0.18.0/docs/#pipe).

```javascript
var add1 = function(x){ return x+1; }
var times2 = function(x){ return x*2; }

var f = w.pipe(add1, times2);
var result = f(3); // => 8
```

### html.tag

> (`String, [String]) → ({*} → {*})`

Creates a function that adds a `body` attribute to a model. Takes the `elementName`, and an array of attribute names that will get values from the model.

If the model already contains a `body` it will be wrapped in this tag.

```javascript
var f = w.html.tag('foo', ['bar']); // => function

var result = f({ bar: 'baz' }); // => { bar: 'baz', body: '<foo bar="baz" />' }
var result2 = f({ body: 'Hi' }); // => { body: '<foo>Hi</foo>' }
```

### bootstrap.panel

 > `{*} → {*}`

Creates a function wraps the current `body` attribute with a [bootstrap panel](http://getbootstrap.com/components/#panels), and stores the result to `body`

Expects the model to contain `id`, `title` and `body` attribute.

```javascript
var model = {
    id: 'panel-1',
    title: 'My title',
    body: 'Hi'
}

var result = w.bootstrap.panel(model).body; // => see below
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

 > `{*} → {*}`

Takes a model which contains a `body` attribute, and creates a Enonic compatible result object.

```javascript
var result = w.asHtml({ body: '<div>test</div>' }); // => see below
```

*Contents of result*

```json
{
    "contentType": "text/html",
    "body": "<div>test</div>"
}
```