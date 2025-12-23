import React, { CSSProperties } from "react";
import Button from "../Button/Button";

type TAutoSourceAudio = {
  src: string;
  alt?: string;
  style?: CSSProperties;
  className?: string;
};

export const AutoSourceAudio: React.FC<TAutoSourceAudio> = ({
  src,
  alt,
  style,
  className,
}) => {
  const [start, setStart] = React.useState<boolean>(false);
  const [link, setLink] = React.useState<string>(src);
  const [isCheckingAudio, setIsCheckingAudio] = React.useState<boolean>(true);

  React.useEffect(() => {
    if (!start) {
      return;
    }

    const abortController = new AbortController();

    isFileOggExisted(src, abortController.signal)
      .then(r => {
        if (abortController.signal.aborted) {
          return;
        }

        if (typeof r === "string") {
          setLink(r);
        }
      })
      .finally(() => {
        if (abortController.signal.aborted) {
          return;
        }

        setIsCheckingAudio(false);
      });

    return () => {
      abortController.abort("Unmounted");
    }
  }, [src, start]);

  if (!start) {
    return (
      <Button
        size="tiny"
        onClick={e => {
          e.stopPropagation();
          setStart(true);
        }}
      >
        Play
      </Button>
    );
  }

  if (isCheckingAudio) {
    return <>Checking...</>;
  }

  return (
    <audio className={className} style={style} controls autoPlay>
      <source src={link} />
    </audio>
  );
};

export const getOggPath = (url?: string) => {
  if (!url) return url;
  return url.startsWith("http") || url.startsWith("https") || url.startsWith("data:")
    ? url
    : `${url.split(".").slice(0, -1)}.ogg`;
};

export const isFileOggExisted = async (url: string, abortSignal?: AbortSignal) => {
  const fileUrl = getOggPath(url);
  if (!fileUrl) return false;
  try {
    const response = await fetch(fileUrl, { method: "HEAD", signal: abortSignal });
    if (abortSignal?.aborted) {
      return false;
    }
    if (response.ok) {
      return fileUrl
    }
    return false;
  } catch (error) {
    return false;
  }
};
