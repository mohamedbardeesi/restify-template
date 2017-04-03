/**

 __   __                _    ____ ___ _____                      _   
 \ \ / /__  _   _ _ __ / \  |  _ \_ _| ____|_  ___ __   ___ _ __| |_ 
  \ V / _ \| | | | '__/ _ \ | |_) | ||  _| \ \/ / '_ \ / _ \ '__| __|
   | | (_) | |_| | | / ___ \|  __/| || |___ >  <| |_) |  __/ |  | |_ 
   |_|\___/ \__,_|_|/_/   \_\_|  |___|_____/_/\_\ .__/ \___|_|   \__|
                                                |_|                  
 @file Handy utilities for various functions
 @author Stephen Lombard <stephen@teem.nz>
 @version 1.0.0
 @module utils
*/

'use strict';


/**
 * Return a shallow copy of the given object;
 * @public
 * @method  shallowCopy
 * @param   {Object} obj the object to copy
 * @returns {Object}     the new copy of the object
 */
function shallowCopy(obj) {
    if (!obj) {
        return (obj);
    }
    var copy = {};
    Object.keys(obj).forEach(function (k) {
        copy[k] = obj[k];
    });
    return (copy);
}



///--- Exports

module.exports = {
    shallowCopy: shallowCopy
};
