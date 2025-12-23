import { TPageFlowProvider } from "../FlowProvider";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { parseLabels } from "@/utils/labelConfig";
import Select, { DataSelect } from "@/components/Select/Select";
import LANGS from "@/constants/languages.json";
import styles from "./Languages.module.scss";
import { useCentrifuge } from "@/providers/CentrifugoProvider";

export type TProps = {
  projectId: number;
  labelConfig: string;
  patchProject: TPageFlowProvider["patchProject"];
}

export default function Languages({projectId, labelConfig, patchProject}: TProps) {
  const [cfg, setCfg] = useState(labelConfig);
  const l = useMemo(() => parseLabels(cfg), [cfg]);
  const sourceRef = useRef(l.languagePairs[0]?.getAttribute("src") ?? "ENG");
  const targetRef = useRef(l.languagePairs[0]?.getAttribute("tgt") ?? "FRA");
  const {onProjectMessage} = useCentrifuge();
  const [isSaving, setSaving] = useState(false);

  const langOpts: DataSelect = useMemo(() => {
    return {
      options: Object.keys(LANGS).map(key => {
        // @ts-ignore
        return {label: LANGS[key] as string, value: key};
      }),
    };
  }, []);

  const updateLanguage = useCallback(() => {
    if (l.languagePairs.length === 0 || !l.doc?.documentElement) {
      return;
    }

    l.languagePairs[0].setAttribute("src", sourceRef.current.toUpperCase());
    l.languagePairs[0].setAttribute("tgt", targetRef.current.toUpperCase());
    const newCfg = new XMLSerializer().serializeToString(l.doc.documentElement);

    setSaving(true);

    patchProject({
      label_config: newCfg,
    }, false, () => {
      setCfg(newCfg);
      setSaving(false);
    });
  }, [l.doc?.documentElement, l.languagePairs, patchProject]);

  useEffect(() => {
    let unsub: VoidFunction | null = null;

    const to = setTimeout(() => {
      unsub = onProjectMessage(projectId, (msg: {label_config?: string}) => {
        if (!("label_config" in msg) || typeof msg["label_config"] !== "string") {
          return;
        }

        setCfg(msg["label_config"]);
      });
    }, 250);

    return () => {
      clearTimeout(to);
      unsub?.();
    };
  }, [onProjectMessage, projectId]);
  
  if (l.languagePairs.length === 0) {
    return null;
  }
  
  return (
    <div className={styles.container}>
      <Select
        label="Source Language"
        data={[langOpts]}
        canFilter={true}
        isLoading={isSaving}
        // @ts-ignore
        defaultValue={{label: LANGS[sourceRef.current], value: sourceRef.current}}
        onChange={o => {
          sourceRef.current = o.value;
          updateLanguage();
        }}
      />
      <Select
        label="Target Language"
        data={[langOpts]}
        canFilter={true}
        isLoading={isSaving}
        // @ts-ignore
        defaultValue={{label: LANGS[targetRef.current], value: targetRef.current}}
        onChange={o => {
          targetRef.current = o.value;
          updateLanguage();
        }}
      />
    </div>
  );
}
