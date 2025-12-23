import React from "react";

export type TComposedProvider = {
  provider: React.FC<any> | React.FunctionComponent<React.PropsWithChildren>,
  props?: Object,
}

export default function composeProviders(providers: TComposedProvider[]): TComposedProvider {
  return providers.reduce(
    (prev, current): TComposedProvider => {
      return {
        provider: (props: React.PropsWithChildren) => (
          <prev.provider {...prev.props}>
            <current.provider {...current.props}>
              {props.children}
            </current.provider>
          </prev.provider>
        ),
        props: {},
      };
    }
  );
}
