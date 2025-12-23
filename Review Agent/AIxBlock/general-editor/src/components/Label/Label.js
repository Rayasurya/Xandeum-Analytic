import chroma from "chroma-js";
import React, { useMemo } from "react";
import { Block, Elem } from "../../utils/bem";
import { asVars } from "../../utils/styles";

import "./Label.styl";

export const Label = React.forwardRef(
  (
    {
      className,
      style,
      color,
      empty = false,
      hidden = false,
      selected = false,
      margins = false,
      onClick,
      children,
      hotkey,
      onDelete,
      ...rest
    },
    ref,
  ) => {
    const styles = useMemo(() => {
      if (!color) return null;
      const background = chroma(color).alpha(0.15);

      return {
        ...(style ?? {}),
        ...asVars({
          color,
          background,
        }),
      };
    }, [color]);

    return (
      <Block
        tag="span"
        ref={ref}
        name="label"
        mod={{ empty, hidden, selected, clickable: !!onClick, margins }}
        mix={className}
        style={styles}
        onClick={onClick}
        {...rest}
      >
        {onDelete ? (
          <Elem tag="span" name="delete" onClick={onDelete}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </Elem>
        ) : null}
        <Elem tag="span" name="text">
          {children}
        </Elem>
        {hotkey ? (
          <Elem tag="span" name="hotkey">
            {hotkey}
          </Elem>
        ) : null}
      </Block>
    );
  },
);
