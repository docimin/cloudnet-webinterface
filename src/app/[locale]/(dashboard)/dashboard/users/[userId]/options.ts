import { Option } from '@/components/ui/custom/multi-select'

export const OPTIONS: Option[] = [
  {
    label: 'Global Admin',
    value: 'global:admin',
    group: 'Administrator',
  },
  {
    label: 'Read for Rest Users',
    value: 'cloudnet_rest:user_read',
    group: 'Rest users',
  },
  {
    label: 'Write for Rest Users',
    value: 'cloudnet_rest:user_write',
    group: 'Rest users',
  },
  {
    label: 'List for Rest Users',
    value: 'cloudnet_rest:user_get_all',
    group: 'Rest users',
  },
  {
    label: 'Create a new rest user',
    value: 'cloudnet_rest:user_create',
    group: 'Rest users',
  },
  {
    label: 'Get info about rest user',
    value: 'cloudnet_rest:user_get',
    group: 'Rest users',
  },
  {
    label: 'Updates existing rest user',
    value: 'cloudnet_rest:user_update',
    group: 'Rest users',
  },
  {
    label: 'Delete a rest user',
    value: 'cloudnet_rest:user_delete',
    group: 'Rest users',
  },
  {
    label: 'Read for Nodes',
    value: 'cloudnet_rest:node_read',
    group: 'Node',
  },
  {
    label: 'Write for Nodes',
    value: 'cloudnet_rest:node_write',
    group: 'Node',
  },
  { label: 'Node info', value: 'cloudnet_rest:node_info', group: 'Node' },
  { label: 'Node ping', value: 'cloudnet_rest:node_ping', group: 'Node' },
  {
    label: 'Node Live console',
    value: 'cloudnet_rest:node_live_console',
    group: 'Node',
  },
  { label: 'Node reload', value: 'cloudnet_rest:node_reload', group: 'Node' },
  {
    label: 'Get the current configuration of node',
    value: 'cloudnet_rest:node_config_get',
    group: 'Node',
  },
  {
    label: 'Updates the configuration of node',
    value: 'cloudnet_rest:node_config_update',
    group: 'Node',
  },
  {
    label: 'Read for Clusters',
    value: 'cloudnet_rest:cluster_read',
    group: 'Cluster',
  },
  {
    label: 'Write for Clusters',
    value: 'cloudnet_rest:cluster_write',
    group: 'Cluster',
  },
  {
    label: 'Lists all nodes',
    value: 'cloudnet_rest:cluster_node_list',
    group: 'Cluster',
  },
  {
    label: 'Updates a node',
    value: 'cloudnet_rest:cluster_node_update',
    group: 'Cluster',
  },
  {
    label: 'Creates a new node',
    value: 'cloudnet_rest:cluster_node_create',
    group: 'Cluster',
  },
  {
    label: 'Get detail information of a specific node',
    value: 'cloudnet_rest:cluster_node_get',
    group: 'Cluster',
  },
  {
    label: 'Deletes a node',
    value: 'cloudnet_rest:cluster_node_delete',
    group: 'Cluster',
  },
  {
    label: 'Sends a command to node',
    value: 'cloudnet_rest:cluster_node_command',
    group: 'Cluster',
  },
  {
    label: 'Read for Databases',
    value: 'cloudnet_rest:database_read',
    group: 'Database',
  },
  {
    label: 'Write for Databases',
    value: 'cloudnet_rest:database_write',
    group: 'Database',
  },
  {
    label: 'Lists all database names',
    value: 'cloudnet_rest:database_list',
    group: 'Database',
  },
  {
    label: 'Create new document in database',
    value: 'cloudnet_rest:database_insert',
    group: 'Database',
  },
  {
    label: 'Delete documents from the database',
    value: 'cloudnet_rest:database_delete',
    group: 'Database',
  },
  {
    label: 'Clears a database',
    value: 'cloudnet_rest:database_clear',
    group: 'Database',
  },
  {
    label: 'Get keys in database',
    value: 'cloudnet_rest:database_keys',
    group: 'Database',
  },
  {
    label: 'Get document count in database',
    value: 'cloudnet_rest:database_count',
    group: 'Database',
  },
  {
    label: 'Checks database for specific key',
    value: 'cloudnet_rest:database_contains',
    group: 'Database',
  },
  {
    label: 'Get document from database',
    value: 'cloudnet_rest:database_get',
    group: 'Database',
  },
  {
    label: 'Find documents in database',
    value: 'cloudnet_rest:database_find',
    group: 'Database',
  },
  {
    label: 'Read for groups',
    value: 'cloudnet_rest:group_read',
    group: 'Groups',
  },
  {
    label: 'Write for groups',
    value: 'cloudnet_rest:group_write',
    group: 'Groups',
  },
  {
    label: 'Lists all groups',
    value: 'cloudnet_rest:group_list',
    group: 'Groups',
  },
  {
    label: 'Creates or updates a group',
    value: 'cloudnet_rest:group_create',
    group: 'Groups',
  },
  {
    label: 'Get a group configuration',
    value: 'cloudnet_rest:group_get',
    group: 'Groups',
  },
  {
    label: 'Deletes a group',
    value: 'cloudnet_rest:group_delete',
    group: 'Groups',
  },
  {
    label: 'Read for Players',
    value: 'cloudnet_bridge:player_read',
    group: 'Player',
  },
  {
    label: 'Write for Players',
    value: 'cloudnet_bridge:player_write',
    group: 'Player',
  },
  {
    label: 'Get number of players',
    value: 'cloudnet_bridge:player_online_count',
    group: 'Player',
  },
  {
    label: 'Get list of online players',
    value: 'cloudnet_bridge:player_get_bulk',
    group: 'Player',
  },
  {
    label: 'Get player by name',
    value: 'cloudnet_bridge:player_get',
    group: 'Player',
  },
  {
    label: 'Checks if player is registered',
    value: 'cloudnet_bridge:player_exists',
    group: 'Player',
  },
  {
    label: 'Send player to service',
    value: 'cloudnet_bridge:player_connect_service',
    group: 'Player',
  },
  {
    label: 'Connect player to task or group',
    value: 'cloudnet_bridge:player_connect_group_task',
    group: 'Player',
  },
  {
    label: 'Connects player to fallback',
    value: 'cloudnet_bridge:player_connect_fallback',
    group: 'Player',
  },
  {
    label: 'Kick players',
    value: 'cloudnet_bridge:player_disconnect',
    group: 'Player',
  },
  {
    label: 'Send chat message to player',
    value: 'cloudnet_bridge:player_send_chat',
    group: 'Player',
  },
  {
    label: 'Executes command for player',
    value: 'cloudnet_bridge:player_send_command',
    group: 'Player',
  },
  {
    label: 'Read for tasks',
    value: 'cloudnet_rest:task_read',
    group: 'Tasks',
  },
  {
    label: 'Write for tasks',
    value: 'cloudnet_rest:task_write',
    group: 'Tasks',
  },
  {
    label: 'Lists all tasks',
    value: 'cloudnet_rest:task_list',
    group: 'Tasks',
  },
  {
    label: 'Creates a new task',
    value: 'cloudnet_rest:task_create',
    group: 'Tasks',
  },
  {
    label: 'Get a service task',
    value: 'cloudnet_rest:task_get',
    group: 'Tasks',
  },
  {
    label: 'Delete a task',
    value: 'cloudnet_rest:task_delete',
    group: 'Tasks',
  },
  {
    label: 'Read for Services',
    value: 'cloudnet_rest:service_read',
    group: 'Service',
  },
  {
    label: 'Write for Services',
    value: 'cloudnet_rest:service_write',
    group: 'Service',
  },
  {
    label: 'Lists all services',
    value: 'cloudnet_rest:service_list',
    group: 'Service',
  },
  {
    label: 'Get a service',
    value: 'cloudnet_rest:service_get',
    group: 'Service',
  },
  {
    label: 'Delete a service',
    value: 'cloudnet_rest:service_delete',
    group: 'Service',
  },
  {
    label: 'Delete all files of a service',
    value: 'cloudnet_rest:service_delete_files',
    group: 'Service',
  },
  {
    label: 'Updates the lifecycle of a service',
    value: 'cloudnet_rest:service_lifecycle',
    group: 'Service',
  },
  {
    label: 'Include type of inclusion',
    value: 'cloudnet_rest:service_include',
    group: 'Service',
  },
  {
    label: 'Deploys all waiting deployments',
    value: 'cloudnet_rest:service_deploy_resources',
    group: 'Service',
  },
  {
    label: 'Get the cached log lines',
    value: 'cloudnet_rest:service_log_lines',
    group: 'Service',
  },
  {
    label: 'Live console of service',
    value: 'cloudnet_rest:service_live_log',
    group: 'Service',
  },
  {
    label: 'Create new service based on config',
    value: 'cloudnet_rest:service_create_service_config',
    group: 'Service',
  },
  {
    label: 'Create new service based on task',
    value: 'cloudnet_rest:service_create_task',
    group: 'Service',
  },
  {
    label: 'Create new service',
    value: 'cloudnet_rest:service_create_task_name',
    group: 'Service',
  },
  {
    label: 'Add template to service',
    value: 'cloudnet_rest:service_add_template',
    group: 'Service',
  },
  {
    label: 'Add deployment to service',
    value: 'cloudnet_rest:service_add_deployment',
    group: 'Service',
  },
  {
    label: 'Add inclusion to service',
    value: 'cloudnet_rest:service_add_inclusion',
    group: 'Service',
  },
  {
    label: 'Execute command on service',
    value: 'cloudnet_rest:service_send_commands',
    group: 'Service',
  },
  {
    label: 'Read template storages',
    value: 'cloudnet_rest:template_storage_read',
    group: 'Template Storage',
  },
  {
    label: 'Shows template storages',
    value: 'cloudnet_rest:template_storage_list',
    group: 'Template Storage',
  },
  {
    label: 'List templates in template storages',
    value: 'cloudnet_rest:template_storage_template_list',
    group: 'Template Storage',
  },
  {
    label: 'Read templates',
    value: 'cloudnet_rest:template_read',
    group: 'Templates',
  },
  {
    label: 'Write templates',
    value: 'cloudnet_rest:template_write',
    group: 'Templates',
  },
  {
    label: 'Download a file',
    value: 'cloudnet_rest:template_file_download',
    group: 'Templates',
  },
  {
    label: 'Get information about path',
    value: 'cloudnet_rest:template_file_info',
    group: 'Templates',
  },
  {
    label: 'Checks if file/folder exists',
    value: 'cloudnet_rest:template_file_exists',
    group: 'Templates',
  },
  {
    label: 'Download template as zip',
    value: 'cloudnet_rest:template_download',
    group: 'Templates',
  },
  {
    label: 'Checks if template exists',
    value: 'cloudnet_rest:template_exists',
    group: 'Templates',
  },
  {
    label: 'Lists all files in template',
    value: 'cloudnet_rest:template_directory_list',
    group: 'Templates',
  },
  {
    label: 'Creates new template',
    value: 'cloudnet_rest:template_create',
    group: 'Templates',
  },
  {
    label: 'Deploy zip in template',
    value: 'cloudnet_rest:template_deploy',
    group: 'Templates',
  },
  {
    label: 'Creates/Overrides a file',
    value: 'cloudnet_rest:template_file_create',
    group: 'Templates',
  },
  {
    label: 'Append content to file',
    value: 'cloudnet_rest:template_file_append',
    group: 'Templates',
  },
  {
    label: 'Creates a directory',
    value: 'cloudnet_rest:template_directory_create',
    group: 'Templates',
  },
  {
    label: 'Deletes a template',
    value: 'cloudnet_rest:template_delete',
    group: 'Templates',
  },
  {
    label: 'Delete a file or directory',
    value: 'cloudnet_rest:template_delete_file',
    group: 'Templates',
  },
  {
    label: 'Read service versions',
    value: 'cloudnet_rest:service_version_read',
    group: 'Service Versions',
  },
  {
    label: 'Write service versions',
    value: 'cloudnet_rest:service_version_write',
    group: 'Service Versions',
  },
  {
    label: 'List service versions',
    value: 'cloudnet_rest:service_version_list',
    group: 'Service Versions',
  },
  {
    label: 'Add service version type',
    value: 'cloudnet_rest:service_version_register',
    group: 'Service Versions',
  },
  {
    label: 'List service environments',
    value: 'cloudnet_rest:service_version_list_environments',
    group: 'Service Versions',
  },
  {
    label: 'Add new service environment',
    value: 'cloudnet_rest:service_version_environment',
    group: 'Service Versions',
  },
  {
    label: 'Get service version',
    value: 'cloudnet_rest:service_version_get',
    group: 'Service Versions',
  },
  {
    label: 'Load service version type',
    value: 'cloudnet_rest:service_version_load',
    group: 'Service Versions',
  },
  {
    label: 'Load service version to service/template',
    value: 'cloudnet_rest:service_version_load',
    group: 'Service Versions',
  },
  {
    label: 'Install service version to service/template',
    value: 'cloudnet_rest:service_version_install',
    group: 'Service Versions',
  },
  {
    label: 'Read for Modules',
    value: 'cloudnet_rest:module_read',
    group: 'Modules',
  },
  {
    label: 'Write for Modules',
    value: 'cloudnet_rest:module_write',
    group: 'Modules',
  },
  {
    label: 'Reload modules',
    value: 'cloudnet_rest:module_reload_all',
    group: 'Modules',
  },
  {
    label: 'Get loaded modules',
    value: 'cloudnet_rest:module_list_loaded',
    group: 'Modules',
  },
  {
    label: 'Get present modules',
    value: 'cloudnet_rest:module_list_present',
    group: 'Modules',
  },
  {
    label: 'Get modules',
    value: 'cloudnet_rest:module_list_available',
    group: 'Modules',
  },
  {
    label: 'Get module info',
    value: 'cloudnet_rest:module_get',
    group: 'Modules',
  },
  {
    label: 'Change lifecycle of module',
    value: 'cloudnet_rest:module_lifecycle',
    group: 'Modules',
  },
  {
    label: 'Uninstall module',
    value: 'cloudnet_rest:module_uninstall',
    group: 'Modules',
  },
  {
    label: 'Load module',
    value: 'cloudnet_rest:module_load',
    group: 'Modules',
  },
  {
    label: 'Install module',
    value: 'cloudnet_rest:module_install',
    group: 'Modules',
  },
  {
    label: 'Get module configuration',
    value: 'cloudnet_rest:module_config_get',
    group: 'Modules',
  },
  {
    label: 'Update module configuration',
    value: 'cloudnet_rest:module_config_update',
    group: 'Modules',
  },
]
