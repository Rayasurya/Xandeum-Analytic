import { FastifyBaseLogger } from 'fastify'
import { Platform } from 'workflow-shared'
import { repoFactory } from '../../core/db/repo-factory'
import { systemJobsSchedule } from '../../helper/system-jobs'
import { SystemJobName } from '../../helper/system-jobs/common'
import { systemJobHandlers } from '../../helper/system-jobs/job-handlers'
import { system } from '../../helper/system/system'
import { PlatformEntity } from '../../platform/platform.entity'
import { platformService } from '../../platform/platform.service'

const repo = repoFactory<Platform>(PlatformEntity)

export const licenseKeysService = (log: FastifyBaseLogger) => ({
    async setup(): Promise<void> {
        const updateLicenseForPlatform = async () => {
            const platforms = await repo().find();
            for (const platform of platforms) {
                await this.verify(platform.id, 'aixblock');
            }
            console.log("### DONE to update license for platform")
        }
        systemJobHandlers.registerJobHandler(SystemJobName.PLATFORM_LICENSE_SYNC, async function syncPlatformLicenseJobHandler(): Promise<void> {
            updateLicenseForPlatform();
        })
        await updateLicenseForPlatform();
        await systemJobsSchedule(system.globalLogger()).upsertJob({
            job: {
                name: SystemJobName.PLATFORM_LICENSE_SYNC,
                data: {},
            },
            schedule: {
                type: 'repeated',
                cron: '0 0 * * *', // Every day at 12:00 AM
            },
        })
    },
    async verify(platformId: string, licenseKey: string) {
        await platformService.update({
            id: platformId,
            licenseKey: licenseKey, //key.key,
        })
        return { success: true }
    }
})
