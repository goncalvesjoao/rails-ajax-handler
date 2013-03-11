/*!
 * rails-ajax-handler.js v1.7.1 - 11 March, 2012
 * By João Gonçalves (http://goncalvesjoao.github.com)
 * Hosted on https://github.com/goncalvesjoao/rails-ajax-handler
 * Licensed under MIT license.
 */

;(function ($, window, document, undefined) {
  
  $.railsAjaxHandler = {
    settings: {},

    init: function(options) {
      var oldPrefix = $.railsAjaxHandler.settings["prefix"];
      var defaults = {
        prefix: '',
        debug: false,
        animation: true,
        spinner: '<div />',
        autoRedirect: true,
        action: "replace_html",
        spinnerWrapper: '<div />',
        errorMessageWrapper: '<span class="field_with_errors" />',
        errorFieldsWrapper: '<div class="field_with_errors" />'
      }
      $.railsAjaxHandler.settings = $.extend({}, defaults, options);
      var newPrefix = $.railsAjaxHandler.settings.prefix;

      if (oldPrefix != newPrefix) {
        var ajaxSelector = '[data-remote][data-' + newPrefix + 'handler]';
        var buttonSelector = '[data-remote-button][data-' + newPrefix + 'handler]';

        if (oldPrefix != undefined) $(document).off('.rails-ajax-handler');
        $(document).off('.rails-ajax-handler');
        
        $(document).on('ajax:beforeSend.rails-ajax-handler', ajaxSelector, function(event, xhr, settings) {
          $.railsAjaxHandler.ajaxBeforesend(xhr, settings, $.railsAjaxHandler.getDataToHandle(this), event);
        });
        
        $(document).on('ajax:success.rails-ajax-handler', ajaxSelector, function(event, data, status, xhr) {
          $.railsAjaxHandler.ajaxSuccess(data, status, xhr, $.railsAjaxHandler.getDataToHandle(this), event);
        });
        
        $(document).on('ajax:error.rails-ajax-handler', ajaxSelector, function(event, xhr, status, error) {
          $.railsAjaxHandler.ajaxError(xhr, status, error, $.railsAjaxHandler.getDataToHandle(this), event);
        });

        $(document).on('ajax:complete.rails-ajax-handler', ajaxSelector, function(event, xhr, status) {
          $.railsAjaxHandler.ajaxComplete(xhr, status, $.railsAjaxHandler.getDataToHandle(this), event);
        });

        $(document).on('click.rails-ajax-handler', buttonSelector, function(event) {
          var $this = $(this);
          var type = ($this.data('method') != undefined) ? $this.data('method') : 'get';
          var dataType = ($this.data('type') != undefined) ? $this.data('type') : 'script';
          var url = $this.data('href');

          if (url != undefined) {
            $.ajax({
              url: url,
              type: type,
              dataType: dataType,
              beforeSend: function(jqXHR, settings) {
                $.railsAjaxHandler.ajaxBeforesend(jqXHR, settings, $.railsAjaxHandler.getDataToHandle($this), event);
              },
              success: function(data, textStatus, jqXHR) {
                $.railsAjaxHandler.ajaxSuccess(data, textStatus, jqXHR, $.railsAjaxHandler.getDataToHandle($this), event);
              },
              error: function(jqXHR, textStatus, errorThrown) {
                $.railsAjaxHandler.ajaxError(jqXHR, textStatus, errorThrown, $.railsAjaxHandler.getDataToHandle($this), event);
              },
              complete: function(jqXHR, textStatus) {
                $.railsAjaxHandler.ajaxComplete(jqXHR, textStatus, $.railsAjaxHandler.getDataToHandle($this), event);
              }
            });
          }
        });
      }

      _rahDebug('function: bind_rails_ujs_ajax_events');
    },
    
    targetAnimationStart: function(animationTarget) {
      $(animationTarget).css('opacity', 0.35);
    },

    targetAnimationStop: function(animationTarget) {
      $(animationTarget).fadeTo('slow', 1);
    },

    spinnerAnimationStart: function(animationTarget) {
      var animationTarget_obj = $(animationTarget);
      var animationTargetClass = animationTarget.replace(/[.#]/g, '_');

      if (animationTarget != 'body') {
        var wrapper = $($.railsAjaxHandler.settings.spinnerWrapper).addClass('rah_general_spinner_container ' + animationTargetClass + '_particular_spinner_container');
        var spinner = $($.railsAjaxHandler.settings.spinner).addClass('rah_general_spinner ' + animationTargetClass + '_particular_spinner');
        var clear_div = '<div class="' + animationTargetClass + '_particular_clear_div" style="clear:both;"></div>';

        animationTarget_obj.each(function(index) {
          if ($(this).css('position') == 'static') {
            $(this).wrap(wrapper).before(spinner).after(clear_div);
          } else {
            $(this).append(spinner);
          }
        });
        $.railsAjaxHandler.targetAnimationStart(animationTarget);
        spinner.show();
      } else {
        var body_spinner = $($.railsAjaxHandler.settings.spinner).attr('id', 'rah_body_spinner');

        animationTarget_obj.prepend(body_spinner);
        body_spinner.show();
      }
    },

    spinnerAnimationStop: function(animationTarget) {
      var animationTargetClass = animationTarget.replace(/[.#]/g, '_');

      if (animationTarget != 'body') {
        $(animationTarget).each(function(index) {
          if ($(this).parent().hasClass('rah_general_spinner_container')) {
            $(this).unwrap();
          }
        });

        $.railsAjaxHandler.targetAnimationStop(animationTarget);
        $('.' + animationTargetClass + '_particular_spinner').remove();
        $('.' + animationTargetClass + '_particular_clear_div').remove();
      } else {
        $('#rah_body_spinner').remove();
      }
    },

    spinnersAnimationStart: function(dataToHandle) {
      if (!dataToHandle.animation || dataToHandle.animation == 'stop') return;
      
      $.railsAjaxHandler.spinnerAnimationStart(dataToHandle.animationTarget);
      if (dataToHandle.animationRequester != dataToHandle.animationTarget) {
        $.railsAjaxHandler.spinnerAnimationStart(dataToHandle.animationRequester);
      }

      _rahDebug('function: spinner_animation_begin');
    },
    
    spinnersAnimationStop: function(dataToHandle) {
      if (!dataToHandle.animation || dataToHandle.animation == 'start') return;

      $.railsAjaxHandler.spinnerAnimationStop(dataToHandle.animationTarget);
      if (dataToHandle.animationRequester != dataToHandle.animationTarget) {
        $.railsAjaxHandler.spinnerAnimationStop(dataToHandle.animationRequester);
      }

      _rahDebug('function: spinnerAnimationStop');
    },

    getDataToHandle: function(objectToHandle) {
      var handler = _getData(objectToHandle, 'handler');
      if (handler == true) handler = $(objectToHandle).attr('id');
      var target = _getData(objectToHandle, 'target', handler);
      var requester = _getData(objectToHandle, 'requester', target);
      
      if (handler != undefined) {
        if (handler[0] == "#" || handler[0] == ".") handler = handler.substr(1);
        if (target != 'body' && target[0] != "#" && target[0] != ".") target = '#' + target;
        if (requester != 'body' && requester[0] != "#" && requester[0] != ".") requester = '#' + requester;
      }
      var animationTarget = _getData(objectToHandle, 'animation-target', target || 'body');
      var animationRequester = (requester != target) ? requester : animationTarget;

      return {
        target: target,
        handler: handler,
        requester: requester,
        objectToHandle: objectToHandle,
        type: _getData(objectToHandle, 'type', 'js'),
        action: _getData(objectToHandle, 'action', $.railsAjaxHandler.settings.action),
        show_errors: _getData(objectToHandle, 'show-errors', false),
        animation: _getData(objectToHandle, 'animation', $.railsAjaxHandler.settings.animation),
        animationTarget: animationTarget,
        animationRequester: _getData(objectToHandle, 'animation-requester', animationRequester || 'body'),
        autoRedirect: _getData(objectToHandle, 'auto-redirect', $.railsAjaxHandler.settings.autoRedirect)
      }
    },

    /** HTML Request Sucess Actions **/
    htmlActions: {
      replace_html: function(dataToHandle, event, data, status, xhr) {
        $.railsAjaxHandler.spinnersAnimationStop(dataToHandle);
        $(dataToHandle.target).replaceWith(data);
        return true;
      },

      replace_html: function(dataToHandle, event, data, status, xhr) {
        $(dataToHandle.target).html(data);
      },

      append: function(dataToHandle, event, data, status, xhr) {
        $(dataToHandle.target).append(data);
      },

      prepend: function(dataToHandle, event, data, status, xhr) {
        $(dataToHandle.target).prepend(data);
      }
    },
    /** /HTML Request Sucess Actions **/



    clearErrorMessages: function() {
      $('.rah_error_message').remove();
      $('.rah_error_wrapped').removeClass('rah_error_wrapped').unwrap();
    },

    showErrorMessages: function(model_name, errors) {
      $.railsAjaxHandler.clearErrorMessages();

      var settings = $.railsAjaxHandler.settings;
      var errorsArray = [];
      var wrap_fields = (settings.errorFieldsWrapper != '' && settings.errorFieldsWrapper != null);

      $.each(errors, function(key, value) {
        var input = $('input[name="' + model_name + '[' + key + ']"]'), input_label = null;
        var errorMessage = $(settings.errorMessageWrapper);
        errorMessage.addClass('rah_error_message').html(value.join('<br/>'));

        if (input.length > 0) {
          input_label = $('label[for="' + input.attr('id') + '"]');
          if (wrap_fields) {
            input.wrap(settings.errorFieldsWrapper).addClass('rah_error_wrapped');
            input.parent().after(errorMessage);
          } else {
            input.after(errorMessage);
          }
        }
        if (input_label != null && input_label.length > 0 && wrap_fields) {
          input_label.wrap(settings.errorFieldsWrapper).addClass('rah_error_wrapped');
        }
        errorsArray.push(key + ': ' + value.join(', '));
      });
      _rahDebug(model_name + ' has the following errors:\n' + errorsArray.join('\n'));
    },

    ajaxBeforesend: function(xhr, settings, dataToHandle, event) {
      $.railsAjaxHandler.clearErrorMessages();
      eval(_getCallback(dataToHandle, 'beforesend') + '(xhr, settings)');
      $.railsAjaxHandler.spinnersAnimationStart(dataToHandle);
      eval(_getCallback(dataToHandle, 'ajax_start') + '(xhr, settings)');

      _rahDebug('function: ajaxBeforesend');
    },

    ajaxSuccess: function(data, status, xhr, dataToHandle, event) {
      var skipAnimation = false;
      if (dataToHandle.type == 'html' && dataToHandle.target != undefined && $.railsAjaxHandler.htmlActions[dataToHandle.action] != undefined) {
        skipAnimation = $.railsAjaxHandler.htmlActions[dataToHandle.action](dataToHandle, event, data, status, xhr);
        _rahDebug('html action: ' + dataToHandle.action);
      }
      
      if (dataToHandle.autoRedirect) {
        if (xhr.getResponseHeader('Location')) {
          window.location.href = xhr.getResponseHeader('Location');
          skipAnimation = true;
          _rahDebug('redirect to: ' + xhr.getResponseHeader('Location'));
        }
      }

      eval(_getCallback(dataToHandle, 'success') + '(data, status, xhr)');
      if (!skipAnimation) $.railsAjaxHandler.spinnersAnimationStop(dataToHandle);
      eval(_getCallback(dataToHandle, 'ajax_stop') + '(data, status, xhr)');

      _rahDebug('function: ajaxSuccess');
    },

    ajaxError: function(xhr, status, error, dataToHandle, event) {
      if (dataToHandle.type == 'json' && dataToHandle.show_errors) {
        var data = $.parseJSON(xhr.responseText);
        $.railsAjaxHandler.showErrorMessages(dataToHandle.show_errors, data.errors != null ? data.errors : data);
      } else if (dataToHandle.type == 'html' && dataToHandle.requester != undefined) {
        $(dataToHandle.requester).html(xhr.responseText);
      }
      
      if (xhr.status == 500) {
        $.railsAjaxHandler.handleServerError(dataToHandle, event, xhr, status, error);
      }

      eval(_getCallback(dataToHandle, 'error') + '(xhr, status, error)');
      $.railsAjaxHandler.spinnersAnimationStop(dataToHandle);
      eval(_getCallback(dataToHandle, 'ajax_stop') + '(xhr, status, error)');

      _rahDebug('function: ajaxError');
      _rahDebug(_getCallback(dataToHandle, 'error'));
    },

    ajaxComplete: function(xhr, status, dataToHandle, event) {
      _rahDebug('function: ajaxComplete');
    },

    handleServerError: function(dataToHandle, event, xhr, status, error) {
      ;
    },

    destroy: function() {
      $(document).off('.rails-ajax-handler');
      $.railsAjaxHandler.settings = {};
    }
  }

  /* Private methods */

  function _rahDebug(message) {
    if ($.railsAjaxHandler.settings.debug) window.console.log(message);
  }
  
  function _getCallback(dataToHandle, callback_sufix) {
    if (eval("typeof " + dataToHandle.handler + '_' + callback_sufix + " == 'function'")) {
      return dataToHandle.handler + '_' + callback_sufix;
    } else if (eval("typeof " + dataToHandle.handler + _capitaliseFirstLetter(callback_sufix) + " == 'function'")) {
      return dataToHandle.handler + _capitaliseFirstLetter(callback_sufix);
    } else {
      return 'focus';
    }
  }

  function _getData(objectToHandle, suffix, defaultValue) {
    var data = $(objectToHandle).data($.railsAjaxHandler.settings.prefix + suffix);
    if (data != undefined) {
      if (data == "true") {
        return true;
      } else if (data == "false") {
        return false;
      } else {
        return data;
      }
    } else {
      return defaultValue;
    }
  }

  function _capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

})(jQuery, window, document);

jQuery(document).ready(function($) { $.railsAjaxHandler.init(); });