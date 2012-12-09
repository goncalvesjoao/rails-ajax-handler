/*!
 * rails-ajax-handler.js v0.3.2 - 09 December, 2012
 * By João Gonçalves (http://goncalvesjoao.github.com)
 * Hosted on https://github.com/goncalvesjoao/rails-ajax-handler
 * Licensed under MIT ("expat" flavour) license.
 */

function RailsAjaxHandler(options) {
  if (options == undefined) options = {};

  if (arguments.callee._singletonInstance) {
    arguments.callee._singletonInstance.setOptions(options);
    return arguments.callee._singletonInstance;
  } else {
    arguments.callee._singletonInstance = this;
  }

  var debug = null;
  var prefix = null;
  var error_message = {
    wrapper_html: null,
    wrapper_class: null
  }
  var error_fields = {
    wrapper_html: null,
    wrapper_class: null,
    wrap: null
  }
  var spinner = {
    html_tag: null,
    class: null,
    min_zindex: null,
    wrapper_html: null,
    wrapper_class: null
  }

  this.setOptions = function(_options) {
    var old_prefix = prefix;

    debug = (_options["debug"] != undefined) ? _options["debug"] : debug;
    prefix = _options["prefix"] || prefix;
    error_message = {
      wrapper_html: (_options["error_message"] && _options["error_message"]["wrapper_html"]) || error_message.wrapper_html,
      wrapper_class: (_options["error_message"] && _options["error_message"]["wrapper_class"]) || error_message.wrapper_class
    }
    error_fields = {
      wrapper_html: (_options["error_fields"] && _options["error_fields"]["wrapper_html"]) || error_fields.wrapper_html,
      wrapper_class: (_options["error_fields"] && _options["error_fields"]["wrapper_class"]) || error_fields.wrapper_class,
      wrap: (_options["error_fields"] && _options["error_fields"]["wrap"] != undefined) ? _options["error_fields"]["wrap"] : error_fields.wrap
    }
    spinner = {
      html_tag: (_options["spinner"] && _options["spinner"]["html_tag"]) || spinner.html_tag,
      class: (_options["spinner"] && _options["spinner"]["class"]) || spinner.class,
      min_zindex: (_options["spinner"] && _options["spinner"]["min_zindex"] != undefined) ? _options["spinner"]["min_zindex"] : spinner.min_zindex,
      wrapper_html: (_options["spinner"] && _options["spinner"]["wrapper_html"]) || spinner.wrapper_html,
      wrapper_class: (_options["spinner"] && _options["spinner"]["wrapper_class"]) || spinner.wrapper_class
    }

    if (old_prefix != prefix) bind_rails_ujs_ajax_events();
  }

  this.resetOptions = function() {
    debug = false;
    prefix = '';
    error_message = {
      wrapper_html: 'span',
      wrapper_class: 'field_with_errors'
    }
    error_fields = {
      wrapper_html: 'div',
      wrapper_class: 'field_with_errors',
      wrap: true
    }
    spinner = {
      html_tag: 'div',
      class: '',
      min_zindex: 100,
      wrapper_html: 'div',
      wrapper_class: ''
    }
  }

  this.clear_error_messages = function() {
    $('.rah_error_message').remove();
    $('.rah_error_wrapped').removeClass('rah_error_wrapped').unwrap();
  }

  this.show_error_messages = function(model_name, errors) {
    clear_error_messages();

    var errors_string = [];
    $.each(errors, function(key, value) {
      var input = $('input[name="' + model_name + '[' + key + ']"]');
      var input_label = null;
      var message_html = '<' + error_message.wrapper_html + ' class="rah_error_message ' + error_message.wrapper_class + '">' + value.join('<br/>') + '</' + error_message.wrapper_html + '>';
      var error_wrapper_html = '<' + error_fields.wrapper_html + ' class="' + error_fields.wrapper_class + '" />';

      if (input.length > 0) {
        input_label = $('label[for="' + input.attr('id') + '"]');
        if (error_fields.wrap) {
          input.wrap(error_wrapper_html).addClass('rah_error_wrapped');
          input.parent().after(message_html);
        } else {
          input.after(message_html);
        }
      }
      if (input_label != null && input_label.length > 0 && error_fields.wrap) {
        input_label.wrap(error_wrapper_html).addClass('rah_error_wrapped');
      }
      errors_string.push(key + ': ' + value.join(', '));
    });
    if (debug) window.console.log(model_name + ' has the following errors:\n' + errors_string.join('\n'));
  }

  var get_selector_to_animate = function(object_to_handle) {
    var selector_to_animate = 'body';
    var animate = $(object_to_handle).data(prefix + 'animate')
    var replace = $(object_to_handle).data(prefix + 'replace');

    if (animate != undefined && animate != 'true') {
      selector_to_animate = animate;
    } else if (replace != undefined) {
      selector_to_animate = replace;
    }

    return selector_to_animate;
  }

  this.spinner_animation_start = function(object_to_handle) {
    var animate = $(object_to_handle).data(prefix + 'animate');
    if (animate == undefined || animate == 'false') return;

    var handler = $(object_to_handle).data(prefix + 'handler');
    var container_html = '<' + spinner.wrapper_html + ' class="rah_general_spinner_container ' + handler + '_particular_spinner_container ' + spinner.wrapper_class + '" style="position: relative;" />';
    var spinner_html_part1 = '<' + spinner.html_tag + ' class="rah_general_spinner ' + handler + '_particular_spinner ' + spinner.class + '" style="z-index: ';
    var spinner_html_part2 = ';"></div>';
    var clear_div = '<div class="rah_general_clear_div ' + handler + '_particular_clear_div" style="clear:both;"></div>';
    var selector_to_animate = get_selector_to_animate(object_to_handle);

    if (selector_to_animate != 'body') {
      $(selector_to_animate).each(function(index) {
        var zindex = spinner.min_zindex;
        var object_zindex = parseInt($(this).css('z-index'));
        zindex = (!isNaN(object_zindex) && object_zindex > 0) ? (object_zindex + 10) : zindex;

        $(this).wrap(container_html).before(spinner_html_part1 + zindex + spinner_html_part2).after(clear_div);
      });

      $(selector_to_animate).css('opacity', 0.35);
      $('.' + handler + '_particular_spinner').show();
    } else {
      if (debug) window.console.log('TODO: Add a spinner for the whole page');
    }
  }
  
  this.spinner_animation_stop = function(object_to_handle) {
    var animate = $(object_to_handle).data(prefix + 'animate');
    if (animate == undefined || animate == 'false') return;

    var handler = $(object_to_handle).data(prefix + 'handler');
    var selector_to_animate = get_selector_to_animate(object_to_handle);

    if (selector_to_animate != 'body') {
      $(selector_to_animate).each(function(index) {
        if ($(this).parent().hasClass('rah_general_spinner_container')) {
          $(this).unwrap();
        }
      });

      $(selector_to_animate).fadeTo('fast', 1);
      $('.' + handler + '_particular_spinner').remove();
      $('.' + handler + '_particular_clear_div').remove();
    } else {
      if (debug) window.console.log('TODO: Remove the spinner for the whole page');
    }
  }

  var get_callback = function(object_to_handle, callback_sufix) {
    var default_callback = $(object_to_handle).data(prefix + 'handler') + '_' + callback_sufix;
    return (window[default_callback] != undefined) ? default_callback : 'focus';
  }

  this.ajax_beforesend = function(object_to_handle, event, xhr, settings) {
    clear_error_messages();
    window[get_callback(object_to_handle, 'beforesend')](xhr, settings);
    spinner_animation_start(object_to_handle);
    window[get_callback(object_to_handle, 'ajax_start')](xhr, settings);
    if (debug) window.console.log('ajax_beforesend');
  }

  this.ajax_success = function(object_to_handle, event, data, status, xhr) {
    if ($(object_to_handle).data('type') == 'html' && $(object_to_handle).data(prefix + 'replace') != undefined) {
      $($(object_to_handle).data(prefix + 'replace')).html(data);
    }
    window[get_callback(object_to_handle, 'success')](data, status, xhr);
    spinner_animation_stop(object_to_handle);
    window[get_callback(object_to_handle, 'ajax_stop')](data, status, xhr);
    if (debug) window.console.log('ajax_success');
  }

  this.ajax_error = function(object_to_handle, event, xhr, status, error) {
    if ($(object_to_handle).data('type') == 'json' && $(object_to_handle).data(prefix + 'show-errors') != undefined) {
      show_error_messages($(object_to_handle).data(prefix + 'show-errors'), $.parseJSON(xhr.responseText));
    }
    window[get_callback(object_to_handle, 'error')](xhr, status, error);
    spinner_animation_stop(object_to_handle);
    window[get_callback(object_to_handle, 'ajax_stop')](xhr, status, error);
    if (debug) window.console.log('ajax_error');
  }
  
  this.ajax_complete = function(object_to_handle, event, xhr, status) {
    window[get_callback(object_to_handle, 'complete')](xhr, status);
    spinner_animation_stop(object_to_handle);
    window[get_callback(object_to_handle, 'ajax_stop')](xhr, status);
    if (debug) window.console.log('ajax_complete');
  }

  this.bind_rails_ujs_ajax_events = function() {
    var objects_to_handle = ($('[data-remote][data-' + prefix + 'handler]').length > 0) ? $('[data-remote][data-' + prefix + 'handler]') : null;

    if (objects_to_handle) {
      objects_to_handle.live('ajax:beforeSend', function(event, xhr, settings) {
        RailsAjaxHandler().ajax_beforesend(this, event, xhr, settings);
      });
      
      objects_to_handle.live('ajax:success', function(event, data, status, xhr) {
        RailsAjaxHandler().ajax_success(this, event, data, status, xhr);
      });
      
      objects_to_handle.live('ajax:error', function(event, xhr, status, error) {
        RailsAjaxHandler().ajax_error(this, event, xhr, status, error);
      });

      objects_to_handle.live('ajax:complete', function(event, xhr, status) {
        RailsAjaxHandler().ajax_complete(this, event, xhr, status);
      });
    }
    if (debug) window.console.log('bind_rails_ujs_ajax_events');
  }

  this.resetOptions();
  this.setOptions(options);
  this.bind_rails_ujs_ajax_events();
} // RailsAjaxHandler

jQuery(document).ready(function($) { RailsAjaxHandler(); });
