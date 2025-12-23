import { isEmpty, ListingCategory, PopulatedFlow } from 'workflow-shared';
import { CheckedState } from '@radix-ui/react-checkbox';
import { DialogProps } from '@radix-ui/react-dialog';
import Paragraph from '@tiptap/extension-paragraph';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    getNodesBounds,
    getViewportForBounds,
    useReactFlow,
} from '@xyflow/react';
import { toPng } from 'html-to-image';
import { t } from 'i18next';
import { get, map } from 'lodash';
import { Bold, Eye, Italic, Strikethrough } from 'lucide-react';
import {
    PropsWithChildren,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import Viewer from 'react-viewer';
import { Markdown, MarkdownStorage } from 'tiptap-markdown';

import { ListingFlowRequest } from '../../../../../shared/src/lib/flows/dto/listing-flow-request';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { ImageWithFallbackV2 } from '@/components/ui/image-with-fallback';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { flowsApi } from '@/features/flows/lib/flows-api';
import { userHooks } from '@/hooks/user-hooks';
import { requestHardToken } from '@/lib/api';

type SellDialogProps = Pick<DialogProps, 'open' | 'onOpenChange'> &
  PropsWithChildren & {
    flow: PopulatedFlow;
    setFlow: (flow: PopulatedFlow) => void;
  };

function EditorToolbar({ editor }: { editor: Editor }) {
  return (
    <div className="mb-2 flex gap-1 border-b p-0.5">
      <Button
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        variant={editor.isActive('bold') ? 'default' : 'outline-primary'}
      >
        <Bold className="w-4 h-4" />
      </Button>
      <Button
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        variant={editor.isActive('italic') ? 'default' : 'outline-primary'}
      >
        <Italic className="w-4 h-4" />
      </Button>
      <Button
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        variant={editor.isActive('strike') ? 'default' : 'outline-primary'}
      >
        <Strikethrough className="w-4 h-4" />
      </Button>
    </div>
  );
}

function inlineSvgStyles(rootElement: HTMLElement): () => void {
  const svgs = rootElement.querySelectorAll('svg');
  const elements: { el: Element; originalStyle: string | null }[] = [];

  svgs.forEach((svg) => {
    elements.push({ el: svg, originalStyle: svg.getAttribute('style') });
    inlineStyles(svg);

    svg.querySelectorAll('*').forEach((el) => {
      elements.push({ el, originalStyle: el.getAttribute('style') });
      inlineStyles(el);
    });
  });

  function inlineStyles(element: Element) {
    const computedStyle = window.getComputedStyle(element);
    const tag = element.tagName.toLowerCase();
    const ns = element.namespaceURI;

    // Tạo element mặc định để so sánh style
    const defaultElement =
      ns === 'http://www.w3.org/2000/svg'
        ? document.createElementNS('http://www.w3.org/2000/svg', tag)
        : document.createElement(tag);

    document.body.appendChild(defaultElement);
    const defaultStyle = window.getComputedStyle(defaultElement);
    const classList = (element as HTMLElement).classList;

    let styleString = '';

    for (let i = 0; i < computedStyle.length; i++) {
      const prop = computedStyle[i];
      let value = computedStyle.getPropertyValue(prop);
      const defaultValue = defaultStyle.getPropertyValue(prop);

      // Nếu là <div> có border trái/phải và đang xử lý width
      if (tag === 'div' && prop === 'width') {
        const borderLeft = computedStyle.getPropertyValue('border-left-width');
        const borderRight =
          computedStyle.getPropertyValue('border-right-width');
        const hasLeft = parseFloat(borderLeft) > 0;
        const hasRight = parseFloat(borderRight) > 0;
        const isTruncate = classList.contains('truncate');
        if ((hasLeft || hasRight || isTruncate) && value.endsWith('px')) {
          const numeric = parseFloat(value);
          const extra = isTruncate ? 3 : 5;
          value = `${numeric + extra}px`;
        }
      }

      // Ghi inline nếu khác default, hoặc nếu là <div> thì luôn ghi
      if (value !== defaultValue || tag === 'div') {
        styleString += `${prop}: ${value}; `;
      }
    }

    element.setAttribute('style', styleString.trim());
    defaultElement.remove();
  }

  // Trả về hàm dùng để khôi phục lại style gốc
  return () => {
    elements.forEach(({ el, originalStyle }) => {
      if (originalStyle === null) {
        el.removeAttribute('style');
      } else {
        el.setAttribute('style', originalStyle);
      }
    });
  };
}

type ListingCategoryState = {
  data: ListingCategory[];
  fetching: boolean;
};

export default function SellDialog({
  open,
  onOpenChange,
  children,
  flow,
  setFlow,
}: SellDialogProps) {
  const [listingCategory, setListingCategory] = useState<ListingCategoryState>({
    data: [],
    fetching: false,
  });
  const { data } = userHooks.useCurrentUser();
  const { getNodes } = useReactFlow();
  const form = useRef<
    ListingFlowRequest & {
      listingStatus: boolean;
      listingIsPreview: boolean;
    }
  >({
    listingName: flow.listingName ?? '',
    listingPrice: flow.listingPrice ?? 0,
    listingDescription: flow.listingDescription ?? '',
    listingStatus: flow.listingStatus ?? false,
    listingPreview: flow.listingPreview ?? '',
    listingIsPreview: isEmpty(flow.listingPreview) === false,
    listingUserId: flow.listingUserId ?? null,
    listingCategoryId: flow.listingCategoryId ?? null,
  });
  const [isShowThumbnailImage, setIsShowThumbnailImage] = useState(() => {
    return isEmpty(flow.listingPreview) === false;
  });
  const [isShowImage, setIsShowImage] = useState(false);
  const [isDumping, setIsDumping] = useState(false);
  const [isSubmitForm, setIsSubmitForm] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: false,
        code: false,
        codeBlock: false,
        orderedList: false,
        bulletList: false,
        hardBreak: false,
        listItem: false,
      }),
      Markdown.configure({
        html: true,
        transformPastedText: true,
        transformCopiedText: true,
        bulletListMarker: '- ',
        breaks: true,
      }),
      TextStyle,
      Placeholder.configure({
        placeholder: 'Describe your template here...',
      }),
      Paragraph,
    ],
    content: form.current.listingDescription,
  });

  const { toast } = useToast();

  const dumpPreviewImage = useCallback(async (): Promise<string | null> => {
    const PADDING = 50;

    const nodesBounds = getNodesBounds(getNodes());
    const viewport = getViewportForBounds(
      nodesBounds,
      nodesBounds.width,
      nodesBounds.height,
      0.5,
      1,
      0,
    );

    const zoom = viewport.zoom;

    // Tính kích thước canvas đã scale
    const canvasWidth = nodesBounds.width * zoom;
    const canvasHeight = nodesBounds.height * zoom;

    // Tính kích thước ảnh cuối cùng (cộng padding)
    const imageWidth = Math.max(canvasWidth, nodesBounds.width) + PADDING * 2;
    const imageHeight =
      Math.max(canvasHeight, nodesBounds.height) + PADDING * 2;

    // Điều chỉnh transform cho đúng, tránh bị lệch
    const transformX = Math.max(viewport.x * zoom + PADDING, PADDING); // Đảm bảo không bị lệch quá
    const transformY = Math.max(viewport.y * zoom + PADDING, PADDING); // Tương tự với Y

    // Lấy phần tử viewport
    const element = document.querySelector(
      '.react-flow__viewport',
    ) as HTMLElement;
    if (!element) return null;

    // Inline style nếu cần
    const restoreStyles = inlineSvgStyles(
      document.querySelector('.react-flow__edges') as HTMLElement,
    );

    // Xuất ảnh PNG
    const result = await toPng(element, {
      backgroundColor: '#f9f9f9',
      width: imageWidth + 150,
      height: imageHeight,
      style: {
        width: `${imageWidth + 150}px`,
        height: `${imageHeight}px`,
        transform: `translate(${transformX}px, ${transformY}px) scale(${zoom})`,
        transformOrigin: 'top left',
      },
    });

    restoreStyles?.(); // phục hồi style SVG nếu có

    return result;
  }, [getNodes]);

  const submitForm = useCallback(async () => {
    setIsSubmitForm(true);
    if (form.current.listingIsPreview) {
      const dumpString = await dumpPreviewImage();
      form.current.listingPreview = dumpString ?? null;
    } else {
      form.current.listingPreview = null;
    }
    if (form.current.listingStatus) {
      let passed = true;

      if (form.current.listingName.trim().length === 0) {
        toast({
          title: 'Error',
          description: 'The name can not empty',
          variant: 'destructive',
        });
        passed = false;
      }

      if (form.current.listingDescription.trim().length === 0) {
        toast({
          title: 'Error',
          description: 'The description can not empty',
          variant: 'destructive',
        });
        passed = false;
      }

      if (form.current.listingPrice < 0) {
        toast({
          title: 'Error',
          description: 'The price must not less than 0',
          variant: 'destructive',
        });
        passed = false;
      }

      if (!passed) {
        setIsSubmitForm(false);
        return;
      }

      if (data != null && data.url && data.token) {
        // Get user from platform when listing
        try {
          const platformUser: { id: number } = await requestHardToken(
            `${data.url}/api/current-user/whoami`,
            {
              baseURL: data.url,
              headers: {
                Authorization: `Token ${data?.token}`,
              },
            },
          );
          if (platformUser != null && platformUser.id) {
            form.current.listingUserId = platformUser.id;
          }
        } catch (error) {
          console.log(error);
        }
        
      } else {
        form.current.listingUserId = null;
      }

      const newFlow = await flowsApi.listing(flow.id, form.current);
      toast({
        title: `Sell template`,
        description: `List template ${form.current.listingName} successfully`,
        variant: 'success',
      });
      setFlow(newFlow);
    } else {
      form.current.listingUserId = null;
      const newFlow = await flowsApi.delisting(flow.id, form.current);
      toast({
        title: `Sell template`,
        description: `Delist template ${form.current.listingName} successfully`,
        variant: 'success',
      });
      setFlow(newFlow);
    }
    setIsSubmitForm(false);
    onOpenChange?.(false);
  }, [onOpenChange, flow.id, setFlow, toast, dumpPreviewImage, data]);

  const onPreviewCheckChanged = async (e: CheckedState) => {
    form.current.listingIsPreview = e === true;
    if (!form.current.listingIsPreview) {
      form.current.listingPreview = null;
      setIsShowThumbnailImage(false);
    } else {
      setIsDumping(true);
      setIsShowThumbnailImage(true);
      const dumpString = await dumpPreviewImage();
      form.current.listingPreview = dumpString;
      setIsDumping(false);
    }
  };
  useEffect(() => {
    if (!open) return;
    setIsShowThumbnailImage(form.current.listingIsPreview);
    const fetchData = async () => {
      setListingCategory((prev) => ({
        ...prev,
        fetching: true,
      }));

      try {
        const r = await flowsApi.getListingCategories();
        const data = get(r, 'data', []);
        setListingCategory((prev) => ({
          ...prev,
          data: data,
          fetching: false,
        }));
      } catch (error) {
        console.error('Failed to fetch listing categories:', error);
        setListingCategory((prev) => ({
          ...prev,
          fetching: false,
        }));
      }
    };

    fetchData();
  }, [open, setListingCategory]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[80%] max-w-[80sw] max-h-[calc(100vh-80px)] overflow-y-auto selling-dialog">
        <DialogHeader>
          <DialogTitle>Sell my template</DialogTitle>
        </DialogHeader>
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="mb-2">Name</div>
            <Input
              disabled={isSubmitForm}
              defaultValue={flow.listingName ?? ''}
              onChange={(ev) => (form.current.listingName = ev.target.value)}
            />
          </div>
          <div className="flex-1">
            <div className="mb-2">Category</div>
            <Select
              disabled={isSubmitForm}
              onValueChange={(v) => (form.current.listingCategoryId = v)}
              defaultValue={flow.listingCategoryId ?? undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder={'Select category'} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {map(listingCategory.data, (item) => {
                    return <SelectItem value={item.id}>{item.name}</SelectItem>;
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="mb-2 mt-4">Selling price (USD)</div>
            <Input
              disabled={isSubmitForm}
              type="number"
              defaultValue={(flow.listingPrice ?? 0) / 100}
              step="0.1"
              min="0"
              onChange={(ev) =>
                (form.current.listingPrice = parseFloat(ev.target.value) * 100)
              }
            />
          </div>
          <div className="flex-1">
            <div className="mb-2 mt-4">Selling status</div>
            <Select
              disabled={isSubmitForm}
              onValueChange={(v) => (form.current.listingStatus = v === '1')}
              defaultValue={flow.listingStatus ? '1' : '0'}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('Select status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="1">{t('Selling')}</SelectItem>
                  <SelectItem value="0">{t('Disabled')}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-4 mb-2 mt-4">
          <div className="flex-1">
            <div className="flex items-center">
              <div className="mr-2">Preview</div>
              <Checkbox
                disabled={isSubmitForm}
                onCheckedChange={onPreviewCheckChanged}
                defaultChecked={isEmpty(flow.listingPreview) === false}
              />
            </div>

            {isShowThumbnailImage && (
              <div className="relative group mt-2 border rounded-md w-[85px] h-[85px] overflow-hidden opacity-0 scale-95 transition-all duration-300 ease-out animate-[fadeIn_0.3s_ease-out_forwards]">
                {/* Thumbnail image */}
                {form.current.listingPreview && (
                  <ImageWithFallbackV2
                    className="w-full h-full object-cover"
                    src={form.current.listingPreview}
                    alt="Preview flow"
                    fallback={<Skeleton className="rounded-full w-full h-full" />}
                  />
                )}
                {/* Preview button on hover */}
                {isDumping === false && (
                  <button
                    onClick={() => setIsShowImage(true)}
                    className="absolute inset-0 bg-black bg-opacity-30 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Eye className="h-4 w-4" /> View
                  </button>
                )}

                {/* Loading overlay */}
                {isDumping && (
                  <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-10">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            )}
            <Viewer
              container={document.getElementById('root') ?? undefined}
              visible={isShowImage}
              showTotal={false}
              className="sell-dialog__preview__flow"
              noNavbar={true}
              changeable={false}
              rotatable={false}
              scalable={false}
              minScale={0.5}
              maxScale={5}
              zoomSpeed={0.5}
              onClose={() => setIsShowImage(false)}
              images={[
                {
                  src: form.current.listingPreview ?? '',
                  alt: '',
                },
              ]}
            ></Viewer>
          </div>
        </div>
        <div className="mb-2 mt-4">Describe your template</div>
        <div className="border rounded-md overflow-hidden">
          {editor && <EditorToolbar editor={editor} />}
          <EditorContent
            editor={editor}
            className="p-2 max-h-[40vh] overflow-y-auto"
          />
        </div>
        <DialogFooter>
          <Button
            disabled={isSubmitForm}
            variant={'outline'}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onOpenChange?.(false);
            }}
          >
            {t('Close')}
          </Button>
          <Button
            disabled={isSubmitForm || isDumping}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              form.current.listingDescription = (
                editor?.storage.markdown as MarkdownStorage
              ).getMarkdown();
              submitForm();
            }}
          >
            {t('Update')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
