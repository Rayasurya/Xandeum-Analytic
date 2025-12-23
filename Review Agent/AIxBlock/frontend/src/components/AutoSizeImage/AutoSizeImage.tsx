import React, { CSSProperties } from "react";

type TAutoSizeImage = {
  src: string;
  alt?: string;
  style?: CSSProperties;
  className?: string;
  size?: 'small' | 'medium' | 'large' | 'raw';
};

export const AutoSizeImage: React.FC<TAutoSizeImage> = ({
  src,
  alt,
  style,
  className,
  size = 'raw',
}) => {
  const imageUrl = getImageUrl(src, size);
  const imgErrorCount = React.useRef(0);

  return <img src={imageUrl} alt={alt} style={style} className={className} onError={(e) => {
    if (imgErrorCount.current > 1) {
      return;
    } else if (imgErrorCount.current === 1) {
      e.currentTarget.src = "/static/images/no-image.jpg";
      imgErrorCount.current++;
      return;
    }

    e.currentTarget.src = src;
    imgErrorCount.current++;
  }} />;
};

export const getFormatedImage = (url?: string, size?: 'small' | 'medium' | 'large' | 'raw') => {
  if (!url) return url;
  const imageSize = size ?? 'raw';
  return getImageUrl(url, imageSize);
}

const getImageUrl = (src: string, size: 'small' | 'medium' | 'large' | 'raw') => {
  if (src.startsWith('http') || src.startsWith('https') || src.startsWith('data:')) {
    return src;
  }
  
  if (size === 'raw') {
    return src;
  }
  
  const parts = src.split('/');
  const fileName = parts.pop();
  const baseUrl = parts.join('/');
  
  return `${baseUrl}/${size}_${fileName}`;
}
