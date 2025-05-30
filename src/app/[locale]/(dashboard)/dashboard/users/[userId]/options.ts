import { Option } from '@/components/ui/custom/multi-select'
import { useDict } from 'gt-next/client'

export function useOptions(): Option[] {
  const permissionsT = useDict('Permissions')

  return [
    {
      label: permissionsT('globalAdmin'),
      value: 'global:admin',
      group: permissionsT('administrator')
    },
    {
      label: permissionsT('readForRestUsers'),
      value: 'cloudnet_rest:user_read',
      group: permissionsT('restUsers')
    },
    {
      label: permissionsT('writeForRestUsers'),
      value: 'cloudnet_rest:user_write',
      group: permissionsT('restUsers')
    },
    {
      label: permissionsT('listForRestUsers'),
      value: 'cloudnet_rest:user_get_all',
      group: permissionsT('restUsers')
    },
    {
      label: permissionsT('createNewRestUser'),
      value: 'cloudnet_rest:user_create',
      group: permissionsT('restUsers')
    },
    {
      label: permissionsT('getInfoAboutRestUser'),
      value: 'cloudnet_rest:user_get',
      group: permissionsT('restUsers')
    },
    {
      label: permissionsT('updatesExistingRestUser'),
      value: 'cloudnet_rest:user_update',
      group: permissionsT('restUsers')
    },
    {
      label: permissionsT('deleteRestUser'),
      value: 'cloudnet_rest:user_delete',
      group: permissionsT('restUsers')
    },
    {
      label: permissionsT('readForNodes'),
      value: 'cloudnet_rest:node_read',
      group: permissionsT('node')
    },
    {
      label: permissionsT('writeForNodes'),
      value: 'cloudnet_rest:node_write',
      group: permissionsT('node')
    },
    {
      label: permissionsT('nodeInfo'),
      value: 'cloudnet_rest:node_info',
      group: permissionsT('node')
    },
    {
      label: permissionsT('nodePing'),
      value: 'cloudnet_rest:node_ping',
      group: permissionsT('node')
    },
    {
      label: permissionsT('nodeLiveConsole'),
      value: 'cloudnet_rest:node_live_console',
      group: permissionsT('node')
    },
    {
      label: permissionsT('nodeReload'),
      value: 'cloudnet_rest:node_reload',
      group: permissionsT('node')
    },
    {
      label: permissionsT('getCurrentConfigurationOfNode'),
      value: 'cloudnet_rest:node_config_get',
      group: permissionsT('node')
    },
    {
      label: permissionsT('updatesConfigurationOfNode'),
      value: 'cloudnet_rest:node_config_update',
      group: permissionsT('node')
    },
    {
      label: permissionsT('readForClusters'),
      value: 'cloudnet_rest:cluster_read',
      group: permissionsT('cluster')
    },
    {
      label: permissionsT('writeForClusters'),
      value: 'cloudnet_rest:cluster_write',
      group: permissionsT('cluster')
    },
    {
      label: permissionsT('listsAllNodes'),
      value: 'cloudnet_rest:cluster_node_list',
      group: permissionsT('cluster')
    },
    {
      label: permissionsT('updatesNode'),
      value: 'cloudnet_rest:cluster_node_update',
      group: permissionsT('cluster')
    },
    {
      label: permissionsT('createsNewNode'),
      value: 'cloudnet_rest:cluster_node_create',
      group: permissionsT('cluster')
    },
    {
      label: permissionsT('getDetailInformationOfNode'),
      value: 'cloudnet_rest:cluster_node_get',
      group: permissionsT('cluster')
    },
    {
      label: permissionsT('deletesNode'),
      value: 'cloudnet_rest:cluster_node_delete',
      group: permissionsT('cluster')
    },
    {
      label: permissionsT('sendsCommandToNode'),
      value: 'cloudnet_rest:cluster_node_command',
      group: permissionsT('cluster')
    },
    {
      label: permissionsT('readForDatabases'),
      value: 'cloudnet_rest:database_read',
      group: permissionsT('database')
    },
    {
      label: permissionsT('writeForDatabases'),
      value: 'cloudnet_rest:database_write',
      group: permissionsT('database')
    },
    {
      label: permissionsT('listsAllDatabaseNames'),
      value: 'cloudnet_rest:database_list',
      group: permissionsT('database')
    },
    {
      label: permissionsT('createNewDocumentInDatabase'),
      value: 'cloudnet_rest:database_insert',
      group: permissionsT('database')
    },
    {
      label: permissionsT('deleteDocumentsFromDatabase'),
      value: 'cloudnet_rest:database_delete',
      group: permissionsT('database')
    },
    {
      label: permissionsT('clearsDatabase'),
      value: 'cloudnet_rest:database_clear',
      group: permissionsT('database')
    },
    {
      label: permissionsT('getKeysInDatabase'),
      value: 'cloudnet_rest:database_keys',
      group: permissionsT('database')
    },
    {
      label: permissionsT('getDocumentCountInDatabase'),
      value: 'cloudnet_rest:database_count',
      group: permissionsT('database')
    },
    {
      label: permissionsT('checksDatabaseForKey'),
      value: 'cloudnet_rest:database_contains',
      group: permissionsT('database')
    },
    {
      label: permissionsT('getDocumentFromDatabase'),
      value: 'cloudnet_rest:database_get',
      group: permissionsT('database')
    },
    {
      label: permissionsT('findDocumentsInDatabase'),
      value: 'cloudnet_rest:database_find',
      group: permissionsT('database')
    },
    {
      label: permissionsT('readForGroups'),
      value: 'cloudnet_rest:group_read',
      group: permissionsT('groups')
    },
    {
      label: permissionsT('writeForGroups'),
      value: 'cloudnet_rest:group_write',
      group: permissionsT('groups')
    },
    {
      label: permissionsT('listsAllGroups'),
      value: 'cloudnet_rest:group_list',
      group: permissionsT('groups')
    },
    {
      label: permissionsT('createsOrUpdatesGroup'),
      value: 'cloudnet_rest:group_create',
      group: permissionsT('groups')
    },
    {
      label: permissionsT('getGroupConfiguration'),
      value: 'cloudnet_rest:group_get',
      group: permissionsT('groups')
    },
    {
      label: permissionsT('deletesGroup'),
      value: 'cloudnet_rest:group_delete',
      group: permissionsT('groups')
    },
    {
      label: permissionsT('readForPlayers'),
      value: 'cloudnet_bridge:player_read',
      group: permissionsT('player')
    },
    {
      label: permissionsT('writeForPlayers'),
      value: 'cloudnet_bridge:player_write',
      group: permissionsT('player')
    },
    {
      label: permissionsT('getNumberOfPlayers'),
      value: 'cloudnet_bridge:player_online_count',
      group: permissionsT('player')
    },
    {
      label: permissionsT('getListOfOnlinePlayers'),
      value: 'cloudnet_bridge:player_get_bulk',
      group: permissionsT('player')
    },
    {
      label: permissionsT('getPlayerByName'),
      value: 'cloudnet_bridge:player_get',
      group: permissionsT('player')
    },
    {
      label: permissionsT('checksIfPlayerIsRegistered'),
      value: 'cloudnet_bridge:player_exists',
      group: permissionsT('player')
    },
    {
      label: permissionsT('sendPlayerToService'),
      value: 'cloudnet_bridge:player_connect_service',
      group: permissionsT('player')
    },
    {
      label: permissionsT('connectPlayerToTaskOrGroup'),
      value: 'cloudnet_bridge:player_connect_group_task',
      group: permissionsT('player')
    },
    {
      label: permissionsT('connectsPlayerToFallback'),
      value: 'cloudnet_bridge:player_connect_fallback',
      group: permissionsT('player')
    },
    {
      label: permissionsT('kickPlayers'),
      value: 'cloudnet_bridge:player_disconnect',
      group: permissionsT('player')
    },
    {
      label: permissionsT('sendChatMessageToPlayer'),
      value: 'cloudnet_bridge:player_send_chat',
      group: permissionsT('player')
    },
    {
      label: permissionsT('executesCommandForPlayer'),
      value: 'cloudnet_bridge:player_send_command',
      group: permissionsT('player')
    },
    {
      label: permissionsT('readForTasks'),
      value: 'cloudnet_rest:task_read',
      group: permissionsT('tasks')
    },
    {
      label: permissionsT('writeForTasks'),
      value: 'cloudnet_rest:task_write',
      group: permissionsT('tasks')
    },
    {
      label: permissionsT('listsAllTasks'),
      value: 'cloudnet_rest:task_list',
      group: permissionsT('tasks')
    },
    {
      label: permissionsT('createsNewTask'),
      value: 'cloudnet_rest:task_create',
      group: permissionsT('tasks')
    },
    {
      label: permissionsT('getServiceTask'),
      value: 'cloudnet_rest:task_get',
      group: permissionsT('tasks')
    },
    {
      label: permissionsT('deleteTask'),
      value: 'cloudnet_rest:task_delete',
      group: permissionsT('tasks')
    },
    {
      label: permissionsT('readForServices'),
      value: 'cloudnet_rest:service_read',
      group: permissionsT('service')
    },
    {
      label: permissionsT('writeForServices'),
      value: 'cloudnet_rest:service_write',
      group: permissionsT('service')
    },
    {
      label: permissionsT('listsAllServices'),
      value: 'cloudnet_rest:service_list',
      group: permissionsT('service')
    },
    {
      label: permissionsT('getService'),
      value: 'cloudnet_rest:service_get',
      group: permissionsT('service')
    },
    {
      label: permissionsT('deleteService'),
      value: 'cloudnet_rest:service_delete',
      group: permissionsT('service')
    },
    {
      label: permissionsT('deleteAllFilesOfService'),
      value: 'cloudnet_rest:service_delete_files',
      group: permissionsT('service')
    },
    {
      label: permissionsT('updatesLifecycleOfService'),
      value: 'cloudnet_rest:service_lifecycle',
      group: permissionsT('service')
    },
    {
      label: permissionsT('includeTypeOfInclusion'),
      value: 'cloudnet_rest:service_include',
      group: permissionsT('service')
    },
    {
      label: permissionsT('deploysAllWaitingDeployments'),
      value: 'cloudnet_rest:service_deploy_resources',
      group: permissionsT('service')
    },
    {
      label: permissionsT('getCachedLogLines'),
      value: 'cloudnet_rest:service_log_lines',
      group: permissionsT('service')
    },
    {
      label: permissionsT('liveConsoleOfService'),
      value: 'cloudnet_rest:service_live_log',
      group: permissionsT('service')
    },
    {
      label: permissionsT('createNewServiceBasedOnConfig'),
      value: 'cloudnet_rest:service_create_service_config',
      group: permissionsT('service')
    },
    {
      label: permissionsT('createNewServiceBasedOnTask'),
      value: 'cloudnet_rest:service_create_task',
      group: permissionsT('service')
    },
    {
      label: permissionsT('createNewService'),
      value: 'cloudnet_rest:service_create_task_name',
      group: permissionsT('service')
    },
    {
      label: permissionsT('addTemplateToService'),
      value: 'cloudnet_rest:service_add_template',
      group: permissionsT('service')
    },
    {
      label: permissionsT('addDeploymentToService'),
      value: 'cloudnet_rest:service_add_deployment',
      group: permissionsT('service')
    },
    {
      label: permissionsT('addInclusionToService'),
      value: 'cloudnet_rest:service_add_inclusion',
      group: permissionsT('service')
    },
    {
      label: permissionsT('executeCommandOnService'),
      value: 'cloudnet_rest:service_send_commands',
      group: permissionsT('service')
    },
    {
      label: permissionsT('readTemplateStorages'),
      value: 'cloudnet_rest:template_storage_read',
      group: permissionsT('templateStorage')
    },
    {
      label: permissionsT('showsTemplateStorages'),
      value: 'cloudnet_rest:template_storage_list',
      group: permissionsT('templateStorage')
    },
    {
      label: permissionsT('listTemplatesInTemplateStorages'),
      value: 'cloudnet_rest:template_storage_template_list',
      group: permissionsT('templateStorage')
    },
    {
      label: permissionsT('readTemplates'),
      value: 'cloudnet_rest:template_read',
      group: permissionsT('templates')
    },
    {
      label: permissionsT('writeTemplates'),
      value: 'cloudnet_rest:template_write',
      group: permissionsT('templates')
    },
    {
      label: permissionsT('downloadFile'),
      value: 'cloudnet_rest:template_file_download',
      group: permissionsT('templates')
    },
    {
      label: permissionsT('getInformationAboutPath'),
      value: 'cloudnet_rest:template_file_info',
      group: permissionsT('templates')
    },
    {
      label: permissionsT('checksIfFileFolderExists'),
      value: 'cloudnet_rest:template_file_exists',
      group: permissionsT('templates')
    },
    {
      label: permissionsT('downloadTemplateAsZip'),
      value: 'cloudnet_rest:template_download',
      group: permissionsT('templates')
    },
    {
      label: permissionsT('checksIfTemplateExists'),
      value: 'cloudnet_rest:template_exists',
      group: permissionsT('templates')
    },
    {
      label: permissionsT('listsAllFilesInTemplate'),
      value: 'cloudnet_rest:template_directory_list',
      group: permissionsT('templates')
    },
    {
      label: permissionsT('createsNewTemplate'),
      value: 'cloudnet_rest:template_create',
      group: permissionsT('templates')
    },
    {
      label: permissionsT('deployZipInTemplate'),
      value: 'cloudnet_rest:template_deploy',
      group: permissionsT('templates')
    },
    {
      label: permissionsT('createsOverridesFile'),
      value: 'cloudnet_rest:template_file_create',
      group: permissionsT('templates')
    },
    {
      label: permissionsT('appendContentToFile'),
      value: 'cloudnet_rest:template_file_append',
      group: permissionsT('templates')
    },
    {
      label: permissionsT('createsDirectory'),
      value: 'cloudnet_rest:template_directory_create',
      group: permissionsT('templates')
    },
    {
      label: permissionsT('deletesTemplate'),
      value: 'cloudnet_rest:template_delete',
      group: permissionsT('templates')
    },
    {
      label: permissionsT('deleteFileOrDirectory'),
      value: 'cloudnet_rest:template_delete_file',
      group: permissionsT('templates')
    },
    {
      label: permissionsT('readServiceVersions'),
      value: 'cloudnet_rest:service_version_read',
      group: permissionsT('serviceVersions')
    },
    {
      label: permissionsT('writeServiceVersions'),
      value: 'cloudnet_rest:service_version_write',
      group: permissionsT('serviceVersions')
    },
    {
      label: permissionsT('listServiceVersions'),
      value: 'cloudnet_rest:service_version_list',
      group: permissionsT('serviceVersions')
    },
    {
      label: permissionsT('addServiceVersionType'),
      value: 'cloudnet_rest:service_version_register',
      group: permissionsT('serviceVersions')
    },
    {
      label: permissionsT('listServiceEnvironments'),
      value: 'cloudnet_rest:service_version_list_environments',
      group: permissionsT('serviceVersions')
    },
    {
      label: permissionsT('addNewServiceEnvironment'),
      value: 'cloudnet_rest:service_version_environment',
      group: permissionsT('serviceVersions')
    },
    {
      label: permissionsT('getServiceVersion'),
      value: 'cloudnet_rest:service_version_get',
      group: permissionsT('serviceVersions')
    },
    {
      label: permissionsT('loadServiceVersionToServiceTemplate'),
      value: 'cloudnet_rest:service_version_load',
      group: permissionsT('serviceVersions')
    },
    {
      label: permissionsT('installServiceVersionToServiceTemplate'),
      value: 'cloudnet_rest:service_version_install',
      group: permissionsT('serviceVersions')
    },
    {
      label: permissionsT('readForModules'),
      value: 'cloudnet_rest:module_read',
      group: permissionsT('modules')
    },
    {
      label: permissionsT('writeForModules'),
      value: 'cloudnet_rest:module_write',
      group: permissionsT('modules')
    },
    {
      label: permissionsT('reloadModules'),
      value: 'cloudnet_rest:module_reload_all',
      group: permissionsT('modules')
    },
    {
      label: permissionsT('getLoadedModules'),
      value: 'cloudnet_rest:module_list_loaded',
      group: permissionsT('modules')
    },
    {
      label: permissionsT('getPresentModules'),
      value: 'cloudnet_rest:module_list_present',
      group: permissionsT('modules')
    },
    {
      label: permissionsT('getModules'),
      value: 'cloudnet_rest:module_list_available',
      group: permissionsT('modules')
    },
    {
      label: permissionsT('getModuleInfo'),
      value: 'cloudnet_rest:module_get',
      group: permissionsT('modules')
    },
    {
      label: permissionsT('changeLifecycleOfModule'),
      value: 'cloudnet_rest:module_lifecycle',
      group: permissionsT('modules')
    },
    {
      label: permissionsT('uninstallModule'),
      value: 'cloudnet_rest:module_uninstall',
      group: permissionsT('modules')
    },
    {
      label: permissionsT('loadModule'),
      value: 'cloudnet_rest:module_load',
      group: permissionsT('modules')
    },
    {
      label: permissionsT('installModule'),
      value: 'cloudnet_rest:module_install',
      group: permissionsT('modules')
    },
    {
      label: permissionsT('getModuleConfiguration'),
      value: 'cloudnet_rest:module_config_get',
      group: permissionsT('modules')
    },
    {
      label: permissionsT('updateModuleConfiguration'),
      value: 'cloudnet_rest:module_config_update',
      group: permissionsT('modules')
    }
  ]
}
