'use server';
import { patchWithPermissions } from '@/utils/actions/patchWithPermissions';

export async function updateServiceLifecycle(serviceId: string, lifecycle: ServiceLifeCycleUpdate) {
  const requiredPermissions = [
    'cloudnet_rest:service_write',
    'cloudnet_rest:service_lifecycle',
    'global:admin'
  ];

  return await patchWithPermissions(
    `/service/${serviceId}/lifecycle?target=${lifecycle}`,
    requiredPermissions
  );
}

export enum ServiceLifeCycleUpdate {
  START = 'start',
  RESTART = 'restart',
  STOP = 'stop',
}
