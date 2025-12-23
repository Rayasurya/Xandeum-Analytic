import { PopulatedFlow } from 'workflow-shared';
import { useQuery } from '@tanstack/react-query';
import { Navigate, useParams } from 'react-router-dom';
import Viewer from 'react-viewer';

import { LoadingSpinner } from '@/components/ui/spinner';
import { flowsApi } from '@/features/flows/lib/flows-api';
import { authenticationSession } from '@/lib/authentication-session';
import './Preview.scss';
const FlowPreviewPage = () => {
  const { flowId } = useParams();

  const {
    data: flow,
    isLoading,
    isError,
  } = useQuery<PopulatedFlow, Error>({
    queryKey: ['flow', flowId, authenticationSession.getProjectId()],
    queryFn: () => flowsApi.get(flowId!),
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (isError) {
    console.error('Error fetching flow', flowId);
    return <Navigate to="/" />;
  }

  if (isLoading) {
    return (
      <div className="bg-background flex h-screen w-screen items-center justify-center ">
        <LoadingSpinner size={50}></LoadingSpinner>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col relative">
      <div className="flex flex-1 w-full align-center justify-center p-10">
        <Viewer
          visible={true}
          showTotal={false}
          noClose
          className="preview__flow"
          noNavbar={true}
          changeable={false}
          rotatable={false}
          scalable={false}
          minScale={0.5}
          maxScale={5}
          zoomSpeed={0.5}
          images={[
            {
              src: flow?.listingPreview ?? '',
              alt: '',
            },
          ]}
        />
        {/* <ImageWithFallback
                    height={768}
                    width={1368}
                    src={flow?.listingPreview ?? undefined}
                    alt={flow?.listingName ?? undefined}
                    className="object-contain"
                    fallback={<Skeleton className="rounded-full w-full" />}
                /> */}
      </div>
    </div>
  );
};

export { FlowPreviewPage };
