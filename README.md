#Rails Ajax Handler v1.2.1 - 26 December, 2012
Want to have a spinner animation when using `:remote => true` and automatically replace a html element with the ajax response?
<br/>
Well, here's a fully customizable ajax handler for your rails app.

<br/>
## Instalation
Copy the files from this project **source** to your **app/assets** directory respectively and:
<br/>
add the following line to your *app/assets/javascripts/application.js* file
```javascript
//= require jqueryrails-ajax-handler
```
and the following line to your *app/assets/javascripts/stylesheets.css* file
```css
*= require rails-ajax-handler
```

<br/>
## Quick Example
Simply add `:handler => true` where you are already using a `:remote => true`.
```html
<%= form_for(@user, html: { data: { remote: true, type: "html", handler: true } }) do |f| %>
  <%= f.label :first_name %>
  <%= f.text_field :first_name %><br/>
  ...
  <%= f.submit %>
<% end %>
```
If you change the **type** of ajax call to **html** the default behaviour is to replace the current **form** with the returned ajax response.

<br/>
Submitting a form through **ajax**, in **json** format:
```html
<%= form_for(@user, html: { data: { remote: true, type: "json", handler: true, show_errors: "user" } }) do |f| %>
  <%= f.label :first_name %>
  <%= f.text_field :first_name %><br/>
  ...
  <%= f.submit %>
<% end %>
```
This will add a spinner animation arround the form element preventing it from being clicked and will either:
- redirect the browser to `render json: @user, location: users_path` the **url** that came in the **location** header response;
- or show any errors returned on the json object, just like a **form_for** would: wrapping the target fields in a `<div class="field_with_errors" />`.
