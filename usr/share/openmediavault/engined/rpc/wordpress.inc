<?php
/**
 *
 * @license    http://www.gnu.org/licenses/gpl.html GPL Version 3
 * @copyright  Copyright (c) 2013 OpenMediaVault Plugin Developers
 *
 * This file is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * This file is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this file. If not, see <http://www.gnu.org/licenses/>.
 */
require_once("openmediavault/object.inc");
require_once("openmediavault/config.inc");
require_once("openmediavault/error.inc");
require_once("openmediavault/util.inc");
require_once("openmediavault/rpcservice.inc");
require_once("openmediavault/notify.inc");

class OMVRpcServiceWordpress extends OMVRpcServiceAbstract {

    public function getName() {
        return "Wordpress";
    }

    public function initialize() {
        $this->registerMethod("getSettings");
        $this->registerMethod("setSettings");

        $this->registerMethod("doInstallDB");
    }

    public function getSettings($params, $context) {
        global $xmlConfig;

        // Validate the RPC caller context.
        $this->validateMethodContext($context, array( "role" => OMV_ROLE_ADMINISTRATOR ));

        // Get configuration object
        $xpath  = "//services/wordpress";
        $object = $xmlConfig->get($xpath);
        if (is_null($object))
            throw new OMVException(OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED, $xpath);

        // Modify result data
        $object['enable']    = boolval($object['enable']);
        $object['showtab']   = boolval($object['showtab']);

        return $object;
    }

    public function setSettings($params, $context) {
        global $xmlConfig;

        // Validate the RPC caller context.
        $this->validateMethodContext($context, array( "role" => OMV_ROLE_ADMINISTRATOR ));
        // Validate the parameters of the RPC service method.
        $this->validateMethodParams($params, '{
            "type"       : "object",
            "properties" : {
                "enable"           : { "type" : "boolean" },
                "auth_key"         : { "type" : "string" },
                "secure_auth_key"  : { "type" : "string" },
                "logged_in_key"    : { "type" : "string" },
                "nonce_key"        : { "type" : "string" },
                "auth_salt"        : { "type" : "string" },
                "secure_auth_salt" : { "type" : "string" },
                "logged_in_salt"   : { "type" : "string" },
                "nonce_salt"       : { "type" : "string" },
                "db_host"          : { "type" : "string" },
                "db_user"          : { "type" : "string" },
                "db_pass"          : { "type" : "string" },
                "db_name"          : { "type" : "string" },
                "root_pass"        : { "type" : "string", "optional" : true },
                "showtab"          : { "type" : "boolean" }
            }
        }');

        // Prepare configuration data
        $object = array(
            'enable'           => array_boolval($params, 'enable'),
            'default_host'     => $params['default_host'],
            'auth_key'         => $params['auth_key'],
            'secure_auth_key'  => $params['secure_auth_key'],
            'logged_in_key'    => $params['logged_in_key'],
            'nonce_key'        => $params['nonce_key'],
            'auth_salt'        => $params['auth_salt'],
            'secure_auth_salt' => $params['secure_auth_salt'],
            'logged_in_salt'   => $params['logged_in_salt'],
            'nonce_salt'       => $params['nonce_salt'],
            'db_host'          => $params['db_host'],
            'db_user'          => $params['db_user'],
            'db_pass'          => $params['db_pass'],
            'db_name'          => $params['db_name'],
            'showtab'          => array_boolval($params, 'showtab')
        );

        // Set configuration object
        if (FALSE === $xmlConfig->replace("//services/wordpress", $object))
            throw new OMVException(OMVErrorMsg::E_CONFIG_SET_OBJECT_FAILED);

        // Notify general configuration changes
        $dispatcher = &OMVNotifyDispatcher::getInstance();
        $dispatcher->notify(OMV_NOTIFY_MODIFY,
            "org.openmediavault.services.wordpress", $object);
    }

    public function doInstallDB($params, $context) {
        global $xmlConfig;

        // Validate the RPC caller context.
        $this->validateMethodContext($context, array( "role" => OMV_ROLE_ADMINISTRATOR ));

        // Validate the parameters of the RPC service method.
        $this->validateMethodParams($params, '{
            "type":"object",
            "properties":{
                "db_host"   : { "type" : "string" },
                "db_name"   : { "type" : "string" },
                "db_user"   : { "type" : "string" },
                "db_pass"   : { "type" : "string" },
                "root_pass" : { "type" : "string" }
            }
        }');

        // Get configuration object
        $xpath  = "//services/wordpress";
        $object = $xmlConfig->get($xpath);
        if (is_null($object))
            throw new OMVException(OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED, $xpath);

        // Modify result data
        $object['db_host'] = $params['db_host'];
        $object['db_name'] = $params['db_name'];
        $object['db_user'] = $params['db_user'];
        $object['db_pass'] = $params['db_pass'];

        // Set configuration object
        if (FALSE === $xmlConfig->replace($xpath, $object))
            throw new OMVException(OMVErrorMsg::E_CONFIG_SET_OBJECT_FAILED);

        //create password file
        $file = "/tmp/.openmediavault-wordpress-mysql-pwd";
        file_put_contents($file, $params['root_pass']);

        // install database
        $cmd = "/usr/local/bin/create_wordpress_db 2>&1";
        if(0 !== $this->exec($cmd, $output))
            throw new OMVException(OMVErrorMsg::E_EXEC_FAILED, $cmd, implode("\n", $output));

        // Notify general configuration changes
        $dispatcher = &OMVNotifyDispatcher::getInstance();
        $dispatcher->notify(OMV_NOTIFY_MODIFY,
            "org.openmediavault.services.wordpress", $object);
    }
}

// Register the RPC service.
$rpcServiceMgr = &OMVRpcServiceMgr::getInstance();
$rpcServiceMgr->registerService(new OMVRpcServiceWordpress());

?>