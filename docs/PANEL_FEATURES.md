# Panel features — how they compose

This PR adds workflows on top of what CloudNet already exposes over REST.
It does **not** change how CloudNet itself works — the same rules about
ephemeral vs. static services still apply, and they matter more than the
features themselves. This doc explains what each button does, when the
change actually reaches the server, and walks through a realistic
minigame + Advanced Slime World Manager (ASWM) setup end to end.

## The one rule that governs everything

CloudNet has two service modes, set on the **task**:

| Mode | Task fields | Behaviour |
|---|---|---|
| **Ephemeral** (default) | `autoDeleteOnStop: true`, `staticServices: false` | Runtime directory is destroyed on stop. Next start recreates the service **from the template**. |
| **Static** | `autoDeleteOnStop: false`, `staticServices: true` | Runtime directory persists. Template is applied **only on first creation**. Subsequent starts do **not** re-apply the template. |

**Minigame servers are almost always ephemeral** — you want a clean map at the start of every match. **Lobby, Survival, Skyblock are static** — you want configs and worlds to survive restarts.

The whole point of the features below is to make it easy to put things in the right place for each mode.

## Feature-by-feature: does the running server actually pick it up?

| Feature | Ephemeral service | Static service |
|---|---|---|
| **Blueprint wizard** (Tasks → New task) | Creates the task and template — used for every future instance. | Same. |
| **Templates → Xxx/default → edit file** | Applied to every new instance (each match starts fresh from template). | Applied only on **first** creation; running static services already ran past that. |
| **Task form editor** (Form / JSON tabs) | New instances see the change on their next spawn. | Existing static services keep their old config; stop + start to rebuild from the updated task. |
| **Group form editor** | Same as task. | Same as task. |
| **Files tab** (runtime file browser) | Change is visible immediately to the running server. **Lost when the match ends** — the runtime directory is destroyed. | Persists across restarts because the runtime directory is kept. |
| **Actions → Attach template / Flush** | Copies template files into the running service now. **Lost when the match ends.** | Kept. |
| **Actions → Add inclusion / Download now** | Downloads the URL into the runtime now. **Lost when the match ends.** | Kept. |
| **Actions → Send command** | Runs the command in the console. Anything the plugin persists to disk shares the same rules. | Same. |
| **Actions → Save as template** (in Files tab) | Snapshots the runtime into a **template** — future matches start from this new state. | Same — a static service can also be snapshotted this way. |
| **Actions → Wipe files** | Effectively a no-op for ephemeral (the runtime resets on next start anyway). | Nuclear — deletes the persistent runtime. |

**One takeaway**: for an ephemeral service, anything you want to keep across matches must end up in the template. The panel gives you four ways to get it there:

1. `Blueprint wizard` with the **bootstrap** checkbox at creation
2. `Templates → local → Xxx/default` — direct edit for text configs / drag & drop jars
3. `Files tab → Save as template` — after live-testing, snapshot the runtime into the template
4. `Actions → Add deployment target` + `Deploy resources now` — same as #3, in two clicks

## End-to-end walkthrough: minigame network with slime worlds

Assume you want a Bedwars-style minigame using **ASWM** (Advanced Slime World Manager) so every match loads a slime world from MySQL (fast, no world folder on disk). Each game server is ephemeral: one match, then throw away.

### 1. Create the task

`Tasks → New task`

- Preset: **Minigame / Event**
- Server software: `paper` or `purpur`, MC version of your choice
- Persistence: **Ephemeral** (default for this preset)
- Task name: `Bedwars`, memory 2048 MB, min instances 2, start port `45500`
- **Check "Pre-generate config files"** — CloudNet spins up a seed service so Paper writes out `bukkit.yml`, `spigot.yml`, `paper-global.yml`, `config/…`, then saves them into the template. Adds ~25s.

Result: task `Bedwars`, template `local/Bedwars/default` with the jar and all default configs.

### 2. Drop the plugins into the template

`Templates → local → Bedwars → default → plugins/`

Drag & drop:
- `AdvancedSlimeWorldManager.jar`
- Your minigame plugin `MyBedwars.jar`
- Any dependencies (LuckPerms, ProtocolLib, …)

The panel uploads them straight into the template folder.

### 3. Configure ASWM

First give ASWM a chance to write its default config. Two options:

- **Preferred**: `Services → New service` → pick `Bedwars` and start one — it comes up, ASWM writes `plugins/AdvancedSlimeWorldManager/config.yml`, then stop the service, go to the service's **Files** tab, click **Save as template** with `Bedwars/default`. Now the template has the ASWM default config. Delete the throwaway service.
- **Faster**: create the config file manually in the template with the values you want.

Then `Templates → local → Bedwars → default → plugins → AdvancedSlimeWorldManager → config.yml`, open it, set your MySQL / MongoDB data source, list the slime worlds ASWM should load, save.

### 4. Configure your minigame plugin the same way

`Templates → local → Bedwars → default → plugins → MyBedwars → config.yml` — set arena names to match the slime world names ASWM will load.

### 5. Start playing

`Services → New service → Bedwars` — 2 instances spawn (the `minServiceCount` from the task), each loads its slime world from the DB, one match runs, everyone leaves, service auto-deletes, next match starts fresh from the same template. **This is the whole point of ephemeral + template + slime worlds together**: no world files to clean up, no per-match config drift, every match starts identical.

### 6. Iterate

You want to change a plugin config for the next match:

- **Persistent change** (all future matches): edit the file in `Templates → local → Bedwars → default → plugins → …/config.yml`. Next match spawned starts with the new config.
- **Hot patch during a match** (live but disposable): edit the same file in the running service's **Files** tab, then `Actions → Send command` → `/mybedwars reload`. The change lasts for this match only.
- **You did a hot patch and it's good, keep it**: on the running service's **Files** tab click **Save as template** → `Bedwars/default`. Next match uses the new state.

### 7. Add a new arena

- Slime worlds are stored in your DB. Add the new slime with ASWM's own tools (or upload the .slime file if you keep them on disk).
- Update `plugins/AdvancedSlimeWorldManager/config.yml` in the template to list the new world.
- Update `plugins/MyBedwars/config.yml` in the template to declare the new arena.
- Next match sees the new arena.

### 8. Upgrade a plugin across the network

- Drop the new jar into `Templates → local → Bedwars → default → plugins/` (overwrites the old one).
- New matches use the new jar. Currently-running matches keep the old one until they end.
- To force everyone onto the new version now: on each running service, `Actions → Attach template / Flush` with `Bedwars/default` (copies the plugin into the running service; you'll still need `/reload confirm` or restart).

## What NOT to do

- **Don't** edit the runtime `Files` tab of an ephemeral service expecting the change to survive the match. Use the template instead.
- **Don't** convert a minigame task to `Static` to keep runtime changes — you'll accumulate worlds, logs, plugin data per instance until the disk fills. If you want changes to stick, save them to the template.
- **Don't** put a `.slime` file inside the template if you're storing worlds in a DB — ASWM will get confused. Choose one storage.
- **Don't** rely on the `Wipe files` action for cleanup on ephemeral services — they clean themselves. `Wipe files` is a big red button that only makes sense on static services when you want to fully reset one.

## Where each button hits CloudNet

Everything goes through the existing REST API, no changes to the node:

- Templates: `POST /template/{s}/{p}/{n}/create`, `POST /file/create`, `POST /deploy`, `POST /directory/create`, `GET /file/download`, `DELETE`
- Tasks: `POST /task` (upsert), `DELETE /task/{name}`
- Groups: `POST /group` (upsert), `DELETE /group/{name}`
- Services: `POST /service/create/taskName`, `PATCH /service/{id}/lifecycle?target=`, `POST /service/{id}/add/template`, `POST /service/{id}/add/deployment`, `POST /service/{id}/add/inclusion`, `POST /service/{id}/deployResources`, `POST /service/{id}/command`, `DELETE /service/{id}/deleteFiles`
- Runtime service files: filesystem access via `CLOUDNET_SERVICES_PATH` bind-mount (feature-flagged)

## Tested on

CloudNet 4.0.0-RC17, Purpur 26.2, Velocity 3.5.1, ASWM InfernalSuite `dev/26.2` branch.
