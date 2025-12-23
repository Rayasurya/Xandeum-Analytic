import { typeboxResolver } from '@hookform/resolvers/typebox';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { TSchema, Type } from '@sinclair/typebox';
import { useMutation } from '@tanstack/react-query';
import { t } from 'i18next';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';

import { ApMarkdown } from '@/components/custom/markdown';
import { ShowPoweredBy } from '@/components/show-powered-by';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ReadMoreDescription } from '@/components/ui/read-more-description';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { flagsHooks } from '@/hooks/flags-hooks';
import { api } from '@/lib/api';
import {
    AIxBlockWebFormInput,
    AIxBlockWebFormInputType,
    AIxBlockWebFormResponse,
    ApFlagId,
    FileResponseInterface,
    HumanInputFormResult,
    HumanInputFormResultTypes,
    createKeyForFormInput,
} from 'workflow-shared';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '../../../components/ui/checkbox';
import { aixblockWebFormsApi } from '../lib/aixblock-web-forms-api';

type ApFormProps = {
    form: AIxBlockWebFormResponse;
    useDraft: boolean;
    stepName: string;
    flowVersionId: string;
    flowRunId: string;
};
type FormInputWithName = AIxBlockWebFormInput & {
    name: string;
};

const requiredPropertySettings = {
    minLength: 1,
    errorMessage: t('This field is required'),
};

const createPropertySchema = (input: FormInputWithName) => {
    const schemaSettings = input.required ? requiredPropertySettings : {};
    switch (input.type) {
        case AIxBlockWebFormInputType.TOGGLE:
            return Type.Boolean(schemaSettings);
        case AIxBlockWebFormInputType.TEXT:
        case AIxBlockWebFormInputType.TEXT_AREA:
            return Type.String(schemaSettings);
        case AIxBlockWebFormInputType.FILE:
            return Type.Unknown(schemaSettings);
        case AIxBlockWebFormInputType.RADIO:
            return Type.Unknown(schemaSettings);
        case AIxBlockWebFormInputType.DROPDOWN:
            return Type.Unknown(schemaSettings);
    }
};

function buildSchema(inputs: FormInputWithName[]) {
    return {
        properties: Type.Object(
            inputs.reduce<Record<string, TSchema>>((acc, input) => {
                acc[input.name] = createPropertySchema(input);
                return acc;
            }, {})
        ),
        defaultValues: inputs.reduce<Record<string, string | boolean>>((acc, input) => {
            acc[input.name] = input.type === AIxBlockWebFormInputType.TOGGLE ? false : '';
            return acc;
        }, {}),
    };
}
const handleDownloadFile = (fileBase: FileResponseInterface) => {
    const link = document.createElement('a');
    if ('url' in fileBase) {
        link.href = fileBase.url;
    } else {
        link.download = fileBase.fileName;
        link.href = fileBase.base64Url;
        URL.revokeObjectURL(fileBase.base64Url);
    }
    link.target = '_blank';
    link.rel = 'noreferrer noopener';

    link.click();
};

const ApForm = ({ form, useDraft, stepName, flowVersionId, flowRunId }: ApFormProps) => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const queryParamsLowerCase = Array.from(queryParams.entries()).reduce((acc, [key, value]) => {
        acc[key.toLowerCase()] = value;
        return acc;
    }, {} as Record<string, string>);

    const inputs = useRef<FormInputWithName[]>(
        form.props.inputs.map((input) => {
            return {
                ...input,
                name: createKeyForFormInput(input.displayName),
            };
        })
    );

    const schema = buildSchema(inputs.current);

    const defaultValues = { ...schema.defaultValues };
    inputs.current.forEach((input) => {
        const queryValue = queryParamsLowerCase[input.name.toLowerCase()];
        if (queryValue !== undefined) {
            defaultValues[input.name] = queryValue;
        }
    });

    const [markdownResponse, setMarkdownResponse] = useState<string | null>(null);
    const { data: showPoweredBy } = flagsHooks.useFlag<boolean>(ApFlagId.SHOW_POWERED_BY_IN_FORM);
    const reactForm = useForm({
        defaultValues,
        resolver: typeboxResolver(schema.properties),
    });

    const putBackQuotesForInputNames = (value: Record<string, unknown>, inputs: FormInputWithName[]) => {
        return inputs.reduce((acc, input) => {
            const key = createKeyForFormInput(input.displayName);
            acc[key] = value[key];
            return acc;
        }, {} as Record<string, unknown>);
    };

    const { mutate, isPending } = useMutation<HumanInputFormResult | null, Error>({
        mutationFn: async () => {
            const resp = await aixblockWebFormsApi.submitForm(
                form,
                useDraft,
                stepName,
                flowVersionId,
                flowRunId,
                putBackQuotesForInputNames(reactForm.getValues(), inputs.current)
            )

            await aixblockWebFormsApi.callLink(form.approveLink)

            return resp;
        },
        onSuccess: (formResult) => {
            switch (formResult?.type) {
                case HumanInputFormResultTypes.MARKDOWN: {
                    setMarkdownResponse(formResult.value as string);
                    if (formResult.files) {
                        formResult.files.forEach((file) => {
                            handleDownloadFile(file as FileResponseInterface);
                        });
                    }
                    break;
                }
                case HumanInputFormResultTypes.FILE:
                    handleDownloadFile(formResult.value as FileResponseInterface);
                    break;
                default:
                    toast({
                        title: t('Success'),
                        description: t('Your submission was successfully received.'),
                        duration: 3000,
                    });
                    break;
            }
        },
        onError: (error) => {
            if (api.isError(error)) {
                const status = error.response?.status;
                if (status === 404) {
                    toast({
                        title: t('Flow not found'),
                        description: t('The flow you are trying to submit to does not exist.'),
                        duration: 3000,
                    });
                } else {
                    toast({
                        title: t('Error'),
                        description: t('The flow failed to execute.'),
                        duration: 3000,
                    });
                }
            }
            console.error(error);
        },
    });
    const maxColumns = Math.max(...inputs.current.map((item) => Number(item.columnIndex)));

    const colStartClasses: any = {
        '1': 'col-start-1',
        '2': 'col-start-2',
        '3': 'col-start-3',
        '4': 'col-start-4',
        '5': 'col-start-5',
        '6': 'col-start-6',
    };

    const rowStartClasses: any = {
        '1': 'row-start-1',
        '2': 'row-start-2',
        '3': 'row-start-3',
        '4': 'row-start-4',
        '5': 'row-start-5',
        '6': 'row-start-6',
    };

    const gridColClasses: any = {
        '1': 'grid-cols-1',
        '2': 'grid-cols-2',
        '3': 'grid-cols-3',
        '4': 'grid-cols-4',
        '5': 'grid-cols-5',
        '6': 'grid-cols-6',
    };

    return (
        <div className="w-full h-full flex">
            <div className="container py-20">
                <Form {...reactForm}>
                    <form onSubmit={(e) => reactForm.handleSubmit(() => mutate())(e)}>
                        <Card className="mx-auto">
                            <CardHeader>
                                <CardTitle className="text-center">{form?.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`grid w-full items-center gap-4 ${gridColClasses[maxColumns as any]}`}>
                                    {inputs.current.map((input) => {
                                        return (
                                            <div className={`${rowStartClasses[input.rowIndex as any]} ${colStartClasses[input.columnIndex as any]}`}>
                                                <FormField
                                                    key={input.name}
                                                    control={reactForm.control}
                                                    name={input.name}
                                                    render={({ field }) => {
                                                        return (
                                                            <>
                                                                {input.type === AIxBlockWebFormInputType.TOGGLE && (
                                                                    <>
                                                                        <FormItem className="flex items-center gap-2 h-full">
                                                                            <FormControl>
                                                                                <Checkbox
                                                                                    onCheckedChange={(e) => field.onChange(e)}
                                                                                    checked={field.value as boolean}
                                                                                ></Checkbox>
                                                                            </FormControl>
                                                                            <FormLabel htmlFor={input.name} className="flex items-center">
                                                                                {input.displayName}
                                                                            </FormLabel>
                                                                        </FormItem>
                                                                        <ReadMoreDescription text={input.description ?? ''} />
                                                                    </>
                                                                )}
                                                                {input.type !== AIxBlockWebFormInputType.TOGGLE && (
                                                                    <FormItem className="flex flex-col gap-1">
                                                                        <FormLabel htmlFor={input.name} className="flex items-center justify-between">
                                                                            {input.displayName} {input.required && '*'}
                                                                        </FormLabel>
                                                                        <FormControl className="flex flex-col gap-1">
                                                                            <>
                                                                                {input.type === AIxBlockWebFormInputType.TEXT_AREA && (
                                                                                    <Textarea
                                                                                        {...field}
                                                                                        name={input.name}
                                                                                        id={input.name}
                                                                                        onChange={field.onChange}
                                                                                        value={field.value as string | undefined}
                                                                                    />
                                                                                )}
                                                                                {input.type === AIxBlockWebFormInputType.TEXT && (
                                                                                    <Input
                                                                                        {...field}
                                                                                        onChange={field.onChange}
                                                                                        id={input.name}
                                                                                        name={input.name}
                                                                                        value={field.value as string | undefined}
                                                                                    />
                                                                                )}
                                                                                {input.type === AIxBlockWebFormInputType.FILE && (
                                                                                    <Input
                                                                                        name={input.name}
                                                                                        id={input.name}
                                                                                        onChange={(e) => {
                                                                                            const file = e.target.files?.[0];
                                                                                            if (file) {
                                                                                                field.onChange(file);
                                                                                            }
                                                                                        }}
                                                                                        placeholder={input.displayName}
                                                                                        type="file"
                                                                                    />
                                                                                )}
                                                                                {input.type === AIxBlockWebFormInputType.DROPDOWN && (
                                                                                    <>
                                                                                        <Select
                                                                                            disabled={field.disabled}
                                                                                            onValueChange={field.onChange}
                                                                                        >
                                                                                            <SelectTrigger>
                                                                                                <SelectValue placeholder={t('Dropdown')} />
                                                                                            </SelectTrigger>

                                                                                            <SelectContent>
                                                                                                {Array.isArray(input.dataSource) &&
                                                                                                    input.dataSource?.map((dataSource) => {
                                                                                                        return (
                                                                                                            <SelectItem value={dataSource.value}>
                                                                                                                {dataSource.label}
                                                                                                            </SelectItem>
                                                                                                        );
                                                                                                    })}
                                                                                            </SelectContent>
                                                                                        </Select>
                                                                                    </>
                                                                                )}
                                                                                {input.type === AIxBlockWebFormInputType.RADIO && (
                                                                                    <RadioGroup
                                                                                        onValueChange={field.onChange}
                                                                                        value={field.value as string | undefined}
                                                                                        className="flex gap-4"
                                                                                    >
                                                                                        {Array.isArray(input.dataSource) &&
                                                                                            input.dataSource?.map((item) => {
                                                                                                return (
                                                                                                    <div className="flex items-center space-x-2">
                                                                                                        <RadioGroupItem
                                                                                                            value={item.value}
                                                                                                            id={item.value}
                                                                                                        />
                                                                                                        <label
                                                                                                            htmlFor="openai"
                                                                                                            className="flex items-center gap-2 cursor-pointer text-sm"
                                                                                                        >
                                                                                                            {item.label}
                                                                                                        </label>
                                                                                                    </div>
                                                                                                );
                                                                                            })}
                                                                                    </RadioGroup>
                                                                                )}
                                                                                <ReadMoreDescription text={input.description ?? ''} />
                                                                            </>
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            </>
                                                        );
                                                    }}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="w-full flex items-center justify-end mt-4">
                                    <Button type="submit" className="w-fit" loading={isPending}>
                                        {t('Submit')}
                                    </Button>
                                </div>

                                {markdownResponse && (
                                    <>
                                        <Separator className="my-4" />
                                        <ApMarkdown markdown={markdownResponse} />
                                    </>
                                )}
                            </CardContent>
                        </Card>
                        <div className="mt-2">
                            <ShowPoweredBy position="static" show={showPoweredBy ?? false} />
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
};

ApForm.displayName = 'ApForm';
export { ApForm };
