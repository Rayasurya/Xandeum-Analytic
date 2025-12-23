import { get } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import ReactImageAnnotate from 'react-image-annotate';

import { LoadingSpinner } from '@/components/ui/spinner';

type ImageAnnotateType = {
  src: string;
  name: string;
  regions: any[];
};

type ImageAnnotationProps = {
  properties: {
    imageUrl: string;
    type: string;
    value: any;
  };
  onSubmit: (annotation: any) => void;
};

const ImageAnnotation = (props: ImageAnnotationProps) => {
  const { properties, onSubmit } = props;
  const [loading, setLoading] = useState<boolean>(true);
  const [images, setImages] = useState<ImageAnnotateType[]>([]);

  const initImages = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      const regions = get(properties.value, '[0].regions', []);
      setImages([
        {
          src: properties.imageUrl,
          name: '',
          regions: regions,
        },
      ]);
      setLoading(false);
    }, 300);
  }, [properties?.imageUrl, properties?.value]);

  useEffect(() => {
    initImages();
  }, [initImages]);

  return (
    <div className="w-full h-[calc(100vh-10rem)]">
      {loading ? (
        <div className="flex items-center justify-center pt-10">
          <LoadingSpinner size={50} />
        </div>
      ) : (
        <ReactImageAnnotate
          labelImages
          regionClsList={['Alpha', 'Beta', 'Charlie', 'Delta']}
          regionTagList={['tag1', 'tag2', 'tag3']}
          images={images}
          onExit={onSubmit}
        />
      )}
    </div>
  );
};

export default ImageAnnotation;
