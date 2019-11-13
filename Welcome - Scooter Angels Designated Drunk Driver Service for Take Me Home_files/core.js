if(typeof(PRT_DATA) == 'undefined')
	var PRT_DATA = {};
if(isNumber(PRT_DATA.animationSpeed)) 
    PRT_DATA.animationSpeed = parseInt(PRT_DATA.animationSpeed);
else if(jQuery.inArray(PRT_DATA.animationSpeed, ['fast', 'slow']) == -1)
    PRT_DATA.animationSpeed = 'fast';
PRT_DATA.showSubscreenOnCenter = parseInt(PRT_DATA.showSubscreenOnCenter);
var sdLoaderImgPrt = '<img src="'+ PRT_DATA.loader+ '" />';

jQuery.fn.showLoaderPrt = function() {
    jQuery(this).html( sdLoaderImgPrt );
}
jQuery.fn.appendLoaderPrt = function() {
    jQuery(this).append( sdLoaderImgPrt );
}

jQuery.sendFormPrt = function(params) {
	// Any html element can be used here
	return jQuery('<br />').sendFormPrt(params);
}
/**
 * Send form or just data to server by ajax and route response
 * @param string params.fid form element ID, if empty - current element will be used
 * @param string params.msgElID element ID to store result messages, if empty - element with ID "msg" will be used. Can be "noMessages" to not use this feature
 * @param function params.onSuccess funstion to do after success receive response. Be advised - "success" means that ajax response will be success
 * @param array params.data data to send if You don't want to send Your form data, will be set instead of all form data
 * @param array params.appendData data to append to sending request. In contrast to params.data will not erase form data
 * @param string params.inputsWraper element ID for inputs wraper, will be used if it is not a form
 * @param string params.clearMsg clear msg element after receive data, if is number - will use it to set time for clearing, else - if true - will clear msg element after 5 seconds
 */
jQuery.fn.sendFormPrt = function(params) {
    var form = null;
    if(!params)
        params = {fid: false, msgElID: false, onSuccess: false};

    if(params.fid)
        form = jQuery('#'+ fid);
    else
        form = jQuery(this);
    
    /* This method can be used not only from form data sending, it can be used just to send some data and fill in response msg or errors*/
    var sentFromForm = (jQuery(form).tagName() == 'FORM');
    var data = new Array();
    if(params.data)
        data = params.data;
    else if(sentFromForm)
        data = jQuery(form).serialize();
    
    if(params.appendData) {
		var dataIsString = typeof(data) == 'string';
		var addStrData = [];
        for(var i in params.appendData) {
			if(dataIsString) {
				addStrData.push(i+ '='+ params.appendData[i]);
			} else
            data[i] = params.appendData[i];
        }
		if(dataIsString)
			data += '&'+ addStrData.join('&');
    }
    var msgEl = null;
    if(params.msgElID) {
        if(params.msgElID == 'noMessages')
            msgEl = false;
        else if(typeof(params.msgElID) == 'object')
           msgEl = params.msgElID;
       else
            msgEl = jQuery('#'+ params.msgElID);
    } else
        msgEl = jQuery('#msg');
	if(typeof(params.inputsWraper) == 'string') {
		form = jQuery('#'+ params.inputsWraper);
		sentFromForm = true;
	}
	if(sentFromForm && form) {
        jQuery(form).find('*').removeClass('prtInputError');
    }
	if(msgEl) {
		jQuery(msgEl).removeClass('prtSuccessMsg')
			.removeClass('prtErrorMsg')
			.showLoaderPrt();
	}
    var url = '';
	if(typeof(params.url) != 'undefined')
		url = params.url;
    else if(typeof(ajaxurl) == 'undefined')
        url = PRT_DATA.ajaxurl;
    else
        url = ajaxurl;
    
    jQuery('.prtErrorForField').hide(PRT_DATA.animationSpeed);
	var dataType = params.dataType ? params.dataType : 'json';
	// Set plugin orientation
	if(typeof(data) == 'string')
		data += '&pl='+ PRT_DATA.PRT_CODE;
	else
		data['pl'] = PRT_DATA.PRT_CODE;
	
    jQuery.ajax({
        url: url,
        data: data,
        type: 'POST',
        dataType: dataType,
        success: function(res) {
            toeProcessAjaxResponsePrt(res, msgEl, form, sentFromForm, params);
			if(params.clearMsg) {
				setTimeout(function(){
					jQuery(msgEl).animateClear();
				}, typeof(params.clearMsg) == 'boolean' ? 5000 : params.clearMsg);
			}
        }
    });
}

/**
 * Hide content in element and then clear it
 */
jQuery.fn.animateClear = function() {
	var newContent = jQuery('<span>'+ jQuery(this).html()+ '</span>');
	jQuery(this).html( newContent );
	jQuery(newContent).hide(PRT_DATA.animationSpeed, function(){
		jQuery(newContent).remove();
	});
}
/**
 * Hide content in element and then remove it
 */
jQuery.fn.animateRemove = function(animationSpeed) {
	animationSpeed = animationSpeed == undefined ? PRT_DATA.animationSpeed : animationSpeed;
	jQuery(this).hide(animationSpeed, function(){
		jQuery(this).remove();
	});
}

function toeProcessAjaxResponsePrt(res, msgEl, form, sentFromForm, params) {
    if(typeof(params) == 'undefined')
        params = {};
    if(typeof(msgEl) == 'string')
        msgEl = jQuery('#'+ msgEl);
    if(msgEl)
        jQuery(msgEl).html('');
    /*if(sentFromForm) {
        jQuery(form).find('*').removeClass('prtInputError');
    }*/
    if(typeof(res) == 'object') {
        if(res.error) {
            if(msgEl) {
                jQuery(msgEl).removeClass('prtSuccessMsg')
					.addClass('prtErrorMsg');
            }
            for(var name in res.errors) {
                if(sentFromForm) {
                    jQuery(form).find('[name*="'+ name+ '"]').addClass('prtInputError');
                }
                if(jQuery('.prtErrorForField.toe_'+ nameToClassId(name)+ '').exists())
                    jQuery('.prtErrorForField.toe_'+ nameToClassId(name)+ '').show().html(res.errors[name]);
                else if(msgEl)
                    jQuery(msgEl).append(res.errors[name]).append('<br />');
            }
        } else if(res.messages.length) {
            if(msgEl) {
                jQuery(msgEl).removeClass('prtErrorMsg')
					.addClass('prtSuccessMsg');
                for(var i in res.messages) {
                    jQuery(msgEl).append(res.messages[i]).append('<br />');
                }
            }
        }
    }
    if(params.onSuccess && typeof(params.onSuccess) == 'function') {
        params.onSuccess(res);
    }
}

function getDialogElementPrt() {
	return jQuery('<div/>').appendTo(jQuery('body'));
}

function toeOptionPrt(key) {
	if(PRT_DATA.options && PRT_DATA.options[ key ] && PRT_DATA.options[ key ].value)
		return PRT_DATA.options[ key ].value;
	return false;
}
function toeLangPrt(key) {
	if(PRT_DATA.siteLang && PRT_DATA.siteLang[key])
		return PRT_DATA.siteLang[key];
	return key;
}
function toePagesPrt(key) {
	if(typeof(PRT_DATA) != 'undefined' && PRT_DATA[key])
		return PRT_DATA[key];
	return false;;
}
/**
 * This function will help us not to hide desc right now, but wait - maybe user will want to select some text or click on some link in it.
 */
function toeOptTimeoutHideDescriptionPrt() {
	jQuery('#prtOptDescription').removeAttr('toeFixTip');
	setTimeout(function(){
		if(!jQuery('#prtOptDescription').attr('toeFixTip'))
			toeOptHideDescriptionPrt();
	}, 500);
}
/**
 * Show description for options
 */
function toeOptShowDescriptionPrt(description, x, y, moveToLeft) {
    if(typeof(description) != 'undefined' && description != '') {
        if(!jQuery('#prtOptDescription').size()) {
            jQuery('body').append('<div id="prtOptDescription"></div>');
        }
		if(moveToLeft)
			jQuery('#prtOptDescription').css('right', jQuery(window).width() - (x - 10));	// Show it on left side of target
		else
			jQuery('#prtOptDescription').css('left', x + 10);
        jQuery('#prtOptDescription').css('top', y);
        jQuery('#prtOptDescription').show(200);
        jQuery('#prtOptDescription').html(description);
    }
}
/**
 * Hide description for options
 */
function toeOptHideDescriptionPrt() {
	jQuery('#prtOptDescription').removeAttr('toeFixTip');
    jQuery('#prtOptDescription').hide(200);
}