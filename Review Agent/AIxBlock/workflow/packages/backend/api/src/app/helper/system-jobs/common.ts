import { Dayjs } from 'dayjs'
import { ProjectId } from 'workflow-shared'

export enum SystemJobName {
    HARD_DELETE_PROJECT = 'hard-delete-project',
    PLATFORM_USAGE_REPORT = 'platform-usage-report',
    USAGE_REPORT = 'usage-report',
    BLOCKS_ANALYTICS = 'blocks-analytics',
    BLOCKS_SYNC = 'blocks-sync',
    FILE_CLEANUP_TRIGGER = 'file-cleanup-trigger',
    ISSUES_REMINDER = 'issue-reminder',
    PROJECT_PLAN_SYNC = 'project-plan-sync',
    PLATFORM_LICENSE_SYNC = 'platform-license-sync',
}

type HardDeleteProjectSystemJobData = {
    projectId: ProjectId
}
type IssuesReminderSystemJobData = {
    projectId: ProjectId
    projectName: string
    platformId: string
}

type SystemJobDataMap = {
    [SystemJobName.HARD_DELETE_PROJECT]: HardDeleteProjectSystemJobData
    [SystemJobName.ISSUES_REMINDER]: IssuesReminderSystemJobData
    [SystemJobName.PLATFORM_USAGE_REPORT]: Record<string, never>
    [SystemJobName.USAGE_REPORT]: Record<string, never>
    [SystemJobName.BLOCKS_ANALYTICS]: Record<string, never>
    [SystemJobName.BLOCKS_SYNC]: Record<string, never>
    [SystemJobName.FILE_CLEANUP_TRIGGER]: Record<string, never>
    [SystemJobName.PROJECT_PLAN_SYNC]: Record<string, never>
    [SystemJobName.PLATFORM_LICENSE_SYNC]: Record<string, never>
}

export type SystemJobData<T extends SystemJobName = SystemJobName> = T extends SystemJobName ? SystemJobDataMap[T] : never

export type SystemJobDefinition<T extends SystemJobName> = {
    name: T
    data: SystemJobData<T>
    jobId?: string
}

export type SystemJobHandler<T extends SystemJobName = SystemJobName> = (data: SystemJobData<T>) => Promise<void>

type OneTimeJobSchedule = {
    type: 'one-time'
    date: Dayjs
}

type RepeatedJobSchedule = {
    type: 'repeated'
    cron: string
}

export type JobSchedule = OneTimeJobSchedule | RepeatedJobSchedule

type UpsertJobParams<T extends SystemJobName> = {
    job: SystemJobDefinition<T>
    schedule: JobSchedule
}

export type SystemJobSchedule = {
    init(): Promise<void>
    upsertJob<T extends SystemJobName>(params: UpsertJobParams<T>): Promise<void>
    close(): Promise<void>
}
