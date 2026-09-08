import type { BlueprintStep, BootstrapStep } from '@/server/blueprint'
import type { SaveAsTemplateStep } from '@/server/service'

export const STEP_KEYS: Record<
  BlueprintStep | BootstrapStep | SaveAsTemplateStep,
  string
> = {
  createTemplate: 'stepCreateTemplate',
  installVersion: 'stepInstallVersion',
  createTask: 'stepCreateTask',
  createService: 'stepCreateService',
  startService: 'stepStartService',
  awaitReady: 'stepAwaitReady',
  addDeployment: 'stepAddDeployment',
  deployResources: 'stepDeployResources'
}
