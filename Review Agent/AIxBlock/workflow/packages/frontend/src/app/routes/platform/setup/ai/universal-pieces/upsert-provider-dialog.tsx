import { typeboxResolver } from '@hookform/resolvers/typebox';
import { Static, Type } from '@sinclair/typebox';
import { useMutation } from '@tanstack/react-query';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { INTERNAL_ERROR_TOAST, useToast } from '@/components/ui/use-toast';
import { aiProviderApi } from '@/features/platform-admin-panel/lib/ai-provider-api';
import type { AiProviderMetadata } from 'workflow-blocks-common';
import { AiProviderConfig } from 'workflow-shared';

import { useAIxBlock } from '@/hooks/aixblock-hooks';
import { userHooks } from '@/hooks/user-hooks';
import { RefreshCcw } from 'lucide-react';
import { ApMarkdown } from '../../../../../../components/custom/markdown';

const EnableAiProviderConfigInput = Type.Composite([
  Type.Omit(AiProviderConfig, ['id', 'created', 'updated', 'platformId', 'projectId']),
  Type.Object({
    id: Type.Optional(Type.String()),
  }),
]);
export type EnableAiProviderConfigInput = Static<
  typeof EnableAiProviderConfigInput
>;

type UpsertAIProviderDialogProps = {
  provider: EnableAiProviderConfigInput;
  providerMetadata: AiProviderMetadata;
  children: React.ReactNode;
  onSave: () => void;
};

export const UpsertAIProviderDialog = ({
  children,
  onSave,
  provider,
  providerMetadata,
}: UpsertAIProviderDialogProps) => {
  const [open, setOpen] = useState(false);
  const [validAIxBlockToken, setValidAIxBlockToken] = useState(false)

  const form = useForm({
    resolver: typeboxResolver(EnableAiProviderConfigInput),
    defaultValues: provider,
  });
  const user = userHooks.useCurrentUser();
  const { toast } = useToast();
  const { getLatestToken, isValidToken, checkEmbed } = useAIxBlock();

  useEffect(() => {
    checkToken();
  }, [open]);

  useEffect(() => {
    initData();
  }, [])

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const headerValue =
        form.getValues().config.defaultHeaders[providerMetadata.auth.name];
      const defaultHeaders =
        typeof headerValue === 'string' && headerValue.trim() !== ''
          ? {
              [providerMetadata.auth.name]:
                providerMetadata.auth.mapper(headerValue),
            }
          : {};
      return aiProviderApi.upsert({
        ...form.getValues(),
        config: {
          ...form.getValues().config,
          defaultHeaders,
        },
      });
    },
    onSuccess: (data) => {
      form.reset(data);
      form.setValue('config.defaultHeaders.Authorization', '');
      setOpen(false);
      onSave();
    },
    onError: () => {
      toast(INTERNAL_ERROR_TOAST);
      setOpen(false);
    },
  });

  const initData = async () => {
    form.setValue('config.defaultHeaders.Authorization', '');
  }

  const checkToken = async () => {
    if (providerMetadata.value !== 'aixblock' || !open) return;
    const valid = await isValidToken(provider.config.defaultHeaders);
    setValidAIxBlockToken(valid);
  }

  const getAIxBlockKey = async () => {
    if (!checkEmbed()) return;
    const axbToken = await getLatestToken();
    if (!axbToken) {
      return toast({
          variant: 'destructive',
          title: t('Error'),
          description: t(`Can not get API key from AIxBlock's platform`),
          duration: 3000,
      });
    }
    form.setValue('config.defaultHeaders.Authorization', axbToken);
    toast({
        variant: 'success',
        title: t('Success'),
        description: t(`Success to get current user API key`),
        duration: 3000,
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          form.reset(provider);
        }
        setOpen(open);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {provider.id ? t('Update AI Provider') : t('Enable AI Provider')} (
            {providerMetadata.label})
          </DialogTitle>
        </DialogHeader>

        {providerMetadata.instructionsMarkdown && (
          <div className="mb-4">
            <ApMarkdown
              markdown={providerMetadata.instructionsMarkdown}
            ></ApMarkdown>
          </div>
        )}

        <Form {...form}>
          <form className="grid space-y-4" onSubmit={(e) => e.preventDefault()}>
            <FormField
              name="baseUrl"
              render={({ field }) => (
                <FormItem className="grid space-y-2" itemType="url">
                  <Label htmlFor="baseUrl">{t('Base URL')}</Label>
                  <Input
                    {...field}
                    required
                    type="url"
                    id="baseUrl"
                    placeholder={t('Base URL')}
                    className="rounded-sm"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name={`config.defaultHeaders.${providerMetadata.auth.name}`}
              defaultValue={provider.id ? '' : undefined}
              render={({ field }) => (
                <FormItem className="grid space-y-3">
                  <Label
                    htmlFor={`config.defaultHeaders.${providerMetadata.auth.name}`}
                    className="flex gap-2 justify-between items-end"
                  >
                    {t('API Key')}
                    {providerMetadata.value === 'aixblock' && user.data?.token && (
                      <Button
                        className="flex gap-2 justify-between p-0 h-auto"
                        size="sm"
                        variant="link"
                        type="button"
                        onClick={() => {
                          if (user.data?.token) {
                            field.onChange(user.data.token);
                          }
                        }}
                      >
                        <RefreshCcw className="w-4 h-4" />
                        Auto fill
                      </Button>
                    )}
                  </Label>
                  <div className="flex gap-2 items-center justify-center">
                    <Input
                      autoFocus
                      {...field}
                      required
                      id={`config.defaultHeaders.${providerMetadata.auth.name}`}
                      placeholder={t('Your API key')}
                      className="rounded-sm"
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form?.formState?.errors?.root?.serverError && (
              <FormMessage>
                {form.formState.errors.root.serverError.message}
              </FormMessage>
            )}
          </form>
        </Form>
        <DialogFooter>
          <Button
            variant={'outline'}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setOpen(false);
            }}
          >
            {t('Cancel')}
          </Button>
          <Button
            disabled={!form.formState.isValid}
            loading={isPending}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              mutate();
            }}
          >
            {t('Save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
