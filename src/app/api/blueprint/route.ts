import { NextResponse } from 'next/server'
import { checkPermissions, makeApiRequest, createApiRoute } from '@/lib/api-helpers'

// Body:
// {
//   taskName: string,
//   preset: 'lobby'|'survival'|'minigame'|'proxy'|'custom',
//   environment: string,        // MINECRAFT_SERVER | VELOCITY | ...
//   groups: string[],
//   static: boolean,            // true → autoDeleteOnStop=false + staticServices=true
//   memory: number,             // MB
//   minServiceCount: number,
//   startPort: number,
//   serviceVersionType?: string,// 'purpurmc' | 'papermc' | 'velocity' | ...
//   serviceVersion?: string,    // '1.21.1' | '26.2' | ...
//   javaCommand?: string,
//   bootstrap: boolean          // pre-generate config files by running the service once
// }
export const POST = createApiRoute(async (req) => {
  const permissionCheck = await checkPermissions([
    'cloudnet_rest:task_write',
    'cloudnet_rest:task_create',
    'global:admin'
  ])
  if (permissionCheck) return NextResponse.json(permissionCheck, { status: permissionCheck.status })

  const b = await req.json()
  const {
    taskName, environment, groups = [], memory = 512, minServiceCount = 0,
    startPort = 44955, serviceVersionType, serviceVersion, javaCommand,
    bootstrap = false
  } = b
  const isStatic: boolean = !!b.static

  if (!taskName || !/^[A-Za-z0-9_-]{1,40}$/.test(taskName)) {
    return NextResponse.json({ error: 'invalid taskName' }, { status: 400 })
  }

  const storage = 'local'
  const templatePrefix = taskName
  const templateName = 'default'
  const templateRef = { prefix: templatePrefix, name: templateName, storage, priority: 0, alwaysCopyToStaticServices: false }

  // Step 1: create the template folder (idempotent — CloudNet ignores if exists)
  await makeApiRequest(
    `/template/${storage}/${templatePrefix}/${templateName}/create`,
    'POST'
  )

  // Step 2: install a service version into the template (optional)
  if (serviceVersionType && serviceVersion) {
    const installRes = await makeApiRequest(
      `/serviceVersion/install?cache=true`,
      'POST',
      {
        template: templateRef,
        serviceVersionType,
        serviceVersion,
      },
      { stringifyBody: true, returnJson: false }
    )
    if (installRes.status >= 400) {
      return NextResponse.json({ step: 'install-version', ...installRes }, { status: installRes.status })
    }
  }

  // Step 3: upsert the task
  const taskConfig = {
    name: taskName,
    runtime: 'jvm',
    hostAddress: null,
    javaCommand: javaCommand || '/usr/lib/jvm/java-25-openjdk-amd64/bin/java',
    nameSplitter: '-',
    disableIpRewrite: false,
    maintenance: false,
    autoDeleteOnStop: !isStatic,
    staticServices: isStatic,
    groups,
    associatedNodes: [],
    deletedFilesAfterStop: [],
    processConfiguration: {
      environment,
      maxHeapMemorySize: memory,
      jvmOptions: [],
      processParameters: [],
      environmentVariables: {}
    },
    startPort,
    minServiceCount,
    templates: [templateRef],
    deployments: [],
    includes: [],
    properties: { requiredPermission: null }
  }
  const taskRes = await makeApiRequest(`/task`, 'POST', taskConfig, {
    stringifyBody: true, returnJson: false
  })
  if (taskRes.status >= 400) {
    return NextResponse.json({ step: 'create-task', ...taskRes }, { status: taskRes.status })
  }

  // Step 4: bootstrap — start a seed service, let it generate configs, deploy back to template
  if (bootstrap) {
    // create service
    const created = await makeApiRequest(
      `/service/create/taskName`,
      'POST',
      { taskName },
      { stringifyBody: true }
    )
    if (created.status >= 400) {
      return NextResponse.json({ step: 'bootstrap-create', ...created }, { status: created.status })
    }
    const cd: any = created.data
    const uuid: string | undefined =
      cd?.serviceInfo?.configuration?.serviceId?.uniqueId ||
      cd?.creationId ||
      cd?.serviceInfoSnapshot?.configuration?.serviceId?.uniqueId ||
      cd?.uniqueId
    if (!uuid) {
      return NextResponse.json({ step: 'bootstrap-uuid', error: 'no uuid returned' }, { status: 500 })
    }

    // start
    await makeApiRequest(`/service/${uuid}/lifecycle?target=start`, 'PATCH')

    // wait for the service to have written its config files
    // (Minecraft servers take 10-20s to produce bukkit.yml/paper-global.yml/…)
    const waitMs = environment === 'MINECRAFT_SERVER' ? 22000 : 8000
    await new Promise(r => setTimeout(r, waitMs))

    // attach deployment to our template (so deployResources writes there)
    await makeApiRequest(
      `/service/${uuid}/add/deployment?flush=false`,
      'POST',
      {
        template: templateRef,
        excludes: [],
        includes: [],
        properties: {}
      },
      { stringifyBody: true, returnJson: false }
    )

    // deploy runtime → template
    await makeApiRequest(`/service/${uuid}/deployResources?remove=true`, 'POST', undefined, { returnJson: false })

    // stop + delete
    await makeApiRequest(`/service/${uuid}/lifecycle?target=stop`, 'PATCH')
    await new Promise(r => setTimeout(r, 1500))
    await makeApiRequest(`/service/${uuid}`, 'DELETE')
  }

  return NextResponse.json({ status: 200, ok: true, taskName })
})
