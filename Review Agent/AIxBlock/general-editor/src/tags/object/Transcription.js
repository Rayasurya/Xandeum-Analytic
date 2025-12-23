// import { debounce } from "lodash";
import { debounce } from "lodash";
import React, { createRef, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { inject, observer } from "mobx-react";
import { types } from "mobx-state-tree";
import ObjectBase from "./Base";
import ProcessAttrsMixin from "../../mixins/ProcessAttrs";
import ObjectTag from "../../components/Tags/Object";
import Registry from "../../core/Registry";
import { ErrorMessage } from "../../components/ErrorMessage/ErrorMessage";
import { AnnotationMixin } from "../../mixins/AnnotationMixin";
import Result from "../../regions/Result";
// import { TextArea } from "../../common/TextArea/TextArea";
import { formatTimespan } from "../../utils/time";
import Toggle from "../../common/Toggle/Toggle";
import throttle from "lodash.throttle";
// import { Label } from "../../components/Label/Label";
import { Button } from "../../common/Button/Button";
import getCaretCoordinates from "textarea-caret";

/**
 * The Audio tag plays a simple audio file. Use this tag for basic audio annotation tasks such as classification or transcription.
 *
 * @example
 * <!-- Audio transcription -->
 * <View>
 *   <Audio name="audio" value="$audio" />
 *   <Transcription name="transcription" toName="audio" />
 * </View>
 * @regions AudioRegion
 * @meta_title Transcription Tag for Transcripting Audio
 * @meta_description Customize Label Studio to transcription audio data for machine learning and data science projects.
 * @name Transcription
 * @param {string} name Name of the element
 */

const TagAttrs = types.model({
  name: types.identifier,
  toname: types.optional(types.string, ""),
});

const Model = types
  .model({
    type: "transcription",
    valueType: "text",
  })
  .volatile(() => ({
    errors: [],
  }))
  .views(self => ({

    get redactor() {
      const _toName = self.annotation?.names.get(self.toname);

      return _toName?.redactor ?? null;
    },

  }))
  .actions(self => ({
    fromStateJSON(obj) {
      if (obj.value.choices) {
        self.annotation?.names.get(obj.from_name).fromStateJSON(obj);
      }

      if (obj.value.text) {
        self.annotation?.names.get(obj.from_name).fromStateJSON(obj);
      }
    },
  }));

const TranscriptionModel = types.compose("TranscriptionModel", Model, TagAttrs, ProcessAttrsMixin, ObjectBase, AnnotationMixin);

const TranscriptionLine = ({ r, name, toName, redactor }) => {
  const [showTimeEdit, setShowTimeEdit] = useState(false);
  /** @type {RefObject<HTMLTextAreaElement>} */
  const textareaRef = useRef(null);
  const wrapperId = "transcription-line-" + r.id;
  const [piiElements, setPiiElements] = useState(redactor?.piiList ?? []);
  const showPiiList = useRef(false);
  /** @type {RefObject<HTMLDivElement>} */
  const piiListRef = useRef(null);
  const [piiIndex, setPiiIndex] = useState(0);

  /*const labels = useMemo(() => {
    return r.results
      .filter(rs => rs.type === "labels")
      .map(rs => {
        if (!rs.value.labels) return [];

        return rs.value.labels.map((l, lIdx) => (
          <Label
            key={"label-" + r.idx + "-" + lIdx}
            color="#ffffff"
          >
            {l}
          </Label>
        ));
      })
      .flat();
  }, [r.results]);*/

  const transcriptionResult = useMemo(() => {
    let result = r.results.find(rs => rs.type === "transcription" || rs.type === "textarea");

    if (!result) {
      result = Result.create({
        from_name: name,
        to_name: toName,
        value: {
          text: "",
        },
        type: "transcription",
      });

      r.addResult(result);
    }

    return result;
  }, [r.results, name, toName]);

  useEffect(() => {
    if (!r.selected || document.activeElement === textareaRef.current) return;
    let container = document.getElementById("aixblock-dm");

    container = container ?? document.documentElement;
    container.scrollTo({ top: 0 });

    setTimeout(() => {
      document.getElementById(wrapperId)?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });

      textareaRef.current?.focus();
    }, 100);
  }, [r.selected]);

  useLayoutEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.value = transcriptionResult.mainValue ?? "";
    textareaRef.current.style.height = "0";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    textareaRef.current.style.overflowY = "hidden";

    function resize() {
      if (!textareaRef.current) return;
      textareaRef.current.style.height = "0";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }

    textareaRef.current.addEventListener("input", resize, false);

    return () => {
      textareaRef.current?.removeEventListener("input", resize);
    };
  }, [textareaRef, transcriptionResult]);

  const findTagPosition = useCallback((textarea) => {
    const _pos = Math.max(textarea.selectionStart - 1, 0);
    const _text = textarea.value;
    let _sPos = textarea.selectionStart;
    let _ePos = textarea.selectionStart;

    if (textarea.selectionStart > 0) {
      for (let i = _pos; i >= 0; i--) {
        if ([" ", "\n", "\r"].includes(_text[i])) {
          break;
        }

        // Find the opening square bracket
        if (_text[i] !== "@") continue;

        _sPos = i;

        // Find the closing square bracket
        let _foundEnd = false;

        for (let j = _ePos; j < _text.length; j++) {
          if (![" ", "\n", "\r"].includes(_text[j])) continue;

          _ePos = j;
          _foundEnd = true;
          break;
        }

        if (!_foundEnd) {
          _ePos = _text.length;
        }

        return { start: _sPos, end: _ePos };
      }
    }

    return null;
  }, []);

  const checkRedactList = useCallback(
    debounce(
      /**
       * @param {HTMLTextAreaElement} textarea
       */
      (textarea) => {
        const _text = textarea.value;
        let _piiList = null;
        let _showPopup = false;
        let _kw = "";
        const _tagPos = findTagPosition(textarea);

        if (_tagPos) {
          _kw = _text.substring(_tagPos.start + 1, _tagPos.end);
          const _kwLower = _kw.toLowerCase();

          _showPopup = true;
          _piiList = redactor.piiList.filter(e => e.toLowerCase().includes(_kwLower));
        }

        _piiList = _piiList ?? redactor?.piiList ?? [];

        if (_piiList.length === 0 && _kw.length > 0) {
          _piiList = [_kw];
        }

        showPiiList.current = _showPopup && _piiList.length > 0;

        if (showPiiList.current) {
          const _caretPos = getCaretCoordinates(textarea, _tagPos.start);

          setPiiElements(_piiList);
          piiListRef.current.style.display = "";
          piiListRef.current.style.left = _caretPos.left + "px";
          piiListRef.current.style.top = (_caretPos.top + _caretPos.height) + "px";
        } else {
          piiListRef.current.style.display = "none";
        }
      },
      20,
    ),
    [redactor, redactor?.piiList],
  );

  const insertSelectedPii = useCallback(() => {
    const pii = piiElements?.[piiIndex];

    if (!pii) {
      return;
    }

    const _tagPos = findTagPosition(textareaRef.current);

    textareaRef.current?.setRangeText(`[${pii}]`, _tagPos.start, _tagPos.end, "end");
    transcriptionResult.setValue(textareaRef.current?.value);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [piiElements, piiIndex, findTagPosition, transcriptionResult]);

  const hidePiiList = useCallback(() => {
    if (piiListRef.current) {
      piiListRef.current.style.display = "none";
    }
  }, []);

  // useEffect(() => {
  //   if (!textareaRef.current) return;
  //
  //   checkRedactList(textareaRef.current, "", false);
  // }, [redactor?.pii, checkRedactList]);

  useEffect(() => {
    /** @type {HTMLDivElement | undefined} */
    const ele = piiListRef.current.childNodes?.[piiIndex];

    if (!ele) {
      return;
    }

    // ele.scrollIntoView();
    const parentRect = ele.parentElement.getBoundingClientRect();
    const itemRect = ele.getBoundingClientRect();
    const parentBottomY = parentRect.top + parentRect.height;
    const parentTopY = parentRect.top;
    const itemBottomY = itemRect.top + itemRect.height;

    if (itemRect.top < parentTopY) {
      ele.parentElement.scrollTo({ top: ele.parentElement.scrollTop - (parentTopY - itemRect.top) });
    } else if (itemBottomY > parentBottomY) {
      ele.parentElement.scrollTo({ top: ele.parentElement.scrollTop + (itemBottomY - parentBottomY) });
    }
  }, [piiIndex]);

  if (!transcriptionResult) {
    return null;
  }

  return (
    <>
      <div
        id={wrapperId}
        className="transcription-line"
        style={{
          backgroundColor: `rgba(255,255,255,.${r.selected ? 2 : 1})`,
          marginTop: 1,
          paddingLeft: 12,
          paddingTop: 12,
          paddingBottom: 6,
        }}
      >
        <div style={{
          display: "grid",
          gap: 8,
          gridTemplateColumns: "repeat(3, 1fr)",
          whiteSpace: "nowrap",
        }}>
          <a
            style={{ fontFamily: "monospace", textAlign: "center" }}
            onClick={() => setShowTimeEdit(!showTimeEdit)}
          >
            {formatTimespan(r.start)}
          </a>
          <span style={{ textAlign: "center" }}>-&gt;</span>
          <a
            style={{ fontFamily: "monospace", textAlign: "center" }}
            onClick={() => setShowTimeEdit(!showTimeEdit)}
          >
            {formatTimespan(r.end)}
          </a>
          {
            showTimeEdit && (
              <>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={Number(r.start).toFixed(2)}
                  style={{
                    backgroundColor: "rgba(255,255,255,.05)",
                    border: "none",
                    borderRadius: 8,
                    fontFamily: "monospace",
                    outline: "none",
                    padding: "4px 8px",
                    textAlign: "center",
                    width: 100,
                  }}
                  onChange={throttle(ev => r.setStart(Number(ev.target.value)), 1000)}
                />
                <span style={{ textAlign: "center" }}>-&gt;</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={Number(r.end).toFixed(2)}
                  style={{
                    backgroundColor: "rgba(255,255,255,.05)",
                    border: "none",
                    borderRadius: 8,
                    fontFamily: "monospace",
                    outline: "none",
                    padding: "4px 8px",
                    textAlign: "center",
                    width: 100,
                  }}
                  onChange={throttle(ev => r.setEnd(Number(ev.target.value)), 1000)}
                />
                <Button
                  look="primary"
                  size="small"
                  style={{
                    gridColumnStart: 1,
                    gridColumnEnd: 4,
                  }}
                  onClick={() => setShowTimeEdit(false)}
                >
                  Done
                </Button>
              </>
            )
          }
        </div>
        {/*{labels.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              paddingTop: 8,
            }}
          >
            {labels}
          </div>
        )}*/}
      </div>
      <div
        className="transcription-line right"
        style={{
          backgroundColor: `rgba(255,255,255,.${r.selected ? 2 : 1})`,
          marginTop: 1,
          flex: 1,
          paddingLeft: 16,
        }}
      >
        <div style={{ flex: 1, position: "relative" }}>
          <textarea
            ref={textareaRef}
            placeholder="(Enter transcription here)"
            onInput={ev => transcriptionResult.setValue(ev.target.value)}
            onFocus={(ev) => {
              if (!r.selected) {
                r.onClick(r.object._ws);
              }

              if (piiListRef.current) {
                checkRedactList(ev.currentTarget, "dummy", false);
              }
            }}
            onBlur={hidePiiList}
            onClick={(ev) => {
              checkRedactList(ev.currentTarget, "dummy", false);
            }}
            onKeyUp={ev => {
              if (ev.key === "Escape") {
                ev.preventDefault();
                showPiiList.current = false;
                piiListRef.current.style.display = "none";
                return;
              }

              if (redactor?.piiList) {
                checkRedactList(ev.currentTarget, ev.key, ev.ctrlKey);
              }
            }}
            onKeyDown={ev => {
              if (ev.key === "Tab") {
                ev.preventDefault();

                if (r._ws_region.wavesurfer.isPlaying()) {
                  r._ws_region.wavesurfer.pause();
                } else {
                  r.play(true);
                }

                return;
              }

              if (showPiiList.current && ["ArrowUp", "ArrowDown", "Enter"].includes(ev.key)) {
                ev.preventDefault();

                if (ev.key === "ArrowDown") {
                  if (piiIndex < piiElements.length - 1) {
                    setPiiIndex(v => v + 1);
                  } else {
                    setPiiIndex(0);
                  }
                } else if (ev.key === "ArrowUp") {
                  if (piiIndex > 0) {
                    setPiiIndex(v => v - 1);
                  } else {
                    setPiiIndex(piiElements.length - 1);
                  }
                } else if (ev.key === "Enter") {
                  insertSelectedPii();
                }
              }
            }}
            style={{
              backgroundColor: "rgba(255,255,255,.05)",
              border: "none",
              color: "#ffffff",
              padding: 8,
              width: "100%",
              minHeight: "100%",
            }}
          />
          <div ref={piiListRef} style={{
            display: "none",
            position: "absolute",
            backgroundColor: "white",
            border: "solid 1px #ddd",
            zIndex: 1,
            maxHeight: 200,
            overflowY: "auto",
            borderRadius: 8,
            boxShadow: "0 0 24px rgba(0,0,0,.3)",
            minWidth: 150,
          }}>
            {piiElements.map((p, idx) => (
              <div
                key={"pii-" + idx}
                style={{
                  backgroundColor: idx === piiIndex ? "rgba(0,0,0,.1)" : "transparent",
                  padding: "4px 8px",
                  fontSize: 12,
                  cursor: "pointer",
                }}
                onMouseOver={() => {
                  if (piiIndex !== idx) {
                    setPiiIndex(idx);
                  }
                }}
                onMouseDown={insertSelectedPii}
              >
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const HtxTranscriptionView = ({ store, item }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [pages, setPages] = useState(1);
  const [showAllLines, setShowAllLines] = useState(true);

  const isReady = !!store.annotationStore?.selected?.regionStore?.regions
    && store.annotationStore?.selected?.regionStore?.regions.length > 0;

  const selectedRegion = useMemo(() => {
    if (!store.annotationStore?.selected?.regionStore?.selectedIds || store.annotationStore.selected?.regionStore?.selectedIds?.length === 0) return null;

    return store.annotationStore.selected.regionStore.findRegion(
      store.annotationStore.selected.regionStore.selectedIds[0],
    );
  }, [store.annotationStore?.selected?.regionStore?.selectedIds]);

  const pageNumbers = useMemo(() => {
    const list = [];

    for (let i = 1; i <= pages; i++) {
      list.push(
        i === currentPage
          ? (<span key={"pagination-" + i}>{i}</span>)
          : (<a onClick={() => setCurrentPage(i)} key={"pagination-" + i}>{i}</a>),
      );
    }

    return list;
  }, [currentPage, perPage, pages]);

  useEffect(() => {
    if (!isReady) return;
    setPages(Math.ceil(store.annotationStore?.selected?.regionStore?.regions.length / perPage));
  }, [store.annotationStore?.selected?.regionStore?.regions, perPage]);

  if (!isReady) return (
    <div>
      <em>
        Please create at least one region to begin transcript.
      </em>
    </div>
  );

  return (
    <ObjectTag item={item}>
      {(item.errors ?? []).map((error, i) => (
        <ErrorMessage key={`err-${i}`} error={error} />
      ))}
      {
        !showAllLines && selectedRegion && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "min-content 1fr",
              marginBottom: 16,
              marginTop: 16,
            }}
          >
            <TranscriptionLine
              key={"transcription-line-selected"}
              redactor={item.redactor}
              r={selectedRegion}
              idx={0}
              name={item.name}
              toName={item.toname}
              end={selectedRegion.end}
            />
          </div>
        )
      }
      <div style={{
        alignItems: "center",
        display: "flex",
        flexWrap: "wrap",
      }}>
        <Toggle
          checked={showAllLines}
          label="Show all transcriptions"
          onChange={ev => setShowAllLines(ev.target.checked)}
        />
        {
          showAllLines && (
            <div
              style={{
                // marginTop: 16,
              }}
            >
              Display:
              <div
                style={{
                  display: "inline-flex",
                  gap: 8,
                  paddingLeft: 8,
                  paddingRight: 8,
                }}
              >
                {
                  [10, 25, 50, 100].map(c => {
                    if (c === perPage) {
                      return <span key={"per-page-" + c}>{c}</span>;
                    }

                    return <a key={"per-page-" + c} onClick={() => setPerPage(c)}>{c}</a>;
                  })
                }
              </div>
              transcriptions / page
            </div>
          )
        }
      </div>
      {
        showAllLines && pages > 1 && (
          <>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 8,
              }}
            >
              {
                currentPage > 1
                  ? <a onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}>Previous</a>
                  : <span>Previous</span>
              }
              {pageNumbers}
              {
                currentPage < pages
                  ? <a onClick={() => setCurrentPage(Math.min(currentPage + 1, pages))}>Next</a>
                  : <span>Next</span>
              }
            </div>
          </>
        )
      }
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "min-content 1fr",
          marginTop: 16,
          rowGap: 16,
        }}
      >
        {
          showAllLines && store.annotationStore.selected?.regionStore.regions
            .filter(r => r.type === "audioregion")
            .sort((r1, r2) => r1.start - r2.start)
            .slice((currentPage - 1) * perPage, (currentPage) * perPage)
            .map((r, idx) => {
              if (!r) {
                return null;
              }

              return (
                <TranscriptionLine
                  key={"transcription-line-" + (r.id ? r.id : idx)}
                  redactor={item.redactor}
                  r={r}
                  idx={idx}
                  name={item.name}
                  toName={item.toname}
                  end={r.end}
                />
              );
            })
        }
      </div>
    </ObjectTag>
  );
};

const HtxTranscription = inject("store")(observer(HtxTranscriptionView));

Registry.addTag("transcription", TranscriptionModel, HtxTranscription);
Registry.addObjectType(TranscriptionModel);

export { TranscriptionModel, HtxTranscription };
