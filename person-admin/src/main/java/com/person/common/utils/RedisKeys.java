/**
 * 
 *
 * 
 *
 * 
 */

package com.person.common.utils;

/**
 * Redis所有Keys
 *
 * @author 
 */
public class RedisKeys {

    public static String getSysConfigKey(String key){
        return "sys:config:" + key;
    }

    public static String getShiroSessionKey(String key){
        return "sessionid:" + key;
    }
}
