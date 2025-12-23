import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { t } from 'i18next';
import { CircleCheck, FilePenLine } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { AIxBlockTaskStatus, AIxBlockTaskStatusOptions } from 'workflow-shared';

interface JSONTableProps {
    onClickViewDetail: (index: string) => void;
    className?: string;
    dataSource?: any[];
    handleUpdateStatus: (index: string, data: any) => void;
    handleUpdateAssignee?: (index: string, data: any) => void;
    allowChangeAssignee: boolean;
}

const JSONTable: React.FC<JSONTableProps> = ({
    className = '',
    onClickViewDetail,
    dataSource,
    handleUpdateStatus,
    handleUpdateAssignee,
    allowChangeAssignee,
}) => {
    const [pageSize, setPageSize] = useState(10);
    const [pageIndex, setPageIndex] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const dataTable = useMemo(() => {
        if (!dataSource) return [];
        const data = dataSource.filter((item) => {
            const idMatch = item.id.includes(searchTerm);
            const statusMatch = item.status?.includes(searchTerm) ?? false;
            const assigneeMatch = item.assignee.includes(searchTerm);
            return idMatch || statusMatch || assigneeMatch;
        });
        return data?.slice((pageIndex - 1) * pageSize, pageIndex * pageSize) ?? [];
    }, [dataSource, pageIndex, pageSize, searchTerm]);

    const renderStatus = (status: string) => {
        if (status === AIxBlockTaskStatus.IN_PROGRESS) {
            return <div className="text-blue-500 font-bold">{t('In Progress')}</div>;
        }
        if (status === AIxBlockTaskStatus.APPROVED) {
            return <div className="text-green-500 font-bold">{t('Approved')}</div>;
        }
        if (status === AIxBlockTaskStatus.RESOLVED) {
            return <div className="text-green-700 font-bold">{t('Resolved')}</div>;
        }
        if (status === AIxBlockTaskStatus.REJECTED) {
            return <div className="text-red-500 font-bold">{t('Rejected')}</div>;
        }
        return <div className="text-gray-500 font-bold">{t('Todo')}</div>;
    };

    const onSubmitNewAssignee = (id: string) => {
        if (!allowChangeAssignee) return;
        const input: HTMLInputElement = document.getElementById(id) as HTMLInputElement;
        if (!input) return;
        const assignee = input.value;
        handleUpdateAssignee?.(id, { assignee });
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="relative pt-2.5">
                <Input
                    type="text"
                    placeholder={t('Search')}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    value={searchTerm}
                />
                {searchTerm && (
                    <button className="absolute right-3 top-5 text-gray-400 hover:text-gray-600" onClick={() => setSearchTerm('')}>
                        ✕
                    </button>
                )}
            </div>
            <div className="overflow-x-auto">
                <div className="flex flex-col w-full">
                    <DataTable
                        page={{ data: dataTable, next: null, previous: null }}
                        isLoading={false}
                        hidePagination={true}
                        columns={[
                            {
                                accessorKey: 'TaskID',
                                header: ({ column }) => <DataTableColumnHeader column={column} title={t('Task ID')} />,
                                cell: ({ row }) => {
                                    return <div className="flex items-center">{row.original.id}</div>;
                                },
                            },
                            {
                                accessorKey: 'status',
                                header: ({ column }) => <DataTableColumnHeader column={column} title={t('Status')} />,
                                cell: ({ row }) => {
                                    return (
                                        <>
                                            <Select
                                                value={row.original.status ?? AIxBlockTaskStatus.TODO}
                                                onValueChange={(value) => handleUpdateStatus?.(row.original.id, { status: value })}
                                            >
                                                <SelectTrigger>{renderStatus(row.original.status)}</SelectTrigger>
                                                <SelectContent>
                                                    {AIxBlockTaskStatusOptions?.map((dataSource) => {
                                                        return <SelectItem value={dataSource.value}>{dataSource.value}</SelectItem>;
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </>
                                    );
                                },
                            },
                            {
                                accessorKey: 'assignee',
                                header: ({ column }) => <DataTableColumnHeader column={column} title={t('Assignee')} />,
                                cell: ({ row }) => {
                                    return (
                                        <div className="gap-2 flex items-center">
                                            <div>{row.original.assignee}</div>
                                            {allowChangeAssignee && (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FilePenLine className="cursor-pointer" />
                                                    </PopoverTrigger>
                                                    <PopoverContent>
                                                        <div>
                                                            <form
                                                                onSubmit={(e) => {
                                                                    e.preventDefault();
                                                                    onSubmitNewAssignee(row.original.id);
                                                                } }
                                                                className="flex items-center gap-3"
                                                            >
                                                                <Input className="w-full" defaultValue={row.original.assignee} id={row.original.id} />
                                                                <Button>
                                                                    <CircleCheck />
                                                                </Button>
                                                            </form>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            )}
                                        </div>
                                    );
                                },
                            },
                            {
                                accessorKey: 'Actions',
                                header: ({ column }) => <DataTableColumnHeader column={column} title={t('Actions')} />,
                                cell: ({ row }) => {
                                    return (
                                        <div>
                                            <span className="cursor-pointer text-primary-300 dark:text-primary" onClick={() => onClickViewDetail?.(row.original.id)}>
                                                {t('View Detail')}
                                            </span>
                                        </div>
                                    );
                                },
                            },
                        ]} emptyStateTextTitle={''} emptyStateTextDescription={''} emptyStateIcon={undefined}                    />
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <p className="text-sm font-medium">Rows per page</p>
                        <Select
                            value={`${pageSize}`}
                            onValueChange={(value) => {
                                setPageSize(parseInt(value));
                            }}
                        >
                            <SelectTrigger className="h-9 min-w-[70px] w-auto">
                                <SelectValue placeholder={t('Rows per page')} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 30, 50].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" disabled={pageIndex === 1} onClick={() => setPageIndex((prev) => Math.max(1, prev - 1))}>
                            {t('Previous')}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pageIndex === Math.ceil((dataSource?.length ?? 0) / pageSize)}
                            onClick={() => setPageIndex((prev) => Math.min(Math.ceil((dataSource?.length ?? 0) / pageSize), prev + 1))}
                        >
                            {t('Next')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JSONTable;
