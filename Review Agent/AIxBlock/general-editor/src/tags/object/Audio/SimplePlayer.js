import React, { useRef } from "react";

export const SimplePlayer = ({ url }) => {
  const audioRef = useRef();

  return (
    <>
      <audio
        ref={audioRef}
        src={url}
        controls={true}
        style={{
          width: "100%",
        }}
      />
    </>
  );
};